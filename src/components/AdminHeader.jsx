import React from 'react'

function AdminHeader() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-600">Welcome to the admin panel.</p>
        </div>
      </div>
    </div>
  )
}

export default AdminHeader
