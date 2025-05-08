'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, History, Clock, RotateCcw, Calendar, Eye } from "lucide-react";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import { contentApi, Content, Revision } from '@/api/contentClient';
import { contentTypeApi, ContentType } from '@/api/contentTypeClient';

export default function ContentVersionsPage({ params }: { params: { type: string, id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contentData, contentTypeData, revisionsData] = await Promise.all([
        contentApi.getContent(params.id),
        contentTypeApi.getContentTypeBySlug(params.type),
        contentApi.getRevisions(params.id),
      ]);
      
      setContent(contentData);
      setContentType(contentTypeData);
      setRevisions(revisionsData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (revision: Revision) => {
    setSelectedRevision(revision);
    setRestoreDialogOpen(true);
  };

  const confirmRestore = async () => {
    if (!selectedRevision) return;
    
    try {
      setRestoring(true);
      await contentApi.restoreRevision(selectedRevision.id);
      setRestoreDialogOpen(false);
      setSelectedRevision(null);
      // Reload data after restoration
      await loadData();
    } catch (err: any) {
      console.error('Failed to restore revision:', err);
      setError(err.response?.data?.message || 'Fehler beim Wiederherstellen der Revision');
    } finally {
      setRestoring(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPpp", { locale: de });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            disabled
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-72" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border rounded-md p-4 flex justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!content || !contentType) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>Fehler</AlertTitle>
        <AlertDescription>
          {!contentType ? 'Inhaltstyp nicht gefunden' : 'Inhalt nicht gefunden'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/content/${params.type}/${params.id}`)}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Versionshistorie</h1>
            <div className="text-sm text-muted-foreground mt-1">
              {content.title} - {contentType.name}
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/content/${params.type}/${params.id}`)}
        >
          Zurück zum Inhalt
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Versionen</CardTitle>
          <CardDescription>
            Versionsverlauf dieses Inhalts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revisions.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Keine Versionshistorie verfügbar.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {/* Current version */}
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium flex items-center">
                        Aktuelle Version
                        <Badge variant="default" className="ml-2">Aktuell</Badge>
                      </h3>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Letzte Aktualisierung: {formatDate(content.updated_at)}
                      </div>
                      {content.author_name && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Bearbeitet von: {content.author_name}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/content/${params.type}/${params.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Anzeigen
                    </Button>
                  </div>
                </div>

                {/* Revisions */}
                {revisions.map((revision) => (
                  <div key={revision.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {revision.comment || `Revision vom ${format(new Date(revision.created_at), "PPp", { locale: de })}`}
                        </h3>
                        <div className="text-sm text-muted-foreground mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Erstellt am: {formatDate(revision.created_at)}
                        </div>
                        {revision.author_name && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Erstellt von: {revision.author_name}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreClick(revision)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Wiederherstellen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Version wiederherstellen</DialogTitle>
            <DialogDescription>
              Möchten Sie wirklich zu dieser Version zurückkehren?
              Eine neue Revision mit dem aktuellen Zustand wird erstellt, bevor die Wiederherstellung erfolgt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)} disabled={restoring}>
              Abbrechen
            </Button>
            <Button onClick={confirmRestore} disabled={restoring}>
              {restoring ? "Wird wiederhergestellt..." : "Wiederherstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}