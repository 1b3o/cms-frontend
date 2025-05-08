// src/components/page-builder/registry/components/basic/ContentListComponent.ts
import React from 'react';

export const ContentListComponent = {
  id: 'content-list',
  name: 'Inhaltsliste',
  icon: <span className="text-xs">🗒️</span>,
  defaultProps: {
    contentType: 'article',
    limit: 5,
    orderBy: 'published_at',
    order: 'desc',
    taxonomyTerms: [],
  },
  render: (props: any, settings: any) => {
    // Note: This component would typically load content on the server
    // In a client component, you'd need to use useEffect and useState
    const { contentType = 'article', limit = 5 } = props;
    
    // This is a placeholder implementation since we can't actually fetch content here
    // In a real implementation, you would fetch content from your API
    return (
      <div 
        className="content-list"
        style={{
          margin: settings.margin || '0',
          padding: settings.padding || '0'
        }}
      >
        <div className="p-4 border border-dashed rounded-md">
          <h3 className="text-lg font-medium mb-2">Inhaltsliste: {contentType}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Zeigt die neuesten {limit} {contentType}-Einträge an
          </p>
          <div className="space-y-2">
            {Array.from({ length: Math.min(3, Number(limit)) }).map((_, index) => (
              <div key={index} className="p-2 bg-muted/30 rounded">
                <div className="h-4 w-3/4 bg-muted rounded"></div>
                <div className="h-3 w-1/2 bg-muted rounded mt-2"></div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Diese Komponente wird auf dem Server gerendert
          </p>
        </div>
      </div>
    );
  }
};