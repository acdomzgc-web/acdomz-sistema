import { Link, useLocation } from 'react-router-dom'
import {
  Building,
  Users,
  FileText,
  LayoutDashboard,
  Building2,
  DollarSign,
  TrendingDown,
  PieChart,
  Wallet,
  Megaphone,
  Bot,
  Calculator,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Logo } from '@/components/Logo'

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Administradoras', url: '/administradoras', icon: Building2 },
  { title: 'Condomínios', url: '/condominios', icon: Building },
  { title: 'Moradores', url: '/moradores', icon: Users },
  { title: 'Documentos', url: '/documentos', icon: FileText },
  { title: 'Dash. Financeiro', url: '/dashboard-financeiro', icon: PieChart },
  { title: 'Fin. Condomínio', url: '/financeiro-condominio', icon: Wallet },
  { title: 'Parecer Financeiro', url: '/parecer-financeiro', icon: FileText },
  { title: 'Comunicados', url: '/comunicados', icon: Megaphone },
  { title: 'SINDIA Bot', url: '/sindia', icon: Bot },
  { title: 'Calc. Honorários', url: '/calculadora', icon: Calculator },
  { title: 'Entradas ACDOMZ', url: '/financeiro', icon: DollarSign },
  { title: 'Saídas ACDOMZ', url: '/despesas', icon: TrendingDown },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
                tooltip={item.title}
                className="transition-all duration-200"
              >
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-md bg-muted/50 border border-border/50">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
            AD
          </div>
          <div className="flex flex-col text-sm">
            <span className="font-semibold text-foreground leading-none">Admin</span>
            <span className="text-xs text-muted-foreground mt-1">Plataforma</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
