
import { Outlet } from 'react-router-dom'
import { ThemeSwitch } from '../theme-switch'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-5 right-5 z-[100]">
        <ThemeSwitch />
      </div>
      <Outlet />
    </div>
  )
}
