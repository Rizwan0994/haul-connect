
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import DashboardLayout from '@/components/dashboard-layout'
import PrivateRoute from '@/components/auth/private-route'

// Auth pages
import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import ForgotPasswordPage from '@/pages/auth/forgot-password'
import ResetPasswordPage from '@/pages/auth/reset-password'

// App pages
import CarrierManagementPage from '@/pages/carrier-management'
import CarrierDetailPage from '@/pages/carrier-management/carrier-detail'
import CarrierEditPage from '@/pages/carrier-management/carrier-edit'
import DispatchManagementPage from '@/pages/dispatch-management'
import DispatchDetailPage from '@/pages/dispatch-management/dispatch-detail'
import DispatchEditPage from '@/pages/dispatch-management/dispatch-edit'
import DispatchInvoicePage from '@/pages/dispatch-management/dispatch-invoice'
import NewDispatchPage from '@/pages/dispatch-management/new'
import InvoicesPage from '@/pages/invoices'
import SMTPSettingsPage from '@/pages/settings/smtp'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/carrier-management" replace />} />
            <Route path="carrier-management" element={<CarrierManagementPage />} />
            <Route path="carrier-management/:id" element={<CarrierDetailPage />} />
            <Route path="carrier-management/:id/edit" element={<CarrierEditPage />} />
            <Route path="dispatch-management" element={<DispatchManagementPage />} />
            <Route path="dispatch-management/new" element={<NewDispatchPage />} />
            <Route path="dispatch-management/:id" element={<DispatchDetailPage />} />
            <Route path="dispatch-management/:id/edit" element={<DispatchEditPage />} />
            <Route path="dispatch-management/:id/invoice" element={<DispatchInvoicePage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="settings/smtp" element={<SMTPSettingsPage />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}

export default App
