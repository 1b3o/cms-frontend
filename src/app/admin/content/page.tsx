'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search, Filter, X, Calendar, Eye, Tags } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import { contentApi, Content, ContentListParams } from '@/api/contentClient';
import { contentTypeApi, ContentType } from '@/api/contentTypeClient';

export default function ContentPage() {
  const router = useRouter();
  const [contents, setContents] = useState<Content[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null);
  
  // Pagination state
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter state
  const [filters, setFilters] = useState<ContentListParams>({
    content_type_id: undefined,
    status: undefined,
    search: undefined,
    page: 1,
    page_size: 10,
    sort_by: 'updated_at',
    sort_order: 'desc',
  });

  useEffect(() => {
    loadContentTypes();
    loadContents();
  }, []);

  useEffect(() => {
    loadContents();
  }, [filters, page]);

  const loadContentTypes = async () => {
    try {
      const types = await contentTypeApi.getAllContentTypes();
      setContentTypes(types);
    } catch (err: any) {
      console.error('Failed to load content types:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden der Inhaltstypen');
    }
  };

  const loadContents = async () => {
    try {
      setLoading(true);
      const params: ContentListParams = {
        ...filters,
        page,
        page_size: pageSize,
      };
      
      const response = await contentApi.listContents(params);
      setContents(response.items);
      setTotal(response.total);
      setTotalPages(response.total_pages);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load contents:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden der Inhalte');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (content: Content) => {
    setContentToDelete(content);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!contentToDelete) return;
    
    try {
      await contentApi.deleteContent(contentToDelete.id);
      setContents(contents.filter(c => c.id !== contentToDelete.id));
      setDeleteDialogOpen(false);
      setContentToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete content:', err);
      setError(err.response?.data?.message || 'Fehler beim Löschen des Inhalts');
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
      content_type_id: undefined,
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
    loadContents();
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

  const getContentTypeName = (id: string) => {
    const contentType = contentTypes.find(ct => ct.id === id);
    return contentType?.name || 'Unbekannt';
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
          <h1 className="text-2xl font-bold">Inhalte</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Inhalte</p>
        </div>
        
        <div className="flex gap-2">
          {contentTypes.length > 0 && (
            <Select
              onValueChange={(contentTypeId) => {
                const contentType = contentTypes.find(ct => ct.id === contentTypeId);
                if (contentType) {
                  router.push(`/admin/content/${contentType.slug}/create`);
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Inhalt erstellen" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map(contentType => (
                  <SelectItem key={contentType.id} value={contentType.id}>
                    {contentType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Inhalte</CardTitle>
          <CardDescription>Alle Inhalte nach Typ und Status</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Inhalte durchsuchen..."
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
                value={filters.content_type_id || "all"}
                onValueChange={(value) => handleFilterChange('content_type_id', value === "all" ? undefined : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Inhaltstyp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  {contentTypes.map(contentType => (
                    <SelectItem key={contentType.id} value={contentType.id}>
                      {contentType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
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
          ) : contents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Keine Inhalte gefunden. Erstellen Sie Ihren ersten Inhalt.
              </p>
              {contentTypes.length > 0 && (
                <Select
                  onValueChange={(contentTypeId) => {
                    const contentType = contentTypes.find(ct => ct.id === contentTypeId);
                    if (contentType) {
                      router.push(`/admin/content/${contentType.slug}/create`);
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px] mx-auto">
                    <SelectValue placeholder="Inhalt erstellen" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map(contentType => (
                      <SelectItem key={contentType.id} value={contentType.id}>
                        {contentType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <div className="p-4 border-b bg-muted/50 hidden md:flex">
                  <div className="flex-1 font-medium">Titel</div>
                  <div className="w-1/4 font-medium">Inhaltstyp</div>
                  <div className="w-1/4 font-medium">Status</div>
                  <div className="w-1/6 font-medium">Aktualisiert</div>
                  <div className="w-24"></div>
                </div>
                <div className="divide-y">
                  {contents.map(content => (
                    <div key={content.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-0">
                      <div className="flex-1">
                        <div className="font-medium">
                          <Link 
                            href={`/admin/content/${content.content_type_slug}/${content.id}`}
                            className="hover:underline"
                          >
                            {content.title}
                          </Link>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 md:hidden">
                          {getContentTypeName(content.content_type_id)}
                        </div>
                        <div className="md:hidden mt-1">
                          {getStatusBadge(content.status)}
                        </div>
                      </div>
                      <div className="w-1/4 hidden md:block">
                        {content.content_type_name || getContentTypeName(content.content_type_id)}
                      </div>
                      <div className="w-1/4 hidden md:block">
                        {getStatusBadge(content.status)}
                      </div>
                      <div className="w-1/6 text-sm text-muted-foreground hidden md:block">
                        {formatDate(content.updated_at)}
                      </div>
                      <div className="flex gap-2 md:w-24 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/content/${content.content_type_slug}/${content.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(content)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) setPage(page - 1);
                        }}
                        className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show first page, last page, current page, and pages around current
                      let pageNum;
                      
                      if (totalPages <= 5) {
                        // If we have 5 or fewer pages, show all
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        // If we're near the beginning
                        if (i < 4) {
                          pageNum = i + 1;
                        } else {
                          pageNum = totalPages;
                        }
                      } else if (page >= totalPages - 2) {
                        // If we're near the end
                        if (i === 0) {
                          pageNum = 1;
                        } else {
                          pageNum = totalPages - 4 + i;
                        }
                      } else {
                        // We're in the middle
                        if (i === 0) {
                          pageNum = 1;
                        } else if (i === 4) {
                          pageNum = totalPages;
                        } else {
                          pageNum = page - 1 + (i - 1);
                        }
                      }
                      
                      // Show ellipsis instead of page numbers in certain cases
                      if ((i === 1 && pageNum !== 2) || (i === 3 && pageNum !== totalPages - 1)) {
                        return (
                          <PaginationItem key={`ellipsis-${i}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(pageNum);
                            }}
                            isActive={pageNum === page}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < totalPages) setPage(page + 1);
                        }}
                        className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inhalt löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie den Inhalt &quot;{contentToDelete?.title}&quot; wirklich löschen?
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