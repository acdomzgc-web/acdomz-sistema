import { supabase } from '@/lib/supabase/client'

export const api = {
  profiles: {
    get: async (id: string) => supabase.from('profiles').select('*').eq('id', id).single(),
  },
  administradoras: {
    list: async () =>
      supabase.from('administradoras').select('*').order('created_at', { ascending: false }),
    create: async (data: any) => supabase.from('administradoras').insert(data).select().single(),
    delete: async (id: string) => supabase.from('administradoras').delete().eq('id', id),
  },
  condominios: {
    list: async () =>
      supabase
        .from('condominios')
        .select('*, administradoras(name), profiles(name)')
        .order('created_at', { ascending: false }),
    create: async (data: any) => supabase.from('condominios').insert(data).select().single(),
  },
  moradores: {
    list: async () =>
      supabase
        .from('moradores')
        .select('*, condominios(name)')
        .order('created_at', { ascending: false }),
    create: async (data: any) => supabase.from('moradores').insert(data).select().single(),
  },
  documentos: {
    list: async () =>
      supabase.from('documentos_condominio').select('*').order('created_at', { ascending: false }),
    create: async (data: any) =>
      supabase.from('documentos_condominio').insert(data).select().single(),
    delete: async (id: string) => supabase.from('documentos_condominio').delete().eq('id', id),
  },
  receitas: {
    list: async () =>
      supabase
        .from('receitas_acdomz')
        .select('*, condominios(name)')
        .order('date', { ascending: false }),
    create: async (data: any) => supabase.from('receitas_acdomz').insert(data).select().single(),
  },
  despesasRecorrentes: {
    list: async () =>
      supabase
        .from('despesas_recorrentes_acdomz')
        .select('*')
        .order('day_of_month', { ascending: true }),
    create: async (data: any) =>
      supabase.from('despesas_recorrentes_acdomz').insert(data).select().single(),
  },
  despesasPontuais: {
    list: async () =>
      supabase.from('despesas_pontuais_acdomz').select('*').order('date', { ascending: false }),
    create: async (data: any) =>
      supabase.from('despesas_pontuais_acdomz').insert(data).select().single(),
  },
  dashboard: {
    stats: async () => {
      const [condos, morad] = await Promise.all([
        supabase.from('condominios').select('id', { count: 'exact' }),
        supabase.from('moradores').select('id', { count: 'exact' }),
      ])
      return { condos: condos.count || 0, moradores: morad.count || 0 }
    },
  },
  financeiroCondominio: {
    list: async (condominioId?: string) => {
      let query = supabase
        .from('financeiro_condominio')
        .select('*')
        .order('date', { ascending: false })
      if (condominioId) {
        query = query.eq('condominio_id', condominioId)
      }
      return query
    },
    getBySindico: async (sindicoId: string) => {
      return supabase.from('condominios').select('*').eq('sindico_id', sindicoId).single()
    },
  },
}
