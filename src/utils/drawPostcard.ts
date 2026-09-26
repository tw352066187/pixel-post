import type { Stamp } from '../data/stamps'

export type PostcardPayload = {
  message: string
  fromName: string
  stamp: Stamp
  city: string
  blessing: string
  dateLabel: string
}

const W = 640
const H = 400

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const lines: string[] = []
  let current = ''
  for (const ch of text) {
    const trial = current + ch
    if (ctx.measureText(trial).width > maxWidth && current) {
      lines.push(current)
      current = ch
      if (lines.length >= maxLines) break
    } else {
      current = trial
    }
  }
  if (lines.length < maxLines && current) lines.push(current)
  if (lines.length > maxLines) return lines.slice(0, maxLines)
  return lines
}

function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

function drawStamp(
  ctx: CanvasRenderingContext2D,
  stamp: Stamp,
  ox: number,
  oy: number,
  scale: number,
) {
  const cell = scale
  for (let row = 0; row < stamp.pattern.length; row++) {
    for (let col = 0; col < stamp.pattern[row]!.length; col++) {
      const v = stamp.pattern[row]![col]!
      drawPixelRect(
        ctx,
        ox + col * cell,
        oy + row * cell,
        cell,
        cell,
        stamp.colors[v]!,
      )
    }
  }
  // jagged stamp border
  ctx.strokeStyle = '#ffd541'
  ctx.lineWidth = 2
  ctx.strokeRect(ox - 2, oy - 2, 8 * cell + 4, 8 * cell + 4)
}

/** Draw postcard onto canvas; returns data URL */
export function drawPostcard(
  canvas: HTMLCanvasElement,
  payload: PostcardPayload,
): string {
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  canvas.width = W
  canvas.height = H

  // CRT dark bg
  drawPixelRect(ctx, 0, 0, W, H, '#0d0f1a')

  // outer bezel
  drawPixelRect(ctx, 8, 8, W - 16, H - 16, '#3d3f5c')
  drawPixelRect(ctx, 16, 16, W - 32, H - 32, '#f4e4bc')

  // left message panel
  drawPixelRect(ctx, 28, 28, 300, H - 56, '#fff8e7')
  // dashed divider
  ctx.strokeStyle = '#c4a882'
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(340, 36)
  ctx.lineTo(340, H - 36)
  ctx.stroke()
  ctx.setLineDash([])

  // header ribbon
  drawPixelRect(ctx, 28, 28, 300, 36, '#e45a3a')
  ctx.fillStyle = '#ffd541'
  ctx.font = '14px "Press Start 2P", monospace'
  ctx.fillText('PIXEL POST', 44, 52)

  // message body
  ctx.fillStyle = '#1a1c2c'
  ctx.font = '22px "ZCOOL KuaiLe", "Microsoft YaHei", sans-serif'
  const lines = wrapText(ctx, payload.message || '（空白的心意）', 268, 6)
  lines.forEach((line, i) => {
    ctx.fillText(line, 44, 96 + i * 32)
  })

  // from
  ctx.fillStyle = '#5a4632'
  ctx.font = '16px "ZCOOL KuaiLe", "Microsoft YaHei", sans-serif'
  ctx.fillText(`—— ${payload.fromName || '匿名像素'}`, 44, H - 48)

  // right side: destination
  ctx.fillStyle = '#1a1c2c'
  ctx.font = '12px "Press Start 2P", monospace'
  ctx.fillText('TO:', 368, 56)

  ctx.font = '20px "ZCOOL KuaiLe", "Microsoft YaHei", sans-serif'
  ctx.fillText(payload.city, 368, 88)

  // stamp
  drawStamp(ctx, payload.stamp, 520, 40, 8)

  // postmark circle
  ctx.strokeStyle = '#e45a3a'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(480, 160, 42, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(480, 160, 34, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#e45a3a'
  ctx.font = '9px "Press Start 2P", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('PIXEL', 480, 154)
  ctx.fillText('MAIL', 480, 168)
  ctx.font = '8px "Press Start 2P", monospace'
  ctx.fillText(payload.dateLabel, 480, 182)
  ctx.textAlign = 'left'

  // blessing box
  drawPixelRect(ctx, 360, 220, 248, 140, '#1a1c2c')
  drawPixelRect(ctx, 366, 226, 236, 128, '#243447')
  ctx.fillStyle = '#ffd541'
  ctx.font = '10px "Press Start 2P", monospace'
  ctx.fillText('MSG', 380, 250)
  ctx.fillStyle = '#a7f070'
  ctx.font = '16px "ZCOOL KuaiLe", "Microsoft YaHei", sans-serif'
  const blessLines = wrapText(ctx, payload.blessing, 210, 4)
  blessLines.forEach((line, i) => {
    ctx.fillText(line, 380, 278 + i * 24)
  })

  // scanline overlay (baked into PNG lightly)
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  for (let y = 0; y < H; y += 3) {
    ctx.fillRect(0, y, W, 1)
  }

  return canvas.toDataURL('image/png')
}
