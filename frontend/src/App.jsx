import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import CardSetupWizard from './pages/CardSetupWizard.jsx'
import OwnerLogin from './pages/OwnerLogin.jsx'
import OwnerPortal from './pages/OwnerPortal.jsx'

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token')
  if (!token) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}

function OwnerProtectedRoute({ children }) {
  const session = localStorage.getItem('owner_session')
  if (!session) {
    return <Navigate to="/owner/login" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Root domain directly opens the NFC card without any redirect */}
      <Route path="/" element={<LandingPage defaultPageId="omdropz" />} />

      {/* Permanent NFC Card URLs: /c/:pageId (and backward-compatible /p/:pageId) */}
      <Route path="/c/:pageId" element={<LandingPage />} />
      <Route path="/p/:pageId" element={<LandingPage />} />

      {/* First Scan / NFC Tap Setup Wizard for unassigned cards */}
      <Route path="/setup/:cardId" element={<CardSetupWizard />} />

      {/* Dedicated Client Owner Portal */}
      <Route path="/owner/login" element={<OwnerLogin />} />
      <Route
        path="/owner"
        element={
          <OwnerProtectedRoute>
            <OwnerPortal />
          </OwnerProtectedRoute>
        }
      />

      {/* Administrator Customization & NFC Management Dashboard */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />

      {/* Catch-all for custom business slugs */}
      <Route path="/:pageId" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
