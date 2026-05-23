import { useState, useMemo, useEffect } from 'react'
import { Users, GraduationCap, CalendarCheck, AlertTriangle, Megaphone, Send, BookOpen, Calendar } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { ecole as mockEcole, matieres as mockMatieres, frequentationHebdo, activiteRecente } from '../../data/mockData'
import { StatCard } from '../../components/ui/index'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { list, apiRequest, getMediaUrl } from '../../services/api'

const EMOJI = { paiement: '💳', appel: '✅', bulletin: '📋', eleve: '👤' }
const BG    = { paiement: 'bg-sage/10', appel: 'bg-amber/10', bulletin: 'bg-navy/10', eleve: 'bg-coral/10' }

// Données de secours pour le graphique comptable si non disponible
const fallbackFluxMensuels = [
  { name: 'Sep', total: 850000 },
  { name: 'Oct', total: 620000 },
  { name: 'Nov', total: 480000 },
  { name: 'Déc', total: 710000 },
  { name: 'Jan', total: 920000 },
  { name: 'Fév', total: 350000 },
]

// Agenda pédagogique mock pour l'enseignant
const agendaEnseignant = [
  { id: 'ag-1', date: '05/05', type: 'Évaluation', matiere: 'Mathématiques', desc: 'Contrôle sur les fractions', icon: '📝', color: 'bg-coral/10 text-coral' },
  { id: 'ag-2', date: '07/05', type: 'Devoir',     matiere: 'Français',      desc: 'Rédaction — sujet libre', icon: '✏️', color: 'bg-amber/10 text-amber-dark' },
  { id: 'ag-3', date: '10/05', type: 'Bulletin',   matiere: 'Toutes',        desc: 'Remise des bulletins T1', icon: '📋', color: 'bg-navy/10 text-navy' },
  { id: 'ag-4', date: '14/05', type: 'Sortie',     matiere: 'Éveil',         desc: 'Visite du musée municipal', icon: '🚌', color: 'bg-sage/10 text-sage' },
]

const evolutionNotes = [
  { eval: 'Devoir 1', 'Mathématiques': 14, 'Français': 12, 'Sciences': 15, 'Histoire-Géo': 13, 'Éducation civique': 16, 'Sport': 18 },
  { eval: 'Devoir 2', 'Mathématiques': 15.5, 'Français': 14, 'Sciences': 14.5, 'Histoire-Géo': 15, 'Éducation civique': 14, 'Sport': 17 },
  { eval: 'Examen T1', 'Mathématiques': 16.5, 'Français': 15, 'Sciences': 17, 'Histoire-Géo': 14, 'Éducation civique': 17, 'Sport': 19 },
]

const mapClasse = c => ({ id: String(c.id), nom: c.nom, niveau: c.niveau, enseignantId: c.enseignant_principal })
const mapEleve = e => ({ 
  id: String(e.id), 
  nom: e.nom, 
  prenom: e.prenom, 
  photo: getMediaUrl(e.photo),
  matricule: e.matricule, 
  classeId: String(e.classe), 
  parentNom: e.parent_detail ? `${e.parent_detail.prenom} ${e.parent_detail.nom}` : '', 
  statut: e.statut === 'ACTIF' ? 'INSCRIT' : e.statut === 'INACTIF' ? 'ARCHIVE' : e.statut 
})
const mapMatiere = m => ({ id: String(m.id), nom: m.nom, couleur: '#1E3A5F' })

