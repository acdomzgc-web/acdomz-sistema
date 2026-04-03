import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Search, ShieldAlert, Plus, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Sindicos() {
  const [sindicos, setSindicos] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const loadData = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'sindico').order('name')
    if (data) setSindicos(data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddMock = () => {
    toast({
      title: 'Convite Necessário',
      description:
        'Para cadastrar um novo síndico profissional, ele precisa criar uma conta pelo app. Você poderá gerenciar o acesso dele aqui.',
    })
  }

  const filtered = sindicos.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Síndicos Profissionais</h1>
          <p className="text-muted-foreground">
            Gerencie o cadastro de síndicos profissionais do ecossistema.
          </p>
        </div>
        <Button className="gap-2" onClick={handleAddMock}>
          <Plus className="h-4 w-4" /> Convidar Síndico
        </Button>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="py-4 px-6 border-b bg-muted/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou e-mail..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sindico) => (
                <TableRow key={sindico.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-primary flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-secondary" /> {sindico.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{sindico.email}</TableCell>
                  <TableCell>{sindico.telefone || '-'}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="border-green-500 text-green-700 bg-green-50"
                    >
                      Ativo
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-secondary hover:text-secondary-foreground hover:bg-secondary/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhum síndico profissional encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
