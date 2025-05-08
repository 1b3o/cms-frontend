"use client"
import React, { useState } from 'react';
import { PublicContent } from '@/api/publicContentClient';
import FieldRenderer from '@/components/structured/rendering/FieldRenderer';

interface FormTemplateProps {
  content: PublicContent;
}

export default function FormTemplate({ content }: FormTemplateProps) {
  // Extract common fields for forms
  const formTitle = content.content.form_title || content.title;
  const description = content.content.description;
  const fields = content.content.fields || [];
  const submitText = content.content.submit_text || 'Submit';
  const successMessage = content.content.success_message || 'Thank you for your submission!';
  const redirectUrl = content.content.redirect_url;
  
  const [formState, setFormState] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Handle form field changes
  const handleChange = (fieldId: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    let isValid = true;
    
    fields.forEach((field: any) => {
      if (field.required && (!formState[field.id] || formState[field.id].trim() === '')) {
        newErrors[field.id] = `${field.label} is required`;
        isValid = false;
      }
      
      if (field.type === 'email' && formState[field.id] && !/\S+@\S+\.\S+/.test(formState[field.id])) {
        newErrors[field.id] = 'Please enter a valid email address';
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, you would send the form data to your API
      // For this template, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      
      // Redirect if specified
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({
        form: 'There was an error submitting the form. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render different form field types
  const renderFormField = (field: any) => {
    const { id, type, label, placeholder, options = [] } = field;
    
    switch (type) {
      case 'text':
        return (
          <div key={id} className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              id={id}
              name={id}
              placeholder={placeholder || ''}
              value={formState[id] || ''}
              onChange={(e) => handleChange(id, e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors[id] && <p className="mt-1 text-sm text-red-600">{errors[id]}</p>}
          </div>
        );
        
      case 'email':
        return (
          <div key={id} className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              id={id}
              name={id}
              placeholder={placeholder || ''}
              value={formState[id] || ''}
              onChange={(e) => handleChange(id, e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors[id] && <p className="mt-1 text-sm text-red-600">{errors[id]}</p>}
          </div>
        );
        
      case 'textarea':
        return (
          <div key={id} className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={id}
              name={id}
              placeholder={placeholder || ''}
              value={formState[id] || ''}
              onChange={(e) => handleChange(id, e.target.value)}
              rows={5}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
            {errors[id] && <p className="mt-1 text-sm text-red-600">{errors[id]}</p>}
          </div>
        );
        
      case 'select':
        return (
          <div key={id} className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={id}
              name={id}
              value={formState[id] || ''}
              onChange={(e) => handleChange(id, e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an option</option>
              {options.map((option: any, index: number) => (
                <option key={index} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
            </select>
            {errors[id] && <p className="mt-1 text-sm text-red-600">{errors[id]}</p>}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-2">{formTitle}</h1>
        
        {description && (
          <div className="mb-6 text-gray-600">
            <FieldRenderer 
              fieldType="richtext" 
              value={description} 
            />
          </div>
        )}
        
        {isSubmitted ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-green-700">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errors.form && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700">{errors.form}</p>
              </div>
            )}
            
            {fields.map((field: any) => renderFormField(field))}
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : submitText}
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* Additional fields */}
      <div className="mt-8">
        {content.fields.map(field => {
          // Skip fields we've already processed
          if ([
            'form_title', 'description', 'fields', 'submit_text', 
            'success_message', 'redirect_url', 'notification_email'
          ].includes(field.slug)) {
            return null;
          }
          
          const fieldValue = content.content[field.slug];
          if (fieldValue === undefined || fieldValue === null) return null;
          
          return (
            <div key={field.id} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{field.name}</h3>
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