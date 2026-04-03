import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ReportLayout } from './ReportLayout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ReportMoradores({ condominioId }: { condominioId: string }) {
  const [moradores, setMoradores] = useState<any[]>([])
  const [condominio, setCondominio] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (condominioId !== 'all') {
        const { data: cond } = await supabase
          .from('condominios')
          .select('name')
          .eq('id', condominioId)
          .single()
        if (cond) setCondominio(cond)
      } else {
        setCondominio({ name: 'Todos os Condomínios' })
      }

      let query = supabase
        .from('moradores')
        .select('name, email, phone, unit, role, status, condominios(name)')
      if (condominioId !== 'all') query = query.eq('condominio_id', condominioId)

      const { data } = await query.order('name')
      setMoradores(data || [])
      setLoading(false)
    }
    load()
  }, [condominioId])

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando dados...</div>

  return (
    <ReportLayout
      title="Relatório de Moradores"
      subtitle={`Condomínio: ${condominio?.name || 'Não selecionado'} - Total: ${moradores.length} registros`}
    >
      <div className="print-break-inside-avoid">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-slate-700">Nome</TableHead>
              <TableHead className="font-bold text-slate-700">Unidade</TableHead>
              <TableHead className="font-bold text-slate-700">Função</TableHead>
              <TableHead className="font-bold text-slate-700">Email</TableHead>
              <TableHead className="font-bold text-slate-700">Telefone</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {moradores.map((m, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium text-slate-800">{m.name}</TableCell>
                <TableCell className="text-slate-600">{m.unit || '-'}</TableCell>
                <TableCell className="capitalize text-slate-600">{m.role || 'Morador'}</TableCell>
                <TableCell className="text-slate-600">{m.email || '-'}</TableCell>
                <TableCell className="text-slate-600">{m.phone || '-'}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${m.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}
                  >
                    {m.status || 'Ativo'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {moradores.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Nenhum morador encontrado para o filtro selecionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ReportLayout>
  )
}
