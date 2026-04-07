import { useState, useEffect } from 'react'
import { Building, MapPin, Hash, FileText, Briefcase, ExternalLink, Map } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function SpecificOverview() {
  const [condominios, setCondominios] = useState<any[]>([])
  const [selectedCondo, setSelectedCondo] = useState<string>('')
  const [condoDetails, setCondoDetails] = useState<any>(null)

  useEffect(() => {
    supabase
      .from('condominios')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCondominios(data)
          setSelectedCondo(data[0].id)
        }
      })
  }, [])

  useEffect(() => {
    if (!selectedCondo) return

    const loadData = async () => {
      const { data: condoData } = await supabase
        .from('condominios')
        .select(`
          *,
          administradoras ( name ),
          profiles:sindico_id ( name )
        `)
        .eq('id', selectedCondo)
        .single()

      setCondoDetails(condoData)
    }

    loadData()
  }, [selectedCondo])

  if (!condoDetails) return null

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    condoDetails.address || condoDetails.name,
  )}`

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Condomínio Selecionado</h2>
            <Select value={selectedCondo} onValueChange={setSelectedCondo}>
              <SelectTrigger className="w-[280px] h-8 border-0 bg-transparent p-0 text-lg font-bold text-primary focus:ring-0 focus:ring-offset-0 shadow-none">
                <SelectValue placeholder="Selecione um condomínio" />
              </SelectTrigger>
              <SelectContent>
                {condominios.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-background">
            {condoDetails.tipo === 'vertical' ? 'Vertical' : 'Horizontal'}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {condoDetails.ocupacao || 'Não definido'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary hover:shadow-md transition-all group cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantidade</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{condoDetails.total_units || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {condoDetails.tipo === 'vertical' ? 'Unidades' : 'Lotes'} registrados
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary hover:shadow-md transition-all group cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CNPJ</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold mt-1">{condoDetails.cnpj || 'Não informado'}</div>
            <p className="text-xs text-muted-foreground mt-2">Cadastro Nacional</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent hover:shadow-md transition-all group cursor-default md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestão Atual</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Administradora</p>
              <p
                className="text-sm font-bold truncate mt-1"
                title={condoDetails.administradoras?.name}
              >
                {condoDetails.administradoras?.name || 'Não atribuída'}
              </p>
            </div>
            <div className="hidden sm:block w-px bg-border my-1" />
            <div>
              <p className="text-xs text-muted-foreground">Síndico</p>
              <p className="text-sm font-bold truncate mt-1" title={condoDetails.profiles?.name}>
                {condoDetails.profiles?.name || 'Não atribuído'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Localização do Condomínio
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {condoDetails.address || 'Endereço não cadastrado'}
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              Abrir no Maps <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[400px] w-full bg-muted relative flex flex-col items-center justify-center">
            {condoDetails.address ? (
              <iframe
                title="Google Maps"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(
                  'NO_API_KEY', // Em um ambiente real, usaria uma API Key aqui, mas sem ela, podemos usar um placeholder visual.
                )}&q=${encodeURIComponent(condoDetails.address)}`}
                className="absolute inset-0 grayscale contrast-125 opacity-80 mix-blend-multiply dark:mix-blend-lighten pointer-events-none"
              ></iframe>
            ) : null}

            <div className="z-10 flex flex-col items-center justify-center p-6 bg-background/80 backdrop-blur-sm rounded-xl border shadow-lg text-center max-w-md mx-auto">
              <Map className="h-12 w-12 text-primary mb-4 opacity-80" />
              <h3 className="font-semibold text-lg mb-2">Visão do Mapa</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {condoDetails.address
                  ? 'Para interagir com o mapa e ver rotas detalhadas, acesse diretamente o Google Maps.'
                  : 'Cadastre um endereço válido nas configurações do condomínio para visualizar o mapa.'}
              </p>
              <Button asChild className="w-full">
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  Visualizar no Google Maps
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
