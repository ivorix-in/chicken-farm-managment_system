import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Building2, ChevronDown, ChevronRight, Save, Search, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { COUNTRIES, PHONE_CODE_OPTIONS } from '../../constants/countries';
import {
  createSeller,
  fetchSellerById,
  getSellerApiErrorMessage,
  updateSeller,
} from '../../api/sellersApi';
import { ROUTE_PATHS } from '../../../../../config/routes';

const QUERY_SELLERS = ['adminSellers', 'list'];

function DropdownPanel({
  open,
  anchorRef,
  menuRef,
  children,
  className = '',
  matchWidth = true,
}) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, [anchorRef]);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  if (!open) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={`fixed z-[200] rounded-lg border border-gray-200 bg-white py-1 shadow-lg shadow-gray-900/[0.12] ${className}`}
      style={{
        top: position.top,
        left: position.left,
        width: matchWidth ? position.width : undefined,
      }}
      role="listbox"
    >
      {children}
    </div>,
    document.body
  );
}

function normalizeSearch(value) {
  return value.trim().toLowerCase();
}

/** Shared seller form — create, edit, or read-only view. */
export default function SellerForm({ viewOnly = false }) {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isViewMode = viewOnly;
  const isEditMode = Boolean(sellerId) && !isViewMode;

  const sellerQuery = useQuery({
    queryKey: ['adminSellers', 'detail', sellerId],
    queryFn: () => fetchSellerById(sellerId),
    enabled: Boolean(sellerId),
  });

  // Form State
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [phoneCode, setPhoneCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sellerType, setSellerType] = useState('individual');
  const [formHydrated, setFormHydrated] = useState(false);

  // Custom Dropdown Open States
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [codeDropdownOpen, setCodeDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [codeSearch, setCodeSearch] = useState('');

  const countryFieldRef = useRef(null);
  const countryButtonRef = useRef(null);
  const countryMenuRef = useRef(null);
  const countrySearchRef = useRef(null);
  const codeFieldRef = useRef(null);
  const codeButtonRef = useRef(null);
  const codeMenuRef = useRef(null);
  const codeSearchRef = useRef(null);

  const filteredCountries = useMemo(() => {
    const query = normalizeSearch(countrySearch);
    if (!query) return [...COUNTRIES];
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.replace(/\s/gu, '').includes(query.replace(/\s/gu, ''))
    );
  }, [countrySearch]);

  const filteredPhoneCodes = useMemo(() => {
    const query = normalizeSearch(codeSearch);
    if (!query) return PHONE_CODE_OPTIONS;
    return PHONE_CODE_OPTIONS.filter(
      ({ code, countries }) =>
        code.replace(/\s/gu, '').includes(query.replace(/\s/gu, '')) ||
        countries.some((name) => name.toLowerCase().includes(query))
    );
  }, [codeSearch]);

  useEffect(() => {
    function handleClickOutside(event) {
      const target = event.target;
      const inCountry =
        countryFieldRef.current?.contains(target) || countryMenuRef.current?.contains(target);
      const inCode = codeFieldRef.current?.contains(target) || codeMenuRef.current?.contains(target);

      if (!inCountry) setCountryDropdownOpen(false);
      if (!inCode) setCodeDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (countryDropdownOpen) {
      setCodeDropdownOpen(false);
      setCountrySearch('');
      requestAnimationFrame(() => countrySearchRef.current?.focus());
    }
  }, [countryDropdownOpen]);

  useEffect(() => {
    if (codeDropdownOpen) {
      setCountryDropdownOpen(false);
      setCodeSearch('');
      requestAnimationFrame(() => codeSearchRef.current?.focus());
    }
  }, [codeDropdownOpen]);

  useEffect(() => {
    if (!sellerId || !sellerQuery.data || formHydrated) return;
    const s = sellerQuery.data;
    setFirstName(s.firstName);
    setSecondName(s.lastName);
    setEmail(s.email ?? '');
    setSelectedCountry(s.country);
    setPhoneCode(s.phoneCode);
    setPhoneNumber(s.phoneNumber);
    setSellerType(s.sellerType);
    setFormHydrated(true);
  }, [sellerId, sellerQuery.data, formHydrated]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        firstName: firstName.trim(),
        lastName: secondName.trim(),
        email: email.trim(),
        country: selectedCountry,
        phoneCode,
        phoneNumber: phoneNumber.trim(),
        sellerType,
        ...(password.trim() ? { password: password.trim() } : {}),
      };
      if (isEditMode && sellerId) {
        return updateSeller(sellerId, payload);
      }
      return createSeller({ ...payload, password: password.trim() });
    },
    onSuccess: (seller) => {
      void qc.invalidateQueries({ queryKey: QUERY_SELLERS });
      toast.success(
        isEditMode
          ? `Seller "${seller.firstName} ${seller.lastName}" updated successfully!`
          : `Seller "${seller.firstName} ${seller.lastName}" created successfully!`
      );
      navigate(ROUTE_PATHS.ADMIN_SELLERS);
    },
    onError: (err) => {
      toast.error(
        getSellerApiErrorMessage(
          err,
          isEditMode ? 'Unable to update seller' : 'Unable to create seller'
        )
      );
    },
  });

  const formReadOnly = isViewMode || saveMutation.isPending;
  const pageTitle = isViewMode
    ? 'View seller'
    : isEditMode
      ? 'Edit seller'
      : 'Create New Seller';
  const pageDescription = isViewMode
    ? 'Review seller details in read-only mode.'
    : isEditMode
      ? 'Update seller information and type.'
      : 'Enter the details of the new seller';

  const handleCountrySelect = (countryName, defaultCode) => {
    setSelectedCountry(countryName);
    setPhoneCode(defaultCode);
    setCountrySearch('');
    setCountryDropdownOpen(false);
  };

  const handlePhoneCodeSelect = (code) => {
    setPhoneCode(code);
    setCodeSearch('');
    setCodeDropdownOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isViewMode) return;
    if (
      !firstName.trim() ||
      !secondName.trim() ||
      !email.trim() ||
      !selectedCountry ||
      !phoneNumber.trim()
    ) {
      toast.error('Please fill in all required fields marked with *');
      return;
    }
    if (!isEditMode && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!isEditMode && password.trim().length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (isEditMode && password.trim() && password.trim().length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    saveMutation.mutate();
  };

  if (sellerId && !sellerQuery.isLoading && !sellerQuery.data) {
    return (
      <div className="space-y-4 font-sans text-[#1C1C1C]">
        <p className="text-sm text-gray-500">Seller not found or no longer available.</p>
        <Link
          to={ROUTE_PATHS.ADMIN_SELLERS}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-[13px] font-medium text-[#1C1C1C] shadow-sm hover:bg-[#FAFAFA]"
        >
          Back to sellers
        </Link>
      </div>
    );
  }

  const inputClass =
    'font-sans w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-[13px] font-normal text-[#1C1C1C] shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-gray-900/10';
  const labelClass = 'font-sans text-[13px] font-medium text-[#1C1C1C]';
  const selectBtnClass =
    'font-sans flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-normal text-[#1C1C1C] shadow-sm outline-none transition-colors hover:border-gray-300 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300';
  const dropdownSearchClass =
    'font-sans w-full h-9 rounded-md border border-gray-200 bg-gray-50/80 pl-8 pr-3 text-[13px] text-[#1C1C1C] outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-900/10';

  return (
    <div className="animate-in fade-in space-y-6 duration-300 sm:space-y-7 font-sans text-[#1C1C1C]">
      <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <header className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-[#1C1C1C] sm:text-[1.65rem] sm:leading-snug">
              {pageTitle}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{pageDescription}</p>
            <nav className="mt-2 flex items-center gap-2 text-[12px] font-normal text-gray-500">
              <Link to={ROUTE_PATHS.ADMIN_SELLERS} className="transition-colors hover:text-[#1C1C1C]">
                Sellers
              </Link>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="font-medium text-[#1C1C1C]">{pageTitle}</span>
            </nav>
          </header>
          <Link
            to={ROUTE_PATHS.ADMIN_SELLERS}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-[13px] font-medium text-[#1C1C1C] shadow-sm transition-colors hover:bg-[#FAFAFA]"
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden />
            Back to sellers
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 font-sans">
          
          {/* Section 1: Seller Information */}
          <section className="rounded-xl border border-gray-200/90 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gray-50/90 px-5 py-3.5">
              <h2 className="text-[14px] font-semibold tracking-tight text-[#1C1C1C]">Seller Information</h2>
              <p className="mt-0.5 text-[12px] font-normal leading-snug text-gray-500">
                Enter the details of the new seller
              </p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-6">
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className={inputClass}
                    disabled={formReadOnly}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>
                    Second Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={secondName}
                    onChange={(e) => setSecondName(e.target.value)}
                    placeholder="Enter second name"
                    className={inputClass}
                    disabled={formReadOnly}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className={labelClass} htmlFor="seller-email">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="seller-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seller@example.com"
                    className={inputClass}
                    disabled={formReadOnly}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5" ref={countryFieldRef}>
                  <label className={labelClass}>
                    Country <span className="text-red-500">*</span>
                  </label>
                  <button
                    ref={countryButtonRef}
                    type="button"
                    onClick={() => !formReadOnly && setCountryDropdownOpen((open) => !open)}
                    className={selectBtnClass}
                    aria-expanded={countryDropdownOpen}
                    aria-haspopup="listbox"
                    disabled={formReadOnly}
                  >
                    <span>{selectedCountry}</span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <DropdownPanel
                    open={countryDropdownOpen && !formReadOnly}
                    anchorRef={countryButtonRef}
                    menuRef={countryMenuRef}
                    className="flex max-h-72 flex-col overflow-hidden p-0"
                  >
                    <div className="sticky top-0 border-b border-gray-100 bg-white p-2">
                      <div className="relative">
                        <Search
                          size={14}
                          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                          aria-hidden
                        />
                        <input
                          ref={countrySearchRef}
                          type="search"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          placeholder="Search country or code…"
                          className={dropdownSearchClass}
                          aria-label="Search countries"
                        />
                      </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto custom-scrollbar py-1">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            role="option"
                            aria-selected={selectedCountry === c.name}
                            onClick={() => handleCountrySelect(c.name, c.code)}
                            className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left font-sans text-[13px] font-normal text-[#1C1C1C] transition-colors hover:bg-[#FAFAFA]"
                          >
                            <span>{c.name}</span>
                            <span className="shrink-0 text-[11px] text-gray-500">{c.code}</span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-4 text-center font-sans text-[12px] text-gray-500">
                          No countries found
                        </p>
                      )}
                    </div>
                  </DropdownPanel>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div ref={codeFieldRef}>
                      <button
                        ref={codeButtonRef}
                        type="button"
                        onClick={() => !formReadOnly && setCodeDropdownOpen((open) => !open)}
                        className={`${selectBtnClass} w-24 px-2.5`}
                        aria-expanded={codeDropdownOpen}
                        aria-haspopup="listbox"
                        disabled={formReadOnly}
                      >
                        <span>{phoneCode}</span>
                        <ChevronDown size={14} className="text-gray-400" />
                      </button>
                      <DropdownPanel
                        open={codeDropdownOpen && !formReadOnly}
                        anchorRef={codeButtonRef}
                        menuRef={codeMenuRef}
                        matchWidth
                        className="flex min-w-[12rem] max-h-72 flex-col overflow-hidden p-0"
                      >
                        <div className="sticky top-0 border-b border-gray-100 bg-white p-2">
                          <div className="relative">
                            <Search
                              size={14}
                              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                              aria-hidden
                            />
                            <input
                              ref={codeSearchRef}
                              type="search"
                              value={codeSearch}
                              onChange={(e) => setCodeSearch(e.target.value)}
                              onKeyDown={(e) => e.stopPropagation()}
                              placeholder="Search code or country…"
                              className={dropdownSearchClass}
                              aria-label="Search phone codes"
                            />
                          </div>
                        </div>
                        <div className="max-h-52 overflow-y-auto custom-scrollbar py-1">
                          {filteredPhoneCodes.length > 0 ? (
                            filteredPhoneCodes.map(({ code, countries }) => (
                              <button
                                key={code}
                                type="button"
                                role="option"
                                aria-selected={phoneCode === code}
                                onClick={() => handlePhoneCodeSelect(code)}
                                className="flex w-full cursor-pointer flex-col gap-0.5 px-3 py-2 text-left font-sans transition-colors hover:bg-[#FAFAFA]"
                              >
                                <span className="text-[13px] font-medium text-[#1C1C1C]">{code}</span>
                                <span className="truncate text-[11px] text-gray-500">
                                  {countries.join(', ')}
                                </span>
                              </button>
                            ))
                          ) : (
                            <p className="px-3 py-4 text-center font-sans text-[12px] text-gray-500">
                              No codes found
                            </p>
                          )}
                        </div>
                      </DropdownPanel>
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter phone number"
                      className={`${inputClass} flex-1`}
                      disabled={formReadOnly}
                    />
                  </div>
                </div>

                {!isEditMode ? (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className={labelClass} htmlFor="seller-password">
                      Password{' '}
                      {!isEditMode && !isViewMode ? <span className="text-red-500">*</span> : null}
                    </label>
                    {isViewMode ? (
                      <div
                        className={`${inputClass} flex items-center text-gray-500`}
                        aria-label="Password hidden"
                      >
                        ••••••••••••
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          id="seller-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={
                            'Create a secure password (min. 8 characters)'
                          }
                          className={`${inputClass} pr-10`}
                          disabled={formReadOnly}
                          autoComplete="new-password"
                          aria-describedby="seller-password-help"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          disabled={formReadOnly}
                        >
                          {showPassword ? (
                            <EyeOff size={16} strokeWidth={1.75} aria-hidden />
                          ) : (
                            <Eye size={16} strokeWidth={1.75} aria-hidden />
                          )}
                        </button>
                      </div>
                    )}
                    {!isViewMode ? (
                      <p id="seller-password-help" className="text-[11px] leading-snug text-gray-500">
                        {'Used for seller portal login. Use at least 8 characters.'}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {/* Section 2: Seller Type */}
          <section className="rounded-xl border border-gray-200/90 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gray-50/90 px-5 py-3.5">
              <h2 className="text-[14px] font-semibold tracking-tight text-[#1C1C1C]">Seller Type</h2>
              <p className="mt-0.5 text-[12px] font-normal leading-snug text-gray-500">
                Select the type of seller
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <div
                onClick={() => !formReadOnly && setSellerType('individual')}
                className={`group relative rounded-lg border p-4 transition-colors ${
                  formReadOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  sellerType === 'individual'
                    ? 'border-gray-900/20 bg-[#F4F4F5] ring-2 ring-gray-900/10'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-[#FAFAFA]'
                }`}
              >
                <div
                  className={`absolute left-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                    sellerType === 'individual' ? 'border-[#1C1C1C]' : 'border-gray-300'
                  }`}
                >
                  {sellerType === 'individual' && (
                    <div className="h-2.5 w-2.5 rounded-full bg-[#1C1C1C]" />
                  )}
                </div>

                <div className="mt-7 flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      sellerType === 'individual'
                        ? 'bg-[#1C1C1C] text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <User size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-sans text-[13px] font-semibold text-[#1C1C1C]">Individual Seller</h3>
                    <p className="mt-1 font-sans text-[12px] font-normal leading-snug text-gray-500">
                      For individuals who want to sell products on the platform.
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => !formReadOnly && setSellerType('business')}
                className={`group relative rounded-lg border p-4 transition-colors ${
                  formReadOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  sellerType === 'business'
                    ? 'border-gray-900/20 bg-[#F4F4F5] ring-2 ring-gray-900/10'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-[#FAFAFA]'
                }`}
              >
                <div
                  className={`absolute left-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                    sellerType === 'business' ? 'border-[#1C1C1C]' : 'border-gray-300'
                  }`}
                >
                  {sellerType === 'business' && (
                    <div className="h-2.5 w-2.5 rounded-full bg-[#1C1C1C]" />
                  )}
                </div>

                <div className="mt-7 flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      sellerType === 'business'
                        ? 'bg-[#1C1C1C] text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Building2 size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-sans text-[13px] font-semibold text-[#1C1C1C]">Business Seller</h3>
                    <p className="mt-1 font-sans text-[12px] font-normal leading-snug text-gray-500">
                      For businesses and companies selling on the platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(ROUTE_PATHS.ADMIN_SELLERS)}
              className="font-sans inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-[13px] font-medium text-[#1C1C1C] shadow-sm transition-colors hover:bg-[#FAFAFA]"
            >
              {isViewMode ? 'Back to sellers' : 'Cancel'}
            </button>
            {!isViewMode ? (
              <button
                type="submit"
                disabled={saveMutation.isPending || (isEditMode && sellerQuery.isLoading)}
                className="font-sans inline-flex h-10 items-center gap-2 rounded-xl bg-[#1C1C1C] px-4 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-black/90 disabled:opacity-60"
              >
                <Save size={16} strokeWidth={1.5} />
                {isEditMode ? 'Save changes' : 'Create Seller'}
              </button>
            ) : null}
          </div>

        </form>
      </div>
    </div>
  );
}