// Badge
export function Badge({ statut }) {
  const map = {
    INSCRIT: 'badge-green', EN_ATTENTE: 'badge-amber', ARCHIVE: 'badge-slate',
    PAYE: 'badge-green', PARTIEL: 'badge-amber', EN_ATTENTE_PAY: 'badge-red',
    PRESENT: 'badge-green', ABSENT_JUSTIFIE: 'badge-amber', ABSENT_NON_JUSTIFIE: 'badge-red', RETARD: 'badge-amber',
  }
  const labels = {
    INSCRIT: 'Actif', EN_ATTENTE: 'En attente', ARCHIVE: 'Archivé',
    PAYE: 'Payé', PARTIEL: 'Partiel', EN_ATTENTE_PAY: 'Impayé',
    PRESENT: 'Présent', ABSENT_JUSTIFIE: 'Absent (J)', ABSENT_NON_JUSTIFIE: 'Absent (NJ)', RETARD: 'Retard',
  }
  return <span className={map[statut] || 'badge-slate'}>{labels[statut] || statut}</span>
}

// StatCard
export function StatCard({ titre, valeur, sous, icon: Icon, variant = 'default', onClick }) {
  const variants = {
    default: 'bg-beige-card border-beige-dark',
    navy:    'bg-navy text-white border-navy-dark',
    amber:   'bg-amber/10 border-amber/25',
    red:     'bg-coral/5 border-coral/20',
    green:   'bg-sage/5 border-sage/20',
  }
  return (
    <div className={`card p-5 ${variants[variant]} ${onClick ? 'cursor-pointer hover:shadow-md transition' : ''}`} onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${variant === 'navy' ? 'text-white/60' : 'text-slate'}`}>{titre}</p>
          <p className={`font-display text-3xl font-bold ${variant === 'navy' ? 'text-white' : 'text-navy'}`}>{valeur}</p>
          {sous && <p className={`text-xs mt-1 ${variant === 'navy' ? 'text-white/50' : 'text-slate'}`}>{sous}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            variant === 'navy' ? 'bg-white/15' : variant === 'amber' ? 'bg-amber/20' : variant === 'red' ? 'bg-coral/15' : variant === 'green' ? 'bg-sage/15' : 'bg-navy/8'
          }`}>
            <Icon size={20} className={variant === 'navy' ? 'text-white' : variant === 'amber' ? 'text-amber-dark' : variant === 'red' ? 'text-coral' : variant === 'green' ? 'text-sage' : 'text-navy'} />
          </div>
        )}
      </div>
    </div>
  )
}

// Avatar
export function Avatar({ prenom, nom, src, size = 'md' }) {
  const initiales = `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase()
  const palettes = ['bg-amber/20 text-amber-dark', 'bg-navy/10 text-navy', 'bg-sage/15 text-sage', 'bg-coral/10 text-coral']
  const idx = (prenom?.charCodeAt(0) || 0) % palettes.length
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }
  
  return (
    <div className={`${sizes[size]} ${palettes[idx]} rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden`}>
      {src ? (
        <img src={src} alt={`${prenom} ${nom}`} className="w-full h-full object-cover" />
      ) : (
        initiales
      )}
    </div>
  )
}

export function LogoMark({ src = '/eduprimaire-logo.png', initials = 'EP', size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-10 h-10 rounded-xl text-sm',
    lg: 'w-16 h-16 rounded-2xl text-xl',
    xl: 'w-28 h-24 rounded-2xl text-2xl',
  }

  return (
    <div className={`${sizes[size]} bg-white border border-beige-dark/70 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt="Logo EduPrimaire" className="w-full h-full object-contain" />
      ) : (
        <span className="font-display font-bold text-navy">{initials}</span>
      )}
    </div>
  )
}

export { default as CopyBadge } from './CopyBadge'
export { default as ImageUploader } from './ImageUploader'
export { default as InvitationPanel } from './InvitationPanel'
