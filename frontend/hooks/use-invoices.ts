import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '@/lib/api/invoices';
import toast from 'react-hot-toast';
import type { Invoice } from '@/types';

const INVOICES_QUERY_KEY = ['invoices'] as const;

export function useInvoices(params?: { clientId?: string; status?: string }) {
  return useQuery({
    queryKey: [...INVOICES_QUERY_KEY, params],
    queryFn: () => invoicesApi.getAll(),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: [...INVOICES_QUERY_KEY, id],
    queryFn: () => invoicesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => invoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      toast.success('Invoice created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      invoicesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...INVOICES_QUERY_KEY, variables.id] });
      toast.success('Invoice updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update invoice');
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete invoice');
    },
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payment }: { id: string; payment: any }) =>
      invoicesApi.addPayment(id, payment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...INVOICES_QUERY_KEY, variables.id] });
      toast.success('Payment added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add payment');
    },
  });
}

export function useMarkAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.markAsPaid(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...INVOICES_QUERY_KEY, variables] });
      toast.success('Invoice marked as paid');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark as paid');
    },
  });
}
