import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Building,
  Users,
  FileText,
  LayoutDashboard,
  Building2,
  PieChart,
  Wallet,
  Megaphone,
  Bot,
  Calculator,
  BarChart2,
  Settings,
  GripVertical,
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

const defaultNavItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Administradoras', url: '/administradoras', icon: Building2 },
  { title: 'Condomínios', url: '/condominios', icon: Building },
  { title: 'Moradores', url: '/moradores', icon: Users },
  { title: 'Documentos', url: '/documentos', icon: FileText },
  { title: 'Dash. Financeiro ACDOMZ', url: '/dashboard-financeiro', icon: PieChart },
  { title: 'Fin. Condomínio', url: '/financeiro-condominio', icon: Wallet },
  { title: 'Parecer Financeiro', url: '/parecer-financeiro', icon: FileText },
  { title: 'Comunicados', url: '/comunicados', icon: Megaphone },
  { title: 'SINDIA Bot', url: '/sindia', icon: Bot },
  { title: 'Síndicos', url: '/sindicos', icon: Users },
  { title: 'Calc. Honorários', url: '/calculadora', icon: Calculator },
  { title: 'Relatórios', url: '/relatorios', icon: BarChart2 },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()
  const [navItems, setNavItems] = useState(defaultNavItems)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-order-v2')
    if (saved) {
      try {
        const order = JSON.parse(saved)
        const orderedItems = order
          .map((title: string) => defaultNavItems.find((i) => i.title === title))
          .filter(Boolean)
        const missing = defaultNavItems.filter((i) => !order.includes(i.title))
        setNavItems([...orderedItems, ...missing])
      } catch (e) {}
    }
  }, [])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (sourceIndex === targetIndex || isNaN(sourceIndex)) return

    const newItems = [...navItems]
    const [removed] = newItems.splice(sourceIndex, 1)
    newItems.splice(targetIndex, 0, removed)

    setNavItems(newItems)
    localStorage.setItem('sidebar-order-v2', JSON.stringify(newItems.map((i) => i.title)))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Logo iconClassName="h-8 w-8" textClassName="text-2xl" />
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          {navItems.map((item, index) => (
            <SidebarMenuItem
              key={item.title}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={handleDragOver}
              className="group/item relative"
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full opacity-0 group-hover/item:opacity-100 cursor-grab px-1 z-10 hover:text-primary">
                <GripVertical className="h-4 w-4" />
              </div>
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