export default function Dashboard() {
  const [modalEleve, setModalEleve] = useState(false)
  const [modalMsg, setModalMsg]     = useState(false)
  const [ecoleData, setEcoleData]   = useState(mockEcole)
  const [classesData, setClassesData] = useState([])
  const [elevesData, setElevesData] = useState([])
  const [matieresData, setMatieresData] = useState(mockMatieres)
  const [paiementsData, setPaiementsData] = useState([])
  const [statsCompta, setStatsCompta] = useState(null)
  const [notesData, setNotesData] = useState([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()
  const navigate = useNavigate()
  const isParent = user?.role === 'PARENT'
  const isTeacher = user?.role === 'ENSEIGNANT'
  const isComptable = user?.role === 'COMPTABLE'
  const isDirecteur = user?.role === 'DIRECTEUR'

  useEffect(() => {
    let mounted = true
    setLoading(true)
    Promise.all([
      apiRequest('/ecole/'),
      list('/ecole/classes/'),
      list('/eleves/'),
      list('/comptabilite/'),
      list('/ecole/matieres/'),
      list('/notes/'),
      (user?.role === 'COMPTABLE' || user?.role === 'DIRECTEUR' || user?.role === 'ADMIN') ? apiRequest('/comptabilite/stats/').catch(() => null) : Promise.resolve(null)
    ])
    .then(([ecole, classes, eleves, paiements, matieres, notes, stats]) => {
      if (!mounted) return
      setEcoleData(ecole)
      setClassesData(classes.map(mapClasse))
      setElevesData(eleves.map(mapEleve))
      setMatieresData(matieres.map(mapMatiere))
      setPaiementsData(paiements.map(p => ({
        id: String(p.id),
        eleveId: String(p.eleve || ''),
        montantPaye: Number(p.montant),
        montantDu: Number(p.montant), // Pour la démo, on considère montantDu = montant payé
        statut: 'PAYE',
        type: p.observations || 'Scolarité'
      })))
      setNotesData(notes.map(n => ({
        id: String(n.id),
        eleveId: String(n.eleve),
        matiereId: String(n.matiere),
        valeur: Number(n.note),
        periode: n.trimestre
      })))
      setStatsCompta(stats)
    })
    .catch(err => console.error('Dashboard: Erreur de chargement API', err))
    .finally(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  // Si c'est un parent, on filtre les données pour son enfant
  const monEnfant = useMemo(() => {
    if (!isParent || !user) return null
    return elevesData.find(e => e.parentNom && user.nom && e.parentNom.includes(user.nom)) || elevesData[0]
  }, [isParent, user, elevesData])
  
  const childPrenom = monEnfant?.prenom || 'votre enfant'

  // Si c'est un enseignant, on trouve sa classe
  const maClasse = useMemo(() => {
    if (!isTeacher || !user) return null
    return classesData.find(c => c.enseignantId === user.id) || classesData[0]
  }, [isTeacher, user, classesData])

  const mesElevesCount = useMemo(() => {
    if (!maClasse) return 0
    return elevesData.filter(e => e.classeId === maClasse.id).length
  }, [maClasse, elevesData])
  
  // Moyenne de la classe par matière pour le graphique de l'enseignant
  const moyennesParMatiere = useMemo(() => {
    if (!isTeacher || !maClasse) return []
    const elevesClasseIds = elevesData.filter(e => e.classeId === maClasse.id).map(e => e.id)
    
    return matieresData.map(m => {
      const notesMatiere = notesData.filter(n => n.matiereId === m.id && elevesClasseIds.includes(n.eleveId))
      let moyenne = 0
      if (notesMatiere.length > 0) {
        const somme = notesMatiere.reduce((acc, n) => acc + n.valeur, 0)
        moyenne = (somme / notesMatiere.length).toFixed(1)
      } else {
        // Fallback si aucune note n'est saisie (pour la démo)
        const fakeData = [14.2, 13.5, 15.1, 12.8, 16.0, 17.5]
        moyenne = fakeData[matieresData.indexOf(m)] || 10
      }
      return {
        nom: m.nom,
        moyenne: parseFloat(moyenne)
      }
    })
  }, [isTeacher, maClasse, elevesData, matieresData, notesData])
  
  const totalInscrits = elevesData.filter(e => e.statut === 'INSCRIT').length
  const impayes       = paiementsData.filter(p => p.statut !== 'PAYE').length
  
  // Stats financières pour le comptable (venant de l'API)
  const totalEnc = statsCompta ? statsCompta.total_percu : paiementsData.filter(p => p.statut === 'PAYE').reduce((s, p) => s + p.montantPaye, 0)
  const totalAtt = statsCompta ? statsCompta.total_attendu : paiementsData.reduce((s, p) => s + p.montantDu, 0)
  const tauxRecouvrement = statsCompta ? statsCompta.taux_recouvrement : (totalAtt > 0 ? Math.round((totalEnc / totalAtt) * 100) : 0)
  const fmt = n => new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA'

  // Stats spécifiques parent
  const monEnfantPaiements = isParent && monEnfant ? paiementsData.filter(p => p.eleveId === monEnfant.id) : []
  const monEnfantImpayes   = monEnfantPaiements.filter(p => p.statut !== 'PAYE').length

  const activitesFiltrees = useMemo(() => {
    if (isParent) {
      return activiteRecente.filter(a => (monEnfant && a.description.includes(monEnfant.prenom)) || a.type === 'bulletin')
    }
    if (isTeacher && maClasse) {
      return activiteRecente.filter(a => a.description.includes(maClasse.nom.split(' ')[0]) || a.type === 'bulletin' || a.type === 'appel')
    }
    if (isComptable) {
      return activiteRecente.filter(a => a.type === 'paiement')
    }
    return activiteRecente
  }, [isParent, isTeacher, isComptable, monEnfant, maClasse])

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center p-12 text-navy font-display">Chargement du tableau de bord...</div>
  }

  return (
    <div className="p-6 space-y-6 page-enter">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">
            {isParent ? `Espace Parent — ${childPrenom}` 
              : isTeacher ? `Espace Enseignant — ${maClasse?.nom}` 
              : isComptable ? 'Tableau de Bord Financier'
              : isDirecteur ? 'Direction — Supervision'
              : 'Tableau de Bord'}
          </h1>
          <p className="text-slate text-sm mt-0.5">Bienvenue — <span className="font-semibold text-navy">{ecoleData.nom}</span></p>
        </div>
        {!isParent && !isTeacher && !isComptable && !isDirecteur && (
          <div className="flex gap-2">
            <button onClick={() => navigate('/presences')} className="btn-primary"><BookOpen size={16} /> Faire l'appel</button>
            <button onClick={() => navigate('/notes')}     className="btn-amber"><Megaphone size={16} /> Saisir notes</button>
          </div>
        )}
        {isTeacher && (
          <div className="flex gap-2">
            <button onClick={() => setModalEleve(true)} className="btn-primary"><Send size={16} /> Demande d'inscription</button>
            <button onClick={() => setModalMsg(true)}   className="btn-amber"><Megaphone size={16} /> Annonce</button>
          </div>
        )}
        {isComptable && (
          <div className="flex gap-2">
            <button onClick={() => setModalMsg(true)}   className="btn-amber"><Send size={16} /> Relance Impayés</button>
          </div>
        )}
      </div>

      <div className={`grid grid-cols-2 ${isParent ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
        {isParent ? (
          <>
            <StatCard titre="Assiduité"        valeur="98%"           sous="Excellent"             icon={CalendarCheck}  variant="green" />
            <StatCard titre="Moyenne"          valeur="16.5"          sous="Trimestre 1"           icon={Users}          variant="navy"  />
            <StatCard titre="Paiements"        valeur={monEnfantImpayes === 0 ? "À jour" : `${monEnfantImpayes} En attente`} sous="Suivi financier" icon={AlertTriangle} variant={monEnfantImpayes === 0 ? "navy" : "red"} />
          </>
        ) : isTeacher ? (
          <>
            <StatCard titre="Ma Classe"        valeur={maClasse?.nom || 'Non assignée'} sous={maClasse?.niveau} icon={GraduationCap} variant="navy" />
            <StatCard titre="Mes Élèves"       valeur={mesElevesCount} sous="Inscrits"              icon={Users}          variant="amber" />
            <StatCard titre="Présences"        valeur="96%"           sous="Aujourd'hui"           icon={CalendarCheck}  variant="green" />
            <StatCard titre="Moyenne Classe"    valeur="14.2"          sous="Trimestre 1"           icon={Users}          variant="navy"  />
          </>
        ) : isComptable ? (
          <>
            <StatCard titre="Total Encaissé"   valeur={fmt(totalEnc)} sous="Depuis la rentrée"     icon={Users}          variant="green" />
            <StatCard titre="À Recouvrer"      valeur={fmt(totalAtt - totalEnc)} sous={`${impayes} impayés`} icon={AlertTriangle} variant="red" />
            <StatCard titre="Recouvrement"     valeur={`${tauxRecouvrement}%`} sous="Taux global"         icon={CalendarCheck}  variant="navy"  />
            <StatCard titre="Élèves Actifs"    valeur={totalInscrits} sous="inscrits"              icon={Users}          variant="amber" />
          </>
        ) : (
          <>
            <StatCard titre="Total Élèves"        valeur={totalInscrits} sous="Inscrits à ce jour"    icon={Users}          variant="navy"  />
            <StatCard titre="Enseignants"          valeur={classesData.length}            sous={`${classesData.length} classes`} icon={GraduationCap} />
            <StatCard titre="Présences Aujourd'hui" valeur="94%"          sous="Très bonne assiduité"  icon={CalendarCheck}  variant="green" />
            <StatCard titre="Impayés"              valeur={impayes}       sous="À relancer"            icon={AlertTriangle}  variant="red"   />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-navy text-lg">
              {isParent ? `Évolution des notes de ${childPrenom}` : isTeacher ? 'Performance par Matière' : 'Fréquentation par Classe'}
            </h2>
            <span className="text-xs text-slate bg-beige border border-beige-dark px-3 py-1 rounded-full">
              {isParent || isTeacher ? 'Trimestre 1' : 'Cette semaine'}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            {isParent ? (
              <LineChart data={evolutionNotes} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid vertical={false} stroke="#EDE6D6" strokeDasharray="3 3" />
                <XAxis dataKey="eval" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} domain={[10, 20]} />
                <Tooltip contentStyle={{ background: '#FDFCFA', border: '1px solid #EDE6D6', borderRadius: 10, fontSize: 13 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                {matieresData.map(m => (
                  <Line key={m.id} name={m.nom} type="monotone" dataKey={m.nom} stroke={m.couleur || '#1E3A5F'} strokeWidth={3} dot={{ fill: m.couleur || '#1E3A5F', r: 4 }} activeDot={{ r: 6 }} />
                ))}
              </LineChart>
            ) : isTeacher ? (
              <BarChart
                data={moyennesParMatiere}
                layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="#EDE6D6" />
                <XAxis type="number" domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `${v}/20`} />
                <YAxis type="category" dataKey="nom" axisLine={false} tickLine={false} tick={{ fill: '#1E3A5F', fontSize: 12, fontWeight: 600 }} width={100} />
                <Tooltip formatter={v => [`${v}/20`, 'Moyenne']} contentStyle={{ background: '#FDFCFA', border: '1px solid #EDE6D6', borderRadius: 10, fontSize: 13 }} />
                <Bar dataKey="moyenne" radius={[0, 6, 6, 0]} barSize={18}>
                  {matieresData.map((m, i) => <Cell key={i} fill={m.couleur || '#1E3A5F'} />)}
                </Bar>
              </BarChart>
            ) : isComptable ? (
              <BarChart data={statsCompta?.donnees_mensuelles || fallbackFluxMensuels} barSize={18} barCategoryGap="20%">
                <CartesianGrid vertical={false} stroke="#EDE6D6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} tickFormatter={v => (v / 1000) + 'k'} />
                <Tooltip formatter={v => [new Intl.NumberFormat('fr-FR').format(v) + ' FCFA', 'Encaissé']} contentStyle={{ background: '#FDFCFA', border: '1px solid #EDE6D6', borderRadius: 10, fontSize: 13 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar name="Encaissé" dataKey="total" fill="#27AE60" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={frequentationHebdo} barSize={36} barCategoryGap="30%">
                <CartesianGrid vertical={false} stroke="#EDE6D6" />
                <XAxis dataKey="classe" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} domain={[70, 100]} tickFormatter={v => v + '%'} />
                <Tooltip formatter={v => [v + '%', 'Présences']} contentStyle={{ background: '#FDFCFA', border: '1px solid #EDE6D6', borderRadius: 10, fontSize: 13 }} />
                <Bar dataKey="taux" radius={[6, 6, 0, 0]}>
                  {frequentationHebdo.map((e, i) => <Cell key={i} fill={e.taux >= 90 ? '#F5A623' : '#1E3A5F'} />)}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Colonne droite : Agenda (enseignant) ou Activité Récente (autres) */}
        <div className="card p-5 flex flex-col">
          <h2 className="font-display font-bold text-navy text-lg mb-4">
            {isTeacher ? 'Agenda Pédagogique' : 'Activité Récente'}
          </h2>
          {isTeacher ? (
            <div className="flex-1 space-y-3">
              {agendaEnseignant.map(ev => (
                <div key={ev.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${ev.color} flex items-center justify-center flex-shrink-0 text-sm`}>
                    {ev.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-navy truncate">{ev.desc}</p>
                      <span className="text-[10px] font-bold text-slate bg-beige border border-beige-dark px-2 py-0.5 rounded-full flex-shrink-0">{ev.date}</span>
                    </div>
                    <p className="text-xs text-slate mt-0.5">{ev.type} · {ev.matiere}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 space-y-4">
              {activitesFiltrees.map(a => (
                <div key={a.id} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full ${BG[a.type] || 'bg-navy/10'} flex items-center justify-center flex-shrink-0 text-sm`}>
                    {EMOJI[a.type] || '📌'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{a.titre}</p>
                    <p className="text-xs text-slate leading-relaxed">{a.description}</p>
                    <p className="text-[10px] text-slate/60 mt-0.5">{a.temps}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!isParent && !isComptable && !isTeacher && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => navigate('/eleves')} className="card p-4 flex items-center gap-4 hover:border-amber/40 hover:shadow-md transition text-left">
            <div className={`w-10 h-10 bg-navy/8 rounded-xl flex items-center justify-center`}>
              <Users size={20} className="text-navy" />
            </div>
            <div>
              <p className="font-semibold text-navy text-sm">Nouveau élève</p>
              <p className="text-xs text-slate">Inscrire un nouvel étudiant</p>
            </div>
          </button>
          <button onClick={() => setModalMsg(true)} className="card p-4 flex items-center gap-4 hover:border-amber/40 hover:shadow-md transition text-left">
            <div className="w-10 h-10 bg-amber/10 rounded-xl flex items-center justify-center"><Megaphone size={20} className="text-amber-dark" /></div>
            <div>
              <p className="font-semibold text-navy text-sm">Annonce</p>
              <p className="text-xs text-slate">Publier un message global</p>
            </div>
          </button>
          {isDirecteur && (
            <button onClick={() => navigate('/eleves')} className="card p-4 flex items-center gap-4 hover:border-sage/40 hover:shadow-md transition text-left col-span-2">
              <div className="w-10 h-10 bg-sage/10 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-sage" />
              </div>
              <div>
                <p className="font-semibold text-navy text-sm">Lien Parent-Élève</p>
                <p className="text-xs text-slate">Gérer les associations entre comptes parents et fiches élèves</p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Modal Demande d'inscription (enseignant) */}
      <Modal open={modalEleve} onClose={() => setModalEleve(false)} title={isTeacher ? "Demande d'inscription" : "Info"} size="md">
        {isTeacher ? (
          <div className="space-y-4">
            <p className="text-sm text-slate">Décrivez la demande d'inscription. Elle sera transmise à la <strong className="text-navy">Direction</strong> et à la <strong className="text-navy">Comptabilité</strong>.</p>
            <div>
              <label className="text-xs font-semibold text-slate block mb-1">Nom complet de l'élève</label>
              <input className="input-base w-full" placeholder="Ex : TRAORÉ Karim" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate block mb-1">Classe souhaitée</label>
                <input className="input-base w-full" defaultValue={maClasse?.nom} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate block mb-1">Contact parent</label>
                <input className="input-base w-full" placeholder="+226 XX XX XX XX" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate block mb-1">Remarques</label>
              <textarea className="input-base w-full resize-none" rows={3} placeholder="Informations complémentaires..."></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModalEleve(false)} className="btn-ghost">Annuler</button>
              <button onClick={() => setModalEleve(false)} className="btn-primary"><Send size={14} /> Envoyer la demande</button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Modal Annonce */}
      <Modal open={modalMsg} onClose={() => setModalMsg(false)} title="Publier une annonce" size="md">
        <div className="space-y-4">
          {isTeacher && (
            <div>
              <label className="text-xs font-semibold text-slate block mb-1">Destinataire</label>
              <select className="input-base w-full">
                <option>Direction</option>
                <option>Comptabilité</option>
                <option>Direction + Comptabilité</option>
              </select>
            </div>
          )}
          {isComptable && (
            <div>
              <label className="text-xs font-semibold text-slate block mb-1">Destinataire</label>
              <select className="input-base w-full">
                <option>Parents d'élèves avec impayés</option>
                <option>Direction</option>
              </select>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate block mb-1">Objet</label>
            <input className="input-base w-full" placeholder="Objet de l'annonce..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate block mb-1">Message</label>
            <textarea className="input-base w-full resize-none" rows={4} placeholder="Votre message..."></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalMsg(false)} className="btn-ghost">Annuler</button>
            <button onClick={() => setModalMsg(false)} className="btn-primary"><Send size={14} /> Envoyer</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
