import { useState } from 'react';
import type { FormEvent } from 'react';
import { displayPermissionLabel } from '../../../../lib/permissionLabels';
import {
  Loader2,
  Shield,
  ShieldCheck,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';

export type AdminRoleLite = {
  id: string;
  name: string;
  code: string;
  permissions?: unknown;
};

function permissionsToStrings(p: unknown): string[] {
  if (Array.isArray(p)) return p.filter((x): x is string => typeof x === 'string');
  return [];
}

export type RoleModalProps = {
  mode: 'create' | 'edit';
  role: AdminRoleLite | null;
  catalog: string[];
  catalogLoading: boolean;
  saving: boolean;
  submitError: string | null;
  onClose: () => void;
  onSubmit: (payload: { name: string; code: string; permissions: string[] }) => void;
};

export default function RoleModal({
  mode,
  role,
  catalog,
  catalogLoading,
  saving,
  submitError,
  onClose,
  onSubmit,
}: RoleModalProps) {
  const initialList = permissionsToStrings(role?.permissions);

  const [name, setName] = useState(() => role?.name ?? '');
  const [code, setCode] = useState(() => role?.code ?? '');
  const [selected, setSelected] = useState(() => {
    if (initialList.includes('*')) return new Set<string>();
    return new Set<string>(initialList);
  });
  const [fullAccess, setFullAccess] = useState(() => initialList.includes('*'));

  const togglePerm = (key: string) => {
    setFullAccess(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllIndividual = () => {
    setFullAccess(false);
    setSelected(new Set(catalog));
  };

  const clearIndividual = () => {
    setFullAccess(false);
    setSelected(new Set());
  };

  const handleToggleFullAccess = () => {
    setFullAccess((v) => {
      const next = !v;
      if (next) setSelected(new Set());
      return next;
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const permissions = fullAccess ? ['*'] : [...selected];
    onSubmit({
      name: name.trim(),
      code: code.trim(),
      permissions,
    });
  };

  const codeEditable = mode === 'create';

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-modal-title"
    >
      <div className="w-full max-w-[500px] max-h-[90vh] flex flex-col rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="flex flex-col space-y-1.5 p-6 pb-4 relative">
          <h2 id="role-modal-title" className="text-[16px] font-semibold leading-none tracking-tight text-slate-950">
            {mode === 'create' ? 'Create Role' : 'Edit Role'}
          </h2>
          <p className="text-[13px] text-slate-500">
            Define access control permissions for this role.
          </p>
          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(saving)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-2 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {submitError ? (
              <div
                className="rounded-md border border-red-500/50 text-red-500 bg-red-50/50 px-4 py-3 text-[13px] font-medium"
                role="alert"
              >
                {submitError}
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-[13px] font-medium leading-none text-slate-950 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Display Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Operations Manager"
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-[13px] shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={Boolean(saving)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium leading-none text-slate-950 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Identifier Code
                </label>
                {!codeEditable ? (
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Locked</span>
                ) : null}
              </div>
              <input
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/[^A-Za-z0-9_]/gu, '').toUpperCase())
                }
                placeholder="OPERATIONS_MANAGER"
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-[13px] font-mono shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                pattern="^[A-Z][A-Z0-9_]*$"
                required
                disabled={Boolean(saving) || !codeEditable}
                title="Uppercase letters, digits, underscore"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium leading-none text-slate-950">Permissions</label>
              </div>
              <div className="rounded-md border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={handleToggleFullAccess}
                  disabled={catalogLoading || Boolean(saving)}
                  className={`flex w-full items-start gap-3 px-3 py-3 text-left transition-colors disabled:opacity-50 ${fullAccess ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                >
                  <div className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border ${fullAccess ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-transparent text-transparent'}`}>
                    <CheckSquare size={12} className={`opacity-0 transition-opacity ${fullAccess ? 'opacity-100' : ''}`} style={{ strokeWidth: 3 }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-none text-slate-950">Grant Full Access (*)</p>
                    <p className="text-[12px] text-slate-500 mt-1.5 leading-snug">
                      Wildcard access equivalent to super-admin.
                    </p>
                  </div>
                </button>

                <div className="px-3 pb-3 border-t border-slate-100">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[12px] font-medium text-slate-500">Specific permissions</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={catalogLoading || fullAccess}
                        onClick={selectAllIndividual}
                        className="text-[12px] font-medium text-slate-600 hover:text-slate-950 disabled:pointer-events-none disabled:opacity-40"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300 text-[12px]">—</span>
                      <button
                        type="button"
                        disabled={catalogLoading || fullAccess}
                        onClick={clearIndividual}
                        className="text-[12px] font-medium text-slate-600 hover:text-slate-950 disabled:pointer-events-none disabled:opacity-40"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {catalogLoading ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-[13px] text-slate-500">
                      <Loader2 className="size-4 animate-spin text-slate-400" aria-hidden />
                      <span>Loading catalog...</span>
                    </div>
                  ) : (
                    <fieldset disabled={fullAccess || Boolean(saving)} className="space-y-0 min-h-0">
                      <div className="grid max-h-[180px] gap-0 overflow-y-auto custom-scrollbar">
                        {(catalog ?? []).map((perm) => {
                          const isSelected = selected.has(perm);
                          return (
                            <label
                              key={perm}
                              className={`flex items-start gap-2.5 rounded-md px-2 py-2 cursor-pointer transition-colors ${fullAccess ? 'opacity-50 grayscale' : 'hover:bg-slate-100/50'}`}
                            >
                              <div className="mt-0.5 relative flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  className="peer sr-only"
                                  checked={isSelected}
                                  disabled={fullAccess || Boolean(saving)}
                                  onChange={() => togglePerm(perm)}
                                />
                                <div className={`size-4 rounded-[4px] border flex items-center justify-center transition-colors ${isSelected ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-transparent text-transparent'}`}>
                                  <CheckSquare size={12} className={`opacity-0 transition-opacity ${isSelected ? 'opacity-100' : ''}`} style={{ strokeWidth: 3 }} />
                                </div>
                              </div>
                              <div className="flex flex-col min-w-0 leading-none space-y-1 mt-0.5">
                                <span className={`text-[13px] font-medium leading-none ${isSelected ? 'text-slate-950' : 'text-slate-700'}`}>
                                  {displayPermissionLabel(perm)}
                                </span>
                                <span className="font-mono text-[11px] text-slate-500 leading-none">
                                  {perm}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      {!catalog?.length ? (
                        <div className="py-4 text-center rounded-md border border-dashed border-slate-200">
                           <p className="text-[13px] text-slate-500">No permissions available.</p>
                        </div>
                      ) : null}
                    </fieldset>
                  )}
                </div>
              </div>
            </div>
          </div>

          <footer className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-6 py-4 mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={Boolean(saving)}
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-950 shadow-sm hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 mt-2 sm:mt-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(saving) || !name.trim() || !code.trim()}
              className="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-[13px] font-medium text-slate-50 shadow hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Saving...
                </>
              ) : mode === 'create' ? (
                'Create Role'
              ) : (
                'Save changes'
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
