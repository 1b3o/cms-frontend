// src/components/page-builder/core/PublicFrontendRenderer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { FrontendRenderer } from './FrontendRenderer';
import { PageBuilderSchema } from './PageBuilderEditor';
import { registerAllComponents } from '../registry/components';

interface PublicFrontendRendererProps {
  layout: PageBuilderSchema;
  className?: string;
}

export function PublicFrontendRenderer({ layout, className }: PublicFrontendRendererProps) {
  const [componentsRegistered, setComponentsRegistered] = useState(false);
  
  // Register components on first render
  useEffect(() => {
    registerAllComponents();
    setComponentsRegistered(true);
  }, []);
  
  // Show a loading state until components are registered
  if (!componentsRegistered) {
    return <div className="p-4">Loading components...</div>;
  }
  
  return <FrontendRenderer layout={layout} className={className} />;
}