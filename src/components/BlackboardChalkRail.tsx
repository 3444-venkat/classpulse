import React, { useState } from 'react';
import { Calculator, Sparkles, SlidersHorizontal, Check, RefreshCw } from 'lucide-react';
import { ChalkDensity, BlackboardVariant } from './BlackboardMathBackground';

interface BlackboardChalkRailProps {
  density: ChalkDensity;
  onChangeDensity: (density: ChalkDensity) => void;
  variant: BlackboardVariant;
  onChangeVariant: (variant: BlackboardVariant) => void;
}

const MATH_CHALK_QUOTES = [
  'E = mc² · Energy-Mass Equivalence',
  '∫ e^(-x²) dx = √π / 2 · Gaussian Integral',
  'a² + b² = c² · Pythagorean Theorem',
  'e^(iπ) + 1 = 0 · Euler\'s Identity',
  '∑(k=1 to n) k = n(n+1)/2 · Gauss Summation',
  'lim(x→0) sin(x)/x = 1 · Fundamental Limit',
  '∇ · B = 0 · Gauss\'s Law for Magnetism',
  'Attendance Sum: Σ attended / Σ total classes × 100% ≥ 75%',
  '128 × 4 = 512 · 2⁷ × 2² = 2⁹',
  '√144 = 12 · 144 ÷ 12 = 12',
];

export const BlackboardChalkRail: React.FC<BlackboardChalkRailProps> = ({
  density,
  onChangeDensity,
  variant,
  onChangeVariant,
}) => {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const nextQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % MATH_CHALK_QUOTES.length);
  };

  return (
    <div className="w-full bg-black/60 border-b border-white/15 px-4 sm:px-6 lg:px-8 py-2 text-xs backdrop-blur-md relative z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Chalk Sum Quote */}
        <div className="flex items-center gap-2 text-white/80 overflow-hidden">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-white/10 border border-white/20 text-white shrink-0">
            <Calculator className="w-3 h-3 text-white/90" />
            CHALK SUMS
          </span>
          <button
            onClick={nextQuote}
            className="group flex items-center gap-1.5 text-white/90 hover:text-white font-chalk text-sm tracking-wide truncate transition-colors text-left"
            title="Click for another blackboard equation"
          >
            <span className="truncate">{MATH_CHALK_QUOTES[quoteIdx]}</span>
            <RefreshCw className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        </div>

        {/* Right: Blackboard & Math Customization Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Variant Selector */}
          <div className="hidden sm:flex items-center bg-white/5 rounded-lg border border-white/15 p-0.5 text-[11px]">
            <button
              onClick={() => onChangeVariant('classic')}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                variant === 'classic'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Classic Blackboard
            </button>
            <button
              onClick={() => onChangeVariant('slate')}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                variant === 'slate'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Dark Slate
            </button>
            <button
              onClick={() => onChangeVariant('pure-bw')}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                variant === 'pure-bw'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Pure B&amp;W
            </button>
            <button
              onClick={() => onChangeVariant('green')}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                variant === 'green'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Green Board
            </button>
          </div>

          {/* Density Control Dropdown/Button */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3 text-white/80" />
              <span>Math Chalk: {density === 'dense' ? 'Full Sums' : density === 'medium' ? 'Balanced' : density === 'subtle' ? 'Subtle' : 'Off'}</span>
            </button>

            {showSettings && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-neutral-900 border border-white/25 rounded-xl p-3 shadow-2xl z-50 text-white">
                <div className="text-xs font-semibold mb-2 text-white/90 flex items-center justify-between">
                  <span>Chalk Math Formulas</span>
                  <span className="text-[10px] text-white/50 font-chalk">White chalk sums</span>
                </div>
                <div className="space-y-1 text-xs">
                  {(['dense', 'medium', 'subtle', 'none'] as ChalkDensity[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        onChangeDensity(d);
                        setShowSettings(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                        density === d
                          ? 'bg-white text-black font-semibold'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <span className="capitalize">
                        {d === 'dense' ? 'Full White Sums' : d === 'medium' ? 'Balanced Chalk' : d === 'subtle' ? 'Subtle Formulas' : 'Hidden (Pure B&W)'}
                      </span>
                      {density === d && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/15">
                  <div className="text-[11px] text-white/60 mb-1.5">Theme Palette:</div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <button
                      onClick={() => {
                        onChangeVariant('classic');
                        setShowSettings(false);
                      }}
                      className={`px-2 py-1 rounded text-center border transition-colors ${
                        variant === 'classic' ? 'bg-white text-black font-semibold border-white' : 'border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      Blackboard
                    </button>
                    <button
                      onClick={() => {
                        onChangeVariant('pure-bw');
                        setShowSettings(false);
                      }}
                      className={`px-2 py-1 rounded text-center border transition-colors ${
                        variant === 'pure-bw' ? 'bg-white text-black font-semibold border-white' : 'border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      Pure B&amp;W
                    </button>
                    <button
                      onClick={() => {
                        onChangeVariant('slate');
                        setShowSettings(false);
                      }}
                      className={`px-2 py-1 rounded text-center border transition-colors ${
                        variant === 'slate' ? 'bg-white text-black font-semibold border-white' : 'border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      Slate
                    </button>
                    <button
                      onClick={() => {
                        onChangeVariant('green');
                        setShowSettings(false);
                      }}
                      className={`px-2 py-1 rounded text-center border transition-colors ${
                        variant === 'green' ? 'bg-white text-black font-semibold border-white' : 'border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      Green Board
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
