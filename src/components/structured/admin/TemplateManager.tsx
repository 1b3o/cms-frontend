// src/components/admin/templates/TemplateManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { contentTypeApi, ContentType } from '@/api/contentTypeClient';

// Template options that can be assigned to content types
const AVAILABLE_TEMPLATES = [
  { id: 'default', name: 'Default Template' },
  { id: 'article', name: 'Article Template' },
  { id: 'page', name: 'Page Template' },
  { id: 'product', name: 'Product Template' },
  { id: 'event', name: 'Event Template' },
  { id: 'team_member', name: 'Team Member Template' },
  { id: 'testimonial', name: 'Testimonial Template' },
  { id: 'faq', name: 'FAQ Template' },
  { id: 'widget', name: 'Widget Template' },
  { id: 'portfolio', name: 'Portfolio Template' },
  { id: 'form', name: 'Form Template' },
  { id: 'menu', name: 'Menu Template' },
  { id: 'gallery', name: 'Gallery Template' },
  { id: 'landing_page', name: 'Landing Page Template' }
];

export default function TemplateManager() {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [templateAssignments, setTemplateAssignments] = useState<Record<string, string>>({});

  useEffect(() => {
    loadContentTypes();
  }, []);

  const loadContentTypes = async () => {
    try {
      setLoading(true);
      const types = await contentTypeApi.getAllContentTypes();
      setContentTypes(types);
      
      // Initialize template assignments from content type UI config
      const assignments: Record<string, string> = {};
      types.forEach(type => {
        if (type.ui_config?.template) {
          assignments[type.id] = type.ui_config.template;
        } else {
          assignments[type.id] = type.slug; // Default to same as slug
        }
      });
      
      setTemplateAssignments(assignments);
    } catch (err: any) {
      console.error('Failed to load content types:', err);
      setError(err.response?.data?.message || 'Error loading content types');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (contentTypeId: string, templateId: string) => {
    setTemplateAssignments(prev => ({
      ...prev,
      [contentTypeId]: templateId
    }));
  };

  const saveTemplateAssignments = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      // Save template assignments to each content type
      for (const contentTypeId in templateAssignments) {
        const contentType = contentTypes.find(ct => ct.id === contentTypeId);
        if (contentType) {
          const uiConfig = contentType.ui_config || {};
          
          await contentTypeApi.updateContentType(contentTypeId, {
            ui_config: {
              ...uiConfig,
              template: templateAssignments[contentTypeId]
            }
          });
        }
      }
      
      setSuccess('Template assignments saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to save template assignments:', err);
      setError(err.response?.data?.message || 'Error saving template assignments');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading template manager...</p>
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Template Manager</h1>
          <p className="text-muted-foreground">
            Assign templates to different content types
          </p>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Content Type Templates</CardTitle>
          <CardDescription>
            Select which template should be used for each content type
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {contentTypes.map(contentType => (
              <div key={contentType.id} className="flex items-center gap-4">
                <div className="w-1/3 font-medium">{contentType.name}</div>
                <div className="flex-1">
                  <Select
                    value={templateAssignments[contentType.id] || contentType.slug}
                    onValueChange={(value) => handleTemplateChange(contentType.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_TEMPLATES.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button onClick={saveTemplateAssignments}>
            Save Template Assignments
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}