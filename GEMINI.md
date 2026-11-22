# ILLUSIONLINE Architecture Rules
- Monorepo: `/backend` (Medusa v2) and `/storefront` (Next.js App Router, TypeScript, Tailwind CSS).
- Zero-localhost workflow: All deploys build on Railway on `git push`. Always verify TypeScript types and Next.js Server/Client component boundaries (`"use client"`) so Railway builds never fail.
- Dynamic routes: Keep `export const dynamic = "force-dynamic"` on dynamic catalog/product routes so new Medusa products render immediately without rebuilds.
- SEO Shield: Keep `robots: { index: false, follow: false }` active in root layout metadata while hosted on `beta.illusionline.com`.
- Custom Measurements: Store Made-to-Measure inputs (bust, waist, hips, hollow_to_hem, height, notes) inside Medusa cart line-item `metadata` when adding to bag.
