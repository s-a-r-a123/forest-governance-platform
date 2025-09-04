"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { 
  Map, 
  MapPlus, 
  PanelBottom, 
  PanelRightOpen, 
  PanelTopOpen,
  Component,
  LandPlot,
  PanelsTopLeft,
  PanelRight,
  PanelLeft,
  LayoutPanelTop,
  PanelLeftClose
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Layer {
  id: string
  name: string
  visible: boolean
  opacity: number
  source: string
  lastUpdated: string
  loading?: boolean
  error?: boolean
}

interface ParcelInfo {
  id: string
  area: number
  owner: string
  classification: string
  coordinates: [number, number][]
  attributes: Record<string, any>
  claimHistory: Array<{
    date: string
    type: string
    status: string
    claimant: string
  }>
}

interface LegalReasoning {
  clause: string
  confidence: number
  matchedAttributes: string[]
  explanation: string
  precedents: string[]
}

interface Recommendation {
  decision: 'recognize' | 'verify' | 'reject'
  confidence: number
  factors: Array<{
    factor: string
    weight: number
    impact: 'positive' | 'negative'
  }>
}

export default function FRAAtlasExplorer() {
  const [selectedParcel, setSelectedParcel] = useState<ParcelInfo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [layersOpen, setLayersOpen] = useState(false)
  const [parcelInfoOpen, setParcelInfoOpen] = useState(false)
  const [claimFormOpen, setClaimFormOpen] = useState(false)
  const [mapLoading, setMapLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [language, setLanguage] = useState('en')
  const [offlineMode, setOfflineMode] = useState(false)
  
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'parcels', name: 'Cadastral Parcels', visible: true, opacity: 80, source: 'Survey Department', lastUpdated: '2024-01-15' },
    { id: 'satellite', name: 'Satellite Imagery', visible: true, opacity: 100, source: 'ISRO', lastUpdated: '2024-01-10' },
    { id: 'historical', name: 'Historical Claims', visible: false, opacity: 60, source: 'FRA Records', lastUpdated: '2023-12-20' },
    { id: 'biodiversity', name: 'Biodiversity Hotspots', visible: false, opacity: 70, source: 'Forest Department', lastUpdated: '2024-01-05' },
    { id: 'tribal', name: 'Tribal Habitation', visible: false, opacity: 65, source: 'Tribal Welfare', lastUpdated: '2023-11-30' },
    { id: 'forest', name: 'Forest Classifications', visible: true, opacity: 75, source: 'FSI', lastUpdated: '2024-01-12' },
  ])

  const [legalReasoningData, setLegalReasoningData] = useState<LegalReasoning[]>([
    {
      clause: 'Section 3(1)(a) - Individual Forest Rights',
      confidence: 85,
      matchedAttributes: ['Settlement Duration: 15 years', 'Cleared Area: 2.3 ha', 'Primary Occupation: Agriculture'],
      explanation: 'Parcel shows evidence of continuous settlement and cultivation meeting the criteria for individual forest rights recognition.',
      precedents: ['Similar case in Gadchiroli district', 'Maharashtra High Court ruling 2019']
    },
    {
      clause: 'Section 3(1)(c) - Community Forest Resources',
      confidence: 72,
      matchedAttributes: ['Community Usage: Documented', 'Traditional Practices: Verified', 'Sustainable Management: Observed'],
      explanation: 'Evidence supports community forest resource rights based on traditional usage patterns.',
      precedents: ['Scheduled Tribes Act precedent', 'Forest Conservation Act guidelines']
    }
  ])

  const [recommendation, setRecommendation] = useState<Recommendation>({
    decision: 'recognize',
    confidence: 78,
    factors: [
      { factor: 'Settlement Duration', weight: 25, impact: 'positive' },
      { factor: 'Environmental Impact', weight: 15, impact: 'positive' },
      { factor: 'Documentation Quality', weight: 20, impact: 'positive' },
      { factor: 'Community Consensus', weight: 18, impact: 'positive' },
      { factor: 'Legal Compliance', weight: 22, impact: 'positive' }
    ]
  })

  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    // Simulate search results
    if (query.length > 2) {
      setSearchResults([
        { id: '1', name: 'Parcel #12345', type: 'parcel', coordinates: [73.8567, 18.5204] },
        { id: '2', name: 'Village Koregaon', type: 'place', coordinates: [73.8567, 18.5204] },
        { id: '3', name: 'Ramesh Kumar', type: 'owner', coordinates: [73.8567, 18.5204] }
      ])
    } else {
      setSearchResults([])
    }
  }, [])

  const handleParcelSelect = useCallback((parcel: Partial<ParcelInfo>) => {
    const mockParcel: ParcelInfo = {
      id: parcel.id || 'P12345',
      area: 2.3,
      owner: 'Ramesh Kumar',
      classification: 'Forest Land',
      coordinates: [[73.8567, 18.5204], [73.8570, 18.5204], [73.8570, 18.5207], [73.8567, 18.5207]],
      attributes: {
        settlementDuration: 15,
        clearedArea: 2.3,
        primaryOccupation: 'Agriculture',
        communityUsage: 'Yes',
        documentationStatus: 'Complete'
      },
      claimHistory: [
        { date: '2023-03-15', type: 'Individual Rights', status: 'Under Review', claimant: 'Ramesh Kumar' },
        { date: '2022-11-20', type: 'Community Rights', status: 'Approved', claimant: 'Village Committee' }
      ]
    }
    setSelectedParcel(mockParcel)
    setParcelInfoOpen(true)
  }, [])

  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ))
  }, [])

  const updateLayerOpacity = useCallback((layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ))
  }, [])

  const submitClaim = useCallback((claimData: any) => {
    toast.success('Claim submitted successfully. Tracking ID: FRA-2024-' + Math.random().toString(36).substr(2, 9).toUpperCase())
    setClaimFormOpen(false)
  }, [])

  const exportReport = useCallback(() => {
    toast.success('Report export initiated. Download will begin shortly.')
  }, [])

  const runScenario = useCallback((modifications: Record<string, any>) => {
    // Simulate scenario analysis
    toast.success('Scenario analysis complete. Updated recommendations available.')
  }, [])

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-heading font-semibold">FRA Atlas Explorer</h1>
          <Badge variant="secondary" className={offlineMode ? "bg-warning text-warning-foreground" : "bg-success text-white"}>
            {offlineMode ? 'Offline' : 'Online'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="hi">HI</SelectItem>
              <SelectItem value="mr">MR</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Search Overlay */}
        <div className="absolute top-20 left-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-3">
                <Input
                  placeholder="Search parcels, places, or owners..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full"
                />
                {searchResults.length > 0 && (
                  <ScrollArea className="max-h-60">
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                          onClick={() => handleParcelSelect(result)}
                        >
                          <div>
                            <div className="font-medium">{result.name}</div>
                            <div className="text-sm text-muted-foreground">{result.type}</div>
                          </div>
                          <Button size="sm" variant="ghost">
                            Select
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Layer Panel Toggle */}
        <Sheet open={layersOpen} onOpenChange={setLayersOpen}>
          <SheetTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-20 right-4 z-40 shadow-lg"
            >
              <PanelRight className="h-4 w-4" />
              Layers
            </Button>
          </SheetTrigger>
          <SheetContent className="w-80">
            <SheetHeader>
              <SheetTitle>Map Layers</SheetTitle>
              <SheetDescription>
                Toggle layers and adjust their visibility
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
              <div className="space-y-4">
                {layers.map((layer) => (
                  <Card key={layer.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={layer.visible}
                              onCheckedChange={() => toggleLayer(layer.id)}
                            />
                            <Label className="font-medium">{layer.name}</Label>
                          </div>
                          {layer.loading && <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />}
                          {layer.error && <Badge variant="destructive">Error</Badge>}
                        </div>
                        {layer.visible && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Opacity</span>
                              <span>{layer.opacity}%</span>
                            </div>
                            <Slider
                              value={[layer.opacity]}
                              onValueChange={([value]) => updateLayerOpacity(layer.id, value)}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Source: {layer.source}</div>
                          <div>Updated: {layer.lastUpdated}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Map Canvas */}
        <div className="flex-1 relative bg-muted">
          <div ref={mapRef} className="w-full h-full">
            {mapLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="h-8 w-8 animate-spin border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  <div className="text-muted-foreground">Loading map tiles...</div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-chart-4 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Map className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div className="text-muted-foreground">
                    Interactive map with parcel layers would render here
                  </div>
                  <Button onClick={() => handleParcelSelect({ id: 'demo' })} variant="outline">
                    Select Demo Parcel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
            <Button size="sm" variant="secondary" className="shadow-lg">
              <MapPlus className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" className="shadow-lg">
              <Component className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" className="shadow-lg">
              <LandPlot className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Parcel Info Drawer */}
        <Sheet open={parcelInfoOpen} onOpenChange={setParcelInfoOpen}>
          <SheetContent className="w-96 sm:w-[480px]">
            <SheetHeader>
              <SheetTitle>Parcel Information</SheetTitle>
              <SheetDescription>
                {selectedParcel && `Parcel ID: ${selectedParcel.id}`}
              </SheetDescription>
            </SheetHeader>
            
            {selectedParcel && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="legal">Legal</TabsTrigger>
                  <TabsTrigger value="recommendation">DSS</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-muted-foreground">Area</Label>
                              <div className="font-medium">{selectedParcel.area} hectares</div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Owner</Label>
                              <div className="font-medium">{selectedParcel.owner}</div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Classification</Label>
                              <div className="font-medium">{selectedParcel.classification}</div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Settlement</Label>
                              <div className="font-medium">{selectedParcel.attributes.settlementDuration} years</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Claim History</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedParcel.claimHistory.map((claim, index) => (
                              <div key={index} className="border-l-2 border-muted pl-4">
                                <div className="font-medium">{claim.type}</div>
                                <div className="text-sm text-muted-foreground">
                                  {claim.date} • {claim.claimant}
                                </div>
                                <Badge variant={claim.status === 'Approved' ? 'default' : 'secondary'} className="mt-1">
                                  {claim.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex gap-2">
                        <Dialog open={claimFormOpen} onOpenChange={setClaimFormOpen}>
                          <DialogTrigger asChild>
                            <Button className="flex-1">Create Claim</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Create New Claim</DialogTitle>
                              <DialogDescription>
                                Submit a new forest rights claim for this parcel
                              </DialogDescription>
                            </DialogHeader>
                            <ClaimForm onSubmit={submitClaim} parcel={selectedParcel} />
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" className="flex-1">Track Claim</Button>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="legal" className="space-y-4">
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="space-y-4">
                      {legalReasoningData.map((reasoning, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{reasoning.clause}</CardTitle>
                              <Badge variant={reasoning.confidence > 80 ? 'default' : 'secondary'}>
                                {reasoning.confidence}% confidence
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium">Matched Attributes</Label>
                              <div className="mt-1 space-y-1">
                                {reasoning.matchedAttributes.map((attr, i) => (
                                  <Badge key={i} variant="outline" className="mr-2 mb-1">
                                    {attr}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Explanation</Label>
                              <p className="mt-1 text-sm text-muted-foreground">{reasoning.explanation}</p>
                            </div>
                            <Accordion type="single" collapsible>
                              <AccordionItem value="precedents">
                                <AccordionTrigger className="text-sm">View Precedents</AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2">
                                    {reasoning.precedents.map((precedent, i) => (
                                      <div key={i} className="text-sm p-2 bg-muted rounded">
                                        {precedent}
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="recommendation" className="space-y-4">
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Recommendation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center space-y-2">
                            <Badge 
                              variant={recommendation.decision === 'recognize' ? 'default' : 'secondary'}
                              className="text-base px-4 py-2"
                            >
                              {recommendation.decision.toUpperCase()}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {recommendation.confidence}% confidence
                            </div>
                            <Progress value={recommendation.confidence} className="w-full" />
                          </div>
                          
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Contributing Factors</Label>
                            {recommendation.factors.map((factor, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    factor.impact === 'positive' ? 'bg-success' : 'bg-destructive'
                                  }`} />
                                  <span className="text-sm">{factor.factor}</span>
                                </div>
                                <div className="text-sm font-medium">{factor.weight}%</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Scenario Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm">Settlement Duration (years)</Label>
                              <Slider
                                defaultValue={[15]}
                                max={30}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Environmental Impact</Label>
                              <Slider
                                defaultValue={[70]}
                                max={100}
                                step={5}
                                className="mt-2"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Community Consensus</Label>
                              <Switch defaultChecked />
                            </div>
                          </div>
                          <Button onClick={() => runScenario({})} className="w-full">
                            Run Scenario
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

function ClaimForm({ onSubmit, parcel }: { onSubmit: (data: any) => void; parcel: ParcelInfo }) {
  const [formData, setFormData] = useState({
    claimantName: '',
    claimantId: '',
    rightType: '',
    description: '',
    documents: [] as File[],
    signature: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="claimantName">Claimant Name</Label>
          <Input
            id="claimantName"
            value={formData.claimantName}
            onChange={(e) => setFormData(prev => ({ ...prev, claimantName: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="claimantId">ID Number</Label>
          <Input
            id="claimantId"
            value={formData.claimantId}
            onChange={(e) => setFormData(prev => ({ ...prev, claimantId: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rightType">Type of Right</Label>
        <Select value={formData.rightType} onValueChange={(value) => setFormData(prev => ({ ...prev, rightType: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select right type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Individual Forest Rights</SelectItem>
            <SelectItem value="community">Community Forest Resources</SelectItem>
            <SelectItem value="traditional">Traditional Rights</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your claim and supporting evidence..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Parcel Information</Label>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Area: {parcel.area} hectares</div>
          <div>Current Classification: {parcel.classification}</div>
          <div>Settlement Duration: {parcel.attributes.settlementDuration} years</div>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Submit Claim
      </Button>
    </form>
  )
}