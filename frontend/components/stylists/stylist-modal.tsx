import { Modal } from '@/components/ui/modal';
import { StylistForm } from './stylist-form';
import { useCreateStylist, useUpdateStylist } from '@/hooks/use-stylists';
import type { Stylist } from '@/types';

interface StylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  stylist?: Stylist;
}

export function StylistModal({ isOpen, onClose, stylist }: StylistModalProps) {
  const createStylist = useCreateStylist();
  const updateStylist = useUpdateStylist();

  const isEdit = !!stylist;

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      if (isEdit && stylist) {
        await updateStylist.mutateAsync({ id: stylist.id, data });
      } else {
        await createStylist.mutateAsync(data);
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
      title={isEdit ? 'Edit Stylist' : 'Add New Stylist'}
    >
      <StylistForm
        stylist={stylist}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={createStylist.isPending || updateStylist.isPending}
      />
    </Modal>
  );
}
