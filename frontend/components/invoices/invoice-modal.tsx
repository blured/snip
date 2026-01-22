import { Modal } from '@/components/ui/modal';
import { InvoiceForm } from './invoice-form';
import { useCreateInvoice, useUpdateInvoice } from '@/hooks/use-invoices';
import type { Invoice } from '@/types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice;
}

export function InvoiceModal({ isOpen, onClose, invoice }: InvoiceModalProps) {
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  const isEdit = !!invoice;

  const handleSubmit = async (data: any) => {
    try {
      if (isEdit && invoice) {
        await updateInvoice.mutateAsync({ id: invoice.id, data });
      } else {
        await createInvoice.mutateAsync(data);
      }
      onClose();
    } catch {
      // Error is handled by the mutation hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Invoice' : 'Create New Invoice'}
    >
      <div className="max-h-[70vh] overflow-y-auto">
        <InvoiceForm
          invoice={invoice}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={createInvoice.isPending || updateInvoice.isPending}
        />
      </div>
    </Modal>
  );
}
