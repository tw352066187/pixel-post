import { useCallback, useMemo, useRef, useState } from 'react'
import { STAMPS, type Stamp } from './data/stamps'
import { pickDestination } from './data/greetings'
import { drawPostcard } from './utils/drawPostcard'
import './App.css'

const MAX_CHARS = 48

function todayLabel() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${mm}/${dd}`
}

export default function App() {
  const [message, setMessage] = useState('')
  const [fromName, setFromName] = useState('')
  const [stampId, setStampId] = useState(STAMPS[0]!.id)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dest, setDest] = useState(() => pickDestination())
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('插入卡带 · 撰写明信片')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const stamp = useMemo(
    () => STAMPS.find((s) => s.id === stampId) ?? STAMPS[0]!,
    [stampId],
  )

  const rerollDest = () => {
    setDest(pickDestination())
    setStatus('已重抽收件人坐标')
  }

  const handleSend = useCallback(() => {
    if (!message.trim()) {
      setStatus('错误：信件内容为空！')
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return

    setSending(true)
    setStatus('投递中… 邮差在跑…')

    window.setTimeout(() => {
      const url = drawPostcard(canvas, {
        message: message.trim(),
        fromName: fromName.trim() || '匿名像素',
        stamp,
        city: dest.city,
        blessing: dest.blessing,
        dateLabel: todayLabel(),
      })
      setPreviewUrl(url)
      setSending(false)
      setStatus('投递成功！可下载 PNG')
    }, 600)
  }, [message, fromName, stamp, dest])

  const handleDownload = () => {
    if (!previewUrl) return
    const a = document.createElement('a')
    a.href = previewUrl
    a.download = `pixel-post-${Date.now()}.png`
    a.click()
    setStatus('PNG 已下载到本地')
  }

  const handleReset = () => {
    setPreviewUrl(null)
    setMessage('')
    setFromName('')
    setDest(pickDestination())
    setStatus('新的一局 · 重新写信')
  }

  return (
    <div className="crt-stage">
      <div className="scanlines" aria-hidden />
      <div className="crt-glow" aria-hidden />

      <header className="top-bar">
        <div className="logo-block">
          <span className="logo-pixel">▣</span>
          <div>
            <h1>像素邮局</h1>
            <p className="sub">PIXEL POST OFFICE · 8-BIT MAIL</p>
          </div>
        </div>
        <div className="status-lamp">
          <span className={`lamp ${sending ? 'blink' : 'on'}`} />
          <span className="status-text">{status}</span>
        </div>
      </header>

      <main className="arcade-shell">
        <section className="panel left-panel">
          <div className="panel-label">▶ 撰写信件</div>

          <label className="field">
            <span>寄件人署名</span>
            <input
              type="text"
              maxLength={12}
              placeholder="例如：小像素"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
            />
          </label>

          <label className="field">
            <span>
              明信片正文
              <em>
                {message.length}/{MAX_CHARS}
              </em>
            </span>
            <textarea
              maxLength={MAX_CHARS}
              rows={4}
              placeholder="写下想说的话（限 48 字）…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>

          <div className="field">
            <span>像素邮票贴纸</span>
            <div className="stamp-grid">
              {STAMPS.map((s) => (
                <StampButton
                  key={s.id}
                  stamp={s}
                  active={s.id === stampId}
                  onSelect={() => setStampId(s.id)}
                />
              ))}
            </div>
          </div>

          <div className="dest-box">
            <div className="dest-row">
              <span className="tag">收件城市</span>
              <strong>{dest.city}</strong>
            </div>
            <div className="dest-row bless">
              <span className="tag">随机祝福</span>
              <p>{dest.blessing}</p>
            </div>
            <button type="button" className="btn ghost" onClick={rerollDest}>
              🎲 重抽坐标
            </button>
          </div>

          <div className="actions">
            <button
              type="button"
              className="btn primary"
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? '投递中…' : '📨 寄出明信片'}
            </button>
          </div>
        </section>

        <section className="panel right-panel">
          <div className="panel-label">▶ 生成画面</div>
          <div className="screen-bezel">
            <div className="screen-inner">
              {previewUrl ? (
                <img src={previewUrl} alt="像素明信片预览" className="preview-img" />
              ) : (
                <div className="placeholder">
                  <p className="blink-text">INSERT COIN</p>
                  <p>写好信 → 选邮票 → 寄出</p>
                  <p className="hint">画面将在此处生成</p>
                </div>
              )}
            </div>
          </div>
          <div className="actions row">
            <button
              type="button"
              className="btn primary"
              onClick={handleDownload}
              disabled={!previewUrl}
            >
              ⬇ 下载 PNG
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={handleReset}
              disabled={!previewUrl && !message}
            >
              ↺ 再写一张
            </button>
          </div>
        </section>
      </main>

      <footer className="foot">
        <span>© PIXEL POST · CRT MODE ON</span>
        <span className="jitter">PRESS START TO CARE</span>
      </footer>

      <canvas ref={canvasRef} className="hidden-canvas" aria-hidden />
    </div>
  )
}

function StampButton({
  stamp,
  active,
  onSelect,
}: {
  stamp: Stamp
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={`stamp-btn ${active ? 'active' : ''}`}
      onClick={onSelect}
      title={stamp.name}
      aria-pressed={active}
    >
      <StampPreview stamp={stamp} />
      <span>{stamp.name}</span>
    </button>
  )
}

function StampPreview({ stamp }: { stamp: Stamp }) {
  const size = 8
  const cells = stamp.pattern.flatMap((row, r) =>
    row.map((v, c) => (
      <rect
        key={`${r}-${c}`}
        x={c}
        y={r}
        width={1}
        height={1}
        fill={stamp.colors[v]}
      />
    )),
  )
  return (
    <svg
      width={size * 4}
      height={size * 4}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      className="stamp-svg"
    >
      {cells}
    </svg>
  )
}
