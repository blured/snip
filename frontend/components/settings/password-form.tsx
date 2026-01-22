import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth';
import toast from 'react-hot-toast';

interface PasswordFormProps {
  onCancel: () => void;
}

export function PasswordForm({ onCancel }: PasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await authApi.changePassword(formData.currentPassword, formData.newPassword);

      toast.success('Password changed successfully');
      onCancel();

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrors({ currentPassword: error.response.data?.message || 'Current password is incorrect' });
      } else {
        toast.error(error.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

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
        label="Current Password *"
        type="password"
        value={formData.currentPassword}
        onChange={(e) => handleChange('currentPassword', e.target.value)}
        error={errors.currentPassword}
        disabled={isLoading}
        placeholder="Enter your current password"
        required
      />

      <Input
        label="New Password *"
        type="password"
        value={formData.newPassword}
        onChange={(e) => handleChange('newPassword', e.target.value)}
        error={errors.newPassword}
        disabled={isLoading}
        placeholder="Enter your new password (min. 6 characters)"
        required
      />

      <Input
        label="Confirm New Password *"
        type="password"
        value={formData.confirmPassword}
        onChange={(e) => handleChange('confirmPassword', e.target.value)}
        error={errors.confirmPassword}
        disabled={isLoading}
        placeholder="Confirm your new password"
        required
      />

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
          {isLoading ? 'Changing...' : 'Change Password'}
        </Button>
      </div>
    </form>
  );
}
