const SVG_NS = 'http://www.w3.org/2000/svg'
const XLINK_NS = 'http://www.w3.org/1999/xlink'
export const LIQUID_LENS_ID = 'dsh-bloom-liquid-lens'

function channelMap(channel: 'r' | 'g'): string {
  const vertical = channel === 'g'
  const color = (v: number) => vertical ? `rgb(0,${v},0)` : `rgb(${v},0,0)`
  const stops = [[0, 232], [0.035, 160], [0.08, 128], [0.92, 128], [0.965, 96], [1, 24]]
  const svg = `<svg xmlns="${SVG_NS}" width="128" height="128"><defs><linearGradient id="r" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map(([at, value]) => `<stop offset="${at}" stop-color="${color(value)}"/>`).join('')}</linearGradient></defs><rect width="128" height="128" fill="url(#r)"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function buildLiquidLens(doc: Document): SVGSVGElement {
  const svg = doc.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  svg.setAttribute('aria-hidden', 'true')
  svg.style.cssText = 'position:fixed;pointer-events:none'
  const defs = doc.createElementNS(SVG_NS, 'defs')
  const filter = doc.createElementNS(SVG_NS, 'filter')
  filter.id = LIQUID_LENS_ID
  filter.setAttribute('x', '0%')
  filter.setAttribute('y', '0%')
  filter.setAttribute('width', '100%')
  filter.setAttribute('height', '100%')
  filter.setAttribute('color-interpolation-filters', 'sRGB')
  filter.setAttribute('primitiveUnits', 'objectBoundingBox')
  for (const channel of ['r', 'g'] as const) {
    const image = doc.createElementNS(SVG_NS, 'feImage')
    image.setAttribute('href', channelMap(channel))
    image.setAttributeNS(XLINK_NS, 'xlink:href', channelMap(channel))
    image.setAttribute('width', '1')
    image.setAttribute('height', '1')
    image.setAttribute('preserveAspectRatio', 'none')
    image.setAttribute('result', channel)
    filter.append(image)
  }
  const map = doc.createElementNS(SVG_NS, 'feComposite')
  for (const [key, value] of Object.entries({ in: 'r', in2: 'g', operator: 'arithmetic', k2: '1', k3: '1', result: 'lens' })) map.setAttribute(key, value)
  const neutral = doc.createElementNS(SVG_NS, 'feComponentTransfer')
  neutral.setAttribute('in', 'lens')
  neutral.setAttribute('result', 'neutral')
  for (const channel of ['R', 'G']) {
    const transfer = doc.createElementNS(SVG_NS, `feFunc${channel}`)
    transfer.setAttribute('type', 'linear')
    transfer.setAttribute('slope', '1')
    transfer.setAttribute('intercept', String(0.5 - 128 / 255))
    neutral.append(transfer)
  }
  const bend = doc.createElementNS(SVG_NS, 'feDisplacementMap')
  for (const [key, value] of Object.entries({ in: 'SourceGraphic', in2: 'neutral', scale: '0.016', xChannelSelector: 'R', yChannelSelector: 'G' })) bend.setAttribute(key, value)
  filter.append(map, neutral, bend)
  defs.append(filter)
  svg.append(defs)
  return svg
}
