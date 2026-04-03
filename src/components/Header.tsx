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
      default:
        return 'Portal'
    }
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-primary"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive border-2 border-card" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel>Avisos Importantes</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                <span className="font-medium text-sm text-primary">Parecer Gerado</span>
                <span className="text-xs text-muted-foreground mt-1">
                  O parecer de IA do Condomínio Alpha está pronto para revisão.
                </span>
                <span className="text-[10px] text-muted-foreground mt-2">Há 5 min</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                <span className="font-medium text-sm text-primary">Novo Documento</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Nova DRE detectada nas pastas do mês.
                </span>
                <span className="text-[10px] text-muted-foreground mt-2">Há 1 hora</span>
              </DropdownMenuItem>
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
