import { useState } from 'react'
import { MonitorSmartphone, Laptop, LogOut } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface SessionMock {
  id: string
  device: string
  browser: string
  location: string
  lastActive: string
  isCurrent: boolean
}

const mockSessions: SessionMock[] = [
  {
    id: '1',
    device: 'MacBook Pro',
    browser: 'Chrome',
    location: 'São Paulo, Brasil',
    lastActive: 'Agora mesmo',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'iPhone 13',
    browser: 'Safari',
    location: 'São Paulo, Brasil',
    lastActive: 'Há 2 horas',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'Windows PC',
    browser: 'Edge',
    location: 'Rio de Janeiro, Brasil',
    lastActive: 'Ontem',
    isCurrent: false,
  },
]

export function SessoesTab() {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<SessionMock[]>(mockSessions)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null)

  const handleRevoke = (id: string) => {
    setSessionToRevoke(id)
    setConfirmOpen(true)
  }

  const confirmRevoke = () => {
    if (!sessionToRevoke) return
    setSessions((prev) => prev.filter((s) => s.id !== sessionToRevoke))
    setConfirmOpen(false)
    toast({ title: 'Sessão encerrada', description: 'O dispositivo foi desconectado com sucesso.' })
  }

  return (
    <Card className="border-t-4 border-t-[#d4af8f]">
      <CardHeader>
        <CardTitle>Sessões Ativas</CardTitle>
        <CardDescription>Gerencie os dispositivos conectados à sua conta.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#1a3a52]/10 rounded-full text-[#1a3a52] dark:text-[#d4af8f] dark:bg-[#d4af8f]/10">
                {session.device.includes('iPhone') ? (
                  <MonitorSmartphone className="h-5 w-5" />
                ) : (
                  <Laptop className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-semibold flex items-center gap-2">
                  {session.device} - {session.browser}
                  {session.isCurrent && (
                    <span className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-0.5 rounded-full font-bold">
                      Atual
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {session.location} • Último acesso: {session.lastActive}
                </p>
              </div>
            </div>
            {!session.isCurrent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRevoke(session.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 shrink-0"
              >
                <LogOut className="h-4 w-4" /> Desconectar
              </Button>
            )}
          </div>
        ))}
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar sessão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desconectar este dispositivo? Será necessário fazer login
              novamente no dispositivo escolhido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRevoke}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
