
import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'

interface PrivateRouteProps {
  children: ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  // For now, we'll use localStorage to check for token
  // You can replace this with your auth context/state management
  const token = localStorage.getItem('token')
  
  return token ? <>{children}</> : <Navigate to="/auth/login" replace />
}
