// src/components/templates/ProductTemplate.tsx
import React from 'react';
import { PublicContent } from '@/api/publicContentClient';
import FieldRenderer from '@/components/fields/FieldRenderer';
import Image from 'next/image';

interface ProductTemplateProps {
  content: PublicContent;
}

export default function ProductTemplate({ content }: ProductTemplateProps) {
  // Extract common fields for products
  const productImage = content.content.product_image;
  const gallery = content.content.gallery || [];
  const price = content.content.price;
  const discountPrice = content.content.discount_price;
  const description = content.content.description;
  const features = content.content.features || [];
  const specifications = content.content.specifications || {};
  const sku = content.content.sku;
  const stock = content.content.stock;
  const categories = content.content.categories || [];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  // Calculate discount percentage
  const discountPercentage = price && discountPrice 
    ? Math.round(((price - discountPrice) / price) * 100) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Product Images */}
        <div className="w-full lg:w-1/2">
          {productImage ? (
            <div className="rounded-lg overflow-hidden mb-4">
              <Image 
                src={productImage} 
                alt={content.title}
                width={600}
                height={600}
                className="w-full object-cover"
              />
            </div>
          ) : (
            <div className="rounded-lg bg-gray-100 flex items-center justify-center h-96">
              <span className="text-gray-400">Kein Bild verfügbar</span>
            </div>
          )}

          {/* Image Gallery */}
          {Array.isArray(gallery) && gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {gallery.map((image: string, index: number) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <Image 
                    src={image} 
                    alt={`${content.title} - Bild ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full object-cover h-24"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
          
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category: string, index: number) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {category}
                </span>
              ))}
            </div>
          )}
          
          {/* Pricing */}
          <div className="mt-6 mb-8">
            {price && (
              <div className="flex items-baseline">
                {discountPrice ? (
                  <>
                    <span className="text-3xl font-bold text-red-600 mr-2">
                      {formatCurrency(discountPrice)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatCurrency(price)}
                    </span>
                    <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      {discountPercentage}% Rabatt
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">
                    {formatCurrency(price)}
                  </span>
                )}
              </div>
            )}
            
            {/* Stock information */}
            {stock !== undefined && (
              <div className={`mt-2 ${Number(stock) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Number(stock) > 0 ? 'Auf Lager' : 'Nicht verfügbar'}
                {Number(stock) > 0 && stock <= 10 && ` (Nur noch ${stock} verfügbar)`}
              </div>
            )}
            
            {sku && (
              <div className="text-sm text-gray-500 mt-2">
                SKU: {sku}
              </div>
            )}
          </div>
          
          {/* Description */}
          {description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Beschreibung</h2>
              <div className="prose prose-sm max-w-none">
                <FieldRenderer 
                  fieldType="richtext" 
                  value={description} 
                  config={{}} 
                />
              </div>
            </div>
          )}
          
          {/* Features */}
          {Array.isArray(features) && features.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Features</h2>
              <ul className="list-disc pl-5 space-y-1">
                {features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Specifications */}
          {specifications && Object.keys(specifications).length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Technische Daten</h2>
              <div className="border rounded-md overflow-hidden">
                {Object.entries(specifications).map(([key, value], index) => (
                  <div 
                    key={index} 
                    className={`flex border-b last:border-b-0 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <div className="w-1/3 px-4 py-3 font-medium">{key}</div>
                    <div className="w-2/3 px-4 py-3">{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add to cart button */}
          <div className="mt-8">
            <button 
              className={`w-full py-3 px-6 rounded-lg font-medium 
                ${Number(stock) > 0 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              disabled={!stock || Number(stock) <= 0}
            >
              In den Warenkorb
            </button>
          </div>
        </div>
      </div>
      
      {/* Additional content */}
      <div className="mt-16">
        {content.fields.map(field => {
          // Skip fields that we've already processed
          if ([
            'product_image', 'gallery', 'price', 'discount_price', 
            'description', 'features', 'specifications', 'sku', 
            'stock', 'categories'
          ].includes(field.slug)) {
            return null;
          }
          
          const fieldValue = content.content[field.slug];
          if (fieldValue === undefined || fieldValue === null) return null;
          
          return (
            <div key={field.id} className="mb-8">
              <h3 className="text-xl font-semibold mb-3">{field.name}</h3>
              <FieldRenderer 
                fieldType={field.field_type} 
                value={fieldValue} 
                config={field.ui_config || {}} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}