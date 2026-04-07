import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Conversa } from './types'

export function ChatSheet({
  chat,
  onClose,
  onUpdate,
}: {
  chat: Conversa | null
  onClose: () => void
  onUpdate: (c: Conversa) => void
}) {
  const { toast } = useToast()
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (chat) setReply('')
  }, [chat])

  const handleStatusToggle = async () => {
    if (!chat) return
    const newStatus = chat.status === 'respondido' ? 'pendente_revisao' : 'respondido'
    try {
      const { error } = await supabase
        .from('conversas_sindia')
        .update({ status: newStatus })
        .eq('id', chat.id)
      if (error) throw error
      onUpdate({ ...chat, status: newStatus })
      toast({ title: 'Status atualizado' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const sendManualReply = async () => {
    if (!chat || !reply.trim()) return
    setSending(true)
    try {
      const { error } = await supabase
        .from('conversas_sindia')
        .update({ manual_reply: reply.trim(), status: 'respondido' })
        .eq('id', chat.id)
      if (error) throw error
      onUpdate({ ...chat, manual_reply: reply.trim(), status: 'respondido' })
      toast({
        title: 'Resposta enviada',
        description: 'A resposta manual foi registrada com sucesso.',
      })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  return (
    <Sheet open={!!chat} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle>
            Conversa -{' '}
            {chat?.profiles?.name || (chat?.is_unauthorized ? 'Não Autorizado' : 'Morador')}
          </SheetTitle>
          <SheetDescription>Histórico e acompanhamento manual</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-4">
          <div className="text-xs text-center text-muted-foreground">
            {chat && format(parseISO(chat.created_at), "dd 'de' MMM 'às' HH:mm")}
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[85%]">
              <p className="text-sm">{chat?.message}</p>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 mr-1">Morador</span>
          </div>
          <div className="flex flex-col items-start">
            <div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-sm max-w-[85%]">
              <p className="text-sm whitespace-pre-wrap">{chat?.response}</p>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 ml-1">SINDIA Bot</span>
          </div>
          {chat?.manual_reply && (
            <div className="flex flex-col items-start mt-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[85%] border border-blue-200 dark:border-blue-800">
                <p className="text-sm whitespace-pre-wrap">{chat.manual_reply}</p>
              </div>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 ml-1">
                Resposta Manual (Humano)
              </span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t space-y-4 mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge
              variant={chat?.status === 'pendente_revisao' ? 'destructive' : 'default'}
              className={chat?.status === 'respondido' ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              {chat?.status === 'pendente_revisao' ? 'Pendente Revisão' : 'Respondido'}
            </Badge>
          </div>
          {!chat?.manual_reply && (
            <div className="space-y-2">
              <Textarea
                placeholder="Digite uma resposta complementar ou correção..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleStatusToggle}>
                  {chat?.status === 'respondido' ? 'Marcar Revisão' : 'Resolver'}
                </Button>
                <Button
                  className="flex-1"
                  onClick={sendManualReply}
                  disabled={sending || !reply.trim()}
                >
                  Enviar Resposta
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
