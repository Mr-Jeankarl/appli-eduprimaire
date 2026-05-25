import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyBadge({ text, label }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-beige-dark bg-white/70 hover:bg-white/90 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:border-navy/20 dark:bg-navy-dark dark:border-slate/10 dark:hover:bg-navy-dark/95">
      <div className="flex flex-col">
        {label && <span className="text-[10px] uppercase font-bold tracking-wider text-slate/60 mb-0.5">{label}</span>}
        <code className="font-mono text-sm font-bold text-navy dark:text-amber tracking-wider">{text}</code>
      </div>
      <button
        onClick={handleCopy}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
          copied 
            ? 'bg-sage/10 text-sage dark:bg-sage/20' 
            : 'bg-navy/5 text-slate hover:bg-navy/10 hover:text-navy dark:bg-white/5 dark:hover:bg-white/10 dark:hover:text-amber'
        }`}
        title="Copier le code"
      >
        {copied ? (
          <Check size={14} className="animate-scaleUp" />
        ) : (
          <Copy size={14} className="hover:scale-110 transition-transform duration-300" />
        )}
      </button>
    </div>
  )
}
