import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Smartphone, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'
import { verifyOwnerLogin } from '../lib/businessStore.js'

export default function OwnerLogin() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    const cleanPhone = phone.trim()
    const cleanPin = pin.trim()

    if (!cleanPhone || !cleanPin) {
      setError('Please enter both your mobile number and PIN.')
      return
    }

    setLoading(true)
    try {
      const session = await verifyOwnerLogin(cleanPhone, cleanPin)
      if (session) {
        localStorage.setItem('owner_session', JSON.stringify(session))
        navigate('/owner')
      } else {
        setError('Invalid mobile number or PIN. Please check credentials or contact your administrator.')
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center p-4">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none bg-[#a3e635]/15" />

      <div className="w-full max-w-md bg-[#0e1017] border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-[#a3e635]/10 border border-[#a3e635]/30 flex items-center justify-center mx-auto mb-4 text-[#a3e635]">
          <Smartphone size={28} />
        </div>

        <div className="text-center mb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#a3e635] bg-[#a3e635]/10 px-3 py-1 rounded-full border border-[#a3e635]/20">
            Owner Portal
          </span>
          <h1 className="text-2xl font-black mt-2 text-white">Client Business Login</h1>
          <p className="text-xs text-gray-400 mt-1">
            Log in to manage your business details and customer links.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5 uppercase tracking-wider">
              Registered Mobile Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full bg-[#161822] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635]"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5 uppercase tracking-wider">
              Personal Security PIN
            </label>
            <input
              type="password"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full bg-[#161822] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-[0_10px_30px_rgba(163,230,53,0.3)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Verifying...</span>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Log In to My Business</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <Link
            to="/"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            &larr; Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
