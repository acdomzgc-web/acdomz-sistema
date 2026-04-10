// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      administradoras: {
        Row: {
          address: string | null
          cnpj: string
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          responsavel_email: string | null
          responsavel_nome: string | null
          responsavel_phone: string | null
        }
        Insert: {
          address?: string | null
          cnpj: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          responsavel_email?: string | null
          responsavel_nome?: string | null
          responsavel_phone?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          responsavel_email?: string | null
          responsavel_nome?: string | null
          responsavel_phone?: string | null
        }
        Relationships: []
      }
      calculos_honorarios: {
        Row: {
          calculated_value: number | null
          condominio_id: string | null
          created_at: string
          details: Json | null
          id: string
        }
        Insert: {
          calculated_value?: number | null
          condominio_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Update: {
          calculated_value?: number | null
          condominio_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'calculos_honorarios_condominio_id_fkey'
            columns: ['condominio_id']
            isOneToOne: false
            referencedRelation: 'condominios'
            referencedColumns: ['id']
          },
        ]
      }
      categorias_financeiras: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      comunicados: {
        Row: {
          comunicado_gerado: string | null
          condominio_id: string | null
          content: string | null
          created_at: string
          criado_por: string | null
          data_criacao: string | null
          date: string | null
          descricao_original: string | null
          formato_download: string | null
          id: string
          title: string | null
        }
        Insert: {
          comunicado_gerado?: string | null
          condominio_id?: string | null
          content?: string | null
          created_at?: string
          criado_por?: string | null
          data_criacao?: string | null
          date?: string | null
          descricao_original?: string | null
          formato_download?: string | null
          id?: string
          title?: string | null
        }
        Update: {
          comunicado_gerado?: string | null
          condominio_id?: string | null
          content?: string | null
          created_at?: string
          criado_por?: string | null
          data_criacao?: string | null
          date?: string | null
          descricao_original?: string | null
          formato_download?: string | null
          id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'comunicados_condominio_id_fkey'
            columns: ['condominio_id']
            isOneToOne: false
            referencedRelation: 'condominios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comunicados_criado_por_fkey'
            columns: ['criado_por']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      condominios: {
        Row: {
          address: string | null
          admin_id: string | null
          calc_areas_comuns: number | null
          calc_densidade_id: string | null
          calc_tipo_id: string | null
          cnpj: string | null
          created_at: string
          id: string
          name: string
          ocupacao: string | null
          sindia_active: boolean | null
          sindia_delay_seconds: number | null
          sindia_prompt: string | null
          sindia_response_length: string | null
          sindia_tone: string | null
          sindico_id: string | null
          tipo: string | null
          total_units: number | null
          use_global_sindia_config: boolean | null
        }
        Insert: {
          address?: string | null
          admin_id?: string | null
          calc_areas_comuns?: number | null
          calc_densidade_id?: string | null
          calc_tipo_id?: string | null
          cnpj?: string | null
          created_at?: string
          id?: string
          name: string
          ocupacao?: string | null
          sindia_active?: boolean | null
          sindia_delay_seconds?: number | null
          sindia_prompt?: string | null
          sindia_response_length?: string | null
          sindia_tone?: string | null
          sindico_id?: string | null
          tipo?: string | null
          total_units?: number | null
          use_global_sindia_config?: boolean | null
        }
        Update: {
          address?: string | null
          admin_id?: string | null
          calc_areas_comuns?: number | null
          calc_densidade_id?: string | null
          calc_tipo_id?: string | null
          cnpj?: string | null
          created_at?: string
          id?: string
          name?: string
          ocupacao?: string | null
          sindia_active?: boolean | null
          sindia_delay_seconds?: number | null
          sindia_prompt?: string | null
          sindia_response_length?: string | null
          sindia_tone?: string | null
          sindico_id?: string | null
          tipo?: string | null
          total_units?: number | null
          use_global_sindia_config?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: 'condominios_admin_id_fkey'
            columns: ['admin_id']
            isOneToOne: false
            referencedRelation: 'administradoras'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'condominios_sindico_id_fkey'
            columns: ['sindico_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      conversas_sindia: {
        Row: {
          condominio_id: string | null
          created_at: string
          id: string
          is_unauthorized: boolean | null
          manual_reply: string | null
          message: string | null
          phone: string | null
          response: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          condominio_id?: string | null
          created_at?: string
          id?: string
          is_unauthorized?: boolean | null
          manual_reply?: string | null
          message?: string | null
          phone?: string | null
          response?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          condominio_id?: string | null
          created_at?: string
          id?: string
          is_unauthorized?: boolean | null
          manual_reply?: string | null
          message?: string | null
          phone?: string | null
          response?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'conversas_sindia_condominio_id_fkey'
            columns: ['condominio_id']
            isOneToOne: false
            referencedRelation: 'condominios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'conversas_sindia_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      crm_leads: {
        Row: {
          condominio_name: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          lead_type: string | null
          name: string
          notes: string | null
          origin: string | null
          phone: string | null
          status: string
          status_updated_at: string | null
          units_count: number | null
          updated_at: string
          value: number | null
        }
        Insert: {
          condominio_name?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_type?: string | null
          name: string
          notes?: string | null
          origin?: string | null
          phone?: string | null
          status?: string
          status_updated_at?: string | null
          units_count?: number | null
          updated_at?: string
          value?: number | null
        }
        Update: {
          condominio_name?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_type?: string | null
          name?: string
          notes?: string | null
          origin?: string | null
          phone?: string | null
          status?: string
          status_updated_at?: string | null
          units_count?: number | null
          updated_at?: string
          value?: number | null
        }
        Relationships: []
      }
      despesas_pontuais_acdomz: {
        Row: {
          amount: number | null
          category: string | null
          created_at: string
          date: string | null
          description: string | null
          id: string
          invoice_url: string | null
          is_recurrent: boolean | null
        }
        Insert: {
          amount?: number | null
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          invoice_url?: string | null
          is_recurrent?: boolean | null
        }
        Update: {
          amount?: number | null
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          invoice_url?: string | null
          is_recurrent?: boolean | null
        }
        Relationships: []
      }
      despesas_recorrentes_acdomz: {
        Row: {
          amount: number | null
          created_at: string
          day_of_month: number | null
          description: string | null
          id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          day_of_month?: number | null
          description?: string | null
          id?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          day_of_month?: number | null
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      documentos_condominio: {
        Row: {
          condominio_id: string | null
          created_at: string
          file_path: string | null
          folder: string | null
          id: string
          name: string
          size: string | null
          type: string | null
        }
        Insert: {
          condominio_id?: string | null
          created_at?: string
          file_path?: string | null
          folder?: string | null
          id?: string
          name: string
          size?: string | null
          type?: string | null
        }
        Update: {
          condominio_id?: string | null
          created_at?: string
          file_path?: string | null
          folder?: string | null
          id?: string
          name?: string
          size?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'documentos_condominio_condominio_id_fkey'
            columns: ['condominio_id']
            isOneToOne: false
            referencedRelation: 'condominios'
            referencedColumns: ['id']
          },
        ]
      }
      financeiro_condominio: {
        Row: {
          amount: number | null
          condominio_id: string | null
          created_at: string
          date: string | null
          description: string | null
          id: string
          type: string | null
        }
        Insert: {
          amount?: number | null
          condominio_id?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          type?: string | null
        }
        Update: {
          amount?: number | null
          condominio_id?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'financeiro_condominio_condominio_id_fkey'
            columns: ['condominio_id']
            isOneToOne: false
            referencedRelation: 'condominios'
            referencedColumns: ['id']
          },
        ]
      }
      moradores: {
        Row: {
          condominio_id: string | null
          created_at: string
          email: string | null
          funcao: string | null
          id: string
          name: string
          perfil_tipo: string | null
          phone: string | null
          role: string | null
          status: string | null
          unit: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          condominio_id?: string | null
          created_at?: string
          email?: string | null
          funcao?: string | null
          id?: string
          name: string
          perfil_tipo?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          unit?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          condominio_id?: string | null
          created_at?: string
          email?: string | null
          funcao?: string | null
          id?: string
          name?: string
          perfil_tipo?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          unit?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'moradores_condominio_id_fkey'
            columns: ['condominio_id']
            isOneToOne: false
            referencedRelation: 'condominios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'moradores_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      parecer_financeiro: {
        Row: {
          condominio_id: string | null
          content: string | null
          created_at: string
          id: string
          month: string | null
        }
        Insert: {
          condominio_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          month?: string | null
        }
        Update: {
          condominio_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          month?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'parecer_financeiro_condominio_id_fkey'
            columns: ['condominio_id']
            isOneToOne: false
            referencedRelation: 'condominios'
            referencedColumns: ['id']
          },
        ]
      }
      pastas_documentos: {
        Row: {
          condominio_id: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          condominio_id?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          condominio_id?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pastas_documentos_condominio_id_fkey'
            columns: ['condominio_id']
            isOneToOne: false
            referencedRelation: 'condominios'
            referencedColumns: ['id']
          },
        ]
      }
      perfis_acesso: {
        Row: {
          created_at: string
          descricao: string | null
          funcao: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          funcao: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          funcao?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          foto_url: string | null
          id: string
          name: string
          role: string
          telefone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          foto_url?: string | null
          id: string
          name: string
          role?: string
          telefone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          foto_url?: string | null
          id?: string
          name?: string
          role?: string
          telefone?: string | null
        }
        Relationships: []
      }
      receitas_acdomz: {
        Row: {
          amount: number | null
          category: string | null
          condominio_id: string | null
          created_at: string
          date: string | null
          description: string | null
          id: string
          invoice_url: string | null
          is_recurrent: boolean | null
        }
        Insert: {
          amount?: number | null
          category?: string | null
          condominio_id?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          invoice_url?: string | null
          is_recurrent?: boolean | null
        }
        Update: {
          amount?: number | null
          category?: string | null
          condominio_id?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          invoice_url?: string | null
          is_recurrent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: 'receitas_acdomz_condominio_id_fkey'
            columns: ['condominio_id']
            isOneToOne: false
            referencedRelation: 'condominios'
            referencedColumns: ['id']
          },
        ]
      }
      regras_calculo_honorarios: {
        Row: {
          created_at: string
          description: string | null
          id: string
          multiplier: number | null
          tipo_condominio_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          multiplier?: number | null
          tipo_condominio_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          multiplier?: number | null
          tipo_condominio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'regras_calculo_honorarios_tipo_condominio_id_fkey'
            columns: ['tipo_condominio_id']
            isOneToOne: false
            referencedRelation: 'tipos_condominio'
            referencedColumns: ['id']
          },
        ]
      }
      sindia_configuracoes_globais: {
        Row: {
          created_at: string | null
          id: number
          sindia_active: boolean | null
          sindia_delay_seconds: number | null
          sindia_prompt: string | null
          sindia_response_length: string | null
          sindia_tone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          sindia_active?: boolean | null
          sindia_delay_seconds?: number | null
          sindia_prompt?: string | null
          sindia_response_length?: string | null
          sindia_tone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          sindia_active?: boolean | null
          sindia_delay_seconds?: number | null
          sindia_prompt?: string | null
          sindia_response_length?: string | null
          sindia_tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tipos_condominio: {
        Row: {
          base_smn: number | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          base_smn?: number | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          base_smn?: number | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: administradoras
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   cnpj: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   address: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   responsavel_nome: text (nullable)
//   responsavel_email: text (nullable)
//   responsavel_phone: text (nullable)
// Table: calculos_honorarios
//   id: uuid (not null, default: gen_random_uuid())
//   condominio_id: uuid (nullable)
//   calculated_value: numeric (nullable)
//   details: jsonb (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: categorias_financeiras
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   type: text (not null)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: comunicados
//   id: uuid (not null, default: gen_random_uuid())
//   condominio_id: uuid (nullable)
//   title: text (nullable)
//   content: text (nullable)
//   date: date (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   descricao_original: text (nullable)
//   comunicado_gerado: text (nullable)
//   formato_download: text (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   criado_por: uuid (nullable)
// Table: condominios
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   cnpj: text (nullable)
//   address: text (nullable)
//   total_units: integer (nullable)
//   admin_id: uuid (nullable)
//   sindico_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   sindia_active: boolean (nullable, default: true)
//   calc_tipo_id: text (nullable)
//   calc_densidade_id: text (nullable)
//   calc_areas_comuns: integer (nullable, default: 0)
//   sindia_prompt: text (nullable, default: 'Você é SINDIA, a assistente virtual inteligente da ACDOMZ. Responda de forma educada, formal e APENAS baseada nos documentos fornecidos do condomínio.'::text)
//   use_global_sindia_config: boolean (nullable, default: true)
//   sindia_tone: text (nullable)
//   sindia_response_length: text (nullable)
//   sindia_delay_seconds: integer (nullable)
//   tipo: text (nullable, default: 'horizontal'::text)
//   ocupacao: text (nullable, default: 'residencial'::text)
// Table: conversas_sindia
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   condominio_id: uuid (nullable)
//   message: text (nullable)
//   response: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   status: text (nullable, default: 'respondido'::text)
//   is_unauthorized: boolean (nullable, default: false)
//   manual_reply: text (nullable)
//   phone: text (nullable)
// Table: crm_leads
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   condominio_name: text (nullable)
//   email: text (nullable)
//   phone: text (nullable)
//   status: text (not null, default: 'lead'::text)
//   value: numeric (nullable)
//   notes: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   lead_type: text (nullable, default: 'sindico'::text)
//   origin: text (nullable, default: 'prospeccao_ativa'::text)
//   units_count: integer (nullable)
//   contact_person: text (nullable)
//   status_updated_at: timestamp with time zone (nullable, default: now())
// Table: despesas_pontuais_acdomz
//   id: uuid (not null, default: gen_random_uuid())
//   description: text (nullable)
//   amount: numeric (nullable)
//   date: date (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   is_recurrent: boolean (nullable, default: false)
//   category: text (nullable, default: 'Geral'::text)
//   invoice_url: text (nullable)
// Table: despesas_recorrentes_acdomz
//   id: uuid (not null, default: gen_random_uuid())
//   description: text (nullable)
//   amount: numeric (nullable)
//   day_of_month: integer (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: documentos_condominio
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   type: text (nullable)
//   size: text (nullable)
//   folder: text (nullable)
//   file_path: text (nullable)
//   condominio_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: financeiro_condominio
//   id: uuid (not null, default: gen_random_uuid())
//   condominio_id: uuid (nullable)
//   type: text (nullable)
//   description: text (nullable)
//   amount: numeric (nullable)
//   date: date (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: moradores
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   whatsapp: text (nullable)
//   unit: text (nullable)
//   role: text (nullable)
//   status: text (nullable, default: 'Ativo'::text)
//   condominio_id: uuid (nullable)
//   user_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   perfil_tipo: text (nullable, default: 'Proprietário'::text)
//   funcao: text (nullable, default: 'Morador'::text)
// Table: parecer_financeiro
//   id: uuid (not null, default: gen_random_uuid())
//   condominio_id: uuid (nullable)
//   month: character varying (nullable)
//   content: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: pastas_documentos
//   id: uuid (not null, default: gen_random_uuid())
//   condominio_id: uuid (nullable)
//   name: text (not null)
//   icon: text (nullable, default: 'Folder'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: perfis_acesso
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   funcao: text (not null)
//   descricao: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (not null)
//   role: text (not null, default: 'morador'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   foto_url: text (nullable)
//   telefone: text (nullable)
// Table: receitas_acdomz
//   id: uuid (not null, default: gen_random_uuid())
//   description: text (nullable)
//   amount: numeric (nullable)
//   date: date (nullable)
//   condominio_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   is_recurrent: boolean (nullable, default: false)
//   category: text (nullable, default: 'Geral'::text)
//   invoice_url: text (nullable)
// Table: regras_calculo_honorarios
//   id: uuid (not null, default: gen_random_uuid())
//   tipo_condominio_id: uuid (nullable)
//   description: text (nullable)
//   multiplier: numeric (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: sindia_configuracoes_globais
//   id: integer (not null, default: 1)
//   sindia_active: boolean (nullable, default: true)
//   sindia_prompt: text (nullable, default: 'Você é SINDIA, a assistente virtual inteligente da ACDOMZ.'::text)
//   sindia_tone: text (nullable, default: 'formal'::text)
//   sindia_response_length: text (nullable, default: 'curta'::text)
//   sindia_delay_seconds: integer (nullable, default: 2)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: tipos_condominio
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   base_smn: numeric (nullable, default: 1621.00)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: administradoras
//   PRIMARY KEY administradoras_pkey: PRIMARY KEY (id)
// Table: calculos_honorarios
//   FOREIGN KEY calculos_honorarios_condominio_id_fkey: FOREIGN KEY (condominio_id) REFERENCES condominios(id)
//   PRIMARY KEY calculos_honorarios_pkey: PRIMARY KEY (id)
// Table: categorias_financeiras
//   PRIMARY KEY categorias_financeiras_pkey: PRIMARY KEY (id)
// Table: comunicados
//   FOREIGN KEY comunicados_condominio_id_fkey: FOREIGN KEY (condominio_id) REFERENCES condominios(id)
//   FOREIGN KEY comunicados_criado_por_fkey: FOREIGN KEY (criado_por) REFERENCES profiles(id)
//   PRIMARY KEY comunicados_pkey: PRIMARY KEY (id)
// Table: condominios
//   FOREIGN KEY condominios_admin_id_fkey: FOREIGN KEY (admin_id) REFERENCES administradoras(id)
//   PRIMARY KEY condominios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY condominios_sindico_id_fkey: FOREIGN KEY (sindico_id) REFERENCES profiles(id)
// Table: conversas_sindia
//   FOREIGN KEY conversas_sindia_condominio_id_fkey: FOREIGN KEY (condominio_id) REFERENCES condominios(id)
//   PRIMARY KEY conversas_sindia_pkey: PRIMARY KEY (id)
//   FOREIGN KEY conversas_sindia_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id)
// Table: crm_leads
//   PRIMARY KEY crm_leads_pkey: PRIMARY KEY (id)
// Table: despesas_pontuais_acdomz
//   PRIMARY KEY despesas_pontuais_acdomz_pkey: PRIMARY KEY (id)
// Table: despesas_recorrentes_acdomz
//   PRIMARY KEY despesas_recorrentes_acdomz_pkey: PRIMARY KEY (id)
// Table: documentos_condominio
//   FOREIGN KEY documentos_condominio_condominio_id_fkey: FOREIGN KEY (condominio_id) REFERENCES condominios(id)
//   PRIMARY KEY documentos_condominio_pkey: PRIMARY KEY (id)
// Table: financeiro_condominio
//   FOREIGN KEY financeiro_condominio_condominio_id_fkey: FOREIGN KEY (condominio_id) REFERENCES condominios(id)
//   PRIMARY KEY financeiro_condominio_pkey: PRIMARY KEY (id)
//   CHECK financeiro_condominio_type_check: CHECK ((type = ANY (ARRAY['receita'::text, 'despesa'::text])))
// Table: moradores
//   FOREIGN KEY moradores_condominio_id_fkey: FOREIGN KEY (condominio_id) REFERENCES condominios(id)
//   PRIMARY KEY moradores_pkey: PRIMARY KEY (id)
//   FOREIGN KEY moradores_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id)
// Table: parecer_financeiro
//   FOREIGN KEY parecer_financeiro_condominio_id_fkey: FOREIGN KEY (condominio_id) REFERENCES condominios(id)
//   PRIMARY KEY parecer_financeiro_pkey: PRIMARY KEY (id)
// Table: pastas_documentos
//   FOREIGN KEY pastas_documentos_condominio_id_fkey: FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE CASCADE
//   PRIMARY KEY pastas_documentos_pkey: PRIMARY KEY (id)
// Table: perfis_acesso
//   CHECK perfis_acesso_funcao_check: CHECK ((funcao = ANY (ARRAY['admin'::text, 'sindico'::text, 'morador'::text])))
//   UNIQUE perfis_acesso_nome_key: UNIQUE (nome)
//   PRIMARY KEY perfis_acesso_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
//   CHECK profiles_role_check: CHECK ((role = ANY (ARRAY['admin'::text, 'sindico'::text, 'morador'::text])))
// Table: receitas_acdomz
//   FOREIGN KEY receitas_acdomz_condominio_id_fkey: FOREIGN KEY (condominio_id) REFERENCES condominios(id)
//   PRIMARY KEY receitas_acdomz_pkey: PRIMARY KEY (id)
// Table: regras_calculo_honorarios
//   PRIMARY KEY regras_calculo_honorarios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY regras_calculo_honorarios_tipo_condominio_id_fkey: FOREIGN KEY (tipo_condominio_id) REFERENCES tipos_condominio(id)
// Table: sindia_configuracoes_globais
//   PRIMARY KEY sindia_configuracoes_globais_pkey: PRIMARY KEY (id)
// Table: tipos_condominio
//   PRIMARY KEY tipos_condominio_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: administradoras
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: calculos_honorarios
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: categorias_financeiras
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: comunicados
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: condominios
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: conversas_sindia
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "allow_all_conversas_sindia" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: crm_leads
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: despesas_pontuais_acdomz
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: despesas_recorrentes_acdomz
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: documentos_condominio
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: financeiro_condominio
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: moradores
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: parecer_financeiro
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: pastas_documentos
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: perfis_acesso
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: profiles
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: receitas_acdomz
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: regras_calculo_honorarios
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: sindia_configuracoes_globais
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: tipos_condominio
//   Policy "allow_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email, name, role)
//     VALUES (
//       NEW.id,
//       NEW.email,
//       COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
//       COALESCE(NEW.raw_user_meta_data->>'role', 'morador')
//     ) ON CONFLICT (id) DO NOTHING;
//     RETURN NEW;
//   END;
//   $function$
//

// --- INDEXES ---
// Table: perfis_acesso
//   CREATE UNIQUE INDEX perfis_acesso_nome_key ON public.perfis_acesso USING btree (nome)
