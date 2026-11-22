"use client"

import { HttpTypes } from "@medusajs/types"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import React, { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  productTitle?: string
}

const ImageGallery = ({
  images,
  productTitle = "ILLUSIONLINE Eveningwear",
}: ImageGalleryProps) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const validImages = (images || []).filter((img) => Boolean(img?.url))

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
    setIsZoomed(false)
  }, [])

  const showPrev = useCallback(() => {
    if (validImages.length <= 1) return
    setIsZoomed(false)
    setLightboxIndex((prev) =>
      prev === null
        ? 0
        : (prev - 1 + validImages.length) % validImages.length
    )
  }, [validImages.length])

  const showNext = useCallback(() => {
    if (validImages.length <= 1) return
    setIsZoomed(false)
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev + 1) % validImages.length
    )
  }, [validImages.length])

  useEffect(() => {
    if (lightboxIndex === null) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") showPrev()
      if (e.key === "ArrowRight") showNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [lightboxIndex, closeLightbox, showPrev, showNext])

  if (validImages.length === 0) {
    return (
      <div className="w-full aspect-[4/5] bg-[#F2EFE9] flex flex-col items-center justify-center text-[#0A0A0A]/35">
        <PlaceholderImage size={32} />
        <span className="mt-3 text-[10px] uppercase tracking-[0.26em]">
          Editorial Imagery Pending
        </span>
      </div>
    )
  }

  const activeImage =
    lightboxIndex !== null ? validImages[lightboxIndex] : undefined

  return (
    <>
      {/* Edge-to-edge vertical stack of full-bleed 4:5 editorial photos */}
      <div className="flex flex-col w-full divide-y divide-[#FAF9F6]">
        {validImages.map((image, index) => (
          <button
            key={image.id || index}
            type="button"
            id={image.id}
            onClick={() => {
              setIsZoomed(false)
              setLightboxIndex(index)
            }}
            className="group relative aspect-[4/5] w-full overflow-hidden bg-[#F2EFE9] cursor-zoom-in text-left focus:outline-none block"
            aria-label={`Zoom ${productTitle} editorial view ${index + 1}`}
          >
            <Image
              src={image.url}
              priority={index <= 1}
              quality={90}
              alt={`${productTitle} — Editorial View ${index + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center transition-transform duration-700 ease-luxury group-hover:scale-[1.02]"
            />

            {/* Discreet architectural hover badge */}
            <span className="pointer-events-none absolute bottom-5 right-5 px-3 py-1.5 bg-[#0A0A0A]/75 backdrop-blur-md text-[#FAF9F6] text-[10px] uppercase tracking-[0.22em] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Click to Zoom +
            </span>
          </button>
        ))}
      </div>

      {/* Fullscreen High-Resolution Lightbox */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {lightboxIndex !== null && activeImage && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={`${productTitle} High-Resolution Gallery`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="fixed inset-0 z-[120] bg-[#0A0A0A]/96 backdrop-blur-md text-[#FAF9F6] flex flex-col"
              >
                {/* Lightbox Top Bar */}
                <div className="flex items-center justify-between px-6 small:px-10 py-5 border-b border-[#1A1A1A] shrink-0 z-20">
                  <div className="flex items-center gap-x-4 text-[11px] uppercase tracking-[0.24em] text-[#FAF9F6]/65">
                    <span>
                      {String(lightboxIndex + 1).padStart(2, "0")} /{" "}
                      {String(validImages.length).padStart(2, "0")}
                    </span>
                    <span className="hidden sm:inline text-[#FAF9F6]/30">|</span>
                    <span className="hidden sm:inline text-[#FAF9F6]/85 truncate max-w-xs">
                      {productTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-x-6">
                    <button
                      type="button"
                      onClick={() => setIsZoomed((z) => !z)}
                      className="text-[11px] uppercase tracking-[0.22em] text-[#FAF9F6]/75 hover:text-[#FAF9F6] transition-colors"
                    >
                      {isZoomed ? "Fit to Screen (1×)" : "Magnify (2×)"}
                    </button>
                    <button
                      type="button"
                      onClick={closeLightbox}
                      className="text-[11px] uppercase tracking-[0.22em] text-[#FAF9F6] border border-[#FAF9F6]/25 px-4 py-1.5 hover:bg-[#FAF9F6] hover:text-[#0A0A0A] transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Lightbox Stage */}
                <div
                  data-lenis-prevent
                  className={`relative flex-1 w-full ${
                    isZoomed
                      ? "overflow-auto flex items-start justify-center p-6"
                      : "overflow-hidden flex items-center justify-center p-4 small:p-8"
                  }`}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      closeLightbox()
                    }
                  }}
                >
                  {validImages.length > 1 && !isZoomed && (
                    <button
                      type="button"
                      onClick={showPrev}
                      aria-label="Previous image"
                      className="absolute left-4 small:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border border-[#FAF9F6]/20 bg-[#0A0A0A]/70 text-[#FAF9F6] flex items-center justify-center text-sm hover:border-[#FAF9F6] transition-colors"
                    >
                      ←
                    </button>
                  )}

                  <motion.div
                    key={`${activeImage.id}-${isZoomed ? "zoom" : "fit"}`}
                    initial={{ opacity: 0.4, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => setIsZoomed((z) => !z)}
                    className={`relative ${
                      isZoomed
                        ? "w-[920px] max-w-none aspect-[4/5] cursor-zoom-out shrink-0"
                        : "h-full max-h-[82vh] aspect-[4/5] cursor-zoom-in"
                    }`}
                  >
                    <Image
                      src={activeImage.url}
                      alt={`${productTitle} — View ${lightboxIndex + 1}`}
                      fill
                      quality={95}
                      sizes="100vw"
                      className="object-contain"
                    />
                  </motion.div>

                  {validImages.length > 1 && !isZoomed && (
                    <button
                      type="button"
                      onClick={showNext}
                      aria-label="Next image"
                      className="absolute right-4 small:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border border-[#FAF9F6]/20 bg-[#0A0A0A]/70 text-[#FAF9F6] flex items-center justify-center text-sm hover:border-[#FAF9F6] transition-colors"
                    >
                      →
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}

export default ImageGallery
