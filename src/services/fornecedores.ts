import { supabase } from '@/lib/supabase/client'

export type Categoria = {
  id: string
  nome: string
  cor: string
}

export type Fornecedor = {
  id: string
  razao_social: string
  nome_fantasia: string | null
  documento: string | null
  status: 'ativo' | 'suspenso' | 'inativo'
  contato_responsavel: string | null
  contato_telefone: string | null
  contato_email: string | null
  contato_site: string | null
  avaliacao: number
  forma_pagamento: string | null
  contrato_assinado: boolean
  validade_documentos: string | null
  faixa_preco: string | null
  observacoes: string | null
  categorias?: Categoria[]
  condominios?: { id: string; name: string }[]
}

export const fornecedoresService = {
  async getCategorias() {
    const { data, error } = await supabase
      .from('fornecedores_categorias' as any)
      .select('*')
      .order('nome')
    if (error) throw error
    return data as Categoria[]
  },
  async saveCategoria(cat: Partial<Categoria>) {
    if (cat.id) {
      const { error } = await supabase
        .from('fornecedores_categorias' as any)
        .update({ nome: cat.nome, cor: cat.cor })
        .eq('id', cat.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('fornecedores_categorias' as any)
        .insert({ nome: cat.nome, cor: cat.cor })
      if (error) throw error
    }
  },
  async deleteCategoria(id: string) {
    const { error } = await supabase
      .from('fornecedores_categorias' as any)
      .delete()
      .eq('id', id)
    if (error) throw error
  },
  async getFornecedores() {
    const { data, error } = await supabase
      .from('fornecedores' as any)
      .select(`
        *,
        fornecedores_fornecedor_categorias (
          fornecedores_categorias ( id, nome, cor )
        ),
        fornecedores_condominios (
          condominios ( id, name )
        )
      `)
      .order('razao_social')

    if (error) throw error
    return data.map((f: any) => ({
      ...f,
      categorias:
        f.fornecedores_fornecedor_categorias
          ?.map((fc: any) => fc.fornecedores_categorias)
          .filter(Boolean) || [],
      condominios:
        f.fornecedores_condominios?.map((fc: any) => fc.condominios).filter(Boolean) || [],
    })) as Fornecedor[]
  },
  async saveFornecedor(forn: Partial<Fornecedor>, catIds: string[], condIds: string[]) {
    let savedId = forn.id
    const fornData = { ...forn }
    delete fornData.categorias
    delete fornData.condominios

    if (savedId) {
      const { error } = await supabase
        .from('fornecedores' as any)
        .update(fornData)
        .eq('id', savedId)
      if (error) throw error
      await supabase
        .from('fornecedores_fornecedor_categorias' as any)
        .delete()
        .eq('fornecedor_id', savedId)
      await supabase
        .from('fornecedores_condominios' as any)
        .delete()
        .eq('fornecedor_id', savedId)
    } else {
      const { data, error } = await supabase
        .from('fornecedores' as any)
        .insert(fornData)
        .select('id')
        .single()
      if (error) throw error
      savedId = data.id
    }

    if (catIds.length > 0) {
      await supabase
        .from('fornecedores_fornecedor_categorias' as any)
        .insert(catIds.map((id) => ({ fornecedor_id: savedId, categoria_id: id })))
    }
    if (condIds.length > 0) {
      await supabase
        .from('fornecedores_condominios' as any)
        .insert(condIds.map((id) => ({ fornecedor_id: savedId, condominio_id: id })))
    }
  },
  async deleteFornecedor(id: string) {
    const { error } = await supabase
      .from('fornecedores' as any)
      .delete()
      .eq('id', id)
    if (error) throw error
  },
  async getPrefs(userId: string) {
    const { data, error } = await supabase
      .from('fornecedores_dashboard_prefs' as any)
      .select('prefs')
      .eq('user_id', userId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data?.prefs
  },
  async savePrefs(userId: string, prefs: any[]) {
    const { error } = await supabase
      .from('fornecedores_dashboard_prefs' as any)
      .upsert({ user_id: userId, prefs, updated_at: new Date().toISOString() })
    if (error) throw error
  },
}
