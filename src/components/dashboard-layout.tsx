import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar for Desktop */}
        <div className="hidden sm:block w-[240px] shrink-0">
          <AppSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex sm:hidden bg-black bg-opacity-50">
            <div className="w-[240px] bg-white h-full">
              <AppSidebar />
            </div>
            {/* Click outside to close */}
            <div className="flex-1" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            {/* Mobile menu button */}
            <div className="sm:hidden">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                <Menu />
              </Button>
            </div>

            {/* Title */}
            <div className="flex items-center gap-2 flex-1 min-w-0 sm:ml-2">
              <h1 className="font-semibold text-lg truncate">Haul Connect</h1>
            </div>
          </header>

          {/* Main Outlet */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
