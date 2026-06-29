import { Loader2 } from 'lucide-react';

/** Loading state while `/auth/me` resolves (mirrors e-learning `AuthRouteFallback`). */
export function AuthRouteFallback() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#fdfdff] text-[#090a21]">
      <Loader2 className="size-10 animate-spin text-[oklch(70.4%_0.04_256.788)]" aria-hidden />
      <span className="sr-only">Loading session</span>
      <span className="text-sm font-medium text-gray-400">Signing you in...</span>
    </div>
  );
}
