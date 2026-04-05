import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react'

const DEFAULT_MENU_ITEMS = [
  'Dashboard',
  'Administradoras',
  'Condomínios',
  'Moradores',
  'Documentos',
  'Dash. Financeiro ACDOMZ',
  'Fin. Condomínio',
  'Parecer Financeiro',
  'Comunicados',
  'SINDIA Bot',
  'Síndicos',
  'Calc. Honorários',
  'Relatórios',
  'Configurações',
]

export function MenuConfigTab() {
  const [menuOrder, setMenuOrder] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-order-v2')
    if (saved) {
      try {
        const order = JSON.parse(saved)
        const orderedItems = order.filter((i: string) => DEFAULT_MENU_ITEMS.includes(i))
        const missing = DEFAULT_MENU_ITEMS.filter((i) => !order.includes(i))
        setMenuOrder([...orderedItems, ...missing])
      } catch (e) {
        setMenuOrder(DEFAULT_MENU_ITEMS)
      }
    } else {
      setMenuOrder(DEFAULT_MENU_ITEMS)
    }
  }, [])

  const updateOrder = (newOrder: string[]) => {
    setMenuOrder(newOrder)
    localStorage.setItem('sidebar-order-v2', JSON.stringify(newOrder))
    window.dispatchEvent(new Event('sidebar-order-updated'))
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...menuOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp
    updateOrder(newOrder)
  }

  const moveDown = (index: number) => {
    if (index === menuOrder.length - 1) return
    const newOrder = [...menuOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp
    updateOrder(newOrder)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalização do Menu</CardTitle>
        <CardDescription>
          Reorganize a ordem das seções no menu lateral de acordo com sua preferência. A alteração
          refletirá imediatamente na navegação. Todas as abas do sistema estão disponíveis aqui para
          organização.
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
                <span className="font-medium">{item}</span>
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
