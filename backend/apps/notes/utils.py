import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.units import cm
from django.conf import settings
from apps.ecole.models import Ecole
from .models import Note

def generer_pdf_bulletin(bulletin):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    elements = []
    styles = getSampleStyleSheet()

    # Infos école: préférer l'école liée à l'élève/bulletin
    try:
        ecole = None
        if getattr(bulletin, 'eleve', None):
            if getattr(bulletin.eleve, 'classe', None) and getattr(bulletin.eleve.classe, 'ecole', None):
                ecole = bulletin.eleve.classe.ecole
        if not ecole:
            ecole = Ecole.objects.first()
    except Exception:
        ecole = None

    # Style pour le titre
    title_style = ParagraphStyle(
        'BulletinTitle',
        parent=styles['Heading1'],
        alignment=1,
        fontSize=18,
        spaceAfter=10
    )

    # En-tête
    if ecole:
        elements.append(Paragraph(ecole.nom.upper(), styles['Heading2']))
        elements.append(Paragraph(ecole.adresse, styles['Normal']))
        elements.append(Paragraph(f"Tél: {ecole.telephone} | Email: {ecole.email}", styles['Normal']))
        elements.append(Spacer(1, 0.5*cm))

    elements.append(Paragraph(f"BULLETIN DE NOTES - {bulletin.get_trimestre_display().upper()}", title_style))
    elements.append(Paragraph(f"Année Scolaire: {bulletin.annee_scolaire}", styles['Normal']))
    elements.append(Spacer(1, 0.5*cm))

    # Infos élève
    eleve_data = [
        [Paragraph(f"<b>Élève:</b> {bulletin.eleve.nom_complet}", styles['Normal']), 
         Paragraph(f"<b>Classe:</b> {bulletin.eleve.classe.nom if bulletin.eleve.classe else 'N/A'}", styles['Normal'])],
        [Paragraph(f"<b>Matricule:</b> {bulletin.eleve.matricule}", styles['Normal']), 
         Paragraph(f"<b>Sexe:</b> {bulletin.eleve.get_sexe_display()}", styles['Normal'])]
    ]
    t_eleve = Table(eleve_data, colWidths=[10*cm, 7*cm])
    elements.append(t_eleve)
    elements.append(Spacer(1, 1*cm))

    # Tableau des notes
    notes = Note.objects.filter(
        eleve=bulletin.eleve, 
        trimestre=bulletin.trimestre, 
        annee_scolaire=bulletin.annee_scolaire
    ).select_related('matiere')

    data = [['Matière', 'Coef', 'Note/20', 'Total', 'Appréciation']]
    
    total_coef = 0
    total_points = 0

    for n in notes:
        coef = n.matiere.coefficient
        note_20 = n.note_sur_20
        total = float(note_20) * coef
        
        data.append([
            n.matiere.nom,
            str(coef),
            f"{note_20:.2f}",
            f"{total:.2f}",
            n.observations or '-'
        ])
        
        total_coef += coef
        total_points += total

    # Ligne de résumé
    data.append(['TOTAL', str(total_coef), '', f"{total_points:.2f}", ''])

    t_notes = Table(data, colWidths=[6*cm, 2*cm, 2.5*cm, 2.5*cm, 4*cm])
    t_notes.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.navy),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(t_notes)
    elements.append(Spacer(1, 1*cm))

    # Résumé général
    moyenne = bulletin.moyenne_generale or (total_points / total_coef if total_coef > 0 else 0)
    elements.append(Paragraph(f"<b>MOYENNE GÉNÉRALE : {moyenne:.2f} / 20</b>", styles['Heading3']))
    elements.append(Paragraph(f"Rang : {bulletin.rang or '-'} / {bulletin.effectif_classe or '-'}", styles['Normal']))
    
    elements.append(Spacer(1, 2*cm))

    # Signatures
    sign_data = [['Le Parent', '', 'Le Directeur']]
    t_sign = Table(sign_data, colWidths=[6*cm, 5*cm, 6*cm])
    elements.append(t_sign)

    doc.build(elements)
    buffer.seek(0)
    return buffer
