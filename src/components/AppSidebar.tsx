import {
  Building2,
  Calculator,
  FileText,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
  Wallet,
  LogOut,
  ChevronsUpDown,
  ShieldCheck,
} from 'lucide-react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Logo } from './Logo'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePreferences, MenuItemId } from '@/hooks/use-preferences'

const MENU_ITEMS_MAP: Record<MenuItemId, any> = {
  dashboard: { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  condominios: { title: 'Condomínios', url: '/condominios', icon: Building2 },
  moradores: { title: 'Moradores', url: '/moradores', icon: Users },
  documentos: { title: 'Documentos', url: '/documentos', icon: FileText },
  financeiro: { title: 'Fin. Condomínio', url: '/financeiro', icon: Wallet },
  sindicos: { title: 'Síndicos', url: '/sindicos', icon: UserCog },
  calculadora: { title: 'Calc. Honorários', url: '/calculadora', icon: Calculator },
  configuracoes: { title: 'Configurações', url: '/configuracoes', icon: Settings },
}

export function AppSidebar() {
  const location = useLocation()
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const { menuOrder } = usePreferences()

  const [profile, setProfile] = useState<{
    name: string
    is_admin: boolean
    avatar_url?: string
  } | null>(null)

  useEffect(() => {
    if (user?.id) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name, is_admin')
            .eq('id', user.id)
            .single()
          if (!error && data) {
            setProfile(data as any)
          }
        } catch (e) {
          console.error('Error fetching profile', e)
        }
      }
      fetchProfile()
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const items = menuOrder.map((id) => ({ id, ...MENU_ITEMS_MAP[id] })).filter((item) => item.title)

  const userName = profile?.name || user?.email?.split('@')[0] || 'Usuário'
  const userInitials = userName.substring(0, 2).toUpperCase()
  const userRole = profile?.is_admin ? 'Administrador' : 'Síndico'
  const userAvatar =
    profile?.avatar_url || `https://img.usecurling.com/ppl/thumbnail?seed=${user?.id || '1'}`

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {items.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url !== '/' && location.pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="transition-all duration-200 hover:bg-primary/5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium rounded-lg px-3 py-5"
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon
                          className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-muted/50 transition-colors rounded-xl p-2 h-auto"
                >
                  <Avatar className="h-9 w-9 rounded-lg border border-border/50 shadow-sm">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs text-muted-foreground flex items-center gap-1">
                      {profile?.is_admin && <ShieldCheck className="w-3 h-3 text-primary" />}
                      {userRole}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="bottom"
                align="end"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl shadow-lg pb-2"
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-3 px-3 py-4 text-left text-sm bg-muted/30 rounded-t-xl mb-1">
                    <Avatar className="h-12 w-12 rounded-lg border shadow-sm">
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-lg">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-base">{userName}</span>
                      <span className="truncate text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        {profile?.is_admin && <ShieldCheck className="w-3 h-3 text-primary" />}
                        {userRole}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive cursor-pointer py-2.5 mx-1 rounded-md mt-1"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-medium">Sair do sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
