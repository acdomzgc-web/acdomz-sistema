import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Moon, Sun, Bell, Globe } from 'lucide-react'

export function PreferenciasTab() {
  const { toast } = useToast()
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [pushEnabled, setPushEnabled] = useState(true)
  const [language, setLanguage] = useState('pt-BR')

  useEffect(() => {
    const savedTheme = localStorage.getItem('acdomz-theme') as any
    if (savedTheme) setTheme(savedTheme)

    const savedPush = localStorage.getItem('acdomz-push')
    if (savedPush !== null) setPushEnabled(savedPush === 'true')

    const savedLang = localStorage.getItem('acdomz-lang')
    if (savedLang) setLanguage(savedLang)
  }, [])

  const handleThemeChange = (val: 'light' | 'dark' | 'system') => {
    setTheme(val)
    localStorage.setItem('acdomz-theme', val)
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    if (val === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(val)
    }
    toast({ title: 'Preferências', description: 'Tema atualizado com sucesso.' })
  }

  const handlePushChange = (val: boolean) => {
    setPushEnabled(val)
    localStorage.setItem('acdomz-push', String(val))
    toast({
      title: 'Preferências',
      description: val ? 'Notificações ativadas.' : 'Notificações desativadas.',
    })
  }

  const handleLangChange = (val: string) => {
    setLanguage(val)
    localStorage.setItem('acdomz-lang', val)
    toast({ title: 'Preferências', description: 'Idioma atualizado com sucesso.' })
  }

  return (
    <Card className="border-t-4 border-t-[#1a3a52]">
      <CardHeader>
        <CardTitle>Preferências do Sistema</CardTitle>
        <CardDescription>Personalize sua experiência na plataforma ACDOMZ.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#1a3a52]/10 rounded-full text-[#1a3a52] dark:text-[#d4af8f] dark:bg-[#d4af8f]/10">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </div>
            <div>
              <Label className="text-base font-semibold">Aparência (Dark Mode)</Label>
              <p className="text-sm text-muted-foreground">Escolha o tema visual da plataforma.</p>
            </div>
          </div>
          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Escuro</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#1a3a52]/10 rounded-full text-[#1a3a52] dark:text-[#d4af8f] dark:bg-[#d4af8f]/10">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <Label className="text-base font-semibold">Notificações Push</Label>
              <p className="text-sm text-muted-foreground">
                Receba alertas importantes do sistema.
              </p>
            </div>
          </div>
          <Switch checked={pushEnabled} onCheckedChange={handlePushChange} />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#1a3a52]/10 rounded-full text-[#1a3a52] dark:text-[#d4af8f] dark:bg-[#d4af8f]/10">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <Label className="text-base font-semibold">Idioma</Label>
              <p className="text-sm text-muted-foreground">Selecione o idioma da interface.</p>
            </div>
          </div>
          <Select value={language} onValueChange={handleLangChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">Português (BR)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
