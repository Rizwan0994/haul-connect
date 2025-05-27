
import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

export default function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full flex bg-background">
        {/* Sidebar - Fixed positioning that pushes content */}
        <AppSidebar />
        
        {/* Main Content Area - Responsive to sidebar state */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out">
          {/* Header */}
          <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h1 className="font-semibold text-lg truncate">Haul Connect</h1>
            </div>
          </header>
          
          {/* Main Content with consistent responsive padding */}
          <main className="flex-1 overflow-auto">
            <div className="w-full h-full p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-16">
              <div className="max-w-none mx-auto">
                <Outlet />
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
