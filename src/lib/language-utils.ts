/**
 * Detect if text contains Arabic characters
 */
export function isArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
}

/**
 * Detect if text is primarily RTL (Right-to-Left)
 */
export function isRTL(text: string): boolean {
  // Check for Arabic, Hebrew, and other RTL scripts
  const rtlPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF\uFB1D-\uFB4F]/;
  return rtlPattern.test(text);
}

/**
 * Get text direction based on content
 */
export function getTextDirection(text: string): 'rtl' | 'ltr' {
  return isRTL(text) ? 'rtl' : 'ltr';
}
