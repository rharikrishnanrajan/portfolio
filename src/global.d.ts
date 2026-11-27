// Global type augmentations for CSS custom properties used in inline styles
declare namespace React {
  interface CSSProperties {
    '--reveal-i'?: string | number
    '--scroll-progress'?: string | number
    [key: `--${string}`]: string | number | undefined
  }
}
