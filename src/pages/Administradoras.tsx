import { useState } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const mockAdmins = [
  {
    id: 1,
    name: 'Gestão Prime',
    cnpj: '12.345.678/0001-90',
    email: 'contato@gestaoprime.com',
    phone: '(11) 3456-7890',
    address: 'Av. Paulista, 1000',
  },
  {
    id: 2,
    name: 'CondoMaster Sul',
    cnpj: '98.765.432/0001-10',
    email: 'atendimento@condomaster.com',
    phone: '(41) 3333-4444',
    address: 'Rua das Flores, 500',
  },
]

export default function Administradoras() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Administradoras</h1>
          <p className="text-muted-foreground">Gerencie as empresas parceiras do portal.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nova Administradora
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Administradora</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Razão Social / Nome Fantasia</Label>
                <Input id="name" placeholder="Ex: Gestão Prime Ltda" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" placeholder="00.000.000/0000-00" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" placeholder="(00) 0000-0000" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail Comercial</Label>
                <Input id="email" type="email" placeholder="contato@empresa.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input id="address" placeholder="Rua, Número, Bairro, Cidade - UF" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Salvar Cadastro</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="py-4 px-6 border-b bg-muted/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou CNPJ..."
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
                <TableHead className="w-[250px]">Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Contatos</TableHead>
                <TableHead className="hidden md:table-cell">Endereço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAdmins.map((admin) => (
                <TableRow key={admin.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-primary">{admin.name}</TableCell>
                  <TableCell className="text-muted-foreground">{admin.cnpj}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{admin.email}</p>
                      <p className="text-muted-foreground">{admin.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {admin.address}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-secondary hover:text-secondary-foreground hover:bg-secondary/20"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
