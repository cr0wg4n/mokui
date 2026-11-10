/** Named scales. Hosts can retheme by overriding the --mk-* custom properties. */
export const scale = {
  /** spacing: gap, padding. Theme vars: --mk-s-<name> */
  space: { none: '0', xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
  /** font size. Theme vars: --mk-f-<name> */
  font: { xs: '11px', sm: '13px', md: '15px', lg: '18px', xl: '24px' },
  /** width / height. Theme vars: --mk-z-<name> */
  size: { xs: '24px', sm: '48px', md: '96px', lg: '160px', xl: '240px' },
  /** min column width for auto-reflow grids. Theme vars: --mk-m-<name> */
  min: { xs: '80px', sm: '120px', md: '200px', lg: '280px', xl: '400px' },
  /** container-query breakpoints (container width, mobile-first) */
  bp: { sm: '480px', md: '768px', lg: '1024px' },
} as const

export type Space = keyof typeof scale.space
export type FontSize = keyof typeof scale.font
export type Breakpoint = keyof typeof scale.bp
