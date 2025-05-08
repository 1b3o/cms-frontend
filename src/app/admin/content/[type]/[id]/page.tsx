'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react'; // Added React.use import
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Save, Calendar, EyeOff, Eye, History, Clock } from "lucide-react";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import { contentApi, Content, UpdateContentRequest } from '@/api/contentClient';
import { contentTypeApi, ContentType, ContentField } from '@/api/contentTypeClient';
import { DynamicField } from '@/components/structured/admin/DynamicField';
import { PageBuilderEditor } from '@/components/page-builder/core/PageBuilderEditor';

// Define form schema
const formSchema = z.object({
  title: z.string().min(1, { message: "Titel ist erforderlich" }),
  slug: z.string().min(1, { message: "Slug ist erforderlich" }),
  status: z.string(),
  published_at: z.date().optional(),
  content: z.record(z.string(), z.any()).default({}),
  metadata: z.record(z.string(), z.any()).default({}),
});

export default function EditContentPage({ params }: { params: { type: string, id: string } }) {
  // Unwrap params at the component level
  const unwrappedParams = use(params);
  const type = unwrappedParams.type;
  const id = unwrappedParams.id;
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [fields, setFields] = useState<ContentField[]>([]);
  const [activeTab, setActiveTab] = useState("content");
  const [previewMode, setPreviewMode] = useState(false);
  
  // For metadata fields
  const metadataFields = [
    { id: "meta_title", name: "Meta-Titel", type: "text", description: "SEO Titel (leer lassen für Standard-Titel)" },
    { id: "meta_description", name: "Meta-Beschreibung", type: "textarea", description: "SEO Beschreibung" },
    { id: "meta_keywords", name: "Meta-Keywords", type: "text", description: "Kommagetrennte Keywords" },
    { id: "og_title", name: "Open Graph Titel", type: "text", description: "Titel für Social Media Shares" },
    { id: "og_description", name: "Open Graph Beschreibung", type: "textarea", description: "Beschreibung für Social Media Shares" },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      status: "draft",
      content: {},
      metadata: {},
    },
  });

  useEffect(() => {
    loadContentType();
    loadContent();
  }, [type, id]); // Changed from params.type, params.id to type, id

  useEffect(() => {
    if (content) {
      form.reset({
        title: content.title,
        slug: content.slug,
        status: content.status,
        published_at: content.published_at ? new Date(content.published_at) : undefined,
        content: content.content || {},
        metadata: content.metadata || {},
      });
    }
  }, [content, form]);

  const loadContentType = async () => {
    try {
      const contentType = await contentTypeApi.getContentTypeBySlug(type); // Changed from params.type to type
      setContentType(contentType);
      setFields(contentType.fields || []);
    } catch (err: any) {
      console.error('Failed to load content type:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden des Inhaltstyps');
    }
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      const content = await contentApi.getContent(id); // Changed from params.id to id
      setContent(content);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load content:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden des Inhalts');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const data: UpdateContentRequest = {
        title: values.title,
        slug: values.slug,
        status: values.status,
        published_at: values.status === "published" ? values.published_at?.toISOString() : undefined,
        content: values.content,
        metadata: values.metadata,
      };
      
      const updatedContent = await contentApi.updateContent(id, data); // Changed from params.id to id
      setContent(updatedContent);
      
      setSuccess('Inhalt erfolgreich gespeichert');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to update content:', err);
      setError(err.response?.data?.message || 'Fehler beim Speichern des Inhalts');
    } finally {
      setSubmitting(false);
    }
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

        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content"><Skeleton className="h-4 w-16" /></TabsTrigger>
            <TabsTrigger value="metadata"><Skeleton className="h-4 w-16" /></TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-6">
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

  if (!contentType || !content) {
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
            onClick={() => router.push('/admin/content')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{content.title}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>{contentType.name}</span>
              <span>•</span>
              {getStatusBadge(content.status)}
              {content.revision_count && content.revision_count > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center">
                    <History className="h-3 w-3 mr-1" />
                    {content.revision_count} Revisionen
                  </span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Letzte Aktualisierung: {format(new Date(content.updated_at), "PPp", { locale: de })}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/content/${type}/${id}/versions`)} // Changed from params.type, params.id to type, id
          >
            <History className="h-4 w-4 mr-2" />
            Versionen
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Bearbeitungsmodus
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Vorschau
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">Erfolg</AlertTitle>
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Inhaltsinformationen</CardTitle>
                    <CardDescription>
                      Grundlegende Informationen zu diesem Inhalt
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titel</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Geben Sie einen Titel ein"
                              {...field}
                              disabled={previewMode}
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
                            <Input
                              placeholder="URL-freundlicher Bezeichner"
                              {...field}
                              disabled={previewMode}
                            />
                          </FormControl>
                          <FormDescription>
                            Der eindeutige Bezeichner für die URL
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="content">Inhalt</TabsTrigger>
                    <TabsTrigger value="metadata">SEO / Metadaten</TabsTrigger>
                    <TabsTrigger value="page-builder">Page Builder</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Inhaltsfelder</CardTitle>
                        <CardDescription>
                          Inhaltsspezifische Felder für diesen {contentType.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {fields.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-muted-foreground">
                              Keine Felder definiert. Bitte fügen Sie Felder zu diesem Inhaltstyp hinzu.
                            </p>
                          </div>
                        ) : (
                          <>
                            {fields.map((field) => (
                              <DynamicField
                                key={field.id}
                                field={field}
                                name={`content.${field.slug}`}
                                disabled={previewMode}
                              />
                            ))}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="metadata" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>SEO & Metadaten</CardTitle>
                        <CardDescription>
                          Metadaten für Suchmaschinenoptimierung
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {metadataFields.map((field) => (
                          <FormField
                            key={field.id}
                            control={form.control}
                            name={`metadata.${field.id}`}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel>{field.name}</FormLabel>
                                <FormControl>
                                  {field.type === 'textarea' ? (
                                    <textarea
                                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      placeholder={field.name}
                                      {...formField}
                                      onChange={(e) => formField.onChange(e.target.value)}
                                      value={formField.value || ''}
                                      disabled={previewMode}
                                    />
                                  ) : (
                                    <Input
                                      placeholder={field.name}
                                      {...formField}
                                      value={formField.value || ''}
                                      disabled={previewMode}
                                    />
                                  )}
                                </FormControl>
                                <FormDescription>
                                  {field.description}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="page-builder" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Visueller Editor</CardTitle>
                        <CardDescription>
                          Erstellen Sie das Layout mit dem visuellen Editor
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 h-[700px]">
                        <PageBuilderEditor
                          initialValue={form.watch('content.layout') || { sections: [] }}
                          onChange={(layout) => {
                            form.setValue('content.layout', layout);
                          }}
                          readOnly={previewMode}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="w-full lg:w-80 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Veröffentlichung</CardTitle>
                    <CardDescription>
                      Status und Zeitpunkt der Veröffentlichung
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={previewMode}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Status auswählen" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Entwurf</SelectItem>
                              <SelectItem value="published">Veröffentlicht</SelectItem>
                              <SelectItem value="archived">Archiviert</SelectItem>
                              <SelectItem value="trash">Papierkorb</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Der aktuelle Status des Inhalts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("status") === "published" && (
                      <FormField
                        control={form.control}
                        name="published_at"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Veröffentlichungsdatum</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                    disabled={previewMode}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: de })
                                    ) : (
                                      <span>Datum auswählen</span>
                                    )}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  disabled={previewMode}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Wann der Inhalt veröffentlicht werden soll
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={submitting || previewMode}
                      className="w-full"
                    >
                      {submitting ? "Speichere..." : "Änderungen speichern"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}