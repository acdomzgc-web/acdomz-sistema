import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const defaultOrder = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'administradoras', label: 'Administradoras' },
  { id: 'condominios', label: 'Condomínios' },
  { id: 'sindicos', label: 'Síndicos' },
  { id: 'moradores', label: 'Moradores' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'financeiro', label: 'Fin. Condomínio' },
  { id: 'calculadora', label: 'Calc. Honorários' },
]

export function PreferenciasTab() {
  const { toast } = useToast()
  const [navItems, setNavItems] = useState(defaultOrder)

  useEffect(() => {
    const savedOrder = localStorage.getItem('acdomz_nav_order')
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder)
        // Garante que todas as opções padrão existam mesmo se o cache estiver desatualizado
        const merged = parsed.filter((p: any) => defaultOrder.find((d) => d.id === p.id))
        const missing = defaultOrder.filter((d) => !merged.find((m: any) => m.id === d.id))
        setNavItems([...merged, ...missing])
      } catch (e) {
        console.error('Error parsing nav order', e)
      }
    }
  }, [])

  const moveUp = (index: number) => {
    if (index === 0) return
    const newItems = [...navItems]
    const temp = newItems[index - 1]
    newItems[index - 1] = newItems[index]
    newItems[index] = temp
    setNavItems(newItems)
  }

  const moveDown = (index: number) => {
    if (index === navItems.length - 1) return
    const newItems = [...navItems]
    const temp = newItems[index + 1]
    newItems[index + 1] = newItems[index]
    newItems[index] = temp
    setNavItems(newItems)
  }

  const saveOrder = () => {
    localStorage.setItem('acdomz_nav_order', JSON.stringify(navItems))
    toast({
      title: 'Preferências salvas',
      description: 'A ordem do menu lateral foi atualizada.',
    })
    // Dispara evento para o sidebar atualizar imediatamente
    window.dispatchEvent(new Event('nav_order_changed'))
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle>Personalização do Menu Lateral</CardTitle>
          <CardDescription>
            Reordene os itens do menu lateral para priorizar as seções que você mais utiliza no dia
            a dia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6 max-w-xl">
            {navItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="h-8 w-8"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveDown(index)}
                    disabled={index === navItems.length - 1}
                    className="h-8 w-8"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={saveOrder} className="w-full sm:w-auto">
            Salvar Ordem do Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
