import { useEffect, useRef } from 'react';
import { X, Mail, Phone, Globe, Building2, User, Calendar, LogIn } from 'lucide-react';
import { formatSellerPhone } from '../../types/seller';

/**
 * Professional seller details modal — displays seller information
 * in a modern, enterprise-level design with smooth animations.
 */
export default function SellerDetailsModal({
  seller,
  open = false,
  onClose,
  onEdit,
}) {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (backdropRef.current === event.target) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open || !seller) return null;

  const initials = `${seller.firstName[0]}${seller.lastName[0]}`.toUpperCase();
  const createdDate = new Date(seller.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const updatedDate = new Date(seller.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const sellerTypeDisplay = seller.sellerType === 'individual' ? 'Individual Seller' : 'Business Seller';

  const infoRow = (icon, label, value, copyable = false) => (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">{label}</p>
        <p
          className={`text-[13px] font-medium text-[#1C1C1C] ${
            copyable ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''
          }`}
          title={copyable ? 'Click to copy' : undefined}
        >
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop Overlay with Blur */}
      <div
        ref={backdropRef}
        className={`fixed top-0 left-0 right-0 bottom-0 z-40 pointer-events-auto transition-all duration-300 ${
          open
            ? 'bg-black/50 backdrop-blur-md'
            : 'bg-black/0 backdrop-blur-0 pointer-events-none'
        }`}
        style={{
          WebkitBackdropFilter: open ? 'blur(12px)' : 'none',
          backdropFilter: open ? 'blur(12px)' : 'none',
        }}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 pointer-events-auto ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 ${
            open ? 'scale-100' : 'scale-95'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Close modal"
          >
            <X size={20} strokeWidth={2} />
          </button>

          {/* Header Section with Avatar */}
          <div className="border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white px-6 py-8">
            <div className="flex items-start gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 text-2xl font-semibold text-white shadow-md">
                {initials}
              </div>

              {/* Header Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-[#1C1C1C] sm:text-2xl">
                      {seller.firstName} {seller.lastName}
                    </h2>
                    <p className="mt-1 text-[13px] text-gray-500">{seller.email}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                      {seller.sellerType === 'individual' ? 'Individual' : 'Business'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8">
            {/* Two-column layout */}
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {infoRow(
                    <Mail size={14} className="text-gray-400" />,
                    'Email',
                    seller.email
                  )}
                  {infoRow(
                    <Phone size={14} className="text-gray-400" />,
                    'Phone',
                    formatSellerPhone(seller)
                  )}
                  {infoRow(
                    <Globe size={14} className="text-gray-400" />,
                    'Country',
                    seller.country
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">
                  Account Details
                </h3>
                <div className="space-y-3">
                  {infoRow(
                    <Building2 size={14} className="text-gray-400" />,
                    'Seller Type',
                    sellerTypeDisplay
                  )}
                  {infoRow(
                    <Calendar size={14} className="text-gray-400" />,
                    'Member Since',
                    createdDate
                  )}
                  {infoRow(
                    <LogIn size={14} className="text-gray-400" />,
                    'Last Updated',
                    updatedDate
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-100" />

            {/* Additional Info */}
            <div className="rounded-xl bg-gray-50/50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
                  <User size={14} className="text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Seller ID
                  </p>
                  <p className="mt-1 font-mono text-[12px] text-gray-600">{seller.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Close
            </button>

            {onEdit && (
              <button
                onClick={() => {
                  onEdit(seller);
                  onClose();
                }}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#1C1C1C] px-4 text-[13px] font-medium text-white transition-colors hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              >
                Edit Seller
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
