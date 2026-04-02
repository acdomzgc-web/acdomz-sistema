import { useState } from 'react'
import { Plus, Edit, Trash2, Search, Building } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const mockCondos = [
  {
    id: 1,
    name: 'Residencial Alpha',
    address: 'Rua das Flores, 100',
    admin: 'Gestão Prime',
    sindico: 'Carlos Silva',
    units: 120,
  },
  {
    id: 2,
    name: 'Torres do Sol',
    address: 'Av. Brasil, 2000',
    admin: 'CondoMaster Sul',
    sindico: 'Mariana Costa',
    units: 250,
  },
]

export default function Condominios() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Condomínios</h1>
          <p className="text-muted-foreground">Gestão do portfólio de propriedades.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Novo Condomínio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-secondary" /> Cadastrar Condomínio
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  Informações Básicas
                </h3>
                <div className="grid gap-2">
                  <Label htmlFor="c-name">Nome do Condomínio</Label>
                  <Input id="c-name" placeholder="Ex: Residencial Alpha" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="c-cnpj">CNPJ</Label>
                    <Input id="c-cnpj" placeholder="00.000.000/0000-00" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="c-units">Total de Unidades</Label>
                    <Input id="c-units" type="number" placeholder="Ex: 120" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-address">Endereço Completo</Label>
                  <Input id="c-address" placeholder="Rua, Número, Bairro, Cidade - UF" />
                </div>
              </div>

              <div className="space-y-4 mt-2">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  Relacionamentos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Administradora</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Gestão Prime</SelectItem>
                        <SelectItem value="2">CondoMaster Sul</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Síndico Atual</Label>
                    <Input placeholder="Nome do Síndico" />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Salvar Condomínio</Button>
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
              placeholder="Buscar condomínios..."
              className="pl-9 bg-background"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Condomínio</TableHead>
                <TableHead>Administradora</TableHead>
                <TableHead>Síndico</TableHead>
                <TableHead className="text-center">Unidades</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCondos.map((condo) => (
                <TableRow key={condo.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-medium text-primary">{condo.name}</div>
                    <div className="text-xs text-muted-foreground">{condo.address}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-background">
                      {condo.admin}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{condo.sindico}</TableCell>
                  <TableCell className="text-center font-medium">{condo.units}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-secondary hover:text-secondary-foreground hover:bg-secondary/20"
                      >
                        <Edit className="h-4 w-4" />
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
