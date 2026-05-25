import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'

export default function ImageUploader({ value, onChange, maxSizeBytes = 5 * 1024 * 1024, fallbackAvatar }) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    setError('')
    if (!file) return false

    // Format validation
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp']
    const extension = file.name.split('.').pop().toLowerCase()
    if (!allowedExtensions.includes(extension)) {
      setError('Format invalide. Seuls les formats PNG, JPG, JPEG et WebP sont acceptés.')
      return false
    }

    // Size validation
    if (file.size > maxSizeBytes) {
      setError(`Le fichier est trop lourd. Taille max : ${maxSizeBytes / (1024 * 1024)} Mo.`)
      return false
    }

    return true
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        onChange(file)
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        onChange(file)
      }
    }
  }

  const removeImage = (e) => {
    e.preventDefault()
    setError('')
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getPreviewUrl = () => {
    if (!value) return fallbackAvatar || null
    if (typeof value === 'string') return value
    return URL.createObjectURL(value)
  }

  const previewUrl = getPreviewUrl()

  return (
    <div className="space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 ${
          dragActive
            ? 'border-amber bg-amber/5 scale-[1.01]'
            : 'border-beige-dark bg-beige-card/50 hover:bg-beige-card hover:border-navy/20 dark:border-slate/10 dark:bg-navy-dark/40 dark:hover:bg-navy-dark/60'
        } min-h-[160px]`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFileChange}
        />

        {previewUrl ? (
          <div className="relative group w-32 h-32 rounded-xl overflow-hidden shadow-md transition-transform duration-300 hover:scale-105">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={removeImage}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-coral text-white flex items-center justify-center shadow-md hover:bg-coral-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              title="Supprimer la photo"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center text-slate/75 dark:bg-white/5 dark:text-amber">
              <Upload size={20} className="animate-bounce" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-navy dark:text-white">Glissez une photo</span> ou <span className="font-bold text-amber">parcourez</span>
            </div>
            <p className="text-[10px] text-slate/60 dark:text-white/40">PNG, JPG ou WebP. Max 5 Mo.</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-coral/5 border border-coral/20 text-coral text-xs">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
