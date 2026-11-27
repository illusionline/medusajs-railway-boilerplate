import { clx } from "@medusajs/ui"
import React, { useId } from "react"

export type IllusionLogoProps = {
  /**
   * Rendered SVG height in px. Width scales proportionally (height * 4.538).
   * Default navbar height: 26px -> 118px × 26px exact studio match.
   */
  height?: number
  className?: string
  ariaLabel?: string
}

/**
 * Official ILLUSION House Brand Mark — 1:1 Studio Optical Calibration
 * - viewBox="0 0 454 100" (aspect ratio 4.538 -> 118 × 26px at height=26)
 * - Jost ExtraLight 200 hairline geometry: strokeWidth="4.2" (~1.1px–1.3px screen)
 * - Tracking: 19.5u, O-Pad: +5.0 clearance on both sides of 'O'
 * - Studio Ring-Light 'O' (cx=349, cy=50, r=26.5):
 *   1) Outer Atmosphere Bloom (stdDeviation="16", Variant C hover pulse 0.48 -> 0.80)
 *   2) Primary 3.2px Screen-Equivalent Optical Halo (stdDeviation="12.3", opacity="0.92")
 *   3) Solid Illuminated Studio Ring Core (strokeWidth="13.5", Ring 8.8 optical body)
 */
export const IllusionLogo: React.FC<IllusionLogoProps> = ({
  height = 26,
  className,
  ariaLabel = "ILLUSION",
}) => {
  const rawId = useId()
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, "")
  const outerGlowId = `illusion-outer-glow-${safeId}`
  const midGlowId = `illusion-mid-glow-${safeId}`
  const width = Math.round(height * 4.538)

  return (
    <span
      className={clx(
        "group/logo group inline-flex items-center justify-center select-none leading-none",
        className
      )}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 454 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
        role="img"
        aria-label={ariaLabel}
        className="overflow-visible block shrink-0"
      >
        <defs>
          {/* Layer 1 Filter: Outer Studio Atmosphere Bloom (stdDeviation="16") */}
          <filter
            id={outerGlowId}
            filterUnits="userSpaceOnUse"
            x="260"
            y="-40"
            width="180"
            height="180"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" />
          </filter>

          {/* Layer 2 Filter: 3.2px Screen-Equivalent Optical Halo (3.2 * 3.846 = 12.3) */}
          <filter
            id={midGlowId}
            filterUnits="userSpaceOnUse"
            x="260"
            y="-40"
            width="180"
            height="180"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="12.3" />
          </filter>
        </defs>

        {/* Crisp Jost 200 Hairline Letters (strokeWidth="4.2") */}
        <g
          stroke="#FFFFFF"
          strokeWidth="4.2"
          fill="none"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit="10"
        >
          {/* I #1 */}
          <line x1="12" y1="18" x2="12" y2="82" />

          {/* L #1 */}
          <path d="M 42 18 L 42 82 L 73 82" />

          {/* L #2 */}
          <path d="M 98 18 L 98 82 L 129 82" />

          {/* U */}
          <path d="M 154 18 L 154 57 C 154 72.5 164.5 82.5 179 82.5 C 193.5 82.5 204 72.5 204 57 L 204 18" />

          {/* S */}
          <path d="M 265 27.5 C 260.5 21 253.5 17.5 245 17.5 C 232.5 17.5 225 24 225 33 C 225 42 232.5 46.2 246 49.5 C 259.5 52.8 267 57.5 267 67.5 C 267 77 258.5 82.5 245 82.5 C 234.5 82.5 227 78 222 69.5" />

          {/* I #2 */}
          <line x1="294" y1="18" x2="294" y2="82" />

          {/* N (after +5.0 O-Pad clearance) */}
          <path d="M 404 82 L 404 18.5 L 444 81.5 L 444 18" />
        </g>

        {/* Locked Optical Studio Ring-Light 'O' (cx=349, cy=50, r=26.5) */}
        <g>
          {/* 1) Outer Studio Atmosphere Bloom (Variant C Hover Pulse) */}
          <circle
            cx="349"
            cy="50"
            r="26.5"
            stroke="#FFFFFF"
            strokeWidth="18"
            fill="none"
            opacity="0.48"
            className="transition-opacity duration-500 ease-out group-hover/logo:opacity-80 group-hover:opacity-80"
            filter={`url(#${outerGlowId})`}
          />

          {/* 2) Primary 3.2px Screen-Equivalent Optical Halo */}
          <circle
            cx="349"
            cy="50"
            r="26.5"
            stroke="#FFFFFF"
            strokeWidth="15.5"
            fill="none"
            opacity="0.92"
            filter={`url(#${midGlowId})`}
          />

          {/* 3) Solid Illuminated Studio Ring Core (Ring 8.8) */}
          <circle
            cx="349"
            cy="50"
            r="26.5"
            stroke="#FFFFFF"
            strokeWidth="13.5"
            fill="none"
          />
        </g>
      </svg>
    </span>
  )
}

export default IllusionLogo
