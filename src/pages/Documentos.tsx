import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Folder,
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  FileArchive,
  FileBadge,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const folders = [
  { id: 'ata', name: 'ATAS', icon: FileArchive },
  { id: 'regimento', name: 'REGIMENTO INTERNO', icon: FileText },
  { id: 'convencao', name: 'CONVENÇÃO', icon: FileBadge },
  { id: 'financeiro', name: 'PARECERES FINANC.', icon: Folder },
  { id: 'faq', name: 'FAQ', icon: Folder },
]

export default function Documentos() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [condos, setCondos] = useState<any[]>([])
  const [selectedCondo, setSelectedCondo] = useState('')
  const [activeFolder, setActiveFolder] = useState('ata')
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const query = supabase.from('condominios').select('*')
        if (data?.role === 'sindico') query.eq('sindico_id', user.id)
        query.then((res) => {
          setCondos(res.data || [])
          if (res.data?.[0]) setSelectedCondo(res.data[0].id)
        })
      })
  }, [user])

  const loadData = async () => {
    if (!selectedCondo) return setFiles([])
    const { data } = await supabase
      .from('documentos_condominio')
      .select('*')
      .eq('condominio_id', selectedCondo)
      .order('created_at', { ascending: false })
    if (data) setFiles(data)
  }

  useEffect(() => {
    loadData()
  }, [selectedCondo])

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedCondo) return

    setUploading(true)
    try {
      const filePath = `condominio-${selectedCondo}/${activeFolder}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('documentos').upload(filePath, file)
      if (upErr) throw upErr

      const { error: docErr } = await supabase.from('documentos_condominio').insert({
        name: file.name,
        folder: activeFolder,
        file_path: filePath,
        type: file.type,
        condominio_id: selectedCondo,
        size: String(file.size),
      })
      if (docErr) throw docErr

      toast({ title: 'Upload concluído!' })

      if (activeFolder === 'financeiro' && file.type === 'application/pdf') {
        toast({ title: 'Processando DRE...', description: 'Extraindo dados via IA.' })
        supabase.functions
          .invoke('extrair-dre-condominio', {
            body: { condominio_id: selectedCondo, file_path: filePath },
          })
          .then(({ error }) => {
            if (error)
              toast({
                title: 'Erro ao processar DRE',
                description: error.message,
                variant: 'destructive',
              })
            else toast({ title: 'DRE Processada', description: 'Valores extraídos e lançados.' })
          })
      }
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro no Upload', description: err.message, variant: 'destructive' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (id: string, path: string) => {
    try {
      if (path) await supabase.storage.from('documentos').remove([path])
      await supabase.from('documentos_condominio').delete().eq('id', id)
      toast({ title: 'Documento excluído' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    }
  }

  const activeFiles = files.filter((f) => f.folder === activeFolder)

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Documentos</h1>
          <p className="text-muted-foreground">Central de arquivos e pastas do condomínio.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedCondo} onValueChange={setSelectedCondo}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecione o Condomínio" />
            </SelectTrigger>
            <SelectContent>
              {condos.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 flex-1">
        <Card className="md:col-span-1 shadow-sm border-border/50 h-fit">
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wider">
              Pastas
            </h3>
            {folders.map((folder) => {
              const isActive = activeFolder === folder.id
              const Icon = folder.icon
              const count = files.filter((f) => f.folder === folder.id).length
              return (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium shadow-md'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 ${isActive ? 'text-secondary' : 'text-muted-foreground'}`}
                    />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      isActive ? 'bg-primary-foreground/20 text-white border-0' : 'bg-background'
                    }
                  >
                    {count}
                  </Badge>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <div className="md:col-span-3 space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          <div
            onClick={!uploading && selectedCondo ? handleUploadClick : undefined}
            className={`border-2 border-dashed border-border rounded-xl bg-card p-10 flex flex-col items-center justify-center text-center transition-colors group ${
              !selectedCondo
                ? 'opacity-50 cursor-not-allowed'
                : uploading
                  ? 'cursor-wait opacity-80'
                  : 'cursor-pointer hover:bg-muted/50'
            }`}
          >
            <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {uploading ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <UploadCloud className="h-8 w-8 text-primary" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {uploading ? 'Enviando arquivo...' : 'Arraste e solte seus arquivos aqui'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              ou clique para selecionar do seu computador
            </p>
            <Button
              disabled={uploading || !selectedCondo}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              onClick={(e) => {
                e.stopPropagation()
                if (selectedCondo) handleUploadClick()
              }}
            >
              Selecionar Arquivos
            </Button>
          </div>

          <Card className="shadow-sm border-border/50">
            <CardContent className="p-0">
              <div className="divide-y">
                {activeFiles.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhum documento encontrado nesta pasta.
                  </div>
                ) : (
                  activeFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded bg-red-100 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-primary text-sm line-clamp-1">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>{new Date(file.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{Math.round(Number(file.size || 0) / 1024)} KB</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          title="Visualizar"
                          onClick={() => {
                            if (file.file_path)
                              window.open(
                                supabase.storage.from('documentos').getPublicUrl(file.file_path)
                                  .data.publicUrl,
                                '_blank',
                              )
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(file.id, file.file_path)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
