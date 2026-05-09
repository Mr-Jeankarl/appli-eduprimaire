import { useState, useMemo } from 'react'
import { Users, GraduationCap, CalendarCheck, AlertTriangle, Megaphone, Send, BookOpen, Calendar } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { ecole, eleves, classes, matieres, paiements, frequentationHebdo, activiteRecente } from '../../data/mockData'
import { StatCard } from '../../components/ui/index'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'

const EMOJI = { paiement: '💳', appel: '✅', bulletin: '📋', eleve: '👤' }
const BG    = { paiement: 'bg-sage/10', appel: 'bg-amber/10', bulletin: 'bg-navy/10', eleve: 'bg-coral/10' }

// Agenda pédagogique mock pour l'enseignant
const agendaEnseignant = [
  { id: 'ag-1', date: '05/05', type: 'Évaluation', matiere: 'Mathématiques', desc: 'Contrôle sur les fractions', icon: '📝', color: 'bg-coral/10 text-coral' },
  { id: 'ag-2', date: '07/05', type: 'Devoir',     matiere: 'Français',      desc: 'Rédaction — sujet libre', icon: '✏️', color: 'bg-amber/10 text-amber-dark' },
  { id: 'ag-3', date: '10/05', type: 'Bulletin',   matiere: 'Toutes',        desc: 'Remise des bulletins T1', icon: '📋', color: 'bg-navy/10 text-navy' },
  { id: 'ag-4', date: '14/05', type: 'Sortie',     matiere: 'Éveil',         desc: 'Visite du musée municipal', icon: '🚌', color: 'bg-sage/10 text-sage' },
]

const evolutionNotes = [
  { eval: 'Devoir 1', maths: 14, francais: 12, sciences: 15, hg: 13, ec: 16, sport: 18 },
  { eval: 'Devoir 2', maths: 15.5, francais: 14, sciences: 14.5, hg: 15, ec: 14, sport: 17 },
  { eval: 'Examen T1', maths: 16.5, francais: 15, sciences: 17, hg: 14, ec: 17, sport: 19 },
]

