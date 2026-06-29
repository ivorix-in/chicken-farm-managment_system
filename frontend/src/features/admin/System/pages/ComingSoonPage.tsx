import { Hammer, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '../../../../config/routes';

type ComingSoonPageProps = {
  title: string;
  description?: string;
};

/** Unified placeholder while modules are wired to APIs. */
export default function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  const accent = 'oklch(70.4% 0.04 256.788)';
  const copy =
    description ??
    `The ${title} workspace is scaffolded — connect services and dashboards here once backend routes are exposed.`;

  return (
    <div className="max-w-[720px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div
        className="rounded-[2rem] border border-gray-100 bg-white px-10 py-16 text-center shadow-xl shadow-gray-950/[0.04]"
        style={{ boxShadow: `0 32px 64px -12px ${accent}33` }}
      >
        <div
          className="mx-auto mb-10 flex size-24 items-center justify-center rounded-[2rem] shadow-lg"
          style={{ backgroundColor: accent }}
          aria-hidden
        >
          <Rocket className="size-11 text-white" strokeWidth={1.75} />
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.55em] text-gray-400 mb-4 inline-flex items-center gap-2">
          <Hammer size={13} aria-hidden strokeWidth={2.4} /> Roadmap preview
        </p>

        <h1 className="text-[2.05rem] sm:text-[2.25rem] font-extrabold text-[#090a21] tracking-tight mb-5">{title}</h1>

        <p className="text-[15px] text-gray-500 leading-relaxed font-medium mb-12 px-1">{copy}</p>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-4">
          <Link
            className="w-full sm:w-auto rounded-xl px-7 py-3.5 text-sm font-bold border border-gray-100 bg-[#fdfdff] text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            to={ROUTE_PATHS.ADMIN_DASHBOARD}
          >
            Back to overview
          </Link>
          <span
            className="w-full sm:w-auto rounded-xl px-7 py-3.5 text-sm font-bold text-white opacity-90 cursor-default text-center shrink-0"
            style={{ backgroundColor: '#1e2275' }}
          >
            Interface locked • API pending
          </span>
        </div>
      </div>

      <div className="mt-14 flex justify-center">
        <div className="h-px w-[min(440px,100%)] bg-gradient-to-r from-transparent via-gray-300/95 to-transparent" />
      </div>

      <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 mt-9">
        Chicken Farm Management admin shell v0.1
      </p>
    </div>
  );
}
