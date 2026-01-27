import { Client } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Mail, Phone, User, Calendar, Key } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onChangePassword?: (client: Client) => void;
  onClick: (client: Client) => void;
}

export function ClientCard({ client, onEdit, onDelete, onChangePassword, onClick }: ClientCardProps) {
  const clientName = `${client.user.firstName} ${client.user.lastName}`;
  const initials = `${client.user.firstName[0]}${client.user.lastName[0]}`;

  return (
    <div
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md"
      onClick={() => onClick(client)}
    >
      {/* Card Header - Avatar and Basic Info */}
      <div className="relative bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-bold text-white shadow-md ring-4 ring-white">
              {initials}
            </div>
          </div>

          {/* Name and Status */}
          <div className="flex-1 pt-1">
            <h3 className="text-xl font-bold text-gray-900">{clientName}</h3>
            {client.user.email && (
              <p className="mt-1 text-sm text-gray-600">{client.user.email}</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={client.user.active ? 'success' : 'neutral'} className="text-xs">
                {client.user.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(client)}
              className="h-8 w-8 rounded-lg p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {onChangePassword && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChangePassword(client)}
                className="h-8 w-8 rounded-lg p-0 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
              >
                <Key className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(client)}
              className="h-8 w-8 rounded-lg p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Card Body - Details */}
      <div className="p-4">
        {/* Contact Info */}
        <div className="mb-3 space-y-2">
          {client.user.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{client.user.phone}</span>
            </div>
          )}
          {client.preferredStylist && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4 text-gray-400" />
              <span>
                Preferred: {client.preferredStylist.user.firstName} {client.preferredStylist.user.lastName}
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        {client.notes && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">{client.notes}</p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>Client since {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
