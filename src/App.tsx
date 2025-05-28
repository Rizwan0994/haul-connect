import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { ModalProvider } from '@/components/carrier-management/modal-context'
import { AuthProvider } from '@/components/auth/auth-context'
import CarrierModalsContainer from '@/components/carrier-management/carrier-modals-container'
import DashboardLayout from '@/components/dashboard-layout'
import PrivateRoute from '@/components/auth/private-route'

// Auth pages
import LoginPage from '@/pages/auth/login'
import ForgotPasswordPage from '@/pages/auth/forgot-password'
import ResetPasswordPage from '@/pages/auth/reset-password'

// App pages
import CarrierManagementPage from '@/pages/carrier-management'
import CarrierDetailPage from '@/pages/carrier-management/carrier-detail'
import CarrierEditPage from '@/pages/carrier-management/carrier-edit'
import CarrierCreatePage from '@/pages/carrier-management/carrier-create'
// import CarrierAssignmentsPage from '@/pages/carrier-management/carrier-assignments'
import DispatchManagementPage from '@/pages/dispatch-management'
import DispatchDetailPage from '@/pages/dispatch-management/dispatch-detail'
import DispatchEditPage from '@/pages/dispatch-management/dispatch-edit'
import DispatchInvoicePage from '@/pages/dispatch-management/dispatch-invoice'
import NewDispatchPage from '@/pages/dispatch-management/new'
import InvoicesPage from '@/pages/invoices'
import SMTPSettingsPage from '@/pages/settings/smtp'

// Import user management page and access denied page
import UserManagementPage from '@/pages/user-management'
import AccessDeniedPage from '@/pages/access-denied'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ModalProvider>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Auth routes */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route path="/access-denied" element={<AccessDeniedPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/carrier-management" replace />} />
            <Route path="carrier-management" element={<CarrierManagementPage />} />
            <Route path="carrier-management/create" element={<CarrierCreatePage />} />
            <Route path="carrier-management/:id" element={<CarrierDetailPage />} />
            <Route path="carrier-management/:id/edit" element={<CarrierEditPage />} />
            {/* <Route path="carrier-management/assignments/:id" element={<CarrierAssignmentsPage />} /> */}
            <Route path="dispatch-management" element={<DispatchManagementPage />} />
            <Route path="dispatch-management/new" element={<NewDispatchPage />} />
            <Route path="dispatch-management/:id" element={<DispatchDetailPage />} />
            <Route path="dispatch-management/:id/edit" element={<DispatchEditPage />} />
            <Route path="dispatch-management/:id/invoice" element={<DispatchInvoicePage />} />
            <Route path="user-management" element={
              <PrivateRoute requiredRoles={['hr_manager', 'hr_user', 'admin_manager', 'admin_user', 'super_admin']}>
                <UserManagementPage />
              </PrivateRoute>
            } />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="settings/smtp" element={<SMTPSettingsPage />} />
          </Route>
        </Routes>
        <CarrierModalsContainer />
        <Toaster />
          </AuthProvider>
        </Router>
      </ModalProvider>
    </ThemeProvider>
  )
}

export default App
