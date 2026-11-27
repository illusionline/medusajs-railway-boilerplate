export type PrimaryNavItem = {
  label: string
  href: string
  filterKey: string | null
  testId: string
}

export const PRIMARY_NAV_LINKS: PrimaryNavItem[] = [
  {
    label: "New Arrivals",
    href: "/store?sortBy=created_at&filter=new-arrivals",
    filterKey: "new-arrivals",
    testId: "nav-new-arrivals-link",
  },
  {
    label: "Evening Gowns",
    href: "/store?filter=evening-gowns",
    filterKey: "evening-gowns",
    testId: "nav-evening-gowns-link",
  },
  {
    label: "Noir Edit",
    href: "/store?filter=noir-edit",
    filterKey: "noir-edit",
    testId: "nav-noir-edit-link",
  },
  {
    label: "Made-to-Measure",
    href: "/store?filter=made-to-measure",
    filterKey: "made-to-measure",
    testId: "nav-made-to-measure-link",
  },
  {
    label: "All Dresses",
    href: "/store",
    filterKey: null,
    testId: "nav-shop-all-link",
  },
]

export type SideMenuItem = {
  name: string
  href: string
}

export const SIDE_MENU_LINKS: SideMenuItem[] = [
  {
    name: "New Arrivals",
    href: "/store?sortBy=created_at&filter=new-arrivals",
  },
  { name: "Evening Gowns", href: "/store?filter=evening-gowns" },
  { name: "Noir Edit", href: "/store?filter=noir-edit" },
  { name: "Made-to-Measure", href: "/store?filter=made-to-measure" },
  { name: "All Dresses", href: "/store" },
  { name: "Measurement Guide", href: "/client-care#made-to-measure" },
  { name: "Account", href: "/account" },
  { name: "Shopping Bag", href: "/cart" },
]
