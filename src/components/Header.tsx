import { useEffect, useState } from 'react'
import { Bell, LogOut, Settings, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { GlobalSearch } from '@/components/GlobalSearch'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export function Header() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<{
    name: string
    foto_url: string | null
    email: string
  } | null>(null)

  const [notifications, setNotifications] = useState<any[]>([])
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('name, foto_url, email')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile({
              name: data.name,
              foto_url: data.foto_url,
              email: data.email,
            })
          }
        })
    }
  }, [user])

  useEffect(() => {
    const fetchNotifs = async () => {
      // Fetch recent SINDIA interactions
      const { data: convs } = await supabase
        .from('conversas_sindia')
        .select('*, condominios(name)')
        .order('created_at', { ascending: false })
        .limit(3)

      // Fetch recent documents
      const { data: docs } = await supabase
        .from('documentos_condominio')
        .select('*, condominios(name)')
        .order('created_at', { ascending: false })
        .limit(3)

      const mapped = [
        ...(convs || []).map((c) => ({
          id: c.id,
          type: 'sindia',
          title: 'Nova Interação SINDIA',
          desc: `Morador interagiu no condomínio ${c.condominios?.name || '-'}`,
          date: c.created_at,
          link: '/sindia',
        })),
        ...(docs || []).map((d) => ({
          id: d.id,
          type: 'doc',
          title: 'Novo Documento Anexado',
          desc: `${d.name} em ${d.condominios?.name || '-'}`,
          date: d.created_at,
          link: '/documentos',
        })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)

      setNotifications(mapped)
      if (mapped.length > 0) setHasUnread(true)
    }

    fetchNotifs()

    // Realtime subscriptions for notifications
    const sub1 = supabase
      .channel('convs_notif')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversas_sindia' },
        () => fetchNotifs(),
      )
      .subscribe()
    const sub2 = supabase
      .channel('docs_notif')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'documentos_condominio' },
        () => fetchNotifs(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sub1)
      supabase.removeChannel(sub2)
    }
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const getPageName = () => {
    switch (location.pathname) {
      case '/':
        return 'Visão Geral'
      case '/administradoras':
        return 'Administradoras'
      case '/condominios':
        return 'Condomínios'
      case '/moradores':
        return 'Moradores'
      case '/documentos':
        return 'Documentos'
      case '/calculadora':
        return 'Precificação'
      case '/sindia':
        return 'SINDIA Bot'
      case '/financeiro':
        return 'Financeiro'
      default:
        return 'Portal'
    }
  }

  const formatTimeAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `Há ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Há ${hours}h`
    return `Há ${Math.floor(hours / 24)} dias`
  }

  const displayName = profile?.name || user?.user_metadata?.name || 'Administrador'
  const displayEmail = profile?.email || user?.email
  const displayAvatar =
    profile?.foto_url ||
    user?.user_metadata?.avatar_url ||
    'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6 shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="h-5 bg-border hidden sm:block" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-2 font-semibold">
                  <img
                    src="https://img.usecurling.com/i?q=building&color=blue&shape=fill"
                    alt="ACDOMZ"
                    className="h-4 w-4 object-contain"
                  />
                  ACDOMZ
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-primary">
                {getPageName()}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        <GlobalSearch />

        <ThemeToggle />

        <DropdownMenu
          onOpenChange={(open) => {
            if (open) setHasUnread(false)
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-primary transition-colors"
            >
              <Bell className="h-5 w-5" />
              {hasUnread && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-card animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel>Avisos Recentes</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className="flex flex-col items-start p-3 cursor-pointer"
                    onClick={() => navigate(notif.link)}
                  >
                    <span className="font-medium text-sm text-primary">{notif.title}</span>
                    <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notif.desc}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-2 font-medium">
                      {formatTimeAgo(notif.date)}
                    </span>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhuma notificação recente.
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={displayAvatar} alt="Perfil" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {displayEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/configuracoes')}>
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/configuracoes')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
