
import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

export default function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0 w-full">
          <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="-ml-1 md:hidden" />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h1 className="font-semibold text-lg truncate">Haul Connect</h1>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-0">
            <div className="w-full max-w-none mx-auto p-4 md:p-6 lg:p-8 xl:p-10">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
