import { Link, useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Logo } from '@/components/Logo'

export default function Login() {
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-muted">
      {/* Background pattern */}
      <div
        className="absolute inset-0 z-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://img.usecurling.com/p/1920/1080?q=architecture&color=blue')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-background/50 z-0" />

      <Card className="w-full max-w-md z-10 shadow-2xl border-0 bg-card/95 backdrop-blur-sm animate-fade-in-up">
        <CardHeader className="space-y-4 pb-6 text-center">
          <div className="flex justify-center mb-2">
            <Logo iconClassName="h-8 w-8" textClassName="text-3xl" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">Bem-vindo ao Portal</CardTitle>
            <CardDescription className="text-base">
              Faça login para gerenciar seus condomínios
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Corporativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@acdomz.com.br"
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link to="#" className="text-sm font-medium text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input id="password" type="password" required className="bg-background" />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="remember" />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Lembrar minhas credenciais
              </Label>
            </div>
            <Button type="submit" className="w-full mt-6 text-base h-11" size="lg">
              Acessar Portal
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6 mt-4">
          <p className="text-sm text-muted-foreground text-center">
            Plataforma de Gestão Inteligente <br />© 2024 ACDOMZ
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
