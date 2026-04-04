import { useState, useEffect } from 'react'

export type MenuItemId =
  | 'dashboard'
  | 'condominios'
  | 'moradores'
  | 'documentos'
  | 'financeiro'
  | 'sindicos'
  | 'calculadora'
  | 'configuracoes'

const DEFAULT_MENU_ORDER: MenuItemId[] = [
  'dashboard',
  'condominios',
  'moradores',
  'documentos',
  'financeiro',
  'sindicos',
  'calculadora',
  'configuracoes',
]

const DEFAULT_METRICS = [
  'admin',
  'condominios',
  'moradores',
  'receita',
  'despesa',
  'lucro',
  'sindicos',
]

export function usePreferences() {
  const [menuOrder, setMenuOrderState] = useState<MenuItemId[]>(() => {
    try {
      const saved = localStorage.getItem('acdomz-menu-order')
      return saved ? JSON.parse(saved) : DEFAULT_MENU_ORDER
    } catch {
      return DEFAULT_MENU_ORDER
    }
  })

  const [visibleMetrics, setVisibleMetricsState] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('acdomz-visible-metrics')
      return saved ? JSON.parse(saved) : DEFAULT_METRICS
    } catch {
      return DEFAULT_METRICS
    }
  })

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedMenu = localStorage.getItem('acdomz-menu-order')
        if (savedMenu) setMenuOrderState(JSON.parse(savedMenu))
        const savedMetrics = localStorage.getItem('acdomz-visible-metrics')
        if (savedMetrics) setVisibleMetricsState(JSON.parse(savedMetrics))
      } catch (e) {
        // ignore
      }
    }

    window.addEventListener('preferences-updated', handleStorageChange)
    return () => window.removeEventListener('preferences-updated', handleStorageChange)
  }, [])

  const setMenuOrder = (order: MenuItemId[]) => {
    setMenuOrderState(order)
    localStorage.setItem('acdomz-menu-order', JSON.stringify(order))
    window.dispatchEvent(new Event('preferences-updated'))
  }

  const setVisibleMetrics = (metrics: string[]) => {
    setVisibleMetricsState(metrics)
    localStorage.setItem('acdomz-visible-metrics', JSON.stringify(metrics))
    window.dispatchEvent(new Event('preferences-updated'))
  }

  return { menuOrder, setMenuOrder, visibleMetrics, setVisibleMetrics }
}
