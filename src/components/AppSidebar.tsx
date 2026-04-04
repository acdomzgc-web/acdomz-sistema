import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Building2,
  Users,
  FileText,
  LayoutDashboard,
  Calculator,
  Settings,
  LogOut,
  Building,
  ShieldCheck,
  Wallet,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase/client'

const menuItemsConfig = {
  dashboard: { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  administradoras: { title: 'Administradoras', url: '/administradoras', icon: Building },
  condominios: { title: 'Condomínios', url: '/condominios', icon: Building2 },
  sindicos: { title: 'Síndicos', url: '/sindicos', icon: ShieldCheck },
  moradores: { title: 'Moradores', url: '/moradores', icon: Users },
  documentos: { title: 'Documentos', url: '/documentos', icon: FileText },
  financeiro: { title: 'Fin. Condomínio', url: '/financeiro', icon: Wallet },
  calculadora: { title: 'Calc. Honorários', url: '/calculadora', icon: Calculator },
}

const defaultOrder = [
  'dashboard',
  'administradoras',
  'condominios',
  'sindicos',
  'moradores',
  'documentos',
  'financeiro',
  'calculadora',
]

export function AppSidebar() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [navOrder, setNavOrder] = useState<string[]>(defaultOrder)

  useEffect(() => {
    const loadNavOrder = () => {
      const saved = localStorage.getItem('acdomz_nav_order')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setNavOrder(parsed.map((item: any) => item.id))
        } catch (e) {
          console.error('Error parsing nav order', e)
        }
      }
    }

    loadNavOrder()

    window.addEventListener('nav_order_changed', loadNavOrder)
    return () => window.removeEventListener('nav_order_changed', loadNavOrder)
  }, [])

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()

        if (data) {
          setProfile(data)
        }
      }
      fetchProfile()
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name.substring(0, 2).toUpperCase()
  }

  const userName = profile?.name || user?.email?.split('@')[0] || 'Usuário'
  const userRole = profile?.is_admin ? 'Administrador' : 'Síndico'
  const avatarSrc =
    profile?.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}&backgroundColor=0f172a&textColor=ffffff`

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex flex-row items-center border-b">
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navOrder.map((id) => {
                const item = menuItemsConfig[id as keyof typeof menuItemsConfig]
                if (!item) return null
                const isActive =
                  location.pathname === item.url ||
                  (item.url !== '/' && location.pathname.startsWith(item.url))

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith('/configuracoes')}
                  tooltip="Configurações"
                >
                  <Link to="/configuracoes">
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-9 w-9 shrink-0 border border-primary/20 shadow-sm">
              <AvatarImage src={avatarSrc} alt={userName} />
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate leading-none mb-1">{userName}</span>
              <span className="text-xs text-muted-foreground truncate leading-none">
                {userRole}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 shrink-0"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
