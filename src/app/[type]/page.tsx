// src/app/[type]/page.tsx
import Link from 'next/link';
import { publicContentApi } from '@/api/publicContentClient';
import { notFound } from 'next/navigation';

// Metadaten für SEO
export async function generateMetadata({ params }: { params: { type: string } }) {
  const type = params.type;
  
  // Simple metadata without requiring content type API
  return {
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} - Übersicht`,
    description: `Alle ${type} anzeigen`,
  };
}

export default async function ContentListPage({ params }: { params: { type: string } }) {
  // Extract the type parameter
  const type = params.type;
  
  try {
    // Fetch the content list
    const response = await publicContentApi.listContents(type, 1, 20);
    
    // Debug the response structure
    console.log("API Response:", JSON.stringify(response));
    
    // Safely extract items from the response, handling different possible structures
    const items = getItemsFromResponse(response);
    
    // Generate a formatted title from the slug
    const formattedTitle = type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Get pagination info with fallback values
    const currentPage = response?.page || 1;
    const totalPages = response?.total_pages || 1;
    
    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{formattedTitle}</h1>
          <p className="text-gray-600">Alle veröffentlichten Inhalte</p>
        </header>
        
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Keine Inhalte gefunden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <Link 
                key={item.id} 
                href={`/${type}/${item.slug}`}
                className="block group"
              >
                <article className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Thumbnail-Bild, falls vorhanden */}
                  {item.content?.featured_image && (
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      <img 
                        src={item.content.featured_image} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h2>
                    
                    {/* Zusammenfassung, falls vorhanden */}
                    {item.content?.summary && (
                      <p className="mt-2 text-gray-600 line-clamp-2">
                        {item.content.summary}
                      </p>
                    )}
                    
                    {/* Veröffentlichungsdatum */}
                    {item.published_at && (
                      <p className="mt-3 text-sm text-gray-500">
                        {new Date(item.published_at).toLocaleDateString('de-DE')}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
        
        {/* Pagination - only show if more than one page */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="inline-flex rounded-md shadow">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/${type}?page=${page}`}
                  className={`px-4 py-2 text-sm font-medium ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border ${page === 1 ? 'rounded-l-md' : ''} ${
                    page === totalPages ? 'rounded-r-md' : ''
                  }`}
                >
                  {page}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in ContentListPage:", error);
    return notFound();
  }
}

// Helper function to safely extract items from different response structures
function getItemsFromResponse(response: any): any[] {
  // Case 1: Response has items array
  if (response?.items && Array.isArray(response.items)) {
    return response.items;
  }
  
  // Case 2: Response is the array itself
  if (Array.isArray(response)) {
    return response;
  }
  
  // Case 3: Single item response (not in an array)
  if (response && typeof response === 'object' && response.id) {
    return [response];
  }
  
  // Default: Empty array if we can't determine the structure
  return [];
}