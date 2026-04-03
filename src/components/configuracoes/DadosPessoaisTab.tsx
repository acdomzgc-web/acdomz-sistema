import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Upload, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const formSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
})

export function DadosPessoaisTab() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingData, setPendingData] = useState<z.infer<typeof formSchema> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        reset({ name: data.name, email: data.email, telefone: (data as any).telefone || '' })
        setAvatarUrl((data as any).foto_url || null)
      }
      setFetching(false)
    }
    loadProfile()
  }, [user, reset])

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setPendingData(data)
    setConfirmOpen(true)
  }

  const handleConfirmSave = async () => {
    if (!pendingData || !user) return
    setLoading(true)
    setConfirmOpen(false)
    try {
      if (pendingData.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email: pendingData.email })
        if (authError) throw authError
      }
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: pendingData.name,
          email: pendingData.email,
          telefone: pendingData.telefone,
        } as any)
        .eq('id', user.id)

      if (profileError) throw profileError
      toast({ title: 'Sucesso', description: 'Dados atualizados com sucesso.' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    try {
      setLoading(true)
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}-${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ foto_url: publicUrl } as any)
        .eq('id', user.id)
      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      toast({ title: 'Sucesso', description: 'Foto de perfil atualizada.' })
    } catch (error: any) {
      toast({ title: 'Erro', description: 'Falha ao atualizar foto.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (fetching)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-[#1a3a52]" />
      </div>
    )

  return (
    <Card className="border-t-4 border-t-[#1a3a52]">
      <CardHeader>
        <CardTitle>Dados Pessoais</CardTitle>
        <CardDescription>Atualize suas informações básicas e foto de perfil.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-[#d4af8f]">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="text-2xl">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" /> Alterar Foto
            </Button>
            <p className="text-xs text-muted-foreground mt-2">JPG, GIF ou PNG. Máximo de 2MB.</p>
          </div>
        </div>

        <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <span className="text-sm text-destructive">{errors.name.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" {...register('telefone')} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">E-mail (Requer confirmação se alterado)</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <span className="text-sm text-destructive">{errors.email.message}</span>
              )}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          form="profile-form"
          type="submit"
          disabled={loading}
          className="bg-[#1a3a52] hover:bg-[#1a3a52]/90 text-white"
        >
          {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />} Salvar Alterações
        </Button>
      </CardFooter>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alterações</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja salvar essas alterações? Se você alterou o e-mail, precisará
              confirmá-lo no novo endereço.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSave}
              className="bg-[#1a3a52] hover:bg-[#1a3a52]/90 text-white"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
