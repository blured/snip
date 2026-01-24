import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAddPayment } from '@/hooks/use-invoices';
import { PaymentMethod } from '@/types';
import type { Invoice } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: PaymentMethod.CASH, label: 'Cash' },
  { value: PaymentMethod.CREDIT_CARD, label: 'Credit Card' },
  { value: PaymentMethod.DEBIT_CARD, label: 'Debit Card' },
  { value: PaymentMethod.DIGITAL_WALLET, label: 'Digital Wallet' },
  { value: PaymentMethod.OTHER, label: 'Other' },
];

export function PaymentModal({ isOpen, onClose, invoice }: PaymentModalProps) {
  const addPayment = useAddPayment();

  const [formData, setFormData] = useState({
    amount: '',
    method: PaymentMethod.CASH,
    transactionId: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const balanceDue = invoice.total - (invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (formData.amount && parseFloat(formData.amount) > balanceDue) {
      newErrors.amount = `Amount cannot exceed balance due (€${balanceDue.toFixed(2)})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const paymentData: any = {
      amount: parseFloat(formData.amount),
      method: formData.method,
    };

    if (formData.transactionId.trim()) {
      paymentData.transactionId = formData.transactionId.trim();
    }

    if (formData.notes.trim()) {
      paymentData.notes = formData.notes.trim();
    }

    try {
      await addPayment.mutateAsync({ id: invoice.id, payment: paymentData });
      onClose();
      // Reset form
      setFormData({
        amount: '',
        method: PaymentMethod.CASH,
        transactionId: '',
        notes: '',
      });
    } catch {
      // Error handled by mutation hook
    }
  };

  const handleChange = (field: string, value: string | PaymentMethod) => {
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Payment - ${invoice.invoiceNumber}`}
    >
      <div className="mb-4 rounded-lg bg-gray-50 p-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Invoice Total:</span>
          <span className="font-medium">€{invoice.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Already Paid:</span>
          <span className="font-medium">€{(invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0).toFixed(2)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-gray-300 pt-2">
          <span className="font-semibold text-gray-900">Balance Due:</span>
          <span className="font-bold text-gray-900">€{balanceDue.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Payment Amount *"
          type="number"
          min="0.01"
          step="0.01"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          error={errors.amount}
          placeholder="0.00"
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Payment Method *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.value}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
                  formData.method === method.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={formData.method === method.value}
                  onChange={(e) => handleChange('method', e.target.value as PaymentMethod)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Input
          label="Transaction ID (optional)"
          value={formData.transactionId}
          onChange={(e) => handleChange('transactionId', e.target.value)}
          placeholder="e.g., Transaction #12345"
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={2}
            placeholder="Any additional notes..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={addPayment.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={addPayment.isPending}>
            {addPayment.isPending ? 'Processing...' : 'Add Payment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
