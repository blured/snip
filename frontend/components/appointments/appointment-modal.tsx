import { Modal } from '@/components/ui/modal';
import { AppointmentForm } from './appointment-form';
import { useCreateAppointment, useUpdateAppointment } from '@/hooks/use-appointments';
import type { Appointment } from '@/types';

interface NewAppointmentData {
  startTime: Date;
  endTime: Date;
  stylistId?: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment;
  newAppointmentData?: NewAppointmentData | null;
}

export function AppointmentModal({ isOpen, onClose, appointment, newAppointmentData }: AppointmentModalProps) {
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const isEdit = !!appointment;
  const isFromCalendar = !!newAppointmentData && !isEdit;

  const handleSubmit = async (data: any) => {
    try {
      if (isEdit && appointment) {
        await updateAppointment.mutateAsync({ id: appointment.id, data });
      } else {
        await createAppointment.mutateAsync(data);
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
      title={isEdit ? 'Edit Appointment' : 'Schedule New Appointment'}
    >
      <AppointmentForm
        appointment={appointment}
        newAppointmentData={isFromCalendar ? newAppointmentData : undefined}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={createAppointment.isPending || updateAppointment.isPending}
      />
    </Modal>
  );
}
