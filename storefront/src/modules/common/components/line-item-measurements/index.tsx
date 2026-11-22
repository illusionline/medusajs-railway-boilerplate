import React from "react"

type LineItemMeasurementsProps = {
  metadata?: Record<string, unknown> | null
  compact?: boolean
}

const formatCm = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  const str = String(value).trim()
  if (!str) return null
  return /cm$/i.test(str) ? str : `${str} cm`
}

const LineItemMeasurements: React.FC<LineItemMeasurementsProps> = ({
  metadata,
  compact = false,
}) => {
  if (!metadata || typeof metadata !== "object") {
    return null
  }

  const bust = formatCm(metadata.bust)
  const waist = formatCm(metadata.waist)
  const hips = formatCm(metadata.hips)
  const hollowToHem = formatCm(metadata.hollow_to_hem)
  const height = formatCm(metadata.height)
  const notes =
    typeof metadata.notes === "string" && metadata.notes.trim().length > 0
      ? metadata.notes.trim()
      : null
  const isMtm =
    metadata.sizing_mode === "Made-to-Measure" ||
    Boolean(bust || waist || hips || hollowToHem || height || notes)

  if (!isMtm) {
    return null
  }

  const specs = [
    bust ? { label: "Bust", value: bust } : null,
    waist ? { label: "Waist", value: waist } : null,
    hips ? { label: "Hips", value: hips } : null,
    hollowToHem ? { label: "Hollow–Hem", value: hollowToHem } : null,
    height ? { label: "Height", value: height } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div
      className={`mt-2 border-l border-[#0A0A0A]/25 pl-2.5 text-[#0A0A0A]/80 ${
        compact ? "space-y-1" : "space-y-1.5"
      }`}
      data-testid="line-item-measurements"
    >
      <span className="block text-[10px] uppercase tracking-[0.2em] font-medium text-[#0A0A0A]">
        Made-to-Measure
      </span>
      {specs.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] leading-relaxed text-[#0A0A0A]/75">
          {specs.map((spec) => (
            <span key={spec.label} className="whitespace-nowrap">
              <span className="text-[#0A0A0A]/50">{spec.label}:</span>{" "}
              <span className="font-medium text-[#0A0A0A]">{spec.value}</span>
            </span>
          ))}
        </div>
      )}
      {notes && (
        <p className="text-[11px] leading-snug text-[#0A0A0A]/65 italic break-words whitespace-normal">
          Note: {notes}
        </p>
      )}
    </div>
  )
}

export default LineItemMeasurements
