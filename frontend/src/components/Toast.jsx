import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

export default function Toast({ message, type = 'success', visible }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
    } else {
      const t = setTimeout(() => setShow(false), 400)
      return () => clearTimeout(t)
    }
  }, [visible])

  if (!show && !visible) return null

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-medium text-sm transition-all duration-400
        ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}
        ${visible ? 'opacity-100 translate-y-0 -translate-x-1/2' : 'opacity-0 translate-y-4 -translate-x-1/2'}`}
      style={{ transform: `translateX(-50%) translateY(${visible ? '0' : '16px'})` }}
      role="alert"
      aria-live="polite"
    >
      {type === 'success' ? (
        <CheckCircle size={18} className="flex-shrink-0" />
      ) : (
        <XCircle size={18} className="flex-shrink-0" />
      )}
      <span>{message}</span>
    </div>
  )
}
