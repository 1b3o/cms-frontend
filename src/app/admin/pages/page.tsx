'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layout, Edit, Eye, Globe, FileText, Trash2, Plus, Search, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { contentApi, Content, ContentListParams } from '@/api/contentClient';

export default function PagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Content | null>(null);
  
  // Pagination state
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState<ContentListParams>({
    content_type_slug: 'page',
    status: undefined,
    search: undefined,
    page: 1,
    page_size: 10,
    sort_by: 'updated_at',
    sort_order: 'desc',
  });

  useEffect(() => {
    loadPages();
  }, [filters, page]);

  const loadPages = async () => {
    try {
      setLoading(true);
      const params: ContentListParams = {
        ...filters,
        page,
        page_size: pageSize,
      };
      
      const response = await contentApi.listContents(params);
      setPages(response.items);
      setTotal(response.total);
      setTotalPages(response.total_pages);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load pages:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden der Seiten');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (page: Content) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pageToDelete) return;
    
    try {
      await contentApi.deleteContent(pageToDelete.id);
      setPages(pages.filter(c => c.id !== pageToDelete.id));
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete page:', err);
      setError(err.response?.data?.message || 'Fehler beim Löschen der Seite');
    }
  };

  const handleFilterChange = (key: keyof ContentListParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1); // Reset page when filters change
  };

  const resetFilters = () => {
    setFilters({
      content_type_slug: 'page',
      status: undefined,
      search: undefined,
      page: 1,
      page_size: pageSize,
      sort_by: 'updated_at',
      sort_order: 'desc',
    });
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPages();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-500">Veröffentlicht</Badge>;
      case 'draft':
        return <Badge variant="outline">Entwurf</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archiviert</Badge>;
      case 'trash':
        return <Badge variant="destructive">Papierkorb</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Seiten</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Webseiten
          </p>
        </div>
        
        <Button onClick={() => router.push('/admin/content/page/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Seite erstellen
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Alle Seiten</CardTitle>
          <CardDescription>Liste aller erstellten Seiten</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Seiten durchsuchen..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="default">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange('status', value === "all" ? undefined : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="draft">Entwurf</SelectItem>
                  <SelectItem value="published">Veröffentlicht</SelectItem>
                  <SelectItem value="archived">Archiviert</SelectItem>
                  <SelectItem value="trash">Papierkorb</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={resetFilters}
                title="Filter zurücksetzen"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-4 py-4 border-b">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-4/5 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="flex-shrink-0 w-1/4">
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <div className="flex-shrink-0 w-1/6">
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex-shrink-0">
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-12">
              <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Keine Seiten gefunden. Erstellen Sie Ihre erste Seite.
              </p>
              <Button onClick={() => router.push('/admin/content/page/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Seite erstellen
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="p-4 border-b bg-muted/50 hidden md:flex">
                <div className="flex-1 font-medium">Titel</div>
                <div className="w-1/4 font-medium">Status</div>
                <div className="w-1/4 font-medium">URL</div>
                <div className="w-1/6 font-medium">Aktualisiert</div>
                <div className="w-32"></div>
              </div>
              <div className="divide-y">
                {pages.map(page => (
                  <div key={page.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-0">
                    <div className="flex-1">
                      <div className="font-medium">
                        <Link 
                          href={`/admin/content/page/${page.id}`}
                          className="hover:underline"
                        >
                          {page.title}
                        </Link>
                      </div>
                      <div className="md:hidden mt-1">
                        {getStatusBadge(page.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 md:hidden">
                        Aktualisiert: {formatDate(page.updated_at)}
                      </div>
                    </div>
                    <div className="w-1/4 hidden md:block">
                      {getStatusBadge(page.status)}
                    </div>
                    <div className="w-1/4 hidden md:block text-sm">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">/{page.slug}</code>
                    </div>
                    <div className="w-1/6 text-sm text-muted-foreground hidden md:block">
                      {formatDate(page.updated_at)}
                    </div>
                    <div className="flex gap-2 md:w-32 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/content/page/${page.id}`)}
                        title="Bearbeiten"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                        title="Anzeigen"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(page)}
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seite löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie die Seite &quot;{pageToDelete?.title}&quot; wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}