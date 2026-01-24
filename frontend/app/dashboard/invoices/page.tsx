'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { InvoiceModal } from '@/components/invoices/invoice-modal';
import { PaymentModal } from '@/components/invoices/payment-modal';
import { useInvoices, useDeleteInvoice, useMarkAsPaid } from '@/hooks/use-invoices';
import { Plus, Pencil, Trash2, Search, Banknote, Eye, X } from 'lucide-react';
import type { Invoice, InvoiceStatus } from '@/types';
import { format } from 'date-fns';

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  DRAFT: 'neutral',
  PENDING: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'neutral',
};

export default function InvoicesPage() {
  const router = useRouter();
  const { data: invoices, isLoading, error } = useInvoices();
  const deleteInvoice = useDeleteInvoice();
  const markAsPaid = useMarkAsPaid();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();

  const filteredInvoices = invoices?.filter((invoice) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.client.user.firstName.toLowerCase().includes(searchLower) ||
      invoice.client.user.lastName.toLowerCase().includes(searchLower) ||
      invoice.client.user.email.toLowerCase().includes(searchLower)
    );

    const matchesStatus = !statusFilter || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) ?? [];

  const handleMarkAsPaid = async (invoice: Invoice) => {
    if (confirm(`Mark invoice ${invoice.invoiceNumber} as paid?`)) {
      try {
        await markAsPaid.mutateAsync(invoice.id);
      } catch {
        // Error handled by mutation hook
      }
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      try {
        await deleteInvoice.mutateAsync(invoice.id);
      } catch {
        // Error handled by mutation hook
      }
    }
  };

  const totalPaid = (invoice: Invoice) => {
    return invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  };

  const balanceDue = (invoice: Invoice) => {
    return invoice.total - totalPaid(invoice);
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Billing and payment management</p>
        </div>
        <Button onClick={() => { setSelectedInvoice(undefined); setShowModal(true); }} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Invoices ({invoices?.length ?? 0})</CardTitle>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading invoices...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Failed to load invoices</div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">
                {searchQuery || statusFilter ? 'No invoices match your filters.' : 'No invoices yet. Create your first invoice to get started.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    clickable
                    onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                  >
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      {invoice.client.user.firstName} {invoice.client.user.lastName}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>€{invoice.total.toFixed(2)}</TableCell>
                    <TableCell>€{totalPaid(invoice).toFixed(2)}</TableCell>
                    <TableCell className={balanceDue(invoice) > 0 ? 'font-medium text-red-600' : ''}>
                      €{balanceDue(invoice).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[invoice.status] || 'neutral'}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.status !== 'PAID' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedInvoice(invoice); setShowPaymentModal(true); }}
                              title="Add Payment"
                            >
                              <Banknote className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsPaid(invoice)}
                              title="Mark as Paid"
                            >
                              <Banknote className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedInvoice(invoice); setShowModal(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(invoice)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedInvoice(undefined); }}
        invoice={selectedInvoice}
      />

      {/* Payment Modal */}
      {selectedInvoice && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => { setShowPaymentModal(false); setSelectedInvoice(undefined); }}
          invoice={selectedInvoice}
        />
      )}
    </DashboardLayout>
  );
}
