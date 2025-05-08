// src/app/admin/templates/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TemplateManager from '@/components/structured/admin/TemplateManager';

export default function TemplatesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Template Manager</h1>
          <p className="text-muted-foreground">
            Manage how content is displayed on the frontend
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Content Type Templates</CardTitle>
          <CardDescription>
            Assign templates to different content types to control how they are displayed on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateManager />
        </CardContent>
      </Card>
    </div>
  );
}