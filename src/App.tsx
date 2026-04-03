import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Dashboard from './pages/Index'
import Administradoras from './pages/Administradoras'
import Condominios from './pages/Condominios'
import Moradores from './pages/Moradores'
import Documentos from './pages/Documentos'
import FinanceiroAcdomz from './pages/FinanceiroAcdomz'
import DespesasAcdomz from './pages/DespesasAcdomz'
import DashboardFinanceiroAcdomz from './pages/DashboardFinanceiroAcdomz'
import FinanceiroCondominio from './pages/FinanceiroCondominio'
import ParecerFinanceiro from './pages/ParecerFinanceiro'
import Comunicados from './pages/Comunicados'
import Sindia from './pages/Sindia'
import CalculadoraHonorarios from './pages/CalculadoraHonorarios'
import Relatorios from './pages/Relatorios'
import { AuthProvider } from './hooks/use-auth'
import { AuthGuard } from './components/AuthGuard'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <AuthGuard>
                <Layout />
              </AuthGuard>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/administradoras" element={<Administradoras />} />
            <Route path="/condominios" element={<Condominios />} />
            <Route path="/moradores" element={<Moradores />} />
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/financeiro" element={<FinanceiroAcdomz />} />
            <Route path="/despesas" element={<DespesasAcdomz />} />
            <Route path="/dashboard-financeiro" element={<DashboardFinanceiroAcdomz />} />
            <Route path="/financeiro-condominio" element={<FinanceiroCondominio />} />
            <Route path="/parecer-financeiro" element={<ParecerFinanceiro />} />
            <Route path="/comunicados" element={<Comunicados />} />
            <Route path="/sindia" element={<Sindia />} />
            <Route path="/calculadora" element={<CalculadoraHonorarios />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
