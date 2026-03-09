type HapticType = 'light' | 'medium' | 'heavy' | 'success'

const patterns: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [15, 40, 15],
}

export function haptic(type: HapticType = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(patterns[type])
  }
}
