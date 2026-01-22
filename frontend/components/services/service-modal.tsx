import { Modal } from '@/components/ui/modal';
import { ServiceForm } from './service-form';
import { useCreateService, useUpdateService } from '@/hooks/use-services';
import type { Service } from '@/types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service;
}

export function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
  const createService = useCreateService();
  const updateService = useUpdateService();

  const isEdit = !!service;

  const handleSubmit = async (data: any) => {
    try {
      if (isEdit && service) {
        await updateService.mutateAsync({ id: service.id, data });
      } else {
        await createService.mutateAsync(data);
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
      title={isEdit ? 'Edit Service' : 'Add New Service'}
    >
      <ServiceForm
        service={service}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={createService.isPending || updateService.isPending}
      />
    </Modal>
  );
}
