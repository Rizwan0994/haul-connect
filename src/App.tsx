import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { ModalProvider } from '@/components/carrier-management/modal-context'
import { ModalProvider as DispatchModalProvider } from '@/components/dispatch-management/modal-context'
import { AuthProvider } from '@/components/auth/auth-context'
import { SocketProvider } from '@/contexts/SocketContext'
import CarrierModalsContainer from '@/components/carrier-management/carrier-modals-container'
import DispatchModalsContainer from '@/components/dispatch-management/dispatch-modals-container'
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
import PermissionManagementPage from '@/pages/settings/permissions'

// Import user management page and access denied page
import UserManagementPage from '@/pages/user-management'
import AccessDeniedPage from '@/pages/access-denied'
import NotificationsPage from '@/pages/notifications'
import AdminNotificationsPage from '@/pages/admin/notifications'
import ProfilePage from '@/pages/profile'
import DashboardPage from '@/pages/dashboard'
import FollowupSheetsPage from '@/pages/carrier-management/followup-sheets'
import DispatchApprovalsPage from '@/pages/dispatch-management/approvals'
import CarrierApprovalsPage from '@/pages/carrier-management/approvals'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ModalProvider>
        <DispatchModalProvider>
          <Router>
            <AuthProvider>
              <SocketProvider>
              <Routes>
                {/* Auth routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                <Route path="/access-denied" element={<AccessDeniedPage />} />

              {/* Protected routes */}
              <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={
                  <PrivateRoute requiredPermission="route.dashboard">
                    <DashboardPage />
                  </PrivateRoute>
                } />
                <Route path="carrier-management" element={
                  <PrivateRoute requiredPermission="route.carrier-profiles">
                    <CarrierManagementPage />
                  </PrivateRoute>
                } />
                <Route path="carrier-management/followup-sheets" element={
                  <PrivateRoute requiredPermission="route.followup-sheets">
                    <FollowupSheetsPage />
                  </PrivateRoute>
                } />
                <Route path="carrier-management/approvals" element={
                  <PrivateRoute requiredPermission="carrier.approval.view">
                    <CarrierApprovalsPage />
                  </PrivateRoute>
                } />
                <Route path="carrier-management/create" element={
                  <PrivateRoute requiredPermission="route.add-carrier">
                    <CarrierCreatePage />
                  </PrivateRoute>
                } />
                <Route path="carrier-management/:id" element={
                  <PrivateRoute requiredPermission="carriers.view">
                    <CarrierDetailPage />
                  </PrivateRoute>
                } />
                <Route path="carrier-management/:id/edit" element={
                  <PrivateRoute requiredPermission="carriers.edit">
                    <CarrierEditPage />
                  </PrivateRoute>
                } />
                {/* <Route path="carrier-management/assignments/:id" element={<CarrierAssignmentsPage />} /> */}
                <Route path="dispatch-management" element={
                  <PrivateRoute requiredPermission="route.active-dispatches">
                    <DispatchManagementPage />
                  </PrivateRoute>
                } />
                <Route path="dispatch-management/new" element={
                  <PrivateRoute requiredPermission="route.create-dispatch">
                    <NewDispatchPage />
                  </PrivateRoute>
                } />
                <Route path="dispatch-management/approvals" element={
                  <PrivateRoute requiredPermission="dispatch.approval.view">
                    <DispatchApprovalsPage />
                  </PrivateRoute>
                } />
                <Route path="dispatch-management/:id" element={
                  <PrivateRoute requiredPermission="dispatch.view">
                    <DispatchDetailPage />
                  </PrivateRoute>
                } />
                <Route path="dispatch-management/:id/edit" element={
                  <PrivateRoute requiredPermission="dispatch.edit">
                    <DispatchEditPage />
                  </PrivateRoute>
                } />
                <Route path="dispatch-management/:id/invoice" element={
                  <PrivateRoute requiredPermission="invoices.view">
                    <DispatchInvoicePage />
                  </PrivateRoute>
                } />
                <Route path="user-management" element={
                  <PrivateRoute requiredPermission="route.user-management">
                    <UserManagementPage />
                  </PrivateRoute>
                } />
                <Route path="invoices" element={
                  <PrivateRoute requiredPermission="route.invoices">
                    <InvoicesPage />
                  </PrivateRoute>
                } />
                <Route path="settings/smtp" element={
                  <PrivateRoute requiredPermission="route.email-settings">
                    <SMTPSettingsPage />
                  </PrivateRoute>
                } />
                <Route path="settings/permissions" element={
                  <PrivateRoute requiredPermission="permissions.manage">
                    <PermissionManagementPage />
                  </PrivateRoute>
                } />
                <Route path="notifications" element={
                  <PrivateRoute requiredPermission="notifications.view">
                    <NotificationsPage />
                  </PrivateRoute>
                } />
                <Route path="admin/notifications" element={
                  <PrivateRoute requiredPermission="notifications.manage">
                    <AdminNotificationsPage />
                  </PrivateRoute>
                } />
                <Route path="profile" element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } />
              </Route>            </Routes>
            <CarrierModalsContainer />
            <DispatchModalsContainer />
            <Toaster />
            </SocketProvider>
          </AuthProvider>
        </Router>
      </DispatchModalProvider>
    </ModalProvider>
  </ThemeProvider>
  )
}

export default App
