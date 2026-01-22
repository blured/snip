import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/use-clients';
import { useServices } from '@/hooks/use-services';
import type { Invoice, InvoiceItem, Service } from '@/types';
import { Trash2, Plus } from 'lucide-react';

interface InvoiceFormProps {
  invoice?: Invoice;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface InvoiceItemInput {
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export function InvoiceForm({ invoice, onSubmit, onCancel, isLoading }: InvoiceFormProps) {
  const { data: clients } = useClients();
  const { data: services } = useServices();

  const [formData, setFormData] = useState({
    clientId: invoice?.clientId || '',
    appointmentId: invoice?.appointmentId || '',
    dueDate: invoice?.dueDate ? invoice.dueDate.split('T')[0] : '',
    notes: invoice?.notes || '',
    tax: invoice?.tax || 0,
    tip: invoice?.tip || 0,
    discount: invoice?.discount || 0,
  });

  const [items, setItems] = useState<InvoiceItemInput[]>(
    invoice?.items?.map((item) => ({
      serviceId: item.serviceId || undefined,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })) || [{ description: '', quantity: 1, unitPrice: 0 }]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const total = subtotal + formData.tax + formData.tip - formData.discount;

  // Update items when service is selected
  const updateItem = (index: number, field: keyof InvoiceItemInput, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // If service is selected, auto-fill description and price
    if (field === 'serviceId') {
      const service = services?.find((s: Service) => s.id === value);
      if (service) {
        newItems[index].description = service.name;
        newItems[index].unitPrice = service.basePrice;
      }
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }

    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    } else {
      items.forEach((item, index) => {
        if (!item.description.trim()) {
          newErrors[`item-${index}-description`] = 'Description is required';
        }
        if (item.quantity < 1) {
          newErrors[`item-${index}-quantity`] = 'Quantity must be at least 1';
        }
        if (item.unitPrice < 0) {
          newErrors[`item-${index}-unitPrice`] = 'Price must be positive';
        }
      });
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
      clientId: formData.clientId,
      items: items.map((item) => ({
        serviceId: item.serviceId || null,
        description: item.description.trim(),
        quantity: parseInt(String(item.quantity)),
        unitPrice: parseFloat(String(item.unitPrice)),
      })),
      tax: formData.tax || undefined,
      tip: formData.tip || undefined,
      discount: formData.discount || undefined,
      notes: formData.notes || undefined,
    };

    if (formData.appointmentId) {
      submitData.appointmentId = formData.appointmentId;
    }

    if (formData.dueDate) {
      submitData.dueDate = new Date(formData.dueDate).toISOString();
    }

    onSubmit(submitData);
  };

  const handleChange = (field: string, value: string | number) => {
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
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Client *
        </label>
        <select
          value={formData.clientId}
          onChange={(e) => handleChange('clientId', e.target.value)}
          disabled={isLoading}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.clientId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a client</option>
          {clients?.map((client) => (
            <option key={client.id} value={client.id}>
              {client.user.firstName} {client.user.lastName}
            </option>
          ))}
        </select>
        {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
      </div>

      {/* Invoice Items */}
      <div>
        <div className="flex items-center justify-between">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Line Items *
          </label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addItem}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="rounded-lg border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">Service (optional)</label>
                  <select
                    value={item.serviceId || ''}
                    onChange={(e) => updateItem(index, 'serviceId', e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select service...</option>
                    {services?.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ${service.basePrice.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    disabled={isLoading}
                    className={`w-full rounded-lg border px-2 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors[`item-${index}-quantity`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Unit Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    className={`w-full rounded-lg border px-2 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors[`item-${index}-unitPrice`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  disabled={isLoading}
                  placeholder="Item description"
                  className={`w-full rounded-lg border px-2 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors[`item-${index}-description`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors[`item-${index}-description`] && (
                  <p className="mt-1 text-xs text-red-600">{errors[`item-${index}-description`]}</p>
                )}
              </div>
              <div className="mt-1 text-right text-xs text-gray-500">
                Line Total: ${(item.quantity * item.unitPrice).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        {errors.items && <p className="mt-1 text-sm text-red-600">{errors.items}</p>}
      </div>

      {/* Totals */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Tax</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.tax}
                onChange={(e) => handleChange('tax', parseFloat(e.target.value) || 0)}
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Tip</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.tip}
                onChange={(e) => handleChange('tip', parseFloat(e.target.value) || 0)}
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Discount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={(e) => handleChange('discount', parseFloat(e.target.value) || 0)}
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex justify-between border-t border-gray-300 pt-2">
            <span className="text-sm font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          disabled={isLoading}
          rows={2}
          placeholder="Any additional notes..."
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
          {isLoading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}
