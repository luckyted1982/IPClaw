import { useState, useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkAuth } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [verified, setVerified] = useState<boolean | null>(null)

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        checkAuth().then((ok) => {
          setVerified(ok)
          if (!ok) setShowModal(true)
        })
      } else {
        setShowModal(true)
        setVerified(false)
      }
    }
  }, [isLoading, isAuthenticated, checkAuth])

  if (isLoading || verified === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (verified) {
    return <>{children}</>
  }

  return (
    <>
      <Navigate to="/" />
      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        defaultTab="login"
        onSuccess={() => {
          setShowModal(false)
          setVerified(true)
        }}
      />
    </>
  )
}
