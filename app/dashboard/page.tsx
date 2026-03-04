'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, LogOut, User, Settings, CreditCard, Activity, Zap, Scissors } from 'lucide-react'
import { getCurrentUser, signOut } from '../../lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { user, error } = await getCurrentUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      setUser(user)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-mono">DocMerge</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user?.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-slate-400 text-lg">Here's your account overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-2xl font-bold">0</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">PDF Operations</h3>
            <p className="text-sm text-slate-400">Total files processed</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold">5</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Daily Limit</h3>
            <p className="text-sm text-slate-400">Operations remaining today</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-lg font-bold">Free</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Current Plan</h3>
            <p className="text-sm text-slate-400">Upgrade for unlimited access</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/#merge"
              className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl p-6 text-left transition-all hover:scale-[1.02] group"
            >
              <FileText className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Merge PDFs</h3>
              <p className="text-sm text-slate-400">Combine multiple files</p>
            </Link>

            <Link
              href="/tools/compress"
              className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl p-6 text-left transition-all hover:scale-[1.02] group"
            >
              <Zap className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Compress PDF</h3>
              <p className="text-sm text-slate-400">Reduce file size</p>
            </Link>

            <Link
              href="/tools/split"
              className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl p-6 text-left transition-all hover:scale-[1.02] group"
            >
              <Scissors className="w-8 h-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Split PDF</h3>
              <p className="text-sm text-slate-400">Extract pages</p>
            </Link>

            <button className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl p-6 text-left transition-all hover:scale-[1.02] group">
              <Settings className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Settings</h3>
              <p className="text-sm text-slate-400">Manage your account</p>
            </button>
          </div>
        </div>

        {/* Upgrade Banner */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-8 text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Ready for Unlimited Access?</h2>
          <p className="text-lg mb-6 opacity-90">
            Upgrade to Premium and unlock all features with no limits
          </p>
          <Link
            href="/#pricing"
            className="inline-block bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            View Plans
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8 text-center">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No recent activity</p>
            <p className="text-sm text-slate-500">Start using PDF tools to see your history here</p>
          </div>
        </div>
      </main>
    </div>
  )
}