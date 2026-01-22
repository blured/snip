import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Service } from '@/types';

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const COMMON_CATEGORIES = [
  'Haircuts',
  'Coloring',
  'Styling',
  'Treatments',
  'Extensions',
  'Men\'s Services',
  'Bridal',
  'Other',
];

export function ServiceForm({ service, onSubmit, onCancel, isLoading }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || '',
    durationMinutes: service?.durationMinutes || '',
    basePrice: service?.basePrice || '',
    active: service?.active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    if (!formData.durationMinutes || parseInt(String(formData.durationMinutes)) < 1) {
      newErrors.durationMinutes = 'Duration must be at least 1 minute';
    }
    if (!formData.basePrice || parseFloat(String(formData.basePrice)) < 0) {
      newErrors.basePrice = 'Price must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: any = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      durationMinutes: parseInt(String(formData.durationMinutes)),
      basePrice: parseFloat(String(formData.basePrice)),
      active: formData.active,
    };

    if (formData.description.trim()) {
      submitData.description = formData.description.trim();
    }

    onSubmit(submitData);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Service Name *"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        disabled={isLoading}
        placeholder="e.g., Women's Haircut"
        required
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Category *
        </label>
        <div className="flex gap-2">
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            disabled={isLoading}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select or type category</option>
            {COMMON_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            disabled={isLoading}
            placeholder="Or type custom category"
            className={`flex-1 rounded-lg border px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Duration (minutes) *
          </label>
          <input
            type="number"
            min="1"
            value={formData.durationMinutes}
            onChange={(e) => handleChange('durationMinutes', e.target.value)}
            disabled={isLoading}
            placeholder="30"
            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.durationMinutes ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.durationMinutes && <p className="mt-1 text-sm text-red-600">{errors.durationMinutes}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Base Price ($) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.basePrice}
            onChange={(e) => handleChange('basePrice', e.target.value)}
            disabled={isLoading}
            placeholder="50.00"
            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.basePrice ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.basePrice && <p className="mt-1 text-sm text-red-600">{errors.basePrice}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          disabled={isLoading}
          rows={3}
          placeholder="Describe the service..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => handleChange('active', e.target.checked)}
          disabled={isLoading}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="active" className="text-sm font-medium text-gray-700">
          Active (available for booking)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
}
