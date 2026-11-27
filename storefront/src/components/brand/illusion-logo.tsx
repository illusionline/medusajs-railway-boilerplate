import { clx } from "@medusajs/ui"
import React, { useId } from "react"

export type IllusionLogoProps = {
  /**
   * Rendered SVG height in px. Width scales proportionally (height * 4.68).
   * Default navbar height: 26px (~122px width).
   */
  height?: number
  className?: string
  ariaLabel?: string
}

/**
 * Official ILLUSION House Brand Mark
 * Locked Studio Calibration:
 * - Jost ExtraLight 200 pure Bauhaus geometric vector primitives (viewBox="0 0 468 100")
 * - Cap-height y=16..84 (68u), strokeWidth=4.6, Tracking=19.5u, O-Pad=+5.0
 * - Studio Ring-Light optical 'O' (cx=366, cy=50, r=31) with dual-stage Gaussian bloom
 *   + Variant C Hover Catchlight Dimmer pulse
 */
export const IllusionLogo: React.FC<IllusionLogoProps> = ({
  height = 26,
  className,
  ariaLabel = "ILLUSION",
}) => {
  const rawId = useId()
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, "")
  const ringFilterId = `illusion-ring-light-${safeId}`
  const catchlightFilterId = `illusion-ring-catchlight-${safeId}`
  const width = Math.round(height * 4.68)

  return (
    <span
      className={clx(
        "group/logo inline-flex items-center justify-center select-none leading-none",
        className
      )}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 468 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
        role="img"
        aria-label={ariaLabel}
        className="overflow-visible block shrink-0"
      >
        <defs>
          {/* Studio Ring-Light Dual-Stage Optical Bloom */}
          <filter
            id={ringFilterId}
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="8.5"
              result="outerStudioBloomRaw"
            />
            <feComponentTransfer
              in="outerStudioBloomRaw"
              result="outerStudioBloom"
            >
              <feFuncA type="linear" slope="0.55" />
            </feComponentTransfer>

            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="3.2"
              result="innerOpticalHaloRaw"
            />
            <feComponentTransfer
              in="innerOpticalHaloRaw"
              result="innerOpticalHalo"
            >
              <feFuncA type="linear" slope="0.88" />
            </feComponentTransfer>

            <feMerge>
              <feMergeNode in="outerStudioBloom" />
              <feMergeNode in="innerOpticalHalo" />
            </feMerge>
          </filter>

          {/* Variant C Hover Catchlight Dimmer Aura */}
          <filter
            id={catchlightFilterId}
            x="-85%"
            y="-85%"
            width="270%"
            height="270%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="13" />
          </filter>
        </defs>

        {/* Jost ExtraLight 200 Geometric Letterforms: I L L U S I _ N */}
        <g
          stroke="#FFFFFF"
          strokeWidth="4.6"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit="10"
          fill="none"
        >
          {/* I #1 */}
          <line x1="16" y1="16" x2="16" y2="84" />

          {/* L #1 */}
          <path d="M 48 16 L 48 84 L 82 84" />

          {/* L #2 */}
          <path d="M 108 16 L 108 84 L 142 84" />

          {/* U */}
          <path d="M 168 16 L 168 58 C 168 74 179 84.5 194 84.5 C 209 84.5 220 74 220 58 L 220 16" />

          {/* S — Pure Bauhaus Jost 200 Spine */}
          <path d="M 284 26 C 279 19 272 15.5 263 15.5 C 250 15.5 242 22.5 242 32 C 242 41.5 250 46 264 49.5 C 278 53 286 58 286 68.5 C 286 78.5 277 84.5 263 84.5 C 252 84.5 244 79.5 239 71" />

          {/* I #2 */}
          <line x1="314" y1="16" x2="314" y2="84" />

          {/* N — Mitered Bauhaus Jost Vertices after +5.0 O-Pad */}
          <path d="M 418 84 L 418 17 L 462 83 L 462 16" />
        </g>

        {/* Studio Ring-Light Optical 'O' (cx=366, cy=50, r=31) */}
        <g>
          {/* Resting Dual-Stage Studio Bloom */}
          <circle
            cx="366"
            cy="50"
            r="31"
            stroke="#FFFFFF"
            strokeWidth="7.8"
            fill="none"
            filter={`url(#${ringFilterId})`}
            className="opacity-95 group-hover/logo:opacity-100 group-hover:opacity-100 transition-opacity duration-500 ease-out"
          />

          {/* Variant C Hover Catchlight Pulse (Zero Layout Shift) */}
          <circle
            cx="366"
            cy="50"
            r="31"
            stroke="#FFFFFF"
            strokeWidth="9.6"
            fill="none"
            filter={`url(#${catchlightFilterId})`}
            className="opacity-0 group-hover/logo:opacity-65 group-hover:opacity-65 transition-opacity duration-500 ease-out"
          />

          {/* Crisp Illuminated Inner LED Ring Tube */}
          <circle
            cx="366"
            cy="50"
            r="31"
            stroke="#FFFFFF"
            strokeWidth="7.8"
            fill="none"
          />
        </g>
      </svg>
    </span>
  )
}

export default IllusionLogo
