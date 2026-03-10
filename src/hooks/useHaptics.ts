type HapticType = 'light' | 'medium' | 'heavy' | 'success'

const patterns: Record<HapticType, number | number[]> = {
  light: 18,
  medium: 40,
  heavy: 80,
  success: [25, 50, 25],
}

const supportsVibrate =
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

// iOS haptic trick: toggling a <input switch> checkbox fires native haptic
let iosLabel: HTMLLabelElement | null = null
let iosInited = false

function ensureIOSSwitch() {
  if (iosInited || typeof document === 'undefined') return
  iosInited = true
  const label = document.createElement('label')
  label.style.position = 'fixed'
  label.style.left = '-9999px'
  label.style.top = '-9999px'
  label.style.pointerEvents = 'none'
  label.style.opacity = '0'
  label.setAttribute('aria-hidden', 'true')
  const cb = document.createElement('input')
  cb.type = 'checkbox'
  cb.setAttribute('switch', '')
  cb.style.all = 'initial'
  cb.style.appearance = 'none'
  cb.style.position = 'fixed'
  cb.style.left = '-9999px'
  label.appendChild(cb)
  document.body.appendChild(label)
  iosLabel = label
}

function triggerIOS() {
  ensureIOSSwitch()
  iosLabel?.click()
}

export function haptic(type: HapticType = 'light') {
  try {
    if (supportsVibrate) {
      navigator.vibrate(patterns[type])
    } else {
      // iOS fallback: fire checkbox switch toggle(s)
      const p = patterns[type]
      if (typeof p === 'number') {
        triggerIOS()
      } else {
        // Pattern: fire once per on-phase
        let delay = 0
        for (let i = 0; i < p.length; i += 2) {
          const d = delay
          setTimeout(() => triggerIOS(), d)
          delay += p[i] + (p[i + 1] ?? 0)
        }
      }
    }
  } catch (_) { /* safe fallback */ }
}
