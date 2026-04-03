import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const SMN = 1621
export const BASE_VALUE = 2 * SMN
export const VALOR_AREA_COMUM = 162.1

export const TIPOS = [
  { id: 'horizontal', name: 'Residencial Horizontal', teto: 10000 },
  { id: 'vertical', name: 'Residencial Vertical', teto: 15000 },
  { id: 'comercial', name: 'Comercial', teto: 20000 },
  { id: 'misto', name: 'Misto', teto: 25000 },
]

export const DENSIDADES = [
  { id: 'baixa', name: 'Baixa (Até 2 un/lote)', multiplier: 1.0 },
  { id: 'media', name: 'Média (3-5 un/lote)', multiplier: 1.2 },
  { id: 'alta', name: 'Alta (Acima 5 un/lote)', multiplier: 1.5 },
]

export function calcularLotes(qtd: number) {
  let total = 0
  let remaining = qtd
  if (remaining > 150) {
    total += (remaining - 150) * 10
    remaining = 150
  }
  if (remaining > 50) {
    total += (remaining - 50) * 15
    remaining = 50
  }
  if (remaining > 0) {
    total += remaining * 20
  }
  return total
}

export const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export function FaixasLotesTable() {
  return (
    <div className="rounded-md border text-sm mt-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Faixa de Lotes</TableHead>
            <TableHead className="text-right">Valor/Und.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>1 a 50</TableCell>
            <TableCell className="text-right">R$ 20,00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>51 a 150</TableCell>
            <TableCell className="text-right">R$ 15,00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Acima de 150</TableCell>
            <TableCell className="text-right">R$ 10,00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

export function DensidadeTable() {
  return (
    <div className="rounded-md border text-sm mt-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Multiplicador</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Baixa</TableCell>
            <TableCell className="text-right">1.0x</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Média</TableCell>
            <TableCell className="text-right">1.2x</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Alta</TableCell>
            <TableCell className="text-right">1.5x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
