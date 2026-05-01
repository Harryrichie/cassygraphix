import { useState } from 'react'
import { supabase } from '../config/supabaseConfig'
import { Toaster, toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import IconLogo from '../assets/icon-logo.png'

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      console.log('Login successful data:', data);
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session after login in SignIn.jsx:', session);

      // Login successful
      toast.success('Login successful! Redirecting...')
      
      // Redirect to home page or dashboard
      setTimeout(() => {
        navigate('/admin', { state: { fromLogin: true } })
      }, 1500)
      
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        toast.error('Connection failed. Check your internet or Supabase configuration.')
      } else {
        toast.error(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <Toaster position="top-center" richColors />
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gray-600 p-3 rounded-xl">
            <img src={IconLogo} alt="Logo" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to manage your portfolio</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
              placeholder="admin@cassygraphix.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignIn