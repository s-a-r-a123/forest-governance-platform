"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileWarning, FileCheck2, FileX2, Container, FileStack, Logs, CloudUpload, Undo, FileInput, FolderUp, File, LayoutDashboard, PanelTop, FilePlus2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Dataset {
  id: string;
  name: string;
  type: 'imagery' | 'vector' | 'tabular';
  status: 'draft' | 'validating' | 'validated' | 'published';
  size: string;
  lastUpdated: string;
  source: string;
  tags: string[];
  thumbnailUrl?: string;
  validationIssues?: ValidationIssue[];
}

interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

interface UploadProgress {
  id: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'parsing' | 'validating' | 'complete' | 'error';
  metadata?: {
    source: string;
    date: string;
    license: string;
    contact: string;
  };
}

interface ProcessingJob {
  id: string;
  type: 'upload' | 'validation' | 'transform' | 'publish';
  datasetName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  user: string;
  logs?: string[];
}

export default function DataIngestManager() {
  const [activeTab, setActiveTab] = useState('upload');
  const [datasets, setDatasets] = useState<Dataset[]>([
    {
      id: '1',
      name: 'Forest Coverage 2024',
      type: 'imagery',
      status: 'published',
      size: '2.4 GB',
      lastUpdated: '2024-01-15',
      source: 'Sentinel-2',
      tags: ['satellite', 'forest', '2024'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=150&fit=crop&crop=center'
    },
    {
      id: '2',
      name: 'Protected Areas Boundaries',
      type: 'vector',
      status: 'validated',
      size: '45 MB',
      lastUpdated: '2024-01-10',
      source: 'Ministry of Environment',
      tags: ['vector', 'boundaries', 'protected-areas']
    },
    {
      id: '3',
      name: 'Biodiversity Survey Data',
      type: 'tabular',
      status: 'draft',
      size: '12 MB',
      lastUpdated: '2024-01-08',
      source: 'Field Survey Team',
      tags: ['csv', 'biodiversity', 'survey'],
      validationIssues: [
        { id: '1', type: 'warning', message: 'Missing CRS information', suggestion: 'Add coordinate reference system metadata' },
        { id: '2', type: 'error', message: 'Invalid geometry in row 142', suggestion: 'Check and fix geometry coordinates' }
      ]
    }
  ]);

  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([
    {
      id: '1',
      type: 'upload',
      datasetName: 'Drone Survey 2024-01',
      status: 'processing',
      progress: 75,
      startTime: '2024-01-15 14:30',
      user: 'admin@example.com'
    },
    {
      id: '2',
      type: 'validation',
      datasetName: 'Cadastral Boundaries',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-15 13:15',
      user: 'data.steward@example.com'
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      const uploadId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newUpload: UploadProgress = {
        id: uploadId,
        filename: file.name,
        progress: 0,
        status: 'uploading',
        metadata: {
          source: '',
          date: new Date().toISOString().split('T')[0],
          license: '',
          contact: ''
        }
      };

      setUploads(prev => [...prev, newUpload]);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploads(prev => prev.map(upload => {
          if (upload.id === uploadId) {
            const newProgress = Math.min(upload.progress + Math.random() * 20, 100);
            const newStatus = newProgress === 100 ? 'parsing' : 'uploading';
            return { ...upload, progress: newProgress, status: newStatus };
          }
          return upload;
        }));
      }, 500);

      // Complete upload after simulation
      setTimeout(() => {
        clearInterval(interval);
        setUploads(prev => prev.map(upload => 
          upload.id === uploadId 
            ? { ...upload, progress: 100, status: 'complete' }
            : upload
        ));
        toast.success(`${file.name} uploaded successfully!`);
      }, 3000);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const getStatusBadge = (status: Dataset['status']) => {
    const variants = {
      draft: 'secondary',
      validating: 'default',
      validated: 'outline',
      published: 'default'
    } as const;

    const colors = {
      draft: 'bg-muted text-muted-foreground',
      validating: 'bg-warning text-white',
      validated: 'bg-success text-white',
      published: 'bg-primary text-primary-foreground'
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: Dataset['type']) => {
    switch (type) {
      case 'imagery': return <Container className="h-4 w-4" />;
      case 'vector': return <FileStack className="h-4 w-4" />;
      case 'tabular': return <FileInput className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const openValidationDialog = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setValidationDialogOpen(true);
  };

  const handlePublishDataset = (dataset: Dataset) => {
    setDatasets(prev => prev.map(d => 
      d.id === dataset.id 
        ? { ...d, status: 'published' as const }
        : d
    ));
    toast.success(`${dataset.name} published successfully!`);
  };

  return (
    <div className="h-full bg-background">
      <div className="border-b bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Data Ingest Manager</h1>
              <p className="text-muted-foreground mt-1">Upload, validate, and publish spatial and tabular datasets</p>
            </div>
            <Button onClick={() => fileInputRef.current?.click()}>
              <FilePlus2 className="h-4 w-4 mr-2" />
              Quick Upload
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dataset Catalog
            </TabsTrigger>
            <TabsTrigger value="processing" className="flex items-center gap-2">
              <Logs className="h-4 w-4" />
              Processing Queue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudUpload className="h-5 w-5" />
                  Upload Datasets
                </CardTitle>
                <CardDescription>
                  Drag and drop files or browse to upload satellite imagery, drone captures, shapefiles, and CSV data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-muted rounded-full">
                      <FolderUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">Drop files here or click to browse</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Supports: GeoTIFF, Shapefile, KML, CSV, GeoJSON (max 5GB per file)
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".tif,.tiff,.shp,.kml,.csv,.geojson,.json"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {uploads.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uploads.map((upload) => (
                      <div key={upload.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {upload.status === 'complete' ? (
                              <FileCheck2 className="h-4 w-4 text-success" />
                            ) : upload.status === 'error' ? (
                              <FileX2 className="h-4 w-4 text-destructive" />
                            ) : (
                              <FileWarning className="h-4 w-4 text-warning" />
                            )}
                            <span className="font-medium">{upload.filename}</span>
                          </div>
                          <span className="text-sm text-muted-foreground capitalize">
                            {upload.status}
                          </span>
                        </div>
                        <Progress value={upload.progress} className="w-full" />
                        
                        {upload.status === 'complete' && (
                          <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-muted rounded-lg">
                            <div>
                              <Label htmlFor={`source-${upload.id}`}>Data Source</Label>
                              <Input 
                                id={`source-${upload.id}`}
                                placeholder="e.g., Sentinel-2, Field Survey"
                                value={upload.metadata?.source || ''}
                                onChange={(e) => {
                                  setUploads(prev => prev.map(u => 
                                    u.id === upload.id 
                                      ? { ...u, metadata: { ...u.metadata!, source: e.target.value } }
                                      : u
                                  ));
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`date-${upload.id}`}>Collection Date</Label>
                              <Input 
                                id={`date-${upload.id}`}
                                type="date"
                                value={upload.metadata?.date || ''}
                                onChange={(e) => {
                                  setUploads(prev => prev.map(u => 
                                    u.id === upload.id 
                                      ? { ...u, metadata: { ...u.metadata!, date: e.target.value } }
                                      : u
                                  ));
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`license-${upload.id}`}>License</Label>
                              <Input 
                                id={`license-${upload.id}`}
                                placeholder="e.g., CC BY 4.0, Proprietary"
                                value={upload.metadata?.license || ''}
                                onChange={(e) => {
                                  setUploads(prev => prev.map(u => 
                                    u.id === upload.id 
                                      ? { ...u, metadata: { ...u.metadata!, license: e.target.value } }
                                      : u
                                  ));
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`contact-${upload.id}`}>Contact</Label>
                              <Input 
                                id={`contact-${upload.id}`}
                                placeholder="Contact email or name"
                                value={upload.metadata?.contact || ''}
                                onChange={(e) => {
                                  setUploads(prev => prev.map(u => 
                                    u.id === upload.id 
                                      ? { ...u, metadata: { ...u.metadata!, contact: e.target.value } }
                                      : u
                                  ));
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Dataset Catalog</CardTitle>
                    <CardDescription>
                      Manage uploaded datasets, preview data, and control publishing
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="validated">Validated</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dataset</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {datasets.map((dataset) => (
                        <TableRow key={dataset.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {dataset.thumbnailUrl && (
                                <img 
                                  src={dataset.thumbnailUrl} 
                                  alt={dataset.name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium">{dataset.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Source: {dataset.source}
                                </div>
                                <div className="flex gap-1 mt-1">
                                  {dataset.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(dataset.type)}
                              <span className="capitalize">{dataset.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(dataset.status)}
                          </TableCell>
                          <TableCell>{dataset.size}</TableCell>
                          <TableCell>{dataset.lastUpdated}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <PanelTop className="h-4 w-4" />
                              </Button>
                              {dataset.validationIssues && dataset.validationIssues.length > 0 && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openValidationDialog(dataset)}
                                >
                                  <FileWarning className="h-4 w-4 text-warning" />
                                </Button>
                              )}
                              {dataset.status === 'validated' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handlePublishDataset(dataset)}
                                >
                                  Publish
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Logs className="h-5 w-5" />
                  Processing Queue & Logs
                </CardTitle>
                <CardDescription>
                  Monitor data processing jobs and view detailed logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processingJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {job.type === 'upload' && <Upload className="h-4 w-4" />}
                            {job.type === 'validation' && <FileCheck2 className="h-4 w-4" />}
                            {job.type === 'transform' && <Container className="h-4 w-4" />}
                            {job.type === 'publish' && <CloudUpload className="h-4 w-4" />}
                            <span className="font-medium capitalize">{job.type}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {job.datasetName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={
                              job.status === 'completed' ? 'bg-success text-white' :
                              job.status === 'failed' ? 'bg-destructive text-white' :
                              job.status === 'processing' ? 'bg-warning text-white' :
                              'bg-muted text-muted-foreground'
                            }
                          >
                            {job.status}
                          </Badge>
                          {job.status === 'failed' && (
                            <Button variant="outline" size="sm">
                              <Undo className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {job.status === 'processing' && (
                        <div className="mb-2">
                          <Progress value={job.progress} className="w-full" />
                          <div className="flex justify-between text-sm text-muted-foreground mt-1">
                            <span>{job.progress}% complete</span>
                            <span>Started: {job.startTime}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>User: {job.user}</span>
                        <Button variant="ghost" size="sm">View Logs</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Validation Dialog */}
      <Dialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Validation Results</DialogTitle>
            <DialogDescription>
              Review validation issues and apply suggested fixes for {selectedDataset?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDataset?.validationIssues && (
            <div className="space-y-4">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {selectedDataset.validationIssues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {issue.type === 'error' && <FileX2 className="h-5 w-5 text-destructive mt-0.5" />}
                        {issue.type === 'warning' && <FileWarning className="h-5 w-5 text-warning mt-0.5" />}
                        {issue.type === 'info' && <FileCheck2 className="h-5 w-5 text-muted-foreground mt-0.5" />}
                        <div className="flex-1">
                          <p className="font-medium">{issue.message}</p>
                          {issue.suggestion && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Suggestion: {issue.suggestion}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline">
                              Apply Fix
                            </Button>
                            <Button size="sm" variant="ghost">
                              Ignore
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={() => setValidationDialogOpen(false)}>
                  Apply All Fixes
                </Button>
                <Button variant="outline" onClick={() => setValidationDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}