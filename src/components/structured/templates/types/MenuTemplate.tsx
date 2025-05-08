// src/components/structured/templates/types/MenuTemplate.tsx
import React from 'react';
import { PublicContent } from '@/api/publicContentClient';
import Link from 'next/link';

interface MenuTemplateProps {
  content: PublicContent;
}

interface MenuItem {
  id: string;
  title: string;
  url?: string;
  path?: string;
  target?: string;
  children?: MenuItem[];
}

export default function MenuTemplate({ content }: MenuTemplateProps) {
  // Extract common fields for menus
  const location = content.content.location || 'header';
  const items = content.content.items || [];
  const maxDepth = content.content.max_depth || 3;
  
  // Recursive function to render menu items
  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0 && depth < maxDepth;
    
    return (
      <li key={item.id} className={`relative group ${hasChildren ? 'has-children' : ''}`}>
        {item.url ? (
          <a
            href={item.url}
            target={item.target || '_self'}
            className="px-3 py-2 hover:text-blue-600 transition-colors"
          >
            {item.title}
          </a>
        ) : item.path ? (
          <Link href={item.path} className="px-3 py-2 hover:text-blue-600 transition-colors">
            {item.title}
          </Link>
        ) : (
          <span className="px-3 py-2">{item.title}</span>
        )}
        
        {hasChildren && (
          <ul className={`
            ${location === 'header' ? 
              'hidden group-hover:block absolute left-0 top-full bg-white shadow-md rounded-md py-2 min-w-[200px] z-10' : 
              'pl-4 mt-2 space-y-1'
            }
          `}>
            {item.children?.map(child => renderMenuItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };
  
  // Render menu based on location
  const renderMenu = () => {
    switch (location) {
      case 'header':
        return (
          <nav className="bg-white shadow-sm py-4">
            <div className="container mx-auto px-4">
              <ul className="flex space-x-1">
                {items.map(item => renderMenuItem(item))}
              </ul>
            </div>
          </nav>
        );
        
      case 'footer':
        return (
          <nav className="bg-gray-800 text-white py-8">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {items.map((item, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold mb-4">{item.title}</h3>
                    {item.children && item.children.length > 0 && (
                      <ul className="space-y-2">
                        {item.children.map(child => (
                          <li key={child.id}>
                            {child.url ? (
                              <a
                                href={child.url}
                                target={child.target || '_self'}
                                className="text-gray-300 hover:text-white transition-colors"
                              >
                                {child.title}
                              </a>
                            ) : child.path ? (
                              <Link
                                href={child.path}
                                className="text-gray-300 hover:text-white transition-colors"
                              >
                                {child.title}
                              </Link>
                            ) : (
                              <span className="text-gray-300">{child.title}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </nav>
        );
        
      case 'sidebar':
        return (
          <nav className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">{content.title}</h3>
            <ul className="space-y-1">
              {items.map(item => renderMenuItem(item))}
            </ul>
          </nav>
        );
        
      case 'mobile':
        return (
          <nav className="bg-white p-4">
            <ul className="space-y-2">
              {items.map(item => (
                <li key={item.id}>
                  {item.url ? (
                    <a
                      href={item.url}
                      target={item.target || '_self'}
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                    >
                      {item.title}
                    </a>
                  ) : item.path ? (
                    <Link
                      href={item.path}
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <span className="block px-3 py-2 font-medium">{item.title}</span>
                  )}
                  
                  {item.children && item.children.length > 0 && (
                    <ul className="pl-4 mt-1 space-y-1">
                      {item.children.map(child => (
                        <li key={child.id}>
                          {child.url ? (
                            <a
                              href={child.url}
                              target={child.target || '_self'}
                              className="block px-3 py-2 rounded hover:bg-gray-100"
                            >
                              {child.title}
                            </a>
                          ) : child.path ? (
                            <Link
                              href={child.path}
                              className="block px-3 py-2 rounded hover:bg-gray-100"
                            >
                              {child.title}
                            </Link>
                          ) : (
                            <span className="block px-3 py-2">{child.title}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        );
        
      default:
        return (
          <div className="text-gray-500">
            Unknown menu location: {location}
          </div>
        );
    }
  };

  return renderMenu();
}