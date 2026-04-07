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
  Plus,
  Edit2,
  MoreVertical,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const getIcon = (name: string) => {
  switch (name) {
    case 'FileArchive':
      return FileArchive
    case 'FileText':
      return FileText
    case 'FileBadge':
      return FileBadge
    default:
      return Folder
  }
}

export default function Documentos() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [condos, setCondos] = useState<any[]>([])
  const [selectedCondo, setSelectedCondo] = useState('')
  const [folders, setFolders] = useState<any[]>([])
  const [activeFolder, setActiveFolder] = useState<string>('')
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isFolderDialogOpen, setFolderDialogOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<any>(null)
  const [folderName, setFolderName] = useState('')

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

  const loadFolders = async () => {
    if (!selectedCondo) return
    const { data } = await supabase
      .from('pastas_documentos')
      .select('*')
      .eq('condominio_id', selectedCondo)
      .order('created_at')
    if (data) {
      setFolders(data)
      if (data.length > 0 && !data.find((f) => f.id === activeFolder)) {
        setActiveFolder(data[0].id)
      }
    }
  }

  const loadFiles = async () => {
    if (!selectedCondo) return setFiles([])
    const { data } = await supabase
      .from('documentos_condominio')
      .select('*')
      .eq('condominio_id', selectedCondo)
      .order('created_at', { ascending: false })
    if (data) setFiles(data)
  }

  useEffect(() => {
    loadFolders()
    loadFiles()
  }, [selectedCondo])

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedCondo || !activeFolder) return

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

      const targetFolder = folders.find((f) => f.id === activeFolder)
      if (
        targetFolder &&
        targetFolder.name.toUpperCase().includes('DRE') &&
        file.type === 'application/pdf'
      ) {
        toast({ title: 'Processando DRE...', description: 'Extraindo dados financeiros.' })
        supabase.functions.invoke('extrair-dre-condominio', {
          body: { condominio_id: selectedCondo, file_path: filePath },
        })
      }
      loadFiles()
    } catch (err: any) {
      toast({ title: 'Erro no Upload', description: err.message, variant: 'destructive' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteFile = async (id: string, path: string) => {
    try {
      if (path) await supabase.storage.from('documentos').remove([path])
      await supabase.from('documentos_condominio').delete().eq('id', id)
      toast({ title: 'Documento excluído' })
      loadFiles()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    }
  }

  const handleSaveFolder = async () => {
    if (!folderName.trim()) return
    if (editingFolder) {
      await supabase
        .from('pastas_documentos')
        .update({ name: folderName })
        .eq('id', editingFolder.id)
      toast({ title: 'Pasta atualizada!' })
    } else {
      await supabase
        .from('pastas_documentos')
        .insert({ condominio_id: selectedCondo, name: folderName, icon: 'Folder' })
      toast({ title: 'Pasta criada!' })
    }
    setFolderDialogOpen(false)
    setEditingFolder(null)
    setFolderName('')
    loadFolders()
  }

  const handleDeleteFolder = async (id: string) => {
    if (!confirm('Deseja excluir esta pasta e perder a referência dos arquivos?')) return
    await supabase.from('documentos_condominio').delete().eq('folder', id)
    await supabase.from('pastas_documentos').delete().eq('id', id)
    toast({ title: 'Pasta excluída' })
    loadFolders()
    loadFiles()
  }

  const activeFiles = files.filter((f) => f.folder === activeFolder)

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Documentos</h1>
          <p className="text-muted-foreground">Central de arquivos e pastas do condomínio.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedCondo} onValueChange={setSelectedCondo}>
            <SelectTrigger className="w-[250px] bg-background">
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

      <Dialog open={isFolderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFolder ? 'Editar Pasta' : 'Nova Pasta'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome da Pasta</Label>
              <Input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Ex: Contratos, DRE, Inadimplência"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFolder}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-primary">Diretórios</h3>
          <Button
            variant="outline"
            className="gap-2 bg-background"
            onClick={() => {
              setEditingFolder(null)
              setFolderName('')
              setFolderDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Nova Pasta
          </Button>
        </div>

        {folders.length === 0 ? (
          <div className="p-8 text-center bg-muted/20 border border-dashed rounded-xl text-muted-foreground">
            Nenhuma pasta criada para este condomínio.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {folders.map((folder) => {
              const isActive = activeFolder === folder.id
              const Icon = getIcon(folder.icon)
              const count = files.filter((f) => f.folder === folder.id).length
              return (
                <Card
                  key={folder.id}
                  className={`group cursor-pointer transition-all duration-200 hover:shadow-md ${isActive ? 'ring-2 ring-primary border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                  onClick={() => setActiveFolder(folder.id)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-3 relative">
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingFolder(folder)
                              setFolderName(folder.name)
                              setFolderDialogOpen(true)
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-2" /> Renomear
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteFolder(folder.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir Pasta
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div
                      className={`p-3 rounded-full ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="w-full">
                      <p className="font-medium text-sm truncate px-1" title={folder.name}>
                        {folder.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {count} arquivo{count !== 1 && 's'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {activeFolder && (
          <div className="mt-8 space-y-4 animate-fade-in-up">
            <h3 className="font-semibold text-lg text-primary border-b pb-2">
              Arquivos em {folders.find((f) => f.id === activeFolder)?.name}
            </h3>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            />

            <div className="grid md:grid-cols-[1fr_2fr] gap-6 items-start">
              <div
                onClick={
                  !uploading && selectedCondo && activeFolder ? handleUploadClick : undefined
                }
                className={`border-2 border-dashed border-border rounded-xl bg-card p-8 flex flex-col items-center justify-center text-center transition-colors group ${!selectedCondo || !activeFolder ? 'opacity-50 cursor-not-allowed' : uploading ? 'cursor-wait opacity-80' : 'cursor-pointer hover:bg-muted/50'}`}
              >
                <div className="h-14 w-14 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  ) : (
                    <UploadCloud className="h-6 w-6 text-primary" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {uploading ? 'Enviando arquivo...' : 'Arraste e solte ou clique'}
                </h3>
                <p className="text-xs text-muted-foreground">Formatos suportados: PDF, DOC, XLS</p>
              </div>

              <Card className="shadow-sm border-border/50">
                <CardContent className="p-0">
                  <div className="divide-y max-h-[400px] overflow-y-auto">
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
                              onClick={async () => {
                                if (file.file_path) {
                                  try {
                                    const { data, error } = await supabase.storage
                                      .from('documentos')
                                      .createSignedUrl(file.file_path, 3600)

                                    if (error) throw error
                                    if (data?.signedUrl) {
                                      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
                                    } else {
                                      const publicUrl = supabase.storage
                                        .from('documentos')
                                        .getPublicUrl(file.file_path).data.publicUrl
                                      window.open(publicUrl, '_blank', 'noopener,noreferrer')
                                    }
                                  } catch (err: any) {
                                    toast({
                                      title: 'Erro ao abrir',
                                      description: err.message,
                                      variant: 'destructive',
                                    })
                                  }
                                }
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteFile(file.id, file.file_path)}
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
        )}
      </div>
    </div>
  )
}
