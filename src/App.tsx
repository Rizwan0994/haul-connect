
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import { ModalProvider } from './components/carrier-management/modal-context'
import CarrierModalsContainer from './components/carrier-management/carrier-modals-container'
import { Toaster } from './components/ui/sonner'
import AuthLayout from './components/auth/auth-layout'
import DashboardLayout from './components/dashboard-layout'
import LoginForm from './pages/auth/login'
import RegisterForm from './pages/auth/register'
import ForgotPasswordForm from './pages/auth/forgot-password'
import ResetPasswordForm from './pages/auth/reset-password'
import CarrierManagement from './pages/carrier-management'
import CarrierDetail from './pages/carrier-management/carrier-detail'
import CarrierEdit from './pages/carrier-management/carrier-edit'
import DispatchManagement from './pages/dispatch-management'
import DispatchDetail from './pages/dispatch-management/dispatch-detail'
import DispatchEdit from './pages/dispatch-management/dispatch-edit'
import DispatchInvoice from './pages/dispatch-management/dispatch-invoice'
import NewDispatch from './pages/dispatch-management/new'
import Invoices from './pages/invoices'
import SMTPSettings from './pages/settings/smtp'
import PrivateRoute from './components/auth/private-route'

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <ModalProvider>
        <Routes>
          {/* Public routes with auth layout */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginForm />} />
            <Route path="register" element={<RegisterForm />} />
            <Route path="forgot-password" element={<ForgotPasswordForm />} />
            <Route path="reset-password" element={<ResetPasswordForm />} />
          </Route>

          {/* Private routes with dashboard layout */}
          <Route path="/" element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="/carrier-management" replace />} />
            <Route path="carrier-management" element={<CarrierManagement />} />
            <Route path="carrier-management/:id" element={<CarrierDetail />} />
            <Route path="carrier-management/:id/edit" element={<CarrierEdit />} />
            <Route path="dispatch-management" element={<DispatchManagement />} />
            <Route path="dispatch-management/new" element={<NewDispatch />} />
            <Route path="dispatch-management/:id" element={<DispatchDetail />} />
            <Route path="dispatch-management/:id/edit" element={<DispatchEdit />} />
            <Route path="dispatch-management/:id/invoice" element={<DispatchInvoice />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="settings/smtp" element={<SMTPSettings />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
        <CarrierModalsContainer />
        <Toaster />
      </ModalProvider>
    </ThemeProvider>
  )
}

export default App
