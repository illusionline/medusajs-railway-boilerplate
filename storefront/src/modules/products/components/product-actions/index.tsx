"use client"

import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { AnimatePresence, motion } from "framer-motion"
import { isEqual } from "lodash"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import ProductPrice from "../product-price"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

type SizingMode = "standard" | "mtm"

const STANDARD_SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL"]
const FALLBACK_STANDARD_SIZES = ["XS", "S", "M", "L", "XL"]
const CUSTOM_KEYWORDS = [
  "custom",
  "made-to-measure",
  "made to measure",
  "bespoke",
  "mtm",
]

const isCustomValue = (val?: string | null): boolean => {
  if (!val) return false
  const normalized = val.trim().toLowerCase()
  return CUSTOM_KEYWORDS.some(
    (kw) => normalized === kw || normalized.includes(kw)
  )
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
): Record<string, string> => {
  return (
    variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
      if (varopt.option_id && varopt.value) {
        acc[varopt.option_id] = varopt.value
      }
      return acc
    }, {}) ?? {}
  )
}

const checkVariantInStock = (variant?: HttpTypes.StoreProductVariant): boolean => {
  if (!variant) return false
  if (!variant.manage_inventory) return true
  if (variant.allow_backorder) return true
  if (variant.manage_inventory && (variant.inventory_quantity || 0) > 0) {
    return true
  }
  return false
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const countryCode = useParams().countryCode as string

  const [sizingMode, setSizingMode] = useState<SizingMode>("standard")
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [fallbackStandardSize, setFallbackStandardSize] = useState<string>("S")
  const [measurements, setMeasurements] = useState({
    bust: "",
    waist: "",
    hips: "",
    hollowToHem: "",
    height: "",
    notes: "",
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  // Identify primary Size option vs any secondary options (e.g. Color)
  const sizeOption = useMemo(() => {
    const opts = product.options || []
    if (opts.length === 0) return undefined
    return (
      opts.find((o) => /size|fit|tailor/i.test(o.title || "")) ||
      (opts.length === 1 ? opts[0] : opts[opts.length - 1])
    )
  }, [product.options])

  const otherOptions = useMemo(() => {
    const opts = product.options || []
    return opts.filter((o) => o.id !== sizeOption?.id)
  }, [product.options, sizeOption])

  // Standard size pills (strictly hiding any "Custom" / "Made-to-Measure" pill)
  const standardSizeValues = useMemo(() => {
    if (!sizeOption) {
      return FALLBACK_STANDARD_SIZES
    }
    const rawValues = Array.from(
      new Set((sizeOption.values || []).map((v) => v.value))
    ).filter((v) => !isCustomValue(v))

    if (rawValues.length === 0) {
      return FALLBACK_STANDARD_SIZES
    }

    return [...rawValues].sort((a, b) => {
      const idxA = STANDARD_SIZE_ORDER.indexOf(a.toUpperCase())
      const idxB = STANDARD_SIZE_ORDER.indexOf(b.toUpperCase())
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return 0
    })
  }, [sizeOption])

  // Locate Custom variant on product (if present)
  const customVariant = useMemo(() => {
    if (!product.variants?.length) return undefined

    const matchingCustomVariants = product.variants.filter(
      (v) =>
        isCustomValue(v.title) ||
        v.options?.some((opt) => isCustomValue(opt.value))
    )

    if (matchingCustomVariants.length === 0) return undefined

    // Prefer custom variant matching other selected options (e.g. Color)
    const exactMatch = matchingCustomVariants.find((v) => {
      const vMap = optionsAsKeymap(v.options)
      return otherOptions.every(
        (opt) => !options[opt.id] || vMap[opt.id] === options[opt.id]
      )
    })

    return exactMatch || matchingCustomVariants[0]
  }, [product.variants, otherOptions, options])

  // Initialize default selection on mount / product change
  useEffect(() => {
    if (!product.variants?.length) return

    const urlVariantId = searchParams.get("v_id")
    const urlVariant = urlVariantId
      ? product.variants.find((v) => v.id === urlVariantId)
      : undefined

    if (urlVariant) {
      setOptions(optionsAsKeymap(urlVariant.options))
      if (
        isCustomValue(urlVariant.title) ||
        urlVariant.options?.some((o) => isCustomValue(o.value))
      ) {
        setSizingMode("mtm")
      }
      return
    }

    // Preselect first available standard variant (avoiding Custom on initial Standard load)
    const firstStandardVariant =
      product.variants.find(
        (v) =>
          !isCustomValue(v.title) &&
          !v.options?.some((o) => isCustomValue(o.value)) &&
          checkVariantInStock(v)
      ) ||
      product.variants.find(
        (v) =>
          !isCustomValue(v.title) &&
          !v.options?.some((o) => isCustomValue(o.value))
      ) ||
      product.variants[0]

    if (firstStandardVariant) {
      setOptions(optionsAsKeymap(firstStandardVariant.options))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return undefined
    }

    const exact = product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })

    if (exact) return exact

    if (product.variants.length === 1) {
      return product.variants[0]
    }

    return undefined
  }, [product.variants, options])

  // Fallback-safe effective variant for both Standard Size and Made-to-Measure
  const effectiveVariant = useMemo(() => {
    if (sizingMode === "mtm") {
      if (customVariant) return customVariant
      if (selectedVariant) return selectedVariant
      return (
        product.variants?.find((v) => checkVariantInStock(v)) ||
        product.variants?.[0]
      )
    }
    return selectedVariant
  }, [sizingMode, customVariant, selectedVariant, product.variants])

  const inStock = useMemo(
    () => checkVariantInStock(effectiveVariant),
    [effectiveVariant]
  )

  // Keep URL ?v_id synced without scrolling
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = effectiveVariant?.id || null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveVariant?.id, pathname])

  const setOptionValue = (optionId: string, value: string) => {
    setValidationError(null)
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  const handleModeChange = (mode: SizingMode) => {
    setValidationError(null)
    setSizingMode(mode)

    if (mode === "mtm") {
      if (customVariant) {
        setOptions(optionsAsKeymap(customVariant.options))
      }
    } else {
      // Switching back to Standard Size: ensure Custom option is replaced by a standard size
      if (sizeOption) {
        const currentSizeVal = options[sizeOption.id]
        if (!currentSizeVal || isCustomValue(currentSizeVal)) {
          const defaultStandard = standardSizeValues[0]
          if (defaultStandard) {
            setOptions((prev) => ({
              ...prev,
              [sizeOption.id]: defaultStandard,
            }))
          }
        }
      }
    }
  }

  const isSizeValueAvailable = (sizeValue: string): boolean => {
    if (!sizeOption || !product.variants?.length) return true
    const hasMatchingVariants = product.variants.some((v) => {
      const map = optionsAsKeymap(v.options)
      return map[sizeOption.id] === sizeValue
    })
    if (!hasMatchingVariants) return true

    return product.variants.some((v) => {
      const map = optionsAsKeymap(v.options)
      const matchesOther = otherOptions.every(
        (opt) => !options[opt.id] || map[opt.id] === options[opt.id]
      )
      return (
        map[sizeOption.id] === sizeValue &&
        matchesOther &&
        checkVariantInStock(v)
      )
    })
  }

  const handleAddToCart = async () => {
    if (!effectiveVariant?.id) return
    setValidationError(null)

    let metadata: Record<string, unknown> | undefined

    if (sizingMode === "mtm") {
      if (
        !measurements.bust.trim() ||
        !measurements.waist.trim() ||
        !measurements.hips.trim()
      ) {
        setValidationError(
          "Please enter your Bust, Waist, and Hips measurements (in cm) for Made-to-Measure tailoring."
        )
        return
      }

      metadata = {
        sizing_mode: "Made-to-Measure",
        bust: measurements.bust.trim(),
        waist: measurements.waist.trim(),
        hips: measurements.hips.trim(),
        hollow_to_hem: measurements.hollowToHem.trim(),
        height: measurements.height.trim(),
        notes: measurements.notes.trim(),
      }
    } else if (
      !sizeOption ||
      !(sizeOption.values || []).some(
        (v) => v.value === options[sizeOption.id]
      )
    ) {
      metadata = {
        sizing_mode: "Standard Size",
        standard_size: fallbackStandardSize,
      }
    }

    setIsAdding(true)
    try {
      await addToCart({
        variantId: effectiveVariant.id,
        quantity: 1,
        countryCode,
        metadata,
      })
    } finally {
      setIsAdding(false)
    }
  }

  const currentStandardSize =
    sizeOption &&
    (sizeOption.values || []).some((v) => !isCustomValue(v.value))
      ? options[sizeOption.id]
      : fallbackStandardSize

  return (
    <div className="flex flex-col gap-y-6">
      {/* Live Regional / AED Price */}
      <ProductPrice product={product} variant={effectiveVariant} />

      {/* Concise Editorial Description */}
      {product.description && (
        <p
          className="text-xs leading-relaxed text-[#0A0A0A]/75 whitespace-pre-line font-normal"
          data-testid="product-description"
        >
          {product.description}
        </p>
      )}

      <div className="h-px w-full bg-[#E5E5E5]" />

      {/* Secondary Non-Size Options (e.g. Color, if present) */}
      {otherOptions.length > 0 && (
        <div className="flex flex-col gap-y-4">
          {otherOptions.map((option) => (
            <div key={option.id} className="flex flex-col gap-y-2.5">
              <span className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#0A0A0A]">
                {option.title}
              </span>
              <div className="flex flex-wrap gap-2">
                {(option.values || []).map((val) => {
                  const active = options[option.id] === val.value
                  return (
                    <button
                      key={val.value}
                      type="button"
                      disabled={!!disabled || isAdding}
                      onClick={() => setOptionValue(option.id, val.value)}
                      className={clx(
                        "px-4 h-10 text-[11px] uppercase tracking-[0.14em] border transition-colors duration-150",
                        active
                          ? "bg-[#0A0A0A] text-white border-[#0A0A0A] font-medium"
                          : "bg-white text-[#0A0A0A] border-[#E5E5E5] hover:border-[#0A0A0A]"
                      )}
                    >
                      {val.value}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Sizing Mode Toggle: Standard Size vs Made-to-Measure */}
      <div className="flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#0A0A0A]">
            Tailoring &amp; Fit
          </span>
          <LocalizedClientLink
            href="/client-care#made-to-measure"
            className="text-[11px] uppercase tracking-[0.12em] text-[#0A0A0A]/65 hover:text-[#0A0A0A] underline underline-offset-4 transition-colors"
          >
            Measurement Guide
          </LocalizedClientLink>
        </div>

        <div
          role="tablist"
          aria-label="Sizing Mode"
          className="grid grid-cols-2 border border-[#0A0A0A] bg-[#F7F7F5] relative"
        >
          <button
            type="button"
            role="tab"
            aria-selected={sizingMode === "standard"}
            onClick={() => handleModeChange("standard")}
            disabled={!!disabled || isAdding}
            data-testid="sizing-mode-standard"
            className={clx(
              "relative z-10 h-11 text-[11px] uppercase tracking-[0.14em] transition-colors duration-200",
              sizingMode === "standard"
                ? "bg-[#0A0A0A] text-white font-medium"
                : "text-[#0A0A0A]/75 hover:text-[#0A0A0A]"
            )}
          >
            Standard Size
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={sizingMode === "mtm"}
            onClick={() => handleModeChange("mtm")}
            disabled={!!disabled || isAdding}
            data-testid="sizing-mode-mtm"
            className={clx(
              "relative z-10 h-11 text-[11px] uppercase tracking-[0.14em] border-l border-[#0A0A0A] transition-colors duration-200",
              sizingMode === "mtm"
                ? "bg-[#0A0A0A] text-white font-medium"
                : "text-[#0A0A0A]/75 hover:text-[#0A0A0A]"
            )}
          >
            Made-to-Measure
          </button>
        </div>

        {/* Mode Content: Standard Rectangular Buttons vs Animated Made-to-Measure Panel */}
        <AnimatePresence mode="wait" initial={false}>
          {sizingMode === "standard" ? (
            <motion.div
              key="standard-sizes"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="pt-1 flex flex-col gap-y-3"
              data-testid="product-options"
            >
              <div className="grid grid-cols-5 gap-2">
                {standardSizeValues.map((sizeVal) => {
                  const isSelected = currentStandardSize === sizeVal
                  const available = isSizeValueAvailable(sizeVal)

                  return (
                    <button
                      key={sizeVal}
                      type="button"
                      disabled={!!disabled || isAdding}
                      onClick={() => {
                        if (
                          sizeOption &&
                          (sizeOption.values || []).some(
                            (v) => v.value === sizeVal
                          )
                        ) {
                          setOptionValue(sizeOption.id, sizeVal)
                        } else {
                          setFallbackStandardSize(sizeVal)
                        }
                      }}
                      data-testid="option-button"
                      className={clx(
                        "h-11 text-[11px] uppercase tracking-[0.14em] border transition-colors duration-150",
                        isSelected
                          ? "bg-[#0A0A0A] text-white border-[#0A0A0A] font-medium"
                          : available
                          ? "bg-white text-[#0A0A0A] border-[#E5E5E5] hover:border-[#0A0A0A]"
                          : "bg-[#F7F7F5] text-[#0A0A0A]/30 border-[#E5E5E5] line-through"
                      )}
                    >
                      {sizeVal}
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-[#0A0A0A]/60">
                True to ILLUSIONLINE atelier sizing. Need bespoke proportions?
                Select Made-to-Measure above.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="mtm-measurements"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-1 space-y-4 border-t border-[#E5E5E5]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#0A0A0A]">
                    Bespoke Atelier Specification
                  </span>
                  {customVariant && (
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#0A0A0A]/60">
                      {customVariant.title}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="mtm-bust"
                      className="block text-[11px] uppercase tracking-[0.12em] text-[#0A0A0A]/75 mb-1.5"
                    >
                      Bust (cm) *
                    </label>
                    <input
                      id="mtm-bust"
                      type="number"
                      inputMode="decimal"
                      min="50"
                      max="180"
                      step="0.5"
                      placeholder="e.g. 86"
                      value={measurements.bust}
                      onChange={(e) =>
                        setMeasurements((prev) => ({
                          ...prev,
                          bust: e.target.value,
                        }))
                      }
                      className="w-full h-11 px-3.5 bg-white border border-[#E5E5E5] text-xs text-[#0A0A0A] placeholder:text-[#0A0A0A]/35 focus:outline-none focus:border-[#0A0A0A] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="mtm-waist"
                      className="block text-[11px] uppercase tracking-[0.12em] text-[#0A0A0A]/75 mb-1.5"
                    >
                      Waist (cm) *
                    </label>
                    <input
                      id="mtm-waist"
                      type="number"
                      inputMode="decimal"
                      min="45"
                      max="160"
                      step="0.5"
                      placeholder="e.g. 66"
                      value={measurements.waist}
                      onChange={(e) =>
                        setMeasurements((prev) => ({
                          ...prev,
                          waist: e.target.value,
                        }))
                      }
                      className="w-full h-11 px-3.5 bg-white border border-[#E5E5E5] text-xs text-[#0A0A0A] placeholder:text-[#0A0A0A]/35 focus:outline-none focus:border-[#0A0A0A] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="mtm-hips"
                      className="block text-[11px] uppercase tracking-[0.12em] text-[#0A0A0A]/75 mb-1.5"
                    >
                      Hips (cm) *
                    </label>
                    <input
                      id="mtm-hips"
                      type="number"
                      inputMode="decimal"
                      min="60"
                      max="190"
                      step="0.5"
                      placeholder="e.g. 94"
                      value={measurements.hips}
                      onChange={(e) =>
                        setMeasurements((prev) => ({
                          ...prev,
                          hips: e.target.value,
                        }))
                      }
                      className="w-full h-11 px-3.5 bg-white border border-[#E5E5E5] text-xs text-[#0A0A0A] placeholder:text-[#0A0A0A]/35 focus:outline-none focus:border-[#0A0A0A] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="mtm-hollow-to-hem"
                      className="block text-[11px] uppercase tracking-[0.12em] text-[#0A0A0A]/75 mb-1.5"
                    >
                      Hollow to Hem (cm)
                    </label>
                    <input
                      id="mtm-hollow-to-hem"
                      type="number"
                      inputMode="decimal"
                      min="80"
                      max="200"
                      step="0.5"
                      placeholder="e.g. 148"
                      value={measurements.hollowToHem}
                      onChange={(e) =>
                        setMeasurements((prev) => ({
                          ...prev,
                          hollowToHem: e.target.value,
                        }))
                      }
                      className="w-full h-11 px-3.5 bg-white border border-[#E5E5E5] text-xs text-[#0A0A0A] placeholder:text-[#0A0A0A]/35 focus:outline-none focus:border-[#0A0A0A] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="mtm-height"
                    className="block text-[11px] uppercase tracking-[0.12em] text-[#0A0A0A]/75 mb-1.5"
                  >
                    Height (cm)
                  </label>
                  <input
                    id="mtm-height"
                    type="number"
                    inputMode="decimal"
                    min="130"
                    max="220"
                    step="0.5"
                    placeholder="Total barefoot height, e.g. 172"
                    value={measurements.height}
                    onChange={(e) =>
                      setMeasurements((prev) => ({
                        ...prev,
                        height: e.target.value,
                      }))
                    }
                    className="w-full h-11 px-3.5 bg-white border border-[#E5E5E5] text-xs text-[#0A0A0A] placeholder:text-[#0A0A0A]/35 focus:outline-none focus:border-[#0A0A0A] transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mtm-notes"
                    className="block text-[11px] uppercase tracking-[0.12em] text-[#0A0A0A]/75 mb-1.5"
                  >
                    Event Date / Styling Notes
                  </label>
                  <textarea
                    id="mtm-notes"
                    rows={2}
                    placeholder="Event date, intended heel height, or tailoring preferences..."
                    value={measurements.notes}
                    onChange={(e) =>
                      setMeasurements((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="w-full p-3.5 bg-white border border-[#E5E5E5] text-xs text-[#0A0A0A] placeholder:text-[#0A0A0A]/35 focus:outline-none focus:border-[#0A0A0A] transition-colors resize-none"
                  />
                </div>

                <p className="text-[11px] text-[#0A0A0A]/75 border-l-2 border-[#0A0A0A] pl-3 py-0.5">
                  Complimentary minor tailoring adjustments included.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {validationError && (
        <p
          role="alert"
          className="text-xs text-[#0A0A0A] bg-[#F7F7F5] border-l-2 border-[#0A0A0A] px-3.5 py-2.5"
        >
          {validationError}
        </p>
      )}

      {/* Primary Add to Bag CTA */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!inStock || !effectiveVariant || !!disabled || isAdding}
        data-testid="add-product-button"
        className={clx(
          "w-full h-13 py-4 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors duration-200 flex items-center justify-center",
          !inStock || !effectiveVariant || !!disabled
            ? "bg-[#E5E5E5] text-[#0A0A0A]/45 cursor-not-allowed"
            : "bg-[#0A0A0A] text-white hover:bg-black/85"
        )}
      >
        {isAdding
          ? "Adding to Bag..."
          : !effectiveVariant
          ? "Select Size"
          : !inStock
          ? "Currently Unavailable"
          : sizingMode === "mtm"
          ? "Add Made-to-Measure to Bag"
          : "Add to Bag"}
      </button>

      {/* Subtle Client Care Reassurance */}
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[#0A0A0A]/55 pt-1">
        <span>Complimentary UAE Courier</span>
        <span>|</span>
        <span>DHL Express Worldwide (AED 99)</span>
      </div>
    </div>
  )
}
