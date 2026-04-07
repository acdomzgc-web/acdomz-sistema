import { useState, useMemo, useRef, useEffect } from 'react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { Search, Send, Bot, User, CheckCheck, AlertCircle, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Conversa } from './types'
import { useToast } from '@/hooks/use-toast'

interface Props {
  conversas: Conversa[]
  loading: boolean
  onAddConversa: (c: Conversa) => void
}

export function ConversasTab({ conversas, loading, onAddConversa }: Props) {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const chats = useMemo(() => {
    const groups = new Map<string, any>()
    conversas.forEach((c) => {
      const key = c.user_id || c.phone || c.id
      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          name: c.profiles?.name || (c.phone ? `+${c.phone}` : 'Desconhecido'),
          phone: c.phone || null,
          avatar: c.profiles?.foto_url || null,
          isUnauthorized: c.is_unauthorized,
          lastMessageTime: c.created_at,
          lastMessage: c.message || c.manual_reply || c.response || '',
          unreadCount: 0,
          messages: [],
        })
      }
      const chat = groups.get(key)!
      chat.messages.push(c)

      if (new Date(c.created_at) > new Date(chat.lastMessageTime)) {
        chat.lastMessageTime = c.created_at
        chat.lastMessage = c.message || c.manual_reply || c.response || ''
      }
      if (c.status === 'pendente_revisao') {
        chat.unreadCount += 1
      }
    })

    return Array.from(groups.values())
      .filter((chat) => chat.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
  }, [conversas, search])

  const activeChat = chats.find((c) => c.id === activeChatId) || null

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeChat?.messages.length, activeChatId])

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeChat) return
    setSending(true)
    try {
      const lastMsg = [...activeChat.messages].sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0]
      const newConversa = {
        condominio_id: lastMsg.condominio_id,
        user_id: lastMsg.user_id,
        phone: lastMsg.phone,
        manual_reply: replyText.trim(),
        status: 'respondido',
        is_unauthorized: lastMsg.is_unauthorized,
      }
      const { data, error } = await supabase
        .from('conversas_sindia')
        .insert(newConversa)
        .select('*, profiles(name, foto_url)')
        .single()
      if (error) throw error
      if (data) {
        onAddConversa(data as unknown as Conversa)
        setReplyText('')
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const formatChatDate = (dateStr: string) => {
    const d = parseISO(dateStr)
    if (isToday(d)) return format(d, 'HH:mm')
    if (isYesterday(d)) return 'Ontem'
    return format(d, 'dd/MM/yyyy')
  }

  return (
    <Card className="flex h-[calc(100vh-220px)] min-h-[500px] overflow-hidden border shadow-sm">
      {/* Left Sidebar - Contacts */}
      <div
        className={cn(
          'w-full sm:w-[320px] border-r flex flex-col bg-muted/10',
          activeChatId ? 'hidden sm:flex' : 'flex',
        )}
      >
        <div className="p-3 border-b bg-background">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-muted/50 border-none shadow-none h-9"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma conversa encontrada.
            </div>
          ) : (
            <div className="flex flex-col">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={cn(
                    'flex items-start gap-3 p-3 border-b text-left transition-colors hover:bg-muted/50',
                    activeChatId === chat.id ? 'bg-muted/50' : 'bg-transparent',
                  )}
                >
                  <Avatar className="w-10 h-10 border">
                    <AvatarImage src={chat.avatar || ''} />
                    <AvatarFallback>{chat.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate pr-2 flex items-center gap-1">
                        {chat.name}
                        {chat.isUnauthorized && (
                          <AlertCircle className="w-3 h-3 text-destructive" />
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatChatDate(chat.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-muted-foreground truncate pr-2">
                        {chat.lastMessage}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Area - Chat */}
      <div
        className={cn(
          'flex-1 flex-col bg-[#efeae2] dark:bg-zinc-950/80 relative',
          activeChatId ? 'flex' : 'hidden sm:flex',
        )}
      >
        {activeChat ? (
          <>
            <div className="h-14 border-b bg-background/95 backdrop-blur flex items-center px-4 justify-between z-10 shrink-0">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden mr-1 -ml-2"
                  onClick={() => setActiveChatId(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={activeChat.avatar || ''} />
                  <AvatarFallback>{activeChat.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-sm">{activeChat.name}</h3>
                  {activeChat.phone && (
                    <p className="text-xs text-muted-foreground">+{activeChat.phone}</p>
                  )}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-3 pb-4">
                {[...activeChat.messages]
                  .sort(
                    (a: any, b: any) =>
                      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
                  )
                  .map((c: any) => (
                    <div key={c.id} className="flex flex-col gap-1.5">
                      {c.message && (
                        <div className="flex justify-start">
                          <div className="bg-background rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] lg:max-w-[70%] shadow-sm">
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                              {c.message}
                            </p>
                            <span className="text-[10px] text-muted-foreground/70 mt-1 block text-right">
                              {format(parseISO(c.created_at), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                      )}

                      {(c.response || c.manual_reply) && (
                        <div className="flex justify-end">
                          <div
                            className={cn(
                              'rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%] lg:max-w-[70%] shadow-sm',
                              c.manual_reply
                                ? 'bg-blue-50 dark:bg-blue-900/30'
                                : 'bg-[#dcf8c6] dark:bg-[#1a4a38]',
                            )}
                          >
                            <div className="flex items-center gap-1.5 mb-1 opacity-70">
                              {c.manual_reply ? (
                                <User className="w-3 h-3" />
                              ) : (
                                <Bot className="w-3 h-3" />
                              )}
                              <span className="text-[10px] font-medium">
                                {c.manual_reply ? 'Admin' : 'SINDIA'}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                              {c.manual_reply || c.response}
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-[10px] text-muted-foreground/70">
                                {format(parseISO(c.created_at), 'HH:mm')}
                              </span>
                              <CheckCheck className="w-3 h-3 text-blue-500" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                <div ref={scrollRef} className="h-1" />
              </div>
            </ScrollArea>

            <div className="p-3 bg-background border-t shrink-0 flex items-center gap-2">
              <Input
                placeholder="Digite uma mensagem manual..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                className="flex-1 bg-muted/50 border-none focus-visible:ring-1"
              />
              <Button size="icon" onClick={handleSendReply} disabled={!replyText.trim() || sending}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-full">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 opacity-50" />
            </div>
            <p>Selecione uma conversa para iniciar o atendimento</p>
          </div>
        )}
      </div>
    </Card>
  )
}
