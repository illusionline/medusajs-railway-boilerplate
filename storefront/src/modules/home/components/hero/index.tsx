"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { motion } from "framer-motion"
import Image from "next/image"

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const Hero = () => {
  return (
    <section className="relative min-h-[88vh] w-full bg-[#0A0A0A] text-[#FAF9F6] overflow-hidden border-b border-[#1A1A1A] flex items-end small:items-center">
      {/* Full-bleed Editorial Photography */}
      <motion.div
        initial={{ scale: 1.06, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: LUXURY_EASE }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/images/hero-editorial.jpg"
          alt="ILLUSIONLINE Architectural Eveningwear"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-[72%_center] small:object-center"
        />
        {/* Architectural vignette veils for contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/40" />
      </motion.div>

      {/* Editorial Content */}
      <div className="relative z-10 content-container py-20 small:py-28 w-full">
        <div className="max-w-3xl flex flex-col items-start">
          {/* Overline */}
          <div className="overflow-hidden mb-5">
            <motion.span
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.85, delay: 0.08, ease: LUXURY_EASE }}
              className="block text-[11px] uppercase tracking-[0.34em] text-[#FAF9F6]/65"
            >
              ILLUSIONLINE ATELIER
            </motion.span>
          </div>

          {/* Kinetic Typography Headline */}
          <h1 className="font-display font-light text-4xl xsmall:text-5xl small:text-6xl large:text-[68px] leading-[1.06] tracking-[0.03em] text-[#FAF9F6]">
            <span className="block overflow-hidden pb-1">
              <motion.span
                initial={{ y: "105%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 1.05, delay: 0.18, ease: LUXURY_EASE }}
                className="block uppercase"
              >
                ARCHITECTURAL EVENINGWEAR
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-2 mt-1">
              <motion.span
                initial={{ y: "105%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 1.05, delay: 0.32, ease: LUXURY_EASE }}
                className="block italic text-[#FAF9F6]/85 text-2xl xsmall:text-3xl small:text-4xl large:text-5xl tracking-[0.06em]"
              >
                — READY-TO-WEAR &amp; BESPOKE
              </motion.span>
            </span>
          </h1>

          {/* Editorial Subcopy */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: LUXURY_EASE }}
            className="mt-6 text-xs small:text-sm text-[#FAF9F6]/70 leading-relaxed max-w-lg font-light tracking-wide"
          >
            Sculpted silhouettes engineered with haute couture precision.
            Crafted in limited ready-to-wear editions and individual
            made-to-measure commissions.
          </motion.p>

          {/* Smooth CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.65, ease: LUXURY_EASE }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <LocalizedClientLink
              href="/store"
              className="group relative inline-flex items-center justify-center px-9 py-4 bg-[#FAF9F6] text-[#0A0A0A] border border-[#FAF9F6] text-[11px] uppercase tracking-[0.26em] font-medium hover:bg-transparent hover:text-[#FAF9F6] transition-all duration-500 ease-out"
            >
              <span>Explore Collection</span>
              <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </LocalizedClientLink>

            <LocalizedClientLink
              href="/client-care#made-to-measure"
              className="inline-flex items-center justify-center px-7 py-4 border border-[#FAF9F6]/25 text-[#FAF9F6]/85 text-[11px] uppercase tracking-[0.24em] hover:border-[#FAF9F6] hover:text-[#FAF9F6] transition-colors duration-300"
            >
              Bespoke Guide
            </LocalizedClientLink>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
