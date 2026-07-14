import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, ArrowRight, Loader2, Sparkles, Eye } from 'lucide-react';
import { loginAdmin, setStoredToken, type AdminMe } from '../../Auth/api/adminAuthApi';
import { adminMeQueryKey } from '../../Auth/hooks/useAdminSession';
import { ROUTE_PATHS } from '../../../../config/routes';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const brandColor = 'oklch(70.4% 0.04 256.788)';
  const themeBg = 'oklch(70.4% 0.04 256.788)';

  const authMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginAdmin({ email: email.trim().toLowerCase(), password }),
    onSuccess: (data: { accessToken: string; admin: AdminMe }) => {
      setStoredToken(data.accessToken);
      queryClient.setQueryData(adminMeQueryKey, data.admin);
      toast.success('Login successful. Welcome back!');
      const fallback = ROUTE_PATHS.ADMIN_DASHBOARD;
      const raw = (location.state as { from?: { pathname?: string } })?.from?.pathname;
      const dest = !raw || raw.includes('/login') ? fallback : raw;
      navigate(dest, { replace: true });
    },
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    authMutation.mutate(formData);
  };

  const loginErrorMsg = authMutation.isError
    ? axios.isAxiosError(authMutation.error)
      ? authMutation.error.response?.data?.error?.message ?? authMutation.error.message
      : String(authMutation.error)
    : null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fdfdff] p-0 overflow-hidden font-['Inter',_sans-serif]">
      <main className="w-full min-h-screen flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        <div
          className="w-full lg:w-[45%] flex flex-col justify-center p-10 sm:p-20 relative text-white min-h-[35vh] lg:min-h-screen shadow-2xl z-20"
          style={{ backgroundColor: themeBg }}
        >
          <div className="relative z-10 animate-in fade-in slide-in-from-left-4 duration-1000">
            <div className="flex items-center gap-3 mb-8 lg:mb-16">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center bg-white/20 shadow-inner border border-white/10">
                <Sparkles size={24} className="text-white" />
              </div>
              <span className="text-xl lg:text-2xl font-bold tracking-tighter">Chicken Farm Management</span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6 lg:mb-8">
              Company admin{' '}
              <br />
              <span className="text-white/80">sign in.</span>
            </h2>

            <p className="text-white/60 text-base lg:text-lg max-w-sm leading-relaxed font-medium">
              Use your issued credentials. Access is enforced by role permissions on the server and
              in the app.
            </p>
          </div>

          <div className="hidden sm:block absolute top-[20%] right-[-5%] w-32 h-32 border-2 border-white/10 rounded-[2rem] rotate-12" />
          <div className="hidden sm:block absolute bottom-[10%] left-[10%] w-48 h-16 border-2 border-white/5 rounded-full -rotate-12" />
        </div>

        <div className="w-full lg:w-[55%] bg-white flex flex-col justify-center items-center p-4 sm:p-10 lg:p-20 relative min-h-[60vh] lg:min-h-screen">
          <div className="absolute top-[10%] right-[15%] w-20 h-20 border-[3px] border-blue-50/40 rounded-[1.5rem] rotate-45 pointer-events-none hidden sm:block" />

          <div className="max-w-md w-full relative z-10">
            <header className="mb-6 lg:mb-10 text-center lg:text-left">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-[#090a21] mb-2 tracking-tight">
                Sign in
              </h1>
              <p className="text-gray-400 font-medium text-xs lg:text-sm leading-relaxed">
                Chicken Farm Management admin portal — authenticates against{' '}
                {/* <span className="text-[#090a21] font-semibold">/api/v1/admin/auth/login</span> */}
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-3.5 lg:space-y-4">
              {loginErrorMsg && (
                <div
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {loginErrorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400/80 ml-1">
                  Work email
                </label>
                <div className="relative group">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--brand)] transition-colors"
                    style={{ ['--brand' as never]: brandColor }}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@company.com"
                    autoComplete="username"
                    className="w-full pl-11 pr-4 py-3 bg-[#f8f9ff] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50/30 focus:border-[var(--brand)] focus:bg-white outline-none transition-all text-[#090a21] placeholder:text-gray-300 text-sm shadow-sm hover:border-gray-200"
                    style={{ ['--brand' as never]: brandColor }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--brand)] transition-colors"
                    style={{ ['--brand' as never]: brandColor }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="············"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3 bg-[#f8f9ff] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50/30 focus:border-[var(--brand)] focus:bg-white outline-none transition-all text-[#090a21] placeholder:text-gray-300 text-sm shadow-sm hover:border-gray-200"
                    style={{ ['--brand' as never]: brandColor }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={authMutation.isPending}
                  className="w-full py-3.5 rounded-xl text-white font-bold transition-all transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 hover:opacity-90 active:shadow-inner disabled:opacity-60"
                  style={{ backgroundColor: '#1e2275' }}
                >
                  {authMutation.isPending ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <span className="text-sm uppercase tracking-widest">Sign in</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
