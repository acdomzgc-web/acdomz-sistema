export type Condominio = {
  id: string
  name: string
  sindia_active: boolean
  sindia_prompt: string | null
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
  profiles: { name: string } | null
}
