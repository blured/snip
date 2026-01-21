import { Modal } from '@/components/ui/modal';
import { ClientForm } from './client-form';
import { useCreateClient, useUpdateClient } from '@/hooks/use-clients';
import type { Client } from '@/types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
}

export function ClientModal({ isOpen, onClose, client }: ClientModalProps) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const isEdit = !!client;

  const handleSubmit = async (data: any) => {
    try {
      if (isEdit && client) {
        await updateClient.mutateAsync({ id: client.id, data });
      } else {
        await createClient.mutateAsync(data);
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
      title={isEdit ? 'Edit Client' : 'Add New Client'}
    >
      <ClientForm
        client={client}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={createClient.isPending || updateClient.isPending}
      />
    </Modal>
  );
}
