export type Condominio = {
  id: string
  name: string
  sindia_active: boolean
  sindia_prompt: string | null
  use_global_sindia_config: boolean
  sindia_tone: string | null
  sindia_response_length: string | null
  sindia_delay_seconds: number | null
}

export type Conversa = {
  id: string
  created_at: string
  message: string | null
  response: string | null
  status: string
  is_unauthorized: boolean
  manual_reply: string | null
  user_id: string | null
  phone?: string | null
  condominio_id?: string | null
  profiles: { name: string; foto_url?: string | null } | null
}
