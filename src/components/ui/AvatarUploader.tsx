'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react'

interface AvatarUploaderProps {
  uid: string
  defaultUrl?: string | null
  onUpload?: (url: string) => void
  name?: string
}

export default function AvatarUploader({ uid, defaultUrl, onUpload, name }: AvatarUploaderProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(defaultUrl || null)
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (file: File) => {
    try {
      setUploading(true)

      const fileExt = file.name.split('.').pop()
      const filePath = `avatars/${uid}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from('public').getPublicUrl(filePath)
      
      setAvatarUrl(data.publicUrl)
      if (onUpload) onUpload(data.publicUrl)

    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error uploading avatar: ' + (error as any).message)
    } finally {
      setUploading(false)
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="flex flex-col gap-3 items-center sm:items-start">
      <input 
        type="hidden" 
        name={name} 
        value={avatarUrl || ''} 
      />
      
      <div 
        className={`
          group relative flex flex-col items-center justify-center 
          w-28 h-28 rounded-full overflow-hidden 
          border-2 border-dashed transition-all cursor-pointer shadow-sm
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:border-blue-400 dark:hover:border-blue-500'
          }
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        title="Click or drag to upload avatar"
      >
        {avatarUrl ? (
          <>
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <UploadCloud className="w-6 h-6 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-neutral-400 p-2 text-center">
            <ImageIcon className="w-6 h-6 mb-1" />
            <span className="text-[9px] uppercase font-bold leading-tight">Upload Photo</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0])
          }
        }}
        className="hidden"
      />
    </div>
  )
}
