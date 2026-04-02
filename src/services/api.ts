import { supabase } from '@/lib/supabase/client'

export const api = {
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
  dashboard: {
    stats: async () => {
      const [condos, morad] = await Promise.all([
        supabase.from('condominios').select('id', { count: 'exact' }),
        supabase.from('moradores').select('id', { count: 'exact' }),
      ])
      return { condos: condos.count || 0, moradores: morad.count || 0 }
    },
  },
}
