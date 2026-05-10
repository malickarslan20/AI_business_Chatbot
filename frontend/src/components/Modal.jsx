import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ title, children, onClose }) {
  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-darkBg2 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-fade-in [animation-duration:200ms]">
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-white/5">
          <h2 className="text-xl sm:text-2xl font-black text-textMain tracking-tight">{title}</h2>
          <button 
            className="p-2 rounded-xl bg-white/5 text-textSecondary hover:text-textMain hover:bg-white/10 transition-all"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
