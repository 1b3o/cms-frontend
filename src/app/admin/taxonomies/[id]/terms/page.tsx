'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { use } from 'react'; // Add import for React.use
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Plus, Trash2, MoveVertical, ChevronRight, ChevronDown, Edit, Save, Tags } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { taxonomyApi, Taxonomy, TaxonomyTerm, CreateTaxonomyTermRequest } from '@/api/taxonomyClient';

// Formular-Schema für Taxonomie-Begriffe
const formSchema = z.object({
  name: z.string().min(1, {
    message: "Der Name ist erforderlich.",
  }),
  slug: z.string().min(1, {
    message: "Der Slug ist erforderlich.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "Der Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.",
  }),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  sort_order: z.number().optional(),
});

type Props = {
  params: { id: string }
};

export default function TaxonomyTermsPage({ params }: Props) {
  const router = useRouter();
  // Unwrap the params using React.use()
  const unwrappedParams = use(params);
  const [taxonomy, setTaxonomy] = useState<Taxonomy | null>(null);
  const [terms, setTerms] = useState<TaxonomyTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [termToDelete, setTermToDelete] = useState<TaxonomyTerm | null>(null);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
  const [editingTerm, setEditingTerm] = useState<string | null>(null);

  // Formular für neuen Term
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parent_id: undefined,
      sort_order: 0,
    },
  });

  // Formular für Term bearbeiten
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parent_id: undefined,
      sort_order: 0,
    },
  });

  // Daten laden
  useEffect(() => {
    loadTaxonomy();
  }, [unwrappedParams.id]); // Use unwrappedParams.id here

  const loadTaxonomy = async () => {
    try {
      setLoading(true);
      const taxonomyData = await taxonomyApi.getTaxonomy(unwrappedParams.id); // Use unwrappedParams.id here
      setTaxonomy(taxonomyData);
      
      if (taxonomyData.terms) {
        // Tiefe Kopie der Terme machen, um sicherzustellen, dass parent_id als String behandelt wird
        const normalizedTerms = taxonomyData.terms.map(term => ({
          ...term,
          // Stelle sicher, dass parent_id ein String ist, wenn vorhanden
          parent_id: term.parent_id ? String(term.parent_id) : null
        }));
        
        setTerms(normalizedTerms);
        
        // Automatisches Aufklappen aller Elternterme, die Kinder haben
        if (taxonomyData.is_hierarchical) {
          const parentsWithChildren = new Set<string>();
          
          // Finde alle Terme, die Kinder haben
          normalizedTerms.forEach(term => {
            if (term.parent_id) {
              // Als String hinzufügen
              parentsWithChildren.add(String(term.parent_id));
            }
          });
          
          // Alle Elternterme expandieren
          setExpandedTerms(parentsWithChildren);
          
          console.log("Elternterme mit Kindern:", [...parentsWithChildren]);
        }
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Failed to load taxonomy:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden der Taxonomie');
    } finally {
      setLoading(false);
    }
  };

  // Slug aus Name generieren
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    
    form.setValue("slug", slug);
  };

  // Term erstellen
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!taxonomy) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const data: CreateTaxonomyTermRequest = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        parent_id: values.parent_id === "root" ? undefined : values.parent_id,
        sort_order: values.sort_order,
      };
      
      await taxonomyApi.createTaxonomyTerm(taxonomy.id, data);
      
      // Wenn der Term einen übergeordneten Begriff hat, expandieren wir diesen
      if (values.parent_id && values.parent_id !== "root") {
        // TypeScript-sichere Version für die Aktualisierung des Sets
        setExpandedTerms(prev => {
          const newSet = new Set(prev);
          newSet.add(values.parent_id as string);
          return newSet;
        });
      }
      
      // Term zur Liste hinzufügen oder aktualisieren
      await loadTaxonomy(); // Liste neu laden, um hierarchische Struktur korrekt zu aktualisieren
      
      // Formular zurücksetzen
      form.reset({
        name: "",
        slug: "",
        description: "",
        parent_id: undefined,
        sort_order: 0,
      });
      
    } catch (err: any) {
      console.error('Failed to create term:', err);
      setError(err.response?.data?.message || 'Fehler beim Erstellen des Begriffs');
    } finally {
      setSubmitting(false);
    }
  };

  // Term bearbeiten starten
  const startEditing = (term: TaxonomyTerm) => {
    editForm.reset({
      name: term.name,
      slug: term.slug,
      description: term.description || "",
      parent_id: term.parent_id,
      sort_order: term.sort_order,
    });
    setEditingTerm(term.id);
  };

  // Term bearbeiten speichern
  const saveEdit = async (termId: string) => {
    if (!taxonomy) return;
    
    try {
      setSubmitting(true);
      const values = editForm.getValues();
      
      await taxonomyApi.updateTaxonomyTerm(taxonomy.id, termId, {
        name: values.name,
        slug: values.slug,
        description: values.description,
        parent_id: values.parent_id === "root" ? undefined : values.parent_id,
        sort_order: values.sort_order,
      });
      
      await loadTaxonomy(); // Liste neu laden
      setEditingTerm(null);
    } catch (err: any) {
      console.error('Failed to update term:', err);
      setError(err.response?.data?.message || 'Fehler beim Aktualisieren des Begriffs');
    } finally {
      setSubmitting(false);
    }
  };

  // Term löschen Dialog
  const handleDeleteClick = (term: TaxonomyTerm) => {
    setTermToDelete(term);
    setDeleteDialogOpen(true);
  };

  // Term löschen bestätigen
  const confirmDelete = async () => {
    if (!taxonomy || !termToDelete) return;
    
    try {
      await taxonomyApi.deleteTaxonomyTerm(taxonomy.id, termToDelete.id);
      await loadTaxonomy(); // Liste neu laden
      setDeleteDialogOpen(false);
      setTermToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete term:', err);
      setError(err.response?.data?.message || 'Fehler beim Löschen des Begriffs');
    }
  };

  // Term-Baum aufklappen/zuklappen
  const toggleExpandTerm = (termId: string) => {
    const newExpanded = new Set(expandedTerms);
    if (newExpanded.has(termId)) {
      newExpanded.delete(termId);
    } else {
      newExpanded.add(termId);
    }
    setExpandedTerms(newExpanded);
  };

  // Debugging-Hilfsfunktion, um alle Terme und ihre Beziehungen anzuzeigen
  useEffect(() => {
    if (!loading && terms.length > 0) {
      console.log("Alle geladenen Terme:", terms);
      terms.forEach(term => {
        console.log(`Term: ${term.name}, ID: ${term.id}, Parent-ID: ${term.parent_id}`);
      });
      
      // Manuelles Finden der Elternterme
      const parentIds = new Set();
      terms.forEach(term => {
        if (term.parent_id) {
          parentIds.add(term.parent_id);
        }
      });
      console.log("Elternterme IDs:", [...parentIds]);
    }
  }, [loading, terms]);

  // Hierarchische Term-Darstellung
  const renderTermTree = (termList: TaxonomyTerm[], parentId: string | null = null, level = 0) => {
    // Debugging
    console.log(`Rendering level ${level} with parentId:`, parentId);
    
    const filteredTerms = termList.filter(term => {
      // String-basierter Vergleich für parent_id, da manchmal string vs. object Probleme auftreten können
      const termParentId = term.parent_id ? String(term.parent_id) : null;
      const compareParentId = parentId ? String(parentId) : null;
      
      // Für das Root-Level, zeigen wir Terme ohne parent_id
      if (compareParentId === null) {
        return termParentId === null;
      }
      
      // Für andere Level, direkter Vergleich der Strings
      const matches = termParentId === compareParentId;
      console.log(`Vergleich für ${term.name}: ${termParentId} === ${compareParentId} = ${matches}`);
      return matches;
    });
    
    console.log(`Found ${filteredTerms.length} terms at level ${level}:`, 
               filteredTerms.map(t => t.name));
    
    return filteredTerms
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(term => {
        // Prüfe, ob dieser Term Kinder hat - mit String-Vergleich
        const termId = String(term.id);
        const hasChildren = termList.some(t => t.parent_id && String(t.parent_id) === termId);
        console.log(`Term ${term.name} (ID: ${termId}) hasChildren:`, hasChildren);
        const isExpanded = expandedTerms.has(term.id);
        
        return (
          <div key={term.id}>
            <div 
              className="flex items-center py-2 hover:bg-gray-50 border-b"
              style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
              {hasChildren ? (
                <button 
                  onClick={() => toggleExpandTerm(term.id)}
                  className="mr-1 p-1 rounded-md hover:bg-gray-200"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              ) : (
                <div className="w-6"></div>
              )}
              
              {editingTerm === term.id ? (
                <div className="flex-1 flex items-center">
                  <Input 
                    className="flex-1 mr-2" 
                    value={editForm.getValues().name} 
                    onChange={e => editForm.setValue("name", e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => saveEdit(term.id)}
                    disabled={submitting}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="flex-1 font-medium">{term.name}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(term)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(term)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
            
            {hasChildren && isExpanded && renderTermTree(termList, term.id, level + 1)}
          </div>
        );
      });
  };

  // Flache Term-Liste (für nicht-hierarchische Taxonomien)
  const renderTermList = (termList: TaxonomyTerm[]) => {
    return termList
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(term => (
        <div key={term.id} className="flex items-center py-2 px-3 hover:bg-gray-50 border-b">
          {editingTerm === term.id ? (
            <div className="flex-1 flex items-center">
              <Input 
                className="flex-1 mr-2" 
                value={editForm.getValues().name} 
                onChange={e => editForm.setValue("name", e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => saveEdit(term.id)}
                disabled={submitting}
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <MoveVertical className="h-4 w-4 text-gray-400 mr-2" />
              <span className="flex-1 font-medium">{term.name}</span>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(term)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(term)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/taxonomies')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {loading ? 'Taxonomie-Begriffe' : `${taxonomy?.name} Begriffe`}
          </h1>
          <p className="text-muted-foreground">
            {taxonomy?.is_hierarchical 
              ? 'Verwalten Sie hierarchische Begriffe mit Eltern-Kind-Beziehungen'
              : 'Verwalten Sie flache Begriffe ohne Hierarchie'}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formular zum Hinzufügen neuer Begriffe */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Neuen Begriff hinzufügen</CardTitle>
              <CardDescription>
                Fügen Sie einen neuen Begriff zur Taxonomie hinzu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="z.B. Technologie, Sport" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              handleNameChange(e);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. technologie, sport" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beschreibung</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Optionale Beschreibung" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {taxonomy?.is_hierarchical && (
                    <FormField
                      control={form.control}
                      name="parent_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Übergeordneter Begriff</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Kein übergeordneter Begriff (Root-Ebene)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="root">Keine (Root-Ebene)</SelectItem>
                              {terms.map(term => (
                                <SelectItem key={term.id} value={term.id}>
                                  {term.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="sort_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sortierung</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormDescription>
                          Niedrigere Werte werden zuerst angezeigt
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={submitting}>
                    <Plus className="w-4 h-4 mr-2" />
                    Begriff hinzufügen
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Liste der vorhandenen Begriffe */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Begriffe</CardTitle>
              <CardDescription>
                {taxonomy?.is_hierarchical 
                  ? 'Klicken Sie auf die Pfeile, um Unterbegriffe anzuzeigen'
                  : 'Liste aller Begriffe in dieser Taxonomie'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center py-2 px-3 border-b">
                      <Skeleton className="h-4 w-4 mr-2" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              ) : terms.length === 0 ? (
                <div className="text-center py-8">
                  <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Keine Begriffe gefunden</h3>
                  <p className="text-muted-foreground mt-2 mb-6">
                    Fügen Sie Begriffe hinzu, um Inhalte zu klassifizieren
                  </p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  {taxonomy?.is_hierarchical 
                    ? renderTermTree(terms)
                    : renderTermList(terms)
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lösch-Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Begriff löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie den Begriff &quot;{termToDelete?.name}&quot; wirklich löschen?
              {taxonomy?.is_hierarchical && termToDelete?.children && termToDelete.children.length > 0 && (
                <strong className="mt-2 block">
                  Achtung: Alle Unterbegriffe werden ebenfalls gelöscht oder zur übergeordneten Ebene verschoben.
                </strong>
              )}
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