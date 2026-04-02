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
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
