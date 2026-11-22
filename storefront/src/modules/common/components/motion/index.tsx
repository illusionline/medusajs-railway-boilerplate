"use client"

import { motion, Variants } from "framer-motion"
import React from "react"

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function EditorialReveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.85, delay, ease: LUXURY_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
}

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: LUXURY_EASE,
    },
  },
}

export function EditorialStagger({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function EditorialItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  )
}

export function KineticHeadline({
  lines,
  className,
}: {
  lines: string[]
  className?: string
}) {
  return (
    <h1 className={className}>
      {lines.map((line, index) => (
        <span key={line} className="block overflow-hidden pb-1">
          <motion.span
            className="block"
            initial={{ y: "105%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: 1.05,
              delay: 0.15 + index * 0.14,
              ease: LUXURY_EASE,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  )
}
