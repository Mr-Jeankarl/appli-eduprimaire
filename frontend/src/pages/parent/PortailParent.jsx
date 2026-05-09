import { useState } from 'react'
import { Phone, Mail, BookOpen, CalendarCheck, CreditCard, ChevronDown, ChevronUp, User } from 'lucide-react'
import { eleves, classes, notes, presences, paiements, enseignants } from '../../data/mockData'

const ENFANT_ID = 'e-001'
const fmt = n => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

function Section({ titre, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-5 py-4 bg-beige hover:bg-beige-dark/30 transition">
        <div className="flex items-center gap-2 font-semibold text-navy"><Icon size={16} className="text-amber-dark" /> {titre}</div>
        {open ? <ChevronUp size={15} className="text-slate" /> : <ChevronDown size={15} className="text-slate" />}
      </button>
      {open && <div className="px-5 py-4 border-t border-beige-dark">{children}</div>}
    </div>
  )
}

export default function PortailParent() {
  const enfant   = eleves.find(e => e.id === ENFANT_ID)
  if (!enfant) return <p className="p-8 text-slate">Aucun enfant associé à ce compte.</p>

  const classe       = classes.find(c => c.id === enfant.classeId)
  const enseignant   = enseignants.find(e => e.classeId === enfant.classeId)
  const notesEnfant  = notes.filter(n => n.eleveId === enfant.id)
  const presEnfant   = presences.filter(p => p.eleveId === enfant.id)
  const paiEnfant    = paiements.filter(p => p.eleveId === enfant.id)

  const moyenne = notesEnfant.length
    ? (notesEnfant.reduce((s, n) => s + n.valeur, 0) / notesEnfant.length).toFixed(1)
    : null

  const statutPresLabel = s => s === 'PRESENT' ? 'Présent' : s === 'ABSENT_JUSTIFIE' ? 'Absent (J)' : s === 'ABSENT_NON_JUSTIFIE' ? 'Absent (NJ)' : 'Retard'
  const statutPresClass = s => s === 'PRESENT' ? 'badge-green' : s === 'ABSENT_NON_JUSTIFIE' ? 'badge-red' : 'badge-amber'
  const statutPaiLabel  = s => s === 'PAYE' ? 'Payé' : s === 'PARTIEL' ? 'Partiel' : 'En attente'
  const statutPaiClass  = s => s === 'PAYE' ? 'badge-green' : s === 'PARTIEL' ? 'badge-amber' : 'badge-red'

  return (
    <div className="p-6 space-y-5 max-w-2xl mx-auto page-enter">
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-amber/15 border border-amber/25 flex items-center justify-center font-display font-bold text-navy text-xl flex-shrink-0">
          {enfant.prenom[0]}{enfant.nom[0]}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-navy">{enfant.prenom} {enfant.nom}</h1>
          <p className="text-sm text-slate mt-0.5">{classe?.nom || ''} · {enfant.matricule}</p>
        </div>
        {moyenne && (
          <div className="text-center flex-shrink-0">
            <p className="font-display font-bold text-3xl text-navy">{moyenne}</p>
            <p className="text-xs text-slate">/20 moyenne</p>
          </div>
        )}
      </div>

      <Section titre="Notes et Résultats" icon={BookOpen}>
        {notesEnfant.length > 0 ? (
          <div className="space-y-2">
            {notesEnfant.map(n => (
              <div key={n.id} className="flex items-center justify-between py-2 border-b border-beige-dark last:border-0">
                <div>
                  <p className="text-sm font-semibold text-navy">Matière</p>
                  {n.appreciation && <p className="text-xs text-slate italic">{n.appreciation}</p>}
                </div>
                <span className={"font-bold text-lg " + (n.valeur >= 15 ? 'text-sage' : n.valeur >= 10 ? 'text-amber-dark' : 'text-coral')}>{n.valeur}/20</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-slate">Aucune note disponible.</p>}
      </Section>

      <Section titre="Présences et Absences" icon={CalendarCheck}>
        {presEnfant.length > 0 ? (
          <div className="space-y-2">
            {presEnfant.map(p => (
              <div key={p.id} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-slate">{p.date}</span>
                <span className={statutPresClass(p.statut) + ' text-xs'}>{statutPresLabel(p.statut)}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-slate">Aucune absence enregistrée.</p>}
      </Section>

      <Section titre="Paiements et Frais scolaires" icon={CreditCard}>
        {paiEnfant.length > 0 ? (
          <div className="space-y-3">
            {paiEnfant.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-beige-dark last:border-0">
                <div><p className="text-sm font-semibold text-navy">{p.type}</p><p className="text-xs text-slate">{p.date}</p></div>
                <div className="text-right">
                  <span className={statutPaiClass(p.statut) + ' text-xs'}>{statutPaiLabel(p.statut)}</span>
                  <p className="text-xs text-slate mt-1">{fmt(p.montantPaye)} / {fmt(p.montantDu)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-slate">Aucun paiement enregistré.</p>}
      </Section>

      <Section titre="Contacter l'enseignant" icon={User}>
        {enseignant ? (
          <div className="space-y-3">
            <p className="text-xs text-slate">Titulaire de la <strong className="text-navy">{classe?.nom}</strong></p>
            <div className="bg-beige border border-beige-dark rounded-xl p-4 space-y-3">
              <p className="font-semibold text-navy">{enseignant.prenom} {enseignant.nom}</p>
              {enseignant.telephone && (
                <a href={"tel:" + enseignant.telephone} className="flex items-center gap-3 text-sm text-slate hover:text-navy transition group">
                  <div className="w-8 h-8 bg-sage/10 rounded-lg flex items-center justify-center group-hover:bg-sage/20 transition"><Phone size={14} className="text-sage" /></div>
                  {enseignant.telephone}
                </a>
              )}
              {enseignant.email && (
                <a href={"mailto:" + enseignant.email} className="flex items-center gap-3 text-sm text-slate hover:text-navy transition group">
                  <div className="w-8 h-8 bg-amber/10 rounded-lg flex items-center justify-center group-hover:bg-amber/20 transition"><Mail size={14} className="text-amber-dark" /></div>
                  {enseignant.email}
                </a>
              )}
            </div>
            <p className="text-[11px] text-slate/60 italic">Ces coordonnées sont fournies à titre informatif. Merci de contacter l'enseignant aux horaires appropriés.</p>
          </div>
        ) : <p className="text-sm text-slate">Les coordonnées ne sont pas encore disponibles.</p>}
      </Section>
    </div>
  )
}
