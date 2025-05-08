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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { taxonomyApi, CreateTaxonomyRequest } from '@/api/taxonomyClient';

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
  is_hierarchical: z.boolean().default(false),
});

export default function CreateTaxonomyPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      is_hierarchical: false,
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
      
      const data: CreateTaxonomyRequest = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        is_hierarchical: values.is_hierarchical,
      };
      
      const taxonomy = await taxonomyApi.createTaxonomy(data);
      
      // Navigate to terms page to add terms
      router.push(`/admin/taxonomies/${taxonomy.id}/terms`);
    } catch (err: any) {
      console.error('Failed to create taxonomy:', err);
      setError(err.response?.data?.message || 'Fehler beim Erstellen der Taxonomie');
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
          onClick={() => router.push('/admin/taxonomies')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Neue Taxonomie erstellen</h1>
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
          <CardTitle>Taxonomie-Details</CardTitle>
          <CardDescription>
            Definieren Sie ein Klassifikationssystem für Ihre Inhalte
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
                        placeholder="z.B. Kategorien, Tags, Autoren" 
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
                      <Input placeholder="z.B. kategorien, tags, autoren" {...field} />
                    </FormControl>
                    <FormDescription>
                      Der eindeutige Bezeichner für diese Taxonomie (nur Kleinbuchstaben, Zahlen und Bindestriche)
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
                        placeholder="Beschreiben Sie den Zweck dieser Taxonomie" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Eine kurze Beschreibung, wofür diese Taxonomie verwendet wird
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 border rounded-md p-4">
                <h3 className="font-medium">Taxonomie-Typ</h3>

                <FormField
                  control={form.control}
                  name="is_hierarchical"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Hierarchische Taxonomie</FormLabel>
                        <FormDescription>
                          Ermöglicht verschachtelte Strukturen (z.B. Kategorien mit Unterkategorien). 
                          Wenn deaktiviert, wird eine flache Taxonomie erstellt (z.B. Tags).
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
                  onClick={() => router.push('/admin/taxonomies')}
                  disabled={submitting}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Erstelle..." : "Taxonomie erstellen"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}