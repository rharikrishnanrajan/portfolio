// Global type augmentations
declare namespace React {
  interface CSSProperties {
    '--reveal-i'?: string | number;
    '--scroll-progress'?: string | number;
    [key: `--${string}`]: string | number | undefined;
  }
}