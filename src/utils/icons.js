import * as lucideStatic from 'lucide-static'

/**
 * Get a Lucide icon SVG string with optional size and class
 * @param {string} name - Icon name in PascalCase (e.g., 'Home', 'Gamepad2', 'Server')
 * @param {object} options - Options for the icon
 * @param {number} options.size - Icon size in pixels (default: 24)
 * @param {string} options.class - Additional CSS classes
 * @returns {string} SVG string
 */
export function icon(name, options = {}) {
  const { size = 24, class: className = '' } = options

  const iconSvg = lucideStatic[name]

  if (!iconSvg) {
    console.warn(`Icon "${name}" not found in lucide-static`)
    return ''
  }

  // Replace width/height and add class
  let svg = iconSvg
    .replace(/width="24"/, `width="${size}"`)
    .replace(/height="24"/, `height="${size}"`)

  if (className) {
    svg = svg.replace('<svg', `<svg class="${className}"`)
  }

  return svg
}

// Export commonly used icons for convenience
export const icons = {
  home: opts => icon('Home', opts),
  gamepad: opts => icon('Gamepad2', opts),
  server: opts => icon('Server', opts),
  file: opts => icon('FileText', opts),
  arrowLeft: opts => icon('ArrowLeft', opts),
  monitor: opts => icon('Monitor', opts),
  cpu: opts => icon('Cpu', opts),
  hardDrive: opts => icon('HardDrive', opts),
  users: opts => icon('Users', opts),
}
