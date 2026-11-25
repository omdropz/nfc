import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Wifi, ArrowLeft, AlertCircle } from 'lucide-react'
import { login } from '../lib/api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await login(email.trim(), password)
      if (data?.token) {
        localStorage.setItem('admin_token', data.token)
      } else {
        localStorage.setItem('admin_token', 'authenticated')
      }
      navigate('/admin')
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Invalid credentials. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 p-4 relative overflow-hidden select-none">
      {/* Decorative ambient auras */}
      <div className="absolute top-[-100px] right-[-100px] w-80 h-80 rounded-full bg-indigo-500 opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-64 h-64 rounded-full bg-purple-500 opacity-20 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm animate-bounce-in relative z-10">
        {/* Back link */}
        <Link
          to="/p/demo"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to page</span>
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-[#11131a] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

          <div className="p-8">
            {/* Logo & Title */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg mb-4">
                <Wifi size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-gray-950 dark:text-white tracking-tight">Admin Access</h1>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">Sign in to manage your NFC card</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 text-sm font-medium">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                    <Mail size={17} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    className="border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-[#181a20] text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-semibold rounded-xl pl-10 pr-4 py-3.5 focus:bg-white dark:focus:bg-[#14161d] focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none w-full text-sm transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                    <Lock size={17} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-[#181a20] text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-semibold rounded-xl pl-10 pr-11 py-3.5 focus:bg-white dark:focus:bg-[#14161d] focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none w-full text-sm transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed tracking-wide text-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-white/60 text-xs mt-6 font-semibold tracking-wide">
          🔒 Secure admin portal
        </p>
      </div>
    </div>
  )
}
