import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { usePreferences, MenuItemId } from '@/hooks/use-preferences'
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react'

const MENU_LABELS: Record<MenuItemId, string> = {
  dashboard: 'Dashboard',
  condominios: 'Condomínios',
  moradores: 'Moradores',
  documentos: 'Documentos',
  financeiro: 'Fin. Condomínio',
  sindicos: 'Síndicos',
  calculadora: 'Calc. Honorários',
  configuracoes: 'Configurações',
}

export function PreferenciasTab() {
  const { menuOrder, setMenuOrder } = usePreferences()

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === menuOrder.length - 1)
    )
      return

    const newOrder = [...menuOrder]
    const swapIndex = direction === 'up' ? index - 1 : index + 1

    ;[newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]]
    setMenuOrder(newOrder)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>Configure como você deseja ser notificado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Receba atualizações importantes no seu email.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações no Sistema</Label>
              <p className="text-sm text-muted-foreground">Alertas dentro da plataforma ACDOMZ.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalização do Menu Lateral</CardTitle>
          <CardDescription>
            Altere a ordem de exibição das seções no menu principal do sistema para melhor se
            adequar ao seu fluxo de trabalho.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {menuOrder.map((itemId, index) => (
              <div
                key={itemId}
                className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{MENU_LABELS[itemId]}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === menuOrder.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
