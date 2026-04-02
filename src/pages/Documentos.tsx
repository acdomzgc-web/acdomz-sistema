import { useState } from 'react'
import {
  Folder,
  UploadCloud,
  FileText,
  Download,
  Trash2,
  Eye,
  FileArchive,
  FileBadge,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const folders = [
  { id: 'ata', name: 'ATAS', count: 12, icon: FileArchive },
  { id: 'regimento', name: 'REGIMENTO INTERNO', count: 2, icon: FileText },
  { id: 'convencao', name: 'CONVENÇÃO', count: 1, icon: FileBadge },
  { id: 'financeiro', name: 'PARECERES FINANC.', count: 24, icon: Folder },
  { id: 'faq', name: 'FAQ', count: 5, icon: Folder },
]

const files = [
  {
    id: 1,
    name: 'Ata_Assembleia_Ordinaria_2023.pdf',
    type: 'PDF',
    date: '15/03/2024',
    size: '2.4 MB',
  },
  {
    id: 2,
    name: 'Ata_Extraordinaria_Piscina.pdf',
    type: 'PDF',
    date: '02/02/2024',
    size: '1.1 MB',
  },
  { id: 3, name: 'Eleicao_Sindico_Assinada.pdf', type: 'PDF', date: '10/12/2023', size: '3.5 MB' },
]

export default function Documentos() {
  const [activeFolder, setActiveFolder] = useState('ata')

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Documentos</h1>
          <p className="text-muted-foreground">Central de arquivos e pastas do condomínio.</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-secondary text-primary hover:bg-secondary/20"
        >
          <FileText className="h-4 w-4" /> Carregar Documentos Padrão
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-6 flex-1">
        {/* Sidebar Folders */}
        <Card className="md:col-span-1 shadow-sm border-border/50 h-fit">
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wider">
              Pastas
            </h3>
            {folders.map((folder) => {
              const isActive = activeFolder === folder.id
              const Icon = folder.icon
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
                    {folder.count}
                  </Badge>
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* Upload Zone */}
          <div className="border-2 border-dashed border-border rounded-xl bg-card p-10 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Arraste e solte seus arquivos aqui
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              ou clique para selecionar do seu computador (PDF, DOCX, TXT)
            </p>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Selecionar Arquivos
            </Button>
          </div>

          {/* File List */}
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-0">
              <div className="divide-y">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded bg-red-100 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-primary text-sm line-clamp-1">{file.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{file.date}</span>
                          <span>•</span>
                          <span>{file.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                        title="Baixar"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
