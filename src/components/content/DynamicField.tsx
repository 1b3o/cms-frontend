// src/components/content/DynamicField.tsx
'use client';

import { useFormContext } from "react-hook-form";
import { ContentField } from "@/api/contentTypeClient";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import dynamic from "next/dynamic";

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-32 w-full border rounded-md bg-muted/20"></div>,
});

interface DynamicFieldProps {
  field: ContentField;
  name: string;
  disabled?: boolean;
}

// Helper function to ensure values are never null/undefined for form inputs
const ensureValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

export function DynamicField({ field, name, disabled = false }: DynamicFieldProps) {
  const { control, formState } = useFormContext();

  // Helper to check if field is required in validation rules
  const isRequired = field.is_required;

  // Get possible select options from validation rules
  const getSelectOptions = () => {
    if (field.validation_rules && typeof field.validation_rules === 'object') {
      const rules = field.validation_rules as any;
      if (Array.isArray(rules.options)) {
        return rules.options;
      }
    }
    return [];
  };

  // Render field based on type
  const renderFieldInput = (fieldProps: any) => {
    const value = fieldProps.value;
    
    switch (field.field_type) {
      case 'text':
        return (
          <Input
            placeholder={`${field.name} eingeben`}
            {...fieldProps}
            value={ensureValue(fieldProps.value)}
            disabled={disabled}
          />
        );
      
      case 'longtext':
        return (
          <Textarea
            placeholder={`${field.name} eingeben`}
            className="min-h-[120px]"
            {...fieldProps}
            value={ensureValue(fieldProps.value)}
            disabled={disabled}
          />
        );
      
      case 'richtext':
        return (
          <RichTextEditor
            value={value || ''}
            onChange={fieldProps.onChange}
            disabled={disabled}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            placeholder="0"
            {...fieldProps}
            value={ensureValue(fieldProps.value)}
            onChange={(e) => fieldProps.onChange(e.target.valueAsNumber || null)}
            disabled={disabled}
          />
        );
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={!!value}
              onCheckedChange={fieldProps.onChange}
              disabled={disabled}
            />
            <span className="text-sm text-muted-foreground">
              {value ? "Aktiviert" : "Deaktiviert"}
            </span>
          </div>
        );
      
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={`w-full justify-start text-left font-normal ${!value && "text-muted-foreground"}`}
                disabled={disabled}
              >
                {value ? (
                  format(new Date(value), "PPP", { locale: de })
                ) : (
                  <span>Datum auswählen</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => fieldProps.onChange(date?.toISOString() || null)}
                initialFocus
                disabled={disabled}
              />
            </PopoverContent>
          </Popover>
        );
      
      case 'select':
        const options = getSelectOptions();
        return (
          <Select
            value={ensureValue(value)}
            onValueChange={fieldProps.onChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={`${field.name} auswählen`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any, index: number) => (
                <SelectItem
                  key={index}
                  value={typeof option === 'object' ? option.value : option}
                >
                  {typeof option === 'object' ? option.label : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'multiselect':
        // For multiselect, handle array values
        const multiOptions = getSelectOptions();
        return (
          <div className="space-y-2">
            {multiOptions.map((option: any, index: number) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              
              const isChecked = Array.isArray(value) 
                ? value.includes(optionValue)
                : false;
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${name}-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const newValue = Array.isArray(value) ? [...value] : [];
                      if (checked) {
                        if (!newValue.includes(optionValue)) {
                          newValue.push(optionValue);
                        }
                      } else {
                        const idx = newValue.indexOf(optionValue);
                        if (idx !== -1) {
                          newValue.splice(idx, 1);
                        }
                      }
                      fieldProps.onChange(newValue);
                    }}
                    disabled={disabled}
                  />
                  <label
                    htmlFor={`${name}-${index}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {optionLabel}
                  </label>
                </div>
              );
            })}
          </div>
        );
      
      case 'email':
        return (
          <Input
            type="email"
            placeholder="email@example.com"
            {...fieldProps}
            value={ensureValue(fieldProps.value)}
            disabled={disabled}
          />
        );
      
      case 'url':
        return (
          <Input
            type="url"
            placeholder="https://example.com"
            {...fieldProps}
            value={ensureValue(fieldProps.value)}
            disabled={disabled}
          />
        );
      
      case 'code':
        return (
          <Textarea
            placeholder={`${field.name} Code eingeben`}
            className="min-h-[200px] font-mono text-sm"
            {...fieldProps}
            value={ensureValue(fieldProps.value)}
            disabled={disabled}
          />
        );
      
      default:
        return (
          <Input
            placeholder={`${field.name} eingeben`}
            {...fieldProps}
            value={ensureValue(fieldProps.value)}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.name}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {renderFieldInput({
              ...formField,
              value: formField.value === undefined 
                ? field.default_value || null 
                : formField.value,
            })}
          </FormControl>
          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}