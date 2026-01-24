import { Stylist } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Mail, Phone, Calendar, Star } from 'lucide-react';

interface StylistCardProps {
  stylist: Stylist;
  onEdit: (stylist: Stylist) => void;
  onDelete: (stylist: Stylist) => void;
  onClick: (stylist: Stylist) => void;
}

export function StylistCard({ stylist, onEdit, onDelete, onClick }: StylistCardProps) {
  const stylistName = `${stylist.user.firstName} ${stylist.user.lastName}`;
  const initials = `${stylist.user.firstName[0]}${stylist.user.lastName[0]}`;

  return (
    <div
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md"
      onClick={() => onClick(stylist)}
    >
      {/* Card Header - Photo and Basic Info */}
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {stylist.photo ? (
              <img
                src={stylist.photo}
                alt={stylistName}
                className="h-20 w-20 rounded-2xl object-cover shadow-md ring-4 ring-white"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white shadow-md ring-4 ring-white">
                {initials}
              </div>
            )}
          </div>

          {/* Name and Status */}
          <div className="flex-1 pt-1">
            <h3 className="text-xl font-bold text-gray-900">{stylistName}</h3>
            {stylist.specialties && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{stylist.specialties}</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={stylist.active ? 'success' : 'neutral'} className="text-xs">
                {stylist.active ? 'Active' : 'Inactive'}
              </Badge>
              {stylist.hourlyRate && (
                <span className="text-xs font-semibold text-gray-700">
                  ${stylist.hourlyRate.toFixed(2)}/hr
                </span>
              )}
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
              onClick={() => onEdit(stylist)}
              className="h-8 w-8 rounded-lg p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(stylist)}
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
          {stylist.user.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="truncate">{stylist.user.email}</span>
            </div>
          )}
          {stylist.user.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{stylist.user.phone}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {stylist.bio && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">{stylist.bio}</p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>Member since {new Date(stylist.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>
          {stylist.commissionRate && (
            <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{stylist.commissionRate}% commission</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
