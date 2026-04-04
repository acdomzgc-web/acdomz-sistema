import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

export function MenuConfigTab() {
  const { menuOrder, setMenuOrder } = usePreferences()

  const moveUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...menuOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp
    setMenuOrder(newOrder)
  }

  const moveDown = (index: number) => {
    if (index === menuOrder.length - 1) return
    const newOrder = [...menuOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp
    setMenuOrder(newOrder)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalização do Menu</CardTitle>
        <CardDescription>
          Reorganize a ordem das seções no menu lateral de acordo com sua preferência. A alteração
          refletirá imediatamente na navegação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-w-lg">
          {menuOrder.map((item, index) => (
            <div
              key={item}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{MENU_LABELS[item]}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveDown(index)}
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
  )
}
