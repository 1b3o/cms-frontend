// src/app/admin/content-types/[id]/components/EditFieldDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form"; // Add SubmitHandler
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { contentTypeApi, ContentField, UpdateContentFieldRequest } from '@/api/contentTypeClient';

interface EditFieldDialogProps {
  contentTypeId: string;
  field: ContentField;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFieldUpdated: (field: ContentField) => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text (Kurz)' },
  { value: 'longtext', label: 'Text (Lang)' },
  { value: 'richtext', label: 'Rich Text' },
  { value: 'number', label: 'Zahl' },
  { value: 'boolean', label: 'Boolean (Ja/Nein)' },
  { value: 'date', label: 'Datum' },
  { value: 'datetime', label: 'Datum & Zeit' },
  { value: 'email', label: 'E-Mail' },
  { value: 'url', label: 'URL' },
  { value: 'select', label: 'Auswahl (Dropdown)' },
  { value: 'multiselect', label: 'Mehrfachauswahl' },
  { value: 'media', label: 'Medien' },
  { value: 'relation', label: 'Beziehung' },
  { value: 'json', label: 'JSON' },
  { value: 'code', label: 'Code' }
];

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, {
    message: "Der Name ist erforderlich.",
  }),
  slug: z.string().min(1, {
    message: "Der Slug ist erforderlich.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "Der Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.",
  }),
  field_type: z.string().min(1, {
    message: "Der Feldtyp ist erforderlich.",
  }),
  description: z.string().optional(),
  is_required: z.boolean().default(false),
  is_unique: z.boolean().default(false),
});

// Define the form values type explicitly
type FieldFormValues = z.infer<typeof formSchema>;

export function EditFieldDialog({ contentTypeId, field, open, onOpenChange, onFieldUpdated }: EditFieldDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with explicit type
  const form = useForm<FieldFormValues>({
    resolver: zodResolver<FieldFormValues>(formSchema),
    defaultValues: {
      name: field.name,
      slug: field.slug,
      field_type: field.field_type,
      description: field.description || "",
      is_required: field.is_required,
      is_unique: field.is_unique,
    },
  });

  // Update form values when field changes
  useEffect(() => {
    form.reset({
      name: field.name,
      slug: field.slug,
      field_type: field.field_type,
      description: field.description || "",
      is_required: field.is_required,
      is_unique: field.is_unique,
    });
  }, [field, form]);

  // Define submit handler with explicit SubmitHandler type
  const onSubmit: SubmitHandler<FieldFormValues> = async (values) => {
    try {
      setSubmitting(true);
      setError(null);
      
      const data: UpdateContentFieldRequest = {
        name: values.name,
        slug: values.slug,
        field_type: values.field_type,
        description: values.description,
        is_required: values.is_required,
        is_unique: values.is_unique,
      };
      
      const updatedField = await contentTypeApi.updateContentField(contentTypeId, field.id, data);
      
      // Notify parent component
      onFieldUpdated(updatedField);
    } catch (err: any) {
      console.error('Failed to update field:', err);
      setError(err.response?.data?.message || 'Fehler beim Aktualisieren des Feldes');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Feld bearbeiten</DialogTitle>
          <DialogDescription>
            Bearbeiten Sie die Eigenschaften dieses Feldes.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fehler</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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
                      placeholder="z.B. Titel, Beschreibung, Preis" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Der Name, der in Formularen angezeigt wird
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
                    <Input placeholder="z.B. titel, beschreibung, preis" {...field} />
                  </FormControl>
                  <FormDescription>
                    Der technische Name des Feldes (nur Kleinbuchstaben, Zahlen und Bindestriche)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="field_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feldtyp</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie einen Feldtyp" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FIELD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Der Datentyp des Feldes bestimmt, welche Daten gespeichert werden können
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
                  <FormLabel>Beschreibung (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Beschreiben Sie den Zweck dieses Feldes" 
                      className="min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Eine Hilfetext für Benutzer, der erklärt, wofür dieses Feld verwendet wird
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="is_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                    <div className="space-y-0.5">
                      <FormLabel>Erforderlich</FormLabel>
                      <FormDescription>
                        Ist dieses Feld erforderlich?
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
                name="is_unique"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                    <div className="space-y-0.5">
                      <FormLabel>Eindeutig</FormLabel>
                      <FormDescription>
                        Muss der Wert eindeutig sein?
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

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Speichern..." : "Änderungen speichern"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}