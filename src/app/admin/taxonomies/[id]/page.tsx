'use client';

import { useState, useEffect } from 'react';
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
import { AlertCircle, ArrowLeft, Save, List } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { taxonomyApi, Taxonomy, UpdateTaxonomyRequest } from '@/api/taxonomyClient';

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

type Props = {
  params: { id: string }
};

export default function EditTaxonomyPage({ params }: Props) {
  const router = useRouter();
  const [taxonomy, setTaxonomy] = useState<Taxonomy | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      is_hierarchical: false,
    },
  });

  useEffect(() => {
    loadTaxonomy();
  }, [params.id]);

  const loadTaxonomy = async () => {
    try {
      setLoading(true);
      const data = await taxonomyApi.getTaxonomy(params.id);
      setTaxonomy(data);
      
      // Formular mit Taxonomie-Daten füllen
      form.reset({
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        is_hierarchical: data.is_hierarchical,
      });
      
      setError(null);
    } catch (err: any) {
      console.error('Failed to load taxonomy:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden der Taxonomie');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      
      const data: UpdateTaxonomyRequest = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        is_hierarchical: values.is_hierarchical,
      };
      
      await taxonomyApi.updateTaxonomy(params.id, data);
      setSuccessMessage('Taxonomie erfolgreich aktualisiert');
      loadTaxonomy(); // Daten neu laden
    } catch (err: any) {
      console.error('Failed to update taxonomy:', err);
      setError(err.response?.data?.message || 'Fehler beim Aktualisieren der Taxonomie');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/taxonomies')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {loading ? 'Taxonomie bearbeiten' : `${taxonomy?.name} bearbeiten`}
          </h1>
        </div>
        
        {taxonomy && (
          <Button 
            variant="outline"
            onClick={() => router.push(`/admin/taxonomies/${params.id}/terms`)}
          >
            <List className="w-4 h-4 mr-2" />
            Begriffe verwalten
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <AlertTitle>Erfolg</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Taxonomie-Details</CardTitle>
            <CardDescription>
              Bearbeiten Sie die Eigenschaften dieser Taxonomie
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
                        <Input placeholder="z.B. Kategorien, Tags, Autoren" {...field} />
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
                        Der eindeutige Bezeichner für diese Taxonomie
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
                            <div className="mt-1 text-amber-500">
                              Hinweis: Das Ändern des Taxonomie-Typs kann bestehende Begriffe beeinflussen!
                            </div>
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
                    {submitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Speichern...
                      </span>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Änderungen speichern
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}