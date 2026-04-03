import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
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
import { Progress } from '@/components/ui/progress'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(8, 'A nova senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export function SegurancaTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingData, setPendingData] = useState<z.infer<typeof passwordSchema> | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  })

  const newPassword = watch('newPassword', '')

  const calculateStrength = (pass: string) => {
    let strength = 0
    if (pass.length >= 8) strength += 25
    if (pass.match(/[a-z]+/)) strength += 25
    if (pass.match(/[A-Z]+/)) strength += 25
    if (pass.match(/[0-9]+/)) strength += 25
    return strength
  }

  const onSubmit = (data: z.infer<typeof passwordSchema>) => {
    setPendingData(data)
    setConfirmOpen(true)
  }

  const handleConfirmSave = async () => {
    if (!pendingData) return
    setLoading(true)
    setConfirmOpen(false)
    try {
      const { error } = await supabase.auth.updateUser({ password: pendingData.newPassword })
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Senha alterada com sucesso.' })
      reset()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao alterar senha',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-t-4 border-t-[#d4af8f]">
      <CardHeader>
        <CardTitle>Segurança</CardTitle>
        <CardDescription>Gerencie sua senha e métodos de autenticação.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="security-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input id="currentPassword" type="password" {...register('currentPassword')} />
            {errors.currentPassword && (
              <span className="text-sm text-destructive">{errors.currentPassword.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input id="newPassword" type="password" {...register('newPassword')} />
            {errors.newPassword && (
              <span className="text-sm text-destructive">{errors.newPassword.message}</span>
            )}
            {newPassword.length > 0 && (
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-xs">
                  <span>Força da senha</span>
                  <span>{calculateStrength(newPassword)}%</span>
                </div>
                <Progress
                  value={calculateStrength(newPassword)}
                  className="h-2 bg-muted [&>div]:bg-[#1a3a52]"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
            {errors.confirmPassword && (
              <span className="text-sm text-destructive">{errors.confirmPassword.message}</span>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          form="security-form"
          type="submit"
          disabled={loading}
          className="bg-[#1a3a52] hover:bg-[#1a3a52]/90 text-white"
        >
          {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />} Alterar Senha
        </Button>
      </CardFooter>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar senha</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado de outros dispositivos após a alteração. Deseja prosseguir?
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
