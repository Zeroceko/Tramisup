/**
 * Tiramisup Design System
 * ────────────────────────────────────────────────
 * Tek kaynak. Tüm renkler, radius, shadow, font
 * buradan okunur. Tailwind class'ları yerine bu
 * token'ları kullanın; Figma değişince burası değişir.
 *
 * RENK PALETİ
 *   pink   #ffd7ef  → primary CTA, active nav, highlight
 *   teal   #95dbda  → secondary accent, progress, success-ish
 *   yellow #fee74e  → logo bg, featured accent
 *   green  #75fc96  → live badge, positive delta
 *   bg     #f6f6f6  → page background
 *   surface#ffffff  → card / modal background
 *   text   #0d0d12  → primary text
 *   sub    #666d80  → secondary text
 *   muted  #5b5a64  → placeholder / tertiary
 *   border #e8e8e8  → divider, card border
 *
 * KURAL
 *   - Blue, indigo, violet, purple KULLANMA
 *   - Gradient button KULLANMA — solid pink veya teal
 *   - rounded-xl (11px) KULLANMA — minimum card radius = 15px
 *   - shadow-sm KULLANMA — card shadow = shadow-card
 */

export const ds = {
  color: {
    pink:       "#ffd7ef",
    pinkDark:   "#f5c8e4",
    teal:       "#95dbda",
    tealDark:   "#8cb4b9",
    yellow:     "#fee74e",
    green:      "#75fc96",
    bg:         "#f6f6f6",
    surface:    "#ffffff",
    text:       "#0d0d12",
    sub:        "#666d80",
    muted:      "#5b5a64",
    border:     "#e8e8e8",
    borderDark: "#d0d0d0",
  },

  // Tailwind class shortcuts — kullanımı kolaylaştırır
  tw: {
    // Backgrounds
    pageBg:     "bg-[#f6f6f6]",
    card:       "bg-white rounded-[15px] border border-[#e8e8e8]",
    cardHover:  "bg-white rounded-[15px] border border-[#e8e8e8] hover:border-[#d0d0d0] transition",

    // Typography
    heading:    "text-[28px] font-bold text-[#0d0d12] tracking-[-0.02em]",
    subheading: "text-[20px] font-semibold text-[#0d0d12] tracking-[-0.01em]",
    body:       "text-[14px] text-[#0d0d12]",
    label:      "text-[13px] font-semibold text-[#0d0d12]",
    sub:        "text-[13px] text-[#666d80]",
    micro:      "text-[11px] text-[#9ca3af]",
    eyebrow:    "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]",

    // Buttons
    btnPrimary: "inline-flex items-center justify-center px-5 h-10 rounded-full bg-[#ffd7ef] text-[13px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition",
    btnSecondary: "inline-flex items-center justify-center px-5 h-10 rounded-full border border-[#e8e8e8] text-[13px] font-medium text-[#666d80] hover:bg-[#f6f6f6] transition",
    btnTeal:    "inline-flex items-center justify-center px-5 h-10 rounded-full bg-[#95dbda] text-[13px] font-semibold text-[#0d0d12] hover:bg-[#8cb4b9] transition",
    btnDanger:  "inline-flex items-center justify-center px-5 h-10 rounded-full bg-red-50 text-[13px] font-semibold text-red-600 hover:bg-red-100 transition",

    // Badges / tags
    tagPink:    "inline-flex items-center px-3 py-1 rounded-full bg-[#ffd7ef] text-[11px] font-semibold text-[#0d0d12]",
    tagTeal:    "inline-flex items-center px-3 py-1 rounded-full bg-[#95dbda] text-[11px] font-semibold text-[#0d0d12]",
    tagGreen:   "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#75fc96] text-[11px] font-semibold text-[#0d0d12]",
    tagYellow:  "inline-flex items-center px-3 py-1 rounded-full bg-[#fee74e] text-[11px] font-semibold text-[#0d0d12]",
    tagGray:    "inline-flex items-center px-3 py-1 rounded-full bg-[#f6f6f6] text-[11px] font-semibold text-[#666d80]",

    // Form inputs
    input:      "w-full px-4 py-3 rounded-[12px] border border-[#e8e8e8] text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition",
    textarea:   "w-full px-4 py-3 rounded-[12px] border border-[#e8e8e8] text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition resize-none",

    // Section header
    sectionHeader: "text-[12px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-1",
  },
} as const;