export default function Dashboard() {
  const [modalEleve, setModalEleve] = useState(false)
  const [modalMsg, setModalMsg]     = useState(false)
  const { user } = useAuth()
  const isParent = user?.role === 'PARENT'
  const isTeacher = user?.role === 'ENSEIGNANT'

  // Si c'est un parent, on filtre les données pour son enfant
  const monEnfant = useMemo(() => {
    if (!isParent) return null
    return eleves.find(e => e.parentNom.includes(user.nom)) || eleves[0]
  }, [isParent, user])
  
  const childPrenom = monEnfant?.prenom || 'votre enfant'

  // Si c'est un enseignant, on trouve sa classe
  const maClasse = useMemo(() => {
    if (!isTeacher) return null
    return classes.find(c => c.enseignantId === user.id) || classes[0]
  }, [isTeacher, user])

  const isComptable = user?.role === 'COMPTABLE'
  const isDirecteur = user?.role === 'DIRECTEUR'

  const mesElevesCount = useMemo(() => {
    if (!maClasse) return 0
    return eleves.filter(e => e.classeId === maClasse.id).length
  }, [maClasse])
  
  const totalInscrits = eleves.filter(e => e.statut === 'INSCRIT').length
  const impayes       = paiements.filter(p => p.statut !== 'PAYE').length
  
  // Stats financières pour le comptable
  const totalEnc = paiements.filter(p => p.statut === 'PAYE').reduce((s, p) => s + p.montantPaye, 0)
  const totalAtt = paiements.reduce((s, p) => s + p.montantDu, 0)
  const tauxRecouvrement = totalAtt > 0 ? Math.round((totalEnc / totalAtt) * 100) : 0
  const fmt = n => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

  // Stats spécifiques parent
  const monEnfantPaiements = isParent && monEnfant ? paiements.filter(p => p.eleveId === monEnfant.id) : []
  const monEnfantImpayes   = monEnfantPaiements.filter(p => p.statut !== 'PAYE').length

  const activitesFiltrees = useMemo(() => {
    if (isParent) {
      return activiteRecente.filter(a => (monEnfant && a.description.includes(monEnfant.prenom)) || a.type === 'bulletin')
    }
    if (isTeacher && maClasse) {
      // Filtrer les activités qui concernent sa classe ou les annonces globales
      return activiteRecente.filter(a => a.description.includes(maClasse.nom.split(' ')[0]) || a.type === 'bulletin' || a.type === 'appel')
    }
    if (isComptable) {
      return activiteRecente.filter(a => a.type === 'paiement')
    }
    return activiteRecente
  }, [isParent, isTeacher, isComptable, monEnfant, maClasse])

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
          <p className="text-slate text-sm mt-0.5">Bienvenue — <span className="font-semibold text-navy">{ecole.nom}</span></p>
        </div>
        {!isParent && !isTeacher && !isComptable && (
          <div className="flex gap-2">
            <button onClick={() => setModalEleve(true)} className="btn-primary"><BookOpen size={16} /> Faire l'appel</button>
            <button onClick={() => setModalMsg(true)}   className="btn-amber"><Megaphone size={16} /> Saisir notes</button>
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
            <StatCard titre="Total Élèves"        valeur={totalInscrits} sous="+4% vs mois dernier"   icon={Users}          variant="navy"  />
            <StatCard titre="Enseignants"          valeur={18}            sous={`${classes.length} classes`} icon={GraduationCap} />
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
                <Line name="Maths" type="monotone" dataKey="maths" stroke="#F5A623" strokeWidth={3} dot={{ fill: '#F5A623', r: 4 }} activeDot={{ r: 6 }} />
                <Line name="Français" type="monotone" dataKey="francais" stroke="#E05C7A" strokeWidth={3} dot={{ fill: '#E05C7A', r: 4 }} activeDot={{ r: 6 }} />
                <Line name="Sciences" type="monotone" dataKey="sciences" stroke="#27AE60" strokeWidth={3} dot={{ fill: '#27AE60', r: 4 }} activeDot={{ r: 6 }} />
                <Line name="Hist-Géo" type="monotone" dataKey="hg" stroke="#D35400" strokeWidth={3} dot={{ fill: '#D35400', r: 4 }} activeDot={{ r: 6 }} />
                <Line name="Éd. Civique" type="monotone" dataKey="ec" stroke="#8E44AD" strokeWidth={3} dot={{ fill: '#8E44AD', r: 4 }} activeDot={{ r: 6 }} />
                <Line name="Sport" type="monotone" dataKey="sport" stroke="#2980B9" strokeWidth={3} dot={{ fill: '#2980B9', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            ) : isTeacher ? (
              <BarChart
                data={matieres.map(m => ({ nom: m.nom, moyenne: [14.2, 13.5, 15.1, 12.8, 16.0, 17.5][matieres.indexOf(m)] }))}
                layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="#EDE6D6" />
                <XAxis type="number" domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `${v}/20`} />
                <YAxis type="category" dataKey="nom" axisLine={false} tickLine={false} tick={{ fill: '#1E3A5F', fontSize: 12, fontWeight: 600 }} width={100} />
                <Tooltip formatter={v => [`${v}/20`, 'Moyenne']} contentStyle={{ background: '#FDFCFA', border: '1px solid #EDE6D6', borderRadius: 10, fontSize: 13 }} />
                <Bar dataKey="moyenne" radius={[0, 6, 6, 0]} barSize={18}>
                  {matieres.map((m, i) => <Cell key={i} fill={m.couleur} />)}
                </Bar>
              </BarChart>
            ) : isComptable ? (
              <div className="flex items-center justify-center h-full text-slate">
                Le graphique des flux de trésorerie mensuels sera disponible prochainement.
              </div>
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

      {!isParent && !isComptable && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => setModalEleve(true)} className="card p-4 flex items-center gap-4 hover:border-amber/40 hover:shadow-md transition text-left">
            <div className={`w-10 h-10 ${isTeacher ? 'bg-sage/10' : 'bg-navy/8'} rounded-xl flex items-center justify-center`}>
              {isTeacher ? <Send size={20} className="text-sage" /> : <Users size={20} className="text-navy" />}
            </div>
            <div>
              <p className="font-semibold text-navy text-sm">{isTeacher ? 'Demande d\'inscription' : 'Nouveau élève'}</p>
              <p className="text-xs text-slate">{isTeacher ? 'Envoyer à la Direction / Comptabilité' : 'Inscrire un nouvel étudiant'}</p>
            </div>
          </button>
          <button onClick={() => setModalMsg(true)} className="card p-4 flex items-center gap-4 hover:border-amber/40 hover:shadow-md transition text-left">
            <div className="w-10 h-10 bg-amber/10 rounded-xl flex items-center justify-center"><Megaphone size={20} className="text-amber-dark" /></div>
            <div>
              <p className="font-semibold text-navy text-sm">Annonce</p>
              <p className="text-xs text-slate">{isTeacher ? 'Adresser à la Direction ou Comptabilité' : 'Publier un message global'}</p>
            </div>
          </button>
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
        ) : (
          <>
            <p className="text-sm text-slate">Accédez au module <strong className="text-navy">Élèves</strong> pour inscrire un nouvel étudiant.</p>
            <div className="flex justify-end mt-4"><button onClick={() => setModalEleve(false)} className="btn-primary">OK</button></div>
          </>
        )}
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
