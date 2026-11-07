/** Inline SVG masks for the three light ambience presets. */
const NS = 'http://www.w3.org/2000/svg'
const PREFIX = 'dsh-bloom-fog-'

type Attributes = Record<string, string | number>
function element<K extends keyof SVGElementTagNameMap>(doc: Document, name: K, attrs: Attributes = {}): SVGElementTagNameMap[K] {
  const node = doc.createElementNS(NS, name)
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value))
  return node
}

/**
 * The masks use object bounding box coordinates and luminance, so they can mask
 * any theme-coloured HTML overlay via mask-image: url(#dsh-bloom-fog-stream),
 * and likewise for wash and clear. The transparent centre preserves content.
 * The result is static, contains no external resources, and is removed by its owner.
 */
export function buildFogDefinitions(doc: Document): SVGSVGElement {
  const svg = element(doc, 'svg', { width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false' })
  svg.style.cssText = 'position:fixed;pointer-events:none'
  const defs = element(doc, 'defs')
  const gradient = element(doc, 'radialGradient', { id: `${PREFIX}soft` })
  for (const [offset, opacity] of [['0%', '.50'], ['25%', '.40'], ['65%', '.12'], ['100%', '0']]) {
    gradient.append(element(doc, 'stop', { offset, 'stop-color': 'white', 'stop-opacity': opacity }))
  }
  const noise = element(doc, 'filter', { id: `${PREFIX}noise`, filterUnits: 'userSpaceOnUse', primitiveUnits: 'userSpaceOnUse', x: '-.15', y: '-.15', width: '1.3', height: '1.3', 'color-interpolation-filters': 'sRGB' })
  noise.append(
    element(doc, 'feTurbulence', { type: 'fractalNoise', baseFrequency: '8 10', numOctaves: 2, seed: 13, result: 'texture' }),
    element(doc, 'feDisplacementMap', { in: 'SourceGraphic', in2: 'texture', scale: '.09', xChannelSelector: 'R', yChannelSelector: 'G', result: 'broken' }),
    element(doc, 'feColorMatrix', { in: 'texture', type: 'matrix', values: '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.4 0 0 0 -.25', result: 'grain' }),
    element(doc, 'feComposite', { in: 'broken', in2: 'grain', operator: 'in' }),
  )
  defs.append(gradient, noise)

  const masks = Object.fromEntries(['stream', 'wash', 'clear'].map(name => {
    const mask = element(doc, 'mask', { id: `${PREFIX}${name}`, maskUnits: 'objectBoundingBox', maskContentUnits: 'objectBoundingBox', x: 0, y: 0, width: 1, height: 1, 'mask-type': 'luminance' })
    defs.append(mask)
    return [name, mask]
  })) as Record<'stream' | 'wash' | 'clear', SVGMaskElement>

  // One low-frequency, two-octave filter per mask breaks the gradient edges.
  // Distributions are deliberately asymmetric and avoid the text-heavy centre.
  const fields = {
    stream: [[.12, .18, .27, .19, 1], [.87, .82, .27, .19, .85]],
    wash: [[.24, .10, .24, .15, .9], [.78, .13, .22, .16, .85], [.20, .88, .22, .15, .8], [.78, .89, .23, .15, .85]],
    clear: [[-.02, .34, .21, .30, .55], [1.02, .66, .21, .30, .55]],
  }
  for (const [name, shapes] of Object.entries(fields)) {
    const group = element(doc, 'g', { filter: `url(#${PREFIX}noise)` })
    for (const [cx, cy, rx, ry, opacity] of shapes) {
      group.append(element(doc, 'ellipse', { cx, cy, rx, ry, opacity, fill: `url(#${PREFIX}soft)` }))
    }
    masks[name as keyof typeof masks].append(group)
  }

  svg.append(defs)
  return svg
}
