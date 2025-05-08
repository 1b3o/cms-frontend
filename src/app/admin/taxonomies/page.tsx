'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Tags, BookOpen, AlertTriangle, List } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { taxonomyApi, Taxonomy } from '@/api/taxonomyClient';

export default function TaxonomiesPage() {
  const router = useRouter();
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taxonomyToDelete, setTaxonomyToDelete] = useState<Taxonomy | null>(null);

  useEffect(() => {
    loadTaxonomies();
  }, []);

  const loadTaxonomies = async () => {
    try {
      setLoading(true);
      const data = await taxonomyApi.getAllTaxonomies();
      setTaxonomies(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load taxonomies:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden der Taxonomien');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (taxonomy: Taxonomy) => {
    setTaxonomyToDelete(taxonomy);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!taxonomyToDelete) return;
    
    try {
      await taxonomyApi.deleteTaxonomy(taxonomyToDelete.id);
      setTaxonomies(taxonomies.filter(t => t.id !== taxonomyToDelete.id));
      setDeleteDialogOpen(false);
      setTaxonomyToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete taxonomy:', err);
      setError(err.response?.data?.message || 'Fehler beim Löschen der Taxonomie');
    }
  };

  // Funktion zum Zählen aller Begriffe (inkl. Unterbegriffe)
  const countAllTerms = (taxonomy: Taxonomy) => {
    return taxonomy.terms?.length || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Taxonomien</h1>
          <p className="text-muted-foreground">Erstellen und verwalten Sie Klassifikationssysteme für Ihre Inhalte</p>
        </div>
        <Button onClick={() => router.push('/admin/taxonomies/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Taxonomie erstellen
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
      ) : taxonomies.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Tags className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Keine Taxonomien gefunden</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              Sie haben noch keine Taxonomien erstellt. Erstellen Sie Ihre erste Taxonomie, um Inhalte zu kategorisieren.
            </p>
            <Button onClick={() => router.push('/admin/taxonomies/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Erste Taxonomie erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {taxonomies.map((taxonomy) => (
            <Card key={taxonomy.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{taxonomy.name}</CardTitle>
                  {taxonomy.is_hierarchical ? (
                    <Badge variant="secondary">Hierarchisch</Badge>
                  ) : (
                    <Badge variant="outline">Flach</Badge>
                  )}
                </div>
                <CardDescription className="truncate">
                  {taxonomy.slug}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {taxonomy.description || 'Keine Beschreibung'}
                </p>
                <div className="mt-3">
                  <div className="text-sm text-muted-foreground">
                    Begriffe: {countAllTerms(taxonomy)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/admin/taxonomies/${taxonomy.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/admin/taxonomies/${taxonomy.id}/terms`)}
                >
                  <List className="w-4 h-4 mr-2" />
                  Begriffe
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteClick(taxonomy)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Taxonomie löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie die Taxonomie &quot;{taxonomyToDelete?.name}&quot; wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden und alle zugehörigen Begriffe werden ebenfalls gelöscht.
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