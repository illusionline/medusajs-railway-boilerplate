/**
 * Pure server/client-safe text sanitizer for editorial blocks and luxury gown cards.
 * Do NOT add `"use client"` so Server Components and Client Components can both import this safely.
 */

export function stripCatalogIdentifiers(raw?: string | null): string {
  if (!raw) return ""

  return raw
    // Strip Product ID: #ILS..., Product ID #..., etc.
    .replace(/\bProduct\s*ID\s*:?\s*#?[A-Za-z0-9_-]+\.?\s*/gi, " ")
    // Strip SKU: #..., SKU ...
    .replace(/\bSKU\s*:?\s*#?[A-Za-z0-9_-]+\.?\s*/gi, " ")
    // Strip Item #..., Item No: ...
    .replace(/\bItem\s*(?:No\.?|#|:)\s*#?[A-Za-z0-9_-]+\.?\s*/gi, " ")
    // Strip Style ID / Style #...
    .replace(/\bStyle\s*(?:ID|No\.?|#|:)\s*#?[A-Za-z0-9_-]+\.?\s*/gi, " ")
    // Strip leading markdown/list bullet characters per line
    .replace(/^[•\-*·]+\s*/gm, "")
    // Strip orphan leading dividers left after removing an ID prefix
    .replace(/^[\s|—–\-:;,.]+/, "")
    .trim()
}

/**
 * Cleans product copy (stripping `Product ID: #...`, `SKU: ...`, `Item #...`),
 * normalizes whitespace, and truncates cleanly at a whole-word boundary (~95–110 chars).
 */
export function cleanEditorialDescription(
  raw?: string | null,
  maxLength = 104
): string {
  const stripped = stripCatalogIdentifiers(raw)
    .replace(/\s+/g, " ")
    .replace(/^[\s|—–\-:;,.]+/, "")
    .trim()

  if (!stripped) return ""
  if (stripped.length <= maxLength) return stripped

  const slice = stripped.slice(0, maxLength + 1)
  const lastSpace = slice.lastIndexOf(" ")
  const cut =
    lastSpace > Math.floor(maxLength * 0.6) ? slice.slice(0, lastSpace) : slice.slice(0, maxLength)

  return `${cut.replace(/[,;:\s.\-—–]+$/, "")}...`
}
