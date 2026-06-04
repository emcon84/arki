'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface DeleteSessionButtonProps {
  sessionId: string
  adminKey: string
}

export function DeleteSessionButton({ sessionId, adminKey }: DeleteSessionButtonProps) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Eliminar sesion ${sessionId.slice(0, 8)}? Esta accion no se puede deshacer.`)) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}?key=${adminKey}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={() => void handleDelete()}
      disabled={deleting}
      className="flex items-center justify-center rounded-lg p-1.5 text-[#cccccc] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:text-[#444444] dark:hover:bg-red-950/30 dark:hover:text-red-400"
      title="Eliminar sesion"
    >
      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
    </button>
  )
}
