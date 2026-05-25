import { useState, useMemo } from 'react'
import { classes as mockClasses, eleves } from '../../data/mockData'
import { ImageUploader } from '../../components/ui'

const INIT = { nom: '', prenom: '', dateNaissance: '', sexe: 'M', classeId: '', matricule: '', statut: 'INSCRIT', parentNom: '', parentTel: '', parentEmail: '', parent2Nom: '', parent2Tel: '', parent2Email: '' }

export default function EleveForm({ onSubmit, onCancel, initial = {}, classesOptions = mockClasses }) {
  const [form, setForm] = useState({ ...INIT, ...initial })
  const set = k => e => setForm(v => ({ ...v, [k]: e.target.value }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-5">
      <div>
        <p className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Informations élève</p>
        <div className="mb-4">
          <ImageUploader 
            value={form.photo} 
            onChange={file => setForm(v => ({ ...v, photo: file }))} 
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate">Nom *</label>
            <input required className="input-base mt-1" placeholder="TRAORÉ" value={form.nom} onChange={set('nom')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate">Prénom *</label>
            <input required className="input-base mt-1" placeholder="Amadou" value={form.prenom} onChange={set('prenom')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate">Date de naissance *</label>
            <input type="date" required className="input-base mt-1" value={form.dateNaissance} onChange={set('dateNaissance')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate">Sexe</label>
            <select className="input-base mt-1" value={form.sexe} onChange={set('sexe')}>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate">Classe *</label>
            <select required className="input-base mt-1" value={form.classeId} onChange={set('classeId')}>
              <option value="">Sélectionner...</option>
              {classesOptions.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate">Matricule</label>
            <input className="input-base mt-1 bg-beige/50 font-mono text-navy font-bold" readOnly value={form.id ? form.matricule : "AUTO-GÉNÉRÉ"} placeholder="Auto-généré" />
            <p className="text-[10px] text-slate/60 mt-0.5">Format: EDU{"{école}"}{"{séquence}"}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-beige-dark pt-4">
        <p className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Contact Parent / Tuteur</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate">Nom du parent</label>
            <input className="input-base mt-1" placeholder="Kofi TRAORÉ" value={form.parentNom} onChange={set('parentNom')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate">Téléphone</label>
            <input className="input-base mt-1" placeholder="+226 70 XX XX XX" value={form.parentTel} onChange={set('parentTel')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate">Email</label>
            <input type="email" className="input-base mt-1" placeholder="parent@email.com" value={form.parentEmail} onChange={set('parentEmail')} />
          </div>
        </div>
      </div>
      <div className="border-t border-beige-dark pt-4">
        <p className="text-xs font-bold text-slate uppercase tracking-wider mb-3">2ème Parent / Tuteur <span className="text-slate/50 normal-case font-normal">(optionnel)</span></p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate">Nom du 2ème parent</label>
            <input className="input-base mt-1" placeholder="Fatou TRAORÉ" value={form.parent2Nom} onChange={set('parent2Nom')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate">Téléphone</label>
            <input className="input-base mt-1" placeholder="+226 76 XX XX XX" value={form.parent2Tel} onChange={set('parent2Tel')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate">Email</label>
            <input type="email" className="input-base mt-1" placeholder="parent2@email.com" value={form.parent2Email} onChange={set('parent2Email')} />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Annuler</button>
        <button type="submit" className="btn-primary">{initial.id ? 'Enregistrer' : 'Inscrire'}</button>
      </div>
    </form>
  )
}
