import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { ArrowUp, ArrowDown, GripVertical, Save } from 'lucide-react'

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
  const [customNames, setCustomNames] = useState<Record<string, string>>({})
  const { toast } = useToast()

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

    const savedNames = localStorage.getItem('sidebar-custom-names')
    if (savedNames) {
      try {
        setCustomNames(JSON.parse(savedNames))
      } catch (e) {
        // ignore
      }
    }
  }, [])

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

  const handleNameChange = (item: string, value: string) => {
    setCustomNames((prev) => ({ ...prev, [item]: value }))
  }

  const saveLayout = () => {
    localStorage.setItem('sidebar-order-v2', JSON.stringify(menuOrder))
    localStorage.setItem('sidebar-custom-names', JSON.stringify(customNames))
    window.dispatchEvent(new Event('sidebar-order-updated'))
    toast({
      title: 'Layout salvo com sucesso',
      description: 'A ordem e os nomes do menu foram atualizados.',
    })
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Personalização do Menu</CardTitle>
        <CardDescription>
          Reorganize a ordem e edite o nome de exibição das seções no menu lateral de acordo com sua
          preferência. Todas as abas do sistema estão disponíveis aqui.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {menuOrder.map((item, index) => (
            <div
              key={item}
              className="flex items-center justify-between p-2 sm:p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <Input
                  value={customNames[item] !== undefined ? customNames[item] : item}
                  onChange={(e) => handleNameChange(item, e.target.value)}
                  className="h-8 max-w-[250px] font-medium"
                  placeholder={item}
                />
                <span className="text-xs text-muted-foreground hidden sm:inline-block">
                  (Original: {item})
                </span>
              </div>
              <div className="flex items-center gap-1 ml-2">
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
      <CardFooter className="bg-muted/20 border-t py-4">
        <Button onClick={saveLayout} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" /> Salvar Layout
        </Button>
      </CardFooter>
    </Card>
  )
}
