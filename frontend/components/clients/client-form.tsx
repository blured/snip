import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStylists } from '@/hooks/use-stylists';
import type { Client } from '@/types';

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ClientForm({ client, onSubmit, onCancel, isLoading }: ClientFormProps) {
  const { data: stylists } = useStylists();

  const [formData, setFormData] = useState({
    user: {
      firstName: client?.user?.firstName || '',
      lastName: client?.user?.lastName || '',
      email: client?.user?.email || '',
      phone: client?.user?.phone || '',
    },
    password: '',
    dateOfBirth: client?.dateOfBirth ? client.dateOfBirth.split('T')[0] : '',
    preferredStylistId: client?.preferredStylistId || '',
    notes: client?.notes || '',
    allergies: client?.allergies || '',
    preferredProducts: client?.preferredProducts || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.user.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.user.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.user.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!client && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Format date for API if provided
    const submitData: any = {
      user: formData.user,
      preferredStylistId: formData.preferredStylistId || undefined,
      notes: formData.notes || undefined,
      allergies: formData.allergies || undefined,
      preferredProducts: formData.preferredProducts || undefined,
    };

    // Only include password when creating a new client
    if (!client && formData.password) {
      submitData.password = formData.password;
    }

    if (formData.dateOfBirth) {
      submitData.dateOfBirth = new Date(formData.dateOfBirth).toISOString();
    }

    onSubmit(submitData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      if (field.startsWith('user.')) {
        const userField = field.replace('user.', '');
        return {
          ...prev,
          user: {
            ...prev.user,
            [userField]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });

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
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name *"
          value={formData.user.firstName}
          onChange={(e) => handleChange('user.firstName', e.target.value)}
          error={errors.firstName}
          disabled={isLoading}
          required
        />
        <Input
          label="Last Name *"
          value={formData.user.lastName}
          onChange={(e) => handleChange('user.lastName', e.target.value)}
          error={errors.lastName}
          disabled={isLoading}
          required
        />
      </div>

      <Input
        label="Email *"
        type="email"
        value={formData.user.email}
        onChange={(e) => handleChange('user.email', e.target.value)}
        error={errors.email}
        disabled={isLoading}
        required
      />

      {!client && (
        <Input
          label="Password *"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          disabled={isLoading}
          placeholder="Min 6 characters"
          required
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Phone"
          type="tel"
          value={formData.user.phone}
          onChange={(e) => handleChange('user.phone', e.target.value)}
          disabled={isLoading}
          placeholder="(555) 123-4567"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Preferred Stylist
        </label>
        <select
          value={formData.preferredStylistId}
          onChange={(e) => handleChange('preferredStylistId', e.target.value)}
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">No preference</option>
          {stylists?.filter((s) => s.active).map((stylist) => (
            <option key={stylist.id} value={stylist.id}>
              {stylist.user.firstName} {stylist.user.lastName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          disabled={isLoading}
          rows={3}
          placeholder="Any additional notes about the client..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Allergies
        </label>
        <textarea
          value={formData.allergies}
          onChange={(e) => handleChange('allergies', e.target.value)}
          disabled={isLoading}
          rows={2}
          placeholder="Any known allergies..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Preferred Products
        </label>
        <textarea
          value={formData.preferredProducts}
          onChange={(e) => handleChange('preferredProducts', e.target.value)}
          disabled={isLoading}
          rows={2}
          placeholder="Products the client prefers..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
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
          {isLoading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
}
