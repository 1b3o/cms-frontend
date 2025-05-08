// src/app/admin/content-types/[id]/page.tsx
// Updated to use @dnd-kit instead of react-beautiful-dnd

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react'; // Added React.use import
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Edit2, AlertCircle, Plus, Trash2, GripVertical, Save, Check } from "lucide-react";

// Import dnd-kit components
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { contentTypeApi, ContentType, ContentField, UpdateContentTypeRequest } from '@/api/contentTypeClient';
import { CreateFieldDialog } from './components/CreateFieldDialog';
import { EditFieldDialog } from './components/EditFieldDialog';

// Form schema code remains the same
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
  icon: z.string().optional(),
  is_system: z.boolean().default(false),
  supports_revisions: z.boolean().default(true),
  supports_comments: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

// Create a sortable row component for fields
function SortableFieldRow({ field, isReordering, handleDeleteClick, setFieldToEdit }: {
  field: ContentField;
  isReordering: boolean;
  handleDeleteClick: (field: ContentField) => void;
  setFieldToEdit: (field: ContentField) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style}
      className={isDragging ? "bg-accent" : ""}
    >
      {isReordering && (
        <TableCell>
          <div
            {...attributes}
            {...listeners}
            className="cursor-move flex justify-center"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
        </TableCell>
      )}
      <TableCell className="font-medium">{field.name}</TableCell>
      <TableCell className="font-mono text-sm">{field.slug}</TableCell>
      <TableCell>
        <Badge variant="outline">{field.field_type}</Badge>
      </TableCell>
      <TableCell>
        {field.is_required ? (
          <Badge variant="default" className="bg-green-500">Ja</Badge>
        ) : (
          <Badge variant="outline">Nein</Badge>
        )}
      </TableCell>
      <TableCell>
        {field.is_unique ? (
          <Badge variant="default" className="bg-blue-500">Ja</Badge>
        ) : (
          <Badge variant="outline">Nein</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFieldToEdit(field)}
            disabled={isReordering}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(field)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={isReordering}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function EditContentTypePage({ params }: { params: { id: string } }) {
  // Unwrap params at the component level
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const router = useRouter();
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [fields, setFields] = useState<ContentField[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isReordering, setIsReordering] = useState(false);
  const [createFieldDialogOpen, setCreateFieldDialogOpen] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState<ContentField | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<ContentField | null>(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const form = useForm<FormValues>({
    resolver: zodResolver<FormValues>(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "",
      is_system: false,
      supports_revisions: true,
      supports_comments: false,
    },
  });

  useEffect(() => {
    loadContentType();
  }, [id]); // Changed from params.id to id

  useEffect(() => {
    if (contentType) {
      form.reset({
        name: contentType.name,
        slug: contentType.slug,
        description: contentType.description || "",
        icon: contentType.icon || "",
        is_system: contentType.is_system,
        supports_revisions: contentType.supports_revisions,
        supports_comments: contentType.supports_comments,
      });
    }
  }, [contentType, form]);

  const loadContentType = async () => {
    try {
      setLoading(true);
      const data = await contentTypeApi.getContentType(id); // Changed from params.id to id
      setContentType(data);
      setFields(data.fields || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load content type:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden des Inhaltstyps');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const data: UpdateContentTypeRequest = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        icon: values.icon,
        is_system: values.is_system,
        supports_revisions: values.supports_revisions,
        supports_comments: values.supports_comments,
      };
      
      const updatedContentType = await contentTypeApi.updateContentType(id, data); // Changed from params.id to id
      setContentType(updatedContentType);
      setSuccess('Inhaltstyp erfolgreich aktualisiert');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to update content type:', err);
      setError(err.response?.data?.message || 'Fehler beim Aktualisieren des Inhaltstyps');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle the end of a drag operation
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    if (active.id === over.id) return;
    
    // Update the field order in local state
    const oldIndex = fields.findIndex(field => field.id === active.id);
    const newIndex = fields.findIndex(field => field.id === over.id);
    
    const newFieldsOrder = arrayMove(fields, oldIndex, newIndex);
    setFields(newFieldsOrder);
    
    if (isReordering) {
      try {
        setError(null);
        // Get the ids of the fields in their new order
        const fieldIds = newFieldsOrder.map(field => field.id);
        await contentTypeApi.reorderContentFields(id, fieldIds); // Changed from params.id to id
      } catch (err: any) {
        console.error('Failed to reorder fields:', err);
        setError(err.response?.data?.message || 'Fehler beim Neuordnen der Felder');
        // Revert to original order
        await loadContentType();
      }
    }
  };

  const handleFieldCreated = (field: ContentField) => {
    setFields([...fields, field]);
    setCreateFieldDialogOpen(false);
    setActiveTab("fields");
  };

  const handleFieldUpdated = (updatedField: ContentField) => {
    setFields(fields.map(field => field.id === updatedField.id ? updatedField : field));
    setFieldToEdit(null);
  };

  const handleDeleteClick = (field: ContentField) => {
    setFieldToDelete(field);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteField = async () => {
    if (!fieldToDelete) return;
    
    try {
      await contentTypeApi.deleteContentField(id, fieldToDelete.id); // Changed from params.id to id
      setFields(fields.filter(field => field.id !== fieldToDelete.id));
      setDeleteDialogOpen(false);
      setFieldToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete field:', err);
      setError(err.response?.data?.message || 'Fehler beim Löschen des Feldes');
    }
  };

  const saveReordering = async () => {
    try {
      setError(null);
      await contentTypeApi.reorderContentFields(id, fields.map(field => field.id)); // Changed from params.id to id
      setIsReordering(false);
      setSuccess('Feldreihenfolge erfolgreich aktualisiert');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to save field order:', err);
      setError(err.response?.data?.message || 'Fehler beim Speichern der Feldreihenfolge');
    }
  };

  if (loading) {
    // Loading skeleton remains the same
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

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details"><Skeleton className="h-4 w-16" /></TabsTrigger>
            <TabsTrigger value="fields"><Skeleton className="h-4 w-16" /></TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (!contentType) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler</AlertTitle>
        <AlertDescription>Inhaltstyp nicht gefunden</AlertDescription>
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
            onClick={() => router.push('/admin/content-types')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{contentType.name}</h1>
        </div>
        
        {activeTab === "fields" && (
          isReordering ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsReordering(false)}>
                Abbrechen
              </Button>
              <Button onClick={saveReordering}>
                <Save className="h-4 w-4 mr-2" />
                Reihenfolge speichern
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsReordering(true)}>
                Felder neu anordnen
              </Button>
              <Button onClick={() => setCreateFieldDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Feld hinzufügen
              </Button>
            </div>
          )
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Erfolg</AlertTitle>
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="fields">Felder</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Inhaltstyp-Details</CardTitle>
              <CardDescription>
                Bearbeiten Sie die grundlegenden Eigenschaften des Inhaltstyps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Form fields remain the same */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. Artikel, Produkt, Seite" {...field} />
                        </FormControl>
                        <FormDescription>
                          Der Name, der in der Benutzeroberfläche angezeigt wird
                        </FormDescription>
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
                          <Input placeholder="z.B. artikel, produkt, seite" {...field} />
                        </FormControl>
                        <FormDescription>
                          Der eindeutige Bezeichner für diesen Inhaltstyp (nur Kleinbuchstaben, Zahlen und Bindestriche)
                        </FormDescription>
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
                          <Textarea
                            placeholder="Beschreiben Sie den Zweck dieses Inhaltstyps"
                            className="min-h-[100px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Eine kurze Beschreibung, wofür dieser Inhaltstyp verwendet wird
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. file-text, image, shopping-cart" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          Ein Lucide-Icon-Name zur Visualisierung dieses Inhaltstyps
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 border rounded-md p-4">
                    <h3 className="font-medium">Erweiterte Optionen</h3>

                    <FormField
                      control={form.control}
                      name="supports_revisions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Versionierung aktivieren</FormLabel>
                            <FormDescription>
                              Speichert frühere Versionen und ermöglicht das Wiederherstellen
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="supports_comments"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Kommentare aktivieren</FormLabel>
                            <FormDescription>
                              Ermöglicht Kommentare zu Inhalten dieses Typs
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_system"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>System-Inhaltstyp</FormLabel>
                            <FormDescription>
                              System-Inhaltstypen können nicht gelöscht werden
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/admin/content-types')}
                      disabled={submitting}
                    >
                      Abbrechen
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Speichern..." : "Änderungen speichern"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fields" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Inhaltstyp-Felder</CardTitle>
              <CardDescription>
                Verwalten Sie die Felder, die für diesen Inhaltstyp verfügbar sind
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Diesem Inhaltstyp wurden noch keine Felder hinzugefügt.
                  </p>
                  <Button onClick={() => setCreateFieldDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Erstes Feld hinzufügen
                  </Button>
                </div>
              ) : (
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <div>
                    <ScrollArea className="h-[500px] pr-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {isReordering && <TableHead className="w-10"></TableHead>}
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Typ</TableHead>
                            <TableHead>Erforderlich</TableHead>
                            <TableHead>Eindeutig</TableHead>
                            <TableHead className="w-[100px]">Aktionen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <SortableContext 
                            items={fields.map(field => field.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {fields.map((field) => (
                              <SortableFieldRow
                                key={field.id}
                                field={field}
                                isReordering={isReordering}
                                handleDeleteClick={handleDeleteClick}
                                setFieldToEdit={setFieldToEdit}
                              />
                            ))}
                          </SortableContext>
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateFieldDialog 
        contentTypeId={id} // Changed from params.id to id
        open={createFieldDialogOpen}
        onOpenChange={setCreateFieldDialogOpen}
        onFieldCreated={handleFieldCreated}
      />

      {fieldToEdit && (
        <EditFieldDialog
          contentTypeId={id} // Changed from params.id to id
          field={fieldToEdit}
          open={!!fieldToEdit}
          onOpenChange={(open) => !open && setFieldToEdit(null)}
          onFieldUpdated={handleFieldUpdated}
        />
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feld löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie das Feld &quot;{fieldToDelete?.name}&quot; wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden und alle zugehörigen Daten gehen verloren.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmDeleteField}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}