'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { contentTypeApi, CreateContentTypeRequest } from '@/api/contentTypeClient';

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

export default function CreateContentTypePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  // Generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-')   // Replace multiple - with single -
      .replace(/^-+/, '')       // Trim - from start of text
      .replace(/-+$/, '');      // Trim - from end of text
    
    form.setValue("slug", slug);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSubmitting(true);
      setError(null);
      
      const data: CreateContentTypeRequest = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        icon: values.icon,
        is_system: values.is_system,
        supports_revisions: values.supports_revisions,
        supports_comments: values.supports_comments,
      };
      
      const contentType = await contentTypeApi.createContentType(data);
      
      // Navigate to edit page to add fields
      router.push(`/admin/content-types/${contentType.id}`);
    } catch (err: any) {
      console.error('Failed to create content type:', err);
      setError(err.response?.data?.message || 'Fehler beim Erstellen des Inhaltstyps');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/content-types')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Neuen Inhaltstyp erstellen</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Inhaltstyp-Details</CardTitle>
          <CardDescription>
            Definieren Sie die grundlegenden Eigenschaften des Inhaltstyps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="z.B. Artikel, Produkt, Seite" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e);
                        }}
                      />
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
                      <Input placeholder="z.B. file-text, image, shopping-cart" {...field} />
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
                  {submitting ? "Erstelle..." : "Inhaltstyp erstellen"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}