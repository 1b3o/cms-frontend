'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react'; // Added React.use import
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Save, Calendar, EyeOff, Eye } from "lucide-react";
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

import { contentApi, CreateContentRequest } from '@/api/contentClient';
import { contentTypeApi, ContentType, ContentField } from '@/api/contentTypeClient';
import { DynamicField } from '@/components/structured/admin/DynamicField';

// Define form schema
const formSchema = z.object({
  title: z.string().min(1, { message: "Titel ist erforderlich" }),
  slug: z.string().optional(),
  status: z.string().default("draft"),
  published_at: z.date().optional(),
  content: z.record(z.string(), z.any()).default({}),
  metadata: z.record(z.string(), z.any()).default({}),
});

export default function CreateContentPage({ params }: { params: { type: string } }) {
  // Unwrap params at the component level
  const unwrappedParams = use(params);
  const type = unwrappedParams.type;
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
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
  }, [type]); // Changed from params.type to type

  const loadContentType = async () => {
    try {
      setLoading(true);
      const contentType = await contentTypeApi.getContentTypeBySlug(type); // Changed from params.type to type
      setContentType(contentType);
      setFields(contentType.fields || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load content type:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden des Inhaltstyps');
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-')   // Replace multiple - with single -
      .replace(/^-+/, '')       // Trim - from start of text
      .replace(/-+$/, '');      // Trim - from end of text
    
    form.setValue("slug", slug);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!contentType) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const data: CreateContentRequest = {
        content_type_id: contentType.id,
        title: values.title,
        slug: values.slug,
        status: values.status,
        published_at: values.status === "published" ? values.published_at?.toISOString() : undefined,
        content: values.content,
        metadata: values.metadata,
      };
      
      const content = await contentApi.createContent(data);
      
      // Navigate to edit page
      router.push(`/admin/content/${type}/${content.id}`); // Changed from params.type to type
    } catch (err: any) {
      console.error('Failed to create content:', err);
      setError(err.response?.data?.message || 'Fehler beim Erstellen des Inhalts');
      setSubmitting(false);
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

  if (!contentType) {
    return (
      <Alert variant="destructive" className="my-4">
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
            onClick={() => router.push('/admin/content')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Neuer Inhalt: {contentType.name}</h1>
        </div>
        
        <div className="flex gap-2">
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
                              onChange={(e) => {
                                field.onChange(e);
                                handleTitleChange(e);
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
                            <Input
                              placeholder="URL-freundlicher Bezeichner"
                              {...field}
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
                                    />
                                  ) : (
                                    <Input
                                      placeholder={field.name}
                                      {...formField}
                                      value={formField.value || ''}
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
                      disabled={submitting}
                      className="w-full"
                    >
                      {submitting ? "Speichere..." : "Inhalt speichern"}
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