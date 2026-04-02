import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function Layout() {
  const location = useLocation()

  // Simple unauthenticated check redirect logic for preview purposes
  if (location.pathname === '/login') {
    return <Outlet />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-muted/30">
        <Header />
        <main className="flex-1 p-6 animate-fade-in">
          <div className="mx-auto max-w-7xl w-full">
            <Outlet />
          </div>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}
