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
export const VALOR_AREA_COMUM = 0.1 * SMN

export const DENSIDADES = [
  { id: 'starter', name: 'STARTER (até 250m²)', multiplier: 1.0, teto_por_lote: 0.05 * SMN },
  { id: 'medium', name: 'MEDIUM (251m² a 500m²)', multiplier: 1.05, teto_por_lote: 0.05 * SMN },
  { id: 'premium', name: 'PREMIUM (501m² a 1000m²)', multiplier: 1.15, teto_por_lote: 0.1 * SMN },
  {
    id: 'exclusive',
    name: 'EXCLUSIVE (acima de 1000m²)',
    multiplier: 1.3,
    teto_por_lote: 0.1 * SMN,
  },
]

export function calcularLotes(qtd: number) {
  let total = 0
  let remaining = qtd
  if (remaining > 100) {
    total += (remaining - 100) * (0.005 * SMN)
    remaining = 100
  }
  if (remaining > 80) {
    total += (remaining - 80) * (0.01 * SMN)
    remaining = 80
  }
  if (remaining > 60) {
    total += (remaining - 60) * (0.02 * SMN)
    remaining = 60
  }
  if (remaining > 40) {
    total += (remaining - 40) * (0.03 * SMN)
    remaining = 40
  }
  if (remaining > 20) {
    total += (remaining - 20) * (0.04 * SMN)
    remaining = 20
  }
  if (remaining > 0) {
    total += remaining * (0.05 * SMN)
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
            <TableHead className="text-right">% do SMN</TableHead>
            <TableHead className="text-right">Valor/Und.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>1 a 20</TableCell>
            <TableCell className="text-right">5,00%</TableCell>
            <TableCell className="text-right">{formatCurrency(0.05 * SMN)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>21 a 40</TableCell>
            <TableCell className="text-right">4,00%</TableCell>
            <TableCell className="text-right">{formatCurrency(0.04 * SMN)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>41 a 60</TableCell>
            <TableCell className="text-right">3,00%</TableCell>
            <TableCell className="text-right">{formatCurrency(0.03 * SMN)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>61 a 80</TableCell>
            <TableCell className="text-right">2,00%</TableCell>
            <TableCell className="text-right">{formatCurrency(0.02 * SMN)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>81 a 100</TableCell>
            <TableCell className="text-right">1,00%</TableCell>
            <TableCell className="text-right">{formatCurrency(0.01 * SMN)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Acima de 100</TableCell>
            <TableCell className="text-right">0,50%</TableCell>
            <TableCell className="text-right">{formatCurrency(0.005 * SMN)}</TableCell>
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
            <TableHead className="text-right">Teto/Lote</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DENSIDADES.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.name}</TableCell>
              <TableCell className="text-right">{d.multiplier.toFixed(2)}x</TableCell>
              <TableCell className="text-right">{formatCurrency(d.teto_por_lote)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
