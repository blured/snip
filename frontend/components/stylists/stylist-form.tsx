import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useJobTitlesGrouped } from '@/hooks/use-job-titles';
import { CareerStage } from '@/types';
import type { Stylist } from '@/types';

interface StylistFormProps {
  stylist?: Stylist;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CAREER_STAGE_LABELS: Record<CareerStage, string> = {
  [CareerStage.ENTRY_LEVEL]: 'Entry Level',
  [CareerStage.EARLY_PRO]: 'Early Professional',
  [CareerStage.MID_LEVEL]: 'Mid-Level',
  [CareerStage.ADVANCED]: 'Advanced',
  [CareerStage.LEADERSHIP]: 'Leadership',
  [CareerStage.OWNERSHIP]: 'Ownership',
};

export function StylistForm({ stylist, onSubmit, onCancel, isLoading }: StylistFormProps) {
  const { grouped, jobTitles, isLoading: jobTitlesLoading } = useJobTitlesGrouped();

  const [formData, setFormData] = useState({
    user: {
      firstName: stylist?.user?.firstName || '',
      lastName: stylist?.user?.lastName || '',
      email: stylist?.user?.email || '',
      phone: stylist?.user?.phone || '',
    },
    jobTitleId: stylist?.jobTitleId || '',
    specialties: stylist?.specialties || '',
    bio: stylist?.bio || '',
    photo: stylist?.photo || '',
    hourlyRate: stylist?.hourlyRate || '',
    commissionRate: stylist?.commissionRate || '',
    active: stylist?.active ?? true,
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: Record<string, unknown> = {
      user: formData.user,
      jobTitleId: formData.jobTitleId || undefined,
      specialties: formData.specialties || undefined,
      bio: formData.bio || undefined,
      photo: formData.photo || undefined,
      active: formData.active,
    };

    if (formData.hourlyRate) {
      submitData.hourlyRate = parseFloat(String(formData.hourlyRate));
    }

    if (formData.commissionRate) {
      submitData.commissionRate = parseFloat(String(formData.commissionRate));
    }

    onSubmit(submitData);
  };

  const handleChange = (field: string, value: string | boolean) => {
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

      <Input
        label="Phone"
        type="tel"
        value={formData.user.phone}
        onChange={(e) => handleChange('user.phone', e.target.value)}
        disabled={isLoading}
        placeholder="(555) 123-4567"
      />

      {/* Job Title Selector */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Job Title
        </label>
        {jobTitlesLoading ? (
          <div className="text-sm text-gray-500">Loading job titles...</div>
        ) : (
          <select
            value={formData.jobTitleId}
            onChange={(e) => handleChange('jobTitleId', e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select a job title (optional)</option>
            {Object.entries(grouped || {}).map(([stage, titles]) => (
              <optgroup key={stage} label={CAREER_STAGE_LABELS[stage as CareerStage]}>
                {titles.map((jobTitle) => (
                  <option key={jobTitle.id} value={jobTitle.id}>
                    {jobTitle.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Photo URL
        </label>
        <input
          type="url"
          value={formData.photo}
          onChange={(e) => handleChange('photo', e.target.value)}
          disabled={isLoading}
          placeholder="https://example.com/photo.jpg"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Specialties
        </label>
        <textarea
          value={formData.specialties}
          onChange={(e) => handleChange('specialties', e.target.value)}
          disabled={isLoading}
          rows={2}
          placeholder="e.g., Haircuts, Coloring, Balayage, Highlights..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          disabled={isLoading}
          rows={3}
          placeholder="Professional biography..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Hourly Rate (€)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.hourlyRate}
            onChange={(e) => handleChange('hourlyRate', e.target.value)}
            disabled={isLoading}
            placeholder="50.00"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Commission Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.commissionRate}
            onChange={(e) => handleChange('commissionRate', e.target.value)}
            disabled={isLoading}
            placeholder="50"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
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
          Active (can accept appointments)
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
          {isLoading ? 'Saving...' : stylist ? 'Update Stylist' : 'Create Stylist'}
        </Button>
      </div>
    </form>
  );
}
