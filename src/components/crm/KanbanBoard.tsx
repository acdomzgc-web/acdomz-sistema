import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { MoreHorizontal, Building, Phone, Mail, Clock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const COLUMNS = [
  {
    id: 'qualificacao',
    title: 'Qualificação',
    color: 'bg-slate-100 dark:bg-slate-900/50',
    border: 'border-slate-200 dark:border-slate-800',
  },
  {
    id: 'primeiro_contato',
    title: 'Primeiro Contato',
    color: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'reuniao',
    title: 'Reunião/Apresentação',
    color: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 'proposta',
    title: 'Proposta Enviada',
    color: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
  },
  {
    id: 'negociacao',
    title: 'Negociação',
    color: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
  },
  {
    id: 'ganho',
    title: 'Fechado/Ganho',
    color: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
  },
  {
    id: 'perdido',
    title: 'Perdido',
    color: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
  },
]

export function KanbanBoard({
  leads,
  onEditLead,
  onStatusChange,
}: {
  leads: any[]
  onEditLead: (lead: any) => void
  onStatusChange: (id: string, status: string) => void
}) {
  const getLeadsByStatus = (status: string) => leads.filter((l) => l.status === status)

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, statusId: string) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    if (leadId) {
      onStatusChange(leadId, statusId)
    }
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap pb-4">
      <div className="flex gap-4 h-[calc(100vh-320px)] min-h-[500px] items-start">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col w-[300px] flex-shrink-0 rounded-xl border ${col.border} ${col.color} overflow-hidden h-full`}
          >
            <div className="p-3 border-b border-border/50 bg-background/50 backdrop-blur-sm flex justify-between items-center font-medium">
              <span className="text-sm">{col.title}</span>
              <Badge variant="secondary" className="rounded-full text-xs">
                {getLeadsByStatus(col.id).length}
              </Badge>
            </div>

            <ScrollArea className="flex-1 p-3">
              <div className="flex flex-col gap-3">
                {getLeadsByStatus(col.id).map((lead) => (
                  <Card
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="cursor-pointer hover:shadow-md transition-shadow bg-card active:cursor-grabbing border-l-4"
                    style={{
                      borderLeftColor:
                        lead.lead_type === 'parceiro' ||
                        lead.lead_type === 'incorporadora' ||
                        lead.lead_type === 'construtora'
                          ? 'hsl(var(--chart-2))'
                          : 'hsl(var(--primary))',
                    }}
                    onClick={() => onEditLead(lead)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="font-semibold text-sm line-clamp-1">{lead.name}</div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Mover para</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {COLUMNS.filter((c) => c.id !== lead.status).map((c) => (
                              <DropdownMenuItem
                                key={c.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onStatusChange(lead.id, c.id)
                                }}
                              >
                                {c.title}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {lead.condominio_name && (
                        <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                          <Building className="h-3 w-3 flex-shrink-0" />
                          <span className="line-clamp-1">{lead.condominio_name}</span>
                        </div>
                      )}

                      {lead.value > 0 && (
                        <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(lead.value)}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-muted-foreground">
                        {lead.phone && <Phone className="h-3 w-3" />}
                        {lead.email && <Mail className="h-3 w-3" />}
                        <div className="ml-auto flex items-center gap-1 text-[10px]">
                          <Clock className="h-3 w-3" />
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {getLeadsByStatus(col.id).length === 0 && (
                  <div className="text-center p-4 text-xs text-muted-foreground italic border-2 border-dashed border-border/50 rounded-lg">
                    Nenhum lead nesta etapa
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
