// src/components/page-builder/registry/components/basic/ButtonComponent.ts
import React from 'react';

export const ButtonComponent = {
  id: 'button',
  name: 'Button',
  icon: <span className="text-xs rounded border px-1">BTN</span>,
  defaultProps: {
    text: 'Klick mich',
    link: '#',
    variant: 'primary',
    size: 'default'
  },
  render: (props: any, settings: any) => {
    const { text = 'Button', link = '#', variant = 'primary', size = 'default' } = props;
    
    // Classes based on variant
    const variantClasses = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground'
    };
    
    // Classes based on size
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs',
      default: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg'
    };
    
    const buttonClassName = `inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
      variantClasses[variant as keyof typeof variantClasses] || variantClasses.primary
    } ${
      sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default
    }`;
    
    return (
      <div
        style={{
          margin: settings.margin || '0',
          padding: settings.padding || '0',
          textAlign: settings.textAlign as React.CSSProperties['textAlign'] || 'left'
        }}
      >
        <a 
          href={link}
          className={buttonClassName}
        >
          {text}
        </a>
      </div>
    );
  }
};