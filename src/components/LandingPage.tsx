import React from 'react';
import {
  ArrowRight,
  Cpu,
  Eye,
  FilePlus2,
  GitBranch,
  LayoutGrid,
  Palette,
  Play,
  Save,
  Send,
  type LucideIcon,
} from 'lucide-react';

interface LandingPageProps {
  /** Name of the project saved in this browser, if any. */
  savedProjectName: string | null;
  onContinue: () => void;
  onOpenSample: () => void;
  onStartBlank: () => void;
}

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}

const FEATURES: Feature[] = [
  {
    icon: LayoutGrid,
    title: 'Drag & drop HMI blocks',
    description: 'Compose scanner inputs, metrics, status badges and tables on a fixed-size kiosk artboard.',
    accent: 'text-blue-400',
  },
  {
    icon: Palette,
    title: 'ISA-101 ready themes',
    description: 'Deep slate and night charcoal palettes tuned for glare-free shop-floor screens.',
    accent: 'text-indigo-400',
  },
  {
    icon: GitBranch,
    title: 'Station topology graph',
    description: 'See how stations connect and wire up navigation between them in one click.',
    accent: 'text-amber-400',
  },
  {
    icon: Play,
    title: 'Test run mode',
    description: 'Switch to a live operator runtime to enter data and record production batches.',
    accent: 'text-rose-400',
  },
  {
    icon: Send,
    title: 'Publish anywhere',
    description: 'Share a live link or download a self-contained HTML file of the whole site.',
    accent: 'text-emerald-400',
  },
  {
    icon: Save,
    title: 'Auto-saved locally',
    description: 'Every change is stored in your browser, so you can close the tab and pick up later.',
    accent: 'text-sky-400',
  },
];

const ActionButton: React.FC<{
  icon: LucideIcon;
  label: string;
  hint?: string;
  variant: 'primary' | 'secondary';
  onClick: () => void;
}> = ({ icon: Icon, label, hint, variant, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex items-center gap-3 px-4 py-3 text-left border transition-colors ${
      variant === 'primary'
        ? 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white'
        : 'bg-stone-900 hover:bg-stone-800 border-stone-800 text-stone-200'
    }`}
  >
    <Icon className="w-4 h-4 shrink-0" />
    <span className="flex flex-col">
      <span className="text-sm font-bold leading-tight">{label}</span>
      {hint && (
        <span
          className={`text-[11px] leading-tight mt-0.5 ${
            variant === 'primary' ? 'text-blue-100/80' : 'text-stone-400'
          }`}
        >
          {hint}
        </span>
      )}
    </span>
    <ArrowRight className="w-4 h-4 ml-auto opacity-60 transition-transform group-hover:translate-x-0.5" />
  </button>
);

/** Decorative mini kiosk that hints at what the studio produces. */
const KioskPreview: React.FC = () => (
  <div
    aria-hidden="true"
    className="w-full max-w-md bg-[#18181B] border border-stone-800 ring-1 ring-white/5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)]"
  >
    <div className="h-7 px-3 flex items-center justify-between bg-[#121316] border-b border-stone-800 text-[10px] text-stone-400">
      <span className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="font-bold uppercase tracking-wide text-stone-200">CTC Auto Log</span>
      </span>
      <span className="font-mono">1280 × 800</span>
    </div>
    <div className="p-6 flex flex-col items-center gap-5">
      <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 border border-emerald-800">
        ● RUNNING
      </span>
      <div className="text-lg font-extrabold text-white tracking-tight">Scan Carrier Barcode</div>
      <div className="w-full h-12 bg-white flex items-center px-3 font-mono text-sm text-black border-2 border-black">
        SN-7849-B2
        <span className="ml-1 w-px h-5 bg-black animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-2 w-full">
        {['Torque', 'Temp', 'Cycle'].map((label, i) => (
          <div key={label} className="p-2 bg-stone-900 border border-stone-800">
            <div className="text-[9px] text-stone-400">{label}</div>
            <div className="text-sm font-mono font-bold text-white">{[42.5, 68, 12][i]}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({
  savedProjectName,
  onContinue,
  onOpenSample,
  onStartBlank,
}) => (
  <div className="min-h-screen w-screen overflow-y-auto bg-[#0F1013] text-stone-100 bg-[radial-gradient(#27272A_1px,transparent_1px)] [background-size:24px_24px]">
    <header className="h-14 px-6 flex items-center gap-2 border-b border-stone-800/90 bg-[#0F1014]/90 backdrop-blur">
      <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center">
        <Cpu className="w-4 h-4" />
      </div>
      <span className="text-sm font-extrabold tracking-tight">CECI</span>
      <span className="text-sm text-stone-500">MES Studio</span>
    </header>

    <main className="max-w-6xl mx-auto px-6 py-14 sm:py-20">
      <section className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold text-blue-300 bg-blue-950/50 border border-blue-900/80">
            <Eye className="w-3 h-3" />
            VISUAL KIOSK BUILDER
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Design shop-floor terminals,{' '}
            <span className="text-blue-400">visually.</span>
          </h1>
          <p className="mt-5 text-base text-stone-400 max-w-xl leading-relaxed">
            Build operator screens for MES and HMI kiosks, link stations together, test them as an
            operator would, and publish — all in your browser, with nothing to install.
          </p>

          <div className="mt-8 flex flex-col gap-2.5 max-w-md">
            {savedProjectName !== null && (
              <ActionButton
                variant="primary"
                icon={Play}
                label="Continue where you left off"
                hint={savedProjectName}
                onClick={onContinue}
              />
            )}
            <ActionButton
              variant={savedProjectName === null ? 'primary' : 'secondary'}
              icon={Cpu}
              label="Open the CTC Auto Log sample"
              hint="A ready-made carrier scanning station"
              onClick={onOpenSample}
            />
            <ActionButton
              variant="secondary"
              icon={FilePlus2}
              label="Start a blank project"
              hint="One empty station to build from scratch"
              onClick={onStartBlank}
            />
          </div>
          {savedProjectName !== null && (
            <p className="mt-3 text-[11px] text-stone-500 max-w-md">
              Opening the sample or a blank project replaces the project saved in this browser.
            </p>
          )}
        </div>

        <div className="flex justify-center lg:justify-end">
          <KioskPreview />
        </div>
      </section>

      <section className="mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-800/80 border border-stone-800/80">
        {FEATURES.map(({ icon: Icon, title, description, accent }) => (
          <div key={title} className="bg-[#121316] p-5">
            <Icon className={`w-5 h-5 ${accent}`} />
            <h2 className="mt-3 text-sm font-bold text-white">{title}</h2>
            <p className="mt-1.5 text-xs text-stone-400 leading-relaxed">{description}</p>
          </div>
        ))}
      </section>
    </main>

  </div>
);
