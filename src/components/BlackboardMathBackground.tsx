import React from 'react';

export type ChalkDensity = 'dense' | 'medium' | 'subtle' | 'none';
export type BlackboardVariant = 'slate' | 'classic' | 'pure-bw' | 'green';

interface BlackboardMathBackgroundProps {
  density?: ChalkDensity;
  variant?: BlackboardVariant;
}

export const BlackboardMathBackground: React.FC<BlackboardMathBackgroundProps> = ({
  density = 'dense',
  variant = 'classic',
}) => {
  if (density === 'none') {
    return null;
  }

  const opacityMultiplier = density === 'dense' ? 1 : density === 'medium' ? 0.65 : 0.35;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0"
      style={{ opacity: opacityMultiplier }}
    >
      {/* Chalkboard Dust and Smudge Texture Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.035)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.03)_0%,transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.025)_0%,transparent_60%)]" />

      {/* SVG Vector Blackboard Math Sums & Handwritten Chalk Equations */}
      <svg
        className="w-full h-full text-white/35 font-chalk"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1600 1200"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="chalk-roughness">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
          </filter>
        </defs>

        <g filter="url(#chalk-roughness)">
          {/* Top-Left Cluster: Calculus & Famous Equations */}
          <g transform="translate(60, 110)">
            {/* E = mc^2 */}
            <text x="0" y="0" className="text-3xl font-bold fill-white/40 tracking-wider">
              E = mc²
            </text>
            <text x="0" y="36" className="text-xl fill-white/30">
              ∫ e^(-x²) dx = √π / 2
            </text>
            <text x="0" y="72" className="text-lg fill-white/25">
              lim (x→0) sin(x)/x = 1
            </text>
            <text x="0" y="105" className="text-base fill-white/25">
              d/dx [ln(x)] = 1/x
            </text>

            {/* Chalk Sum calculation */}
            <g transform="translate(0, 140)">
              <text x="0" y="0" className="text-base fill-white/35 font-mono">
                144 ÷ 12 = 12
              </text>
              <text x="0" y="24" className="text-base fill-white/35 font-mono">
                37 × 3 = 111
              </text>
              <line x1="0" y1="32" x2="110" y2="32" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 2" strokeWidth="1" />
              <text x="0" y="52" className="text-sm fill-white/30 font-chalk">
                ✓ Q.E.D.
              </text>
            </g>
          </g>

          {/* Top-Center / Banner Area: Euler's identity & Series */}
          <g transform="translate(620, 80)">
            <text x="0" y="0" className="text-2xl font-semibold fill-white/30 tracking-widest text-center">
              e^(iπ) + 1 = 0
            </text>
            <text x="0" y="32" className="text-lg fill-white/20">
              ∑ (n=1 to ∞) 1/n² = π² / 6
            </text>
            <text x="0" y="60" className="text-sm fill-white/25 font-mono">
              F = G (m₁·m₂) / r²
            </text>
          </g>

          {/* Top-Right Cluster: Geometry & Algebra Sums */}
          <g transform="translate(1260, 100)">
            <text x="0" y="0" className="text-2xl font-bold fill-white/35">
              a² + b² = c²
            </text>

            {/* Right Triangle Sketch with Chalk Labels */}
            <path
              d="M 20,30 L 20,110 L 140,110 Z"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1.5"
              strokeDasharray="2 1"
            />
            {/* Right angle mark */}
            <path
              d="M 20,95 L 35,95 L 35,110"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
            />
            <text x="5" y="75" className="text-sm fill-white/30 font-chalk">a</text>
            <text x="75" y="128" className="text-sm fill-white/30 font-chalk">b</text>
            <text x="85" y="65" className="text-sm fill-white/35 font-chalk">c = √(a²+b²)</text>
            <text x="45" y="105" className="text-xs fill-white/25">θ</text>

            {/* Quadratic Formula */}
            <g transform="translate(-40, 160)">
              <text x="0" y="0" className="text-base fill-white/35">
                x = (-b ± √(b² - 4ac)) / 2a
              </text>
              <text x="0" y="26" className="text-sm fill-white/25 font-mono">
                Δ = b² - 4ac &gt; 0  ⇒ 2 real roots
              </text>
            </g>
          </g>

          {/* Middle-Left Cluster: Matrices & Linear Algebra */}
          <g transform="translate(40, 480)">
            <text x="0" y="0" className="text-xl fill-white/30 font-bold">
              [ A ] · [ x ] = [ b ]
            </text>
            {/* Matrix brackets */}
            <g transform="translate(0, 20)">
              <text x="0" y="25" className="text-2xl fill-white/25">[</text>
              <text x="18" y="18" className="text-sm fill-white/30 font-mono">cos θ</text>
              <text x="75" y="18" className="text-sm fill-white/30 font-mono">-sin θ</text>
              <text x="18" y="38" className="text-sm fill-white/30 font-mono">sin θ</text>
              <text x="75" y="38" className="text-sm fill-white/30 font-mono"> cos θ</text>
              <text x="135" y="25" className="text-2xl fill-white/25">]</text>
              <text x="155" y="28" className="text-sm fill-white/25 font-chalk">det(R) = 1</text>
            </g>

            {/* Arithmetic column sum */}
            <g transform="translate(10, 95)" className="font-mono text-sm fill-white/35">
              <text x="0" y="0">  825</text>
              <text x="0" y="18">+ 475</text>
              <line x1="-5" y1="24" x2="55" y2="24" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <text x="0" y="40"> 1300</text>
            </g>
          </g>

          {/* Middle-Right Cluster: Statistics & Physics */}
          <g transform="translate(1300, 520)">
            <text x="0" y="0" className="text-lg fill-white/30">
              σ = √[ ∑(x - μ)² / N ]
            </text>
            <text x="0" y="30" className="text-base fill-white/25">
              Δx · Δp ≥ ℏ / 2
            </text>
            <text x="0" y="60" className="text-lg fill-white/30 font-bold">
              ∇ · B = 0
            </text>
            <text x="0" y="90" className="text-base fill-white/25">
              ∇ × E = -∂B / ∂t
            </text>

            {/* Bell curve chalk sketch */}
            <g transform="translate(0, 115)">
              <path
                d="M 0,40 Q 40,38 60,10 Q 80,38 120,40"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
                strokeDasharray="2 1"
              />
              <line x1="60" y1="8" x2="60" y2="45" stroke="rgba(255,255,255,0.2)" strokeDasharray="1 1" />
              <text x="56" y="55" className="text-xs fill-white/25 font-chalk">μ</text>
            </g>
          </g>

          {/* Bottom-Left Cluster: Coordinate Axis & Graph with parabola */}
          <g transform="translate(70, 850)">
            {/* Coordinate axes */}
            <line x1="20" y1="120" x2="20" y2="10" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            <line x1="10" y1="110" x2="160" y2="110" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            <polygon points="20,5 17,12 23,12" fill="rgba(255,255,255,0.35)" />
            <polygon points="165,110 158,107 158,113" fill="rgba(255,255,255,0.35)" />
            <text x="25" y="15" className="text-xs fill-white/30 font-chalk">y</text>
            <text x="155" y="125" className="text-xs fill-white/30 font-chalk">x</text>

            {/* Parabola: y = x^2 */}
            <path
              d="M 20,110 Q 70,110 110,25"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <text x="115" y="25" className="text-xs fill-white/35 font-chalk">y = x²</text>
            <text x="45" y="145" className="text-sm fill-white/30 font-chalk">
              dy/dx = 2x  (slope at x=2 is 4)
            </text>
          </g>

          {/* Bottom-Center: Large Central Chalk Sums */}
          <g transform="translate(560, 950)">
            <text x="0" y="0" className="text-xl fill-white/25 tracking-wide">
              ∑(k=1 to n) k = n(n+1) / 2
            </text>
            <text x="0" y="32" className="text-lg fill-white/20">
              1 + 2 + 3 + ... + 100 = 5,050
            </text>
            <text x="0" y="60" className="text-base fill-white/25 font-mono">
              2¹⁰ = 1,024  |  log₂(1024) = 10
            </text>
            <text x="0" y="85" className="text-sm fill-white/20">
              λ = h / p  (De Broglie wavelength)
            </text>
          </g>

          {/* Bottom-Right: Complex Numbers & Arithmetic Calculations */}
          <g transform="translate(1220, 880)">
            <text x="0" y="0" className="text-xl fill-white/35 font-bold">
              z = r(cos θ + i sin θ) = r e^(iθ)
            </text>
            <text x="0" y="30" className="text-base fill-white/30">
              |z| = √(x² + y²)
            </text>

            <g transform="translate(10, 60)" className="font-mono text-sm fill-white/30">
              <text x="0" y="0">  25 × 25 = 625</text>
              <text x="0" y="20">  √225 = 15</text>
              <text x="0" y="40">  π ≈ 3.14159265</text>
              <text x="0" y="60">  e ≈ 2.71828182</text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
