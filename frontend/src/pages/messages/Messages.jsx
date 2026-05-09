import { useState, useMemo } from 'react'
import { Plus, Send, Inbox, CheckCheck, Clock, Megaphone } from 'lucide-react'
import { messages as initMessages, classes, eleves } from '../../data/mockData'
import Modal from '../../components/ui/Modal'
import { Avatar } from '../../components/ui/index'
import { useAuth } from '../../context/AuthContext'

const ROLE_BADGE = { DIRECTEUR: 'badge-navy', ENSEIGNANT: 'badge-green', ADMIN: 'badge-red', COMPTABLE: 'badge-amber', PARENT: 'badge-coral' }

function ComposeForm({ onSubmit, onCancel, isParent, isTeacher, isComptable, isDirecteur, maClasse }) {
  const defaultDest = isParent ? 'ecole' : isTeacher ? 'classe' : isComptable ? 'parents_impayes' : 'tous'
  const [form, setForm] = useState({ 
    destinataireType: defaultDest, 
    classeId: isTeacher && maClasse ? maClasse.id : '', 
    objet: '', 
    contenu: '' 
  })
  const set = k => e => setForm(v => ({ ...v, [k]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-slate">Destinataire</label>
        {isParent ? (
          <select className="input-base mt-1" value={form.destinataireType} onChange={set('destinataireType')}>
            <option value="ecole">Direction de l'école</option>
            <option value="enseignant">Enseignant de l'enfant</option>
          </select>
        ) : isTeacher ? (
          <select className="input-base mt-1" value={form.destinataireType} onChange={set('destinataireType')}>
            <option value="classe">Parents de {maClasse?.nom || 'ma classe'}</option>
            <option value="direction">Direction</option>
            <option value="comptabilite">Comptabilité</option>
            <option value="equipe">Équipe pédagogique</option>
          </select>
        ) : isComptable ? (
          <select className="input-base mt-1" value={form.destinataireType} onChange={set('destinataireType')}>
            <option value="parents_impayes">Parents d'élèves avec impayés</option>
            <option value="direction">Direction</option>
          </select>
        ) : isDirecteur ? (
          <select className="input-base mt-1" value={form.destinataireType} onChange={set('destinataireType')}>
            <option value="tous">Tous les parents</option>
            <option value="classe">Une classe</option>
            <option value="equipe">Équipe pédagogique</option>
            <option value="comptabilite">Comptabilité</option>
          </select>
        ) : (
          <select className="input-base mt-1" value={form.destinataireType} onChange={set('destinataireType')}>
            <option value="tous">Tous les parents</option>
            <option value="classe">Une classe</option>
            <option value="equipe">Équipe pédagogique</option>
          </select>
        )}
      </div>
      {form.destinataireType === 'classe' && !isParent && !isTeacher && (
        <div>
          <label className="text-xs font-semibold text-slate">Classe</label>
          <select className="input-base mt-1" value={form.classeId} onChange={set('classeId')}>
            <option value="">Sélectionner...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>
      )}
      <div><label className="text-xs font-semibold text-slate">Objet *</label><input required className="input-base mt-1" placeholder="Objet du message" value={form.objet} onChange={set('objet')} /></div>
      <div><label className="text-xs font-semibold text-slate">Message *</label><textarea required rows={5} className="input-base mt-1 resize-none" placeholder="Rédigez votre message..." value={form.contenu} onChange={set('contenu')} /></div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Annuler</button>
        <button type="submit" className="btn-primary"><Send size={14} /> Envoyer</button>
      </div>
    </form>
  )
}

export default function Messages() {
  const { user } = useAuth()
  const isParent = user?.role === 'PARENT'
  const isTeacher = user?.role === 'ENSEIGNANT'
  const isComptable = user?.role === 'COMPTABLE'
  const isDirecteur = user?.role === 'DIRECTEUR'

  // Classe de l'enseignant
  const maClasse = useMemo(() => {
    if (!isTeacher) return null
    return classes.find(c => c.enseignantId === user.id) || null
  }, [isTeacher, user])

  // Filtrer les messages selon le rôle
  const initialMessages = useMemo(() => {
    if (isParent) {
      const monEnfant = eleves.find(e => e.parentNom.includes(user.nom)) || eleves[0]
      return initMessages.filter(m => 
        m.destinataireType === 'tous' || 
        (m.destinataireType === 'classe' && m.classeId === monEnfant.classeId)
      )
    }
    if (isTeacher && maClasse) {
      return initMessages.filter(m =>
        m.destinataireType === 'tous' ||
        m.destinataireType === 'equipe' ||
        (m.destinataireType === 'classe' && m.classeId === maClasse.id)
      )
    }
    if (isComptable) {
      return initMessages.filter(m => 
        m.destinataireType === 'comptabilite' || 
        m.expediteurRole === 'COMPTABLE'
      )
    }
    return initMessages
  }, [user, isParent, isTeacher, isComptable, maClasse])

  const [messages, setMessages] = useState(initialMessages)
  const [selected, setSelected] = useState(initialMessages[0])
  const [modalCompose, setCompose] = useState(false)

  const nonLus = messages.filter(m => !m.lu).length

  const handleSend = data => {
    const n = { 
      ...data, 
      id: `msg-${Date.now()}`, 
      expediteurNom: `${user.prenom} ${user.nom}`, 
      expediteurRole: user.role, 
      date: new Date().toISOString().split('T')[0], 
      lu: true 
    }
    setMessages(v => [n, ...v])
    setSelected(n)
    setCompose(false)
  }

  const handleSelect = msg => {
    setSelected(msg)
    if (!msg.lu) setMessages(v => v.map(m => m.id === msg.id ? { ...m, lu: true } : m))
  }

  const destLabel = m => m.destinataireType === 'classe' ? 'Classe spécifique' : m.destinataireType === 'equipe' ? 'Équipe pédagogique' : m.destinataireType === 'parents_impayes' ? 'Parents (Impayés)' : 'Tous les parents'
  const parts = name => { const p = (name || '').split(' '); return { prenom: p[0] || '', nom: p[1] || '' } }

  return (
    <div className="flex h-full page-enter overflow-hidden">
      <div className="w-80 flex-shrink-0 border-r border-beige-dark flex flex-col">
        <div className="p-4 border-b border-beige-dark">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="font-display text-lg font-bold text-navy">Messages</h1>
              {nonLus > 0 && <p className="text-xs text-amber-dark font-semibold">{nonLus} non lu(s)</p>}
            </div>
            <button onClick={() => setCompose(true)} className="btn-amber text-xs px-3 py-1.5"><Plus size={13} /> Composer</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-beige-dark/60">
          {messages.map(msg => {
            const p = parts(msg.expediteurNom)
            return (
              <button key={msg.id} onClick={() => handleSelect(msg)} className={"w-full text-left p-4 hover:bg-beige/60 transition " + (selected?.id === msg.id ? 'bg-amber/5 border-l-2 border-l-amber' : '') + (!msg.lu ? ' bg-beige/30' : '')}>
                <div className="flex items-start gap-3">
                  <Avatar prenom={p.prenom} nom={p.nom} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={"text-sm truncate " + (!msg.lu ? 'font-bold text-navy' : 'font-semibold text-navy/80')}>{msg.expediteurNom}</p>
                      {!msg.lu && <span className="w-2 h-2 bg-amber rounded-full flex-shrink-0" />}
                    </div>
                    <p className={"text-xs truncate mt-0.5 " + (!msg.lu ? 'text-navy font-medium' : 'text-slate')}>{msg.objet}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={10} className="text-slate/50" />
                      <span className="text-[10px] text-slate/60">{msg.date}</span>
                      <span className={ROLE_BADGE[msg.expediteurRole] + ' text-[9px] ml-1'}>{msg.expediteurRole}</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
          {messages.length === 0 && <div className="p-8 text-center text-slate text-sm">Aucun message</div>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <div className="p-6 max-w-2xl space-y-5">
            <div className="card p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display font-bold text-navy text-xl leading-tight">{selected.objet}</h2>
                {selected.lu
                  ? <span className="flex items-center gap-1 text-xs text-slate flex-shrink-0"><CheckCheck size={13} /> Lu</span>
                  : <span className="text-xs text-amber-dark font-semibold">Non lu</span>
                }
              </div>
              <div className="flex items-center gap-3 pt-1 border-t border-beige-dark">
                <Avatar prenom={parts(selected.expediteurNom).prenom} nom={parts(selected.expediteurNom).nom} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-navy">{selected.expediteurNom}</p>
                  <div className="flex items-center gap-2 text-xs text-slate">
                    <span className={ROLE_BADGE[selected.expediteurRole] + ' text-[10px]'}>{selected.expediteurRole}</span>
                    <span>·</span><span>{selected.date}</span>
                    <span>·</span><span className="flex items-center gap-1"><Megaphone size={10} /> {destLabel(selected)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <p className="text-sm text-navy leading-relaxed whitespace-pre-wrap">{selected.contenu}</p>
            </div>
            <p className="text-xs text-slate/60 italic flex items-center gap-1.5">
              <Inbox size={12} /> {isParent 
                ? "Vous pouvez répondre à ce message ou contacter directement l'école." 
                : "Les parents lisent ce message en lecture seule et peuvent contacter l'enseignant par téléphone."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate gap-3">
            <Inbox size={40} className="text-beige-dark" />
            <p className="text-sm">Sélectionnez un message</p>
          </div>
        )}
      </div>

      <Modal open={modalCompose} onClose={() => setCompose(false)} title="Nouveau message" size="md">
        <ComposeForm onSubmit={handleSend} onCancel={() => setCompose(false)} isParent={isParent} isTeacher={isTeacher} isComptable={isComptable} isDirecteur={isDirecteur} maClasse={maClasse} />
      </Modal>
    </div>
  )
}
