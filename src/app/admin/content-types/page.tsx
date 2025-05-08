'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, FilePlus, BookOpen, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { contentTypeApi, ContentType } from '@/api/contentTypeClient';

export default function ContentTypesPage() {
  const router = useRouter();
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentTypeToDelete, setContentTypeToDelete] = useState<ContentType | null>(null);

  useEffect(() => {
    loadContentTypes();
  }, []);

  const loadContentTypes = async () => {
    try {
      setLoading(true);
      const data = await contentTypeApi.getAllContentTypes();
      setContentTypes(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load content types:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden der Inhaltstypen');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (contentType: ContentType) => {
    setContentTypeToDelete(contentType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!contentTypeToDelete) return;
    
    try {
      await contentTypeApi.deleteContentType(contentTypeToDelete.id);
      setContentTypes(contentTypes.filter(ct => ct.id !== contentTypeToDelete.id));
      setDeleteDialogOpen(false);
      setContentTypeToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete content type:', err);
      setError(err.response?.data?.message || 'Fehler beim Löschen des Inhaltstyps');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inhaltstypen</h1>
          <p className="text-muted-foreground">Erstellen und verwalten Sie Inhaltstypen für Ihre Website</p>
        </div>
        <Button onClick={() => router.push('/admin/content-types/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Inhaltstyp erstellen
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : contentTypes.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Keine Inhaltstypen gefunden</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              Sie haben noch keine Inhaltstypen erstellt. Erstellen Sie Ihren ersten Inhaltstyp, um loszulegen.
            </p>
            <Button onClick={() => router.push('/admin/content-types/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Ersten Inhaltstyp erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentTypes.map((contentType) => (
            <Card key={contentType.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{contentType.name}</CardTitle>
                  {contentType.is_system && (
                    <Badge variant="secondary">System</Badge>
                  )}
                </div>
                <CardDescription className="truncate">
                  {contentType.slug}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {contentType.description || 'Keine Beschreibung'}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/admin/content-types/${contentType.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/admin/content/${contentType.slug}`)}
                >
                  <FilePlus className="w-4 h-4 mr-2" />
                  Inhalte
                </Button>
                {!contentType.is_system && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteClick(contentType)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inhaltstyp löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie den Inhaltstyp &quot;{contentTypeToDelete?.name}&quot; wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden und alle zugehörigen Inhalte werden ebenfalls gelöscht.
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