import 'highlight.js/styles/atom-one-dark.css'
import '../css/style.css'
import hljs from 'highlight.js'
import { toPng, toSvg, toBlob } from 'html-to-image'
import { js as jsBeautify, css as cssBeautify, html as htmlBeautify } from 'js-beautify'
import { THEMES_CSS } from './themes.js'

/* ---------- Default code ---------- */
const DEFAULT_CODE = `import java.util.List;
import java.util.Optional;

public class OrderService {

    private final OrderRepository repo;

    public Order create(String customerId, List<LineItem> items) {
        double total = items.stream()
            .mapToDouble(item -> item.price() * item.quantity())
            .sum();
        return repo.save(new Order(customerId, items, total));
    }

    public Optional<Order> findById(String id) {
        return repo.findById(id);
    }
}`

/* ---------- DOM refs ---------- */
const el = (id) => document.getElementById(id)
const codeInput = el('code')
const output = el('output')
const stage = el('stage')
const card = el('card')
const lineNums = el('lineNumbers')
const themeStyleEl = el('currentTheme')

/* ---------- Populate Language dropdown ---------- */
;(function populateLanguages() {
  const sel = el('language')
  const available = hljs.listLanguages().sort()
  const common = [
    'javascript', 'typescript', 'python', 'java', 'bash', 'shell',
    'json', 'xml', 'yaml', 'html', 'css', 'scss',
    'sql', 'markdown',
    'c', 'cpp', 'rust', 'go', 'csharp', 'kotlin', 'swift', 'objectivec',
    'ruby', 'php', 'lua', 'r', 'scala',
    'dockerfile', 'makefile', 'ini', 'diff', 'graphql', 'plaintext'
  ]
  const inList = new Set(available)
  sel.innerHTML = ''

  const auto = document.createElement('option')
  auto.value = 'auto'; auto.textContent = '自动检测'
  sel.appendChild(auto)

  const group1 = document.createElement('optgroup')
  group1.label = '常用'
  common.filter(l => inList.has(l)).forEach(l => {
    const o = document.createElement('option')
    o.value = l; o.textContent = l; group1.appendChild(o)
  })
  sel.appendChild(group1)

  const group2 = document.createElement('optgroup')
  group2.label = '全部 (' + available.length + ')'
  available.forEach(l => {
    if (common.includes(l)) return
    const o = document.createElement('option')
    o.value = l; o.textContent = l; group2.appendChild(o)
  })
  sel.appendChild(group2)
})()

/* ---------- Populate Theme dropdown ---------- */
;(function populateThemes() {
  const sel = el('theme')
  const dark = [], light = []
  Object.entries(THEMES_CSS).forEach(([key, v]) => {
    const name = v.name
    if (/light|github$|xcode|ascetic|docco|idea|^vs$/.test(key)) light.push([key, name])
    else dark.push([key, name])
  })

  const gD = document.createElement('optgroup'); gD.label = '暗色'
  dark.forEach(([k, n]) => {
    const o = document.createElement('option'); o.value = k; o.textContent = n
    gD.appendChild(o)
  })
  sel.appendChild(gD)

  const gL = document.createElement('optgroup'); gL.label = '亮色'
  light.forEach(([k, n]) => {
    const o = document.createElement('option'); o.value = k; o.textContent = n
    gL.appendChild(o)
  })
  sel.appendChild(gL)

  sel.value = 'atom-one-dark'
})()

/* ---------- Theme apply ---------- */
function applyTheme(key) {
  const t = THEMES_CSS[key]
  if (!t) return
  themeStyleEl.textContent = t.css
  const bgMatch = t.css.match(/\.hljs\s*\{[^}]*background\s*:\s*([^;}\s][^;}]*)/)
  const bgColor = bgMatch ? bgMatch[1].trim() : '#282c34'
  const isLight = isLightColor(bgColor)
  if (card) {
    card.style.setProperty('--line-num-color', isLight ? 'rgba(0,0,0,.3)' : 'rgba(255,255,255,.25)')
    card.style.setProperty('--line-num-dim-color', isLight ? 'rgba(0,0,0,.15)' : 'rgba(255,255,255,.12)')
  }
}

function isLightColor(color) {
  const c = color.replace(/\s/g, '')
  let r, g, b
  const hex6 = c.match(/^#([0-9a-f]{6})$/i)
  const hex3 = c.match(/^#([0-9a-f]{3})$/i)
  const rgb = c.match(/^rgb\((\d+),(\d+),(\d+)\)$/i)
  if (hex6) {
    r = parseInt(hex6[1].slice(0,2),16); g = parseInt(hex6[1].slice(2,4),16); b = parseInt(hex6[1].slice(4,6),16)
  } else if (hex3) {
    r = parseInt(hex3[1][0]+hex3[1][0],16); g = parseInt(hex3[1][1]+hex3[1][1],16); b = parseInt(hex3[1][2]+hex3[1][2],16)
  } else if (rgb) {
    r = +rgb[1]; g = +rgb[2]; b = +rgb[3]
  } else {
    return false
  }
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

/* ---------- Gradient swatches ---------- */
const GRADIENTS = [
  'linear-gradient(135deg,#ff9a9e 0%,#fad0c4 100%)',
  'linear-gradient(135deg,#a1c4fd 0%,#c2e9fb 100%)',
  'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
  'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
  'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
  'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)',
  'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',
  'linear-gradient(135deg,#30cfd0 0%,#330867 100%)',
  'linear-gradient(135deg,#f6d365 0%,#fda085 100%)',
  'linear-gradient(135deg,#84fab0 0%,#8fd3f4 100%)',
  'linear-gradient(135deg,#fccb90 0%,#d57eeb 100%)',
  'linear-gradient(135deg,#e0c3fc 0%,#8ec5fc 100%)',
  'linear-gradient(180deg,#0f2027 0%,#203a43 50%,#2c5364 100%)',
  'linear-gradient(135deg,#232526 0%,#414345 100%)',
  'linear-gradient(135deg,#1a2980 0%,#26d0ce 100%)',
  'linear-gradient(135deg,#ee0979 0%,#ff6a00 100%)',
  'linear-gradient(135deg,#0ba360 0%,#3cba92 100%)',
  'linear-gradient(135deg,#fdfcfb 0%,#e2d1c3 100%)',
]
const bgSwatches = el('bgSwatches')
GRADIENTS.forEach((g, i) => {
  const d = document.createElement('div')
  d.className = 'sw' + (i === 0 ? ' active' : '')
  d.style.background = g
  d.dataset.bg = g
  d.addEventListener('click', () => {
    document.querySelectorAll('.bg-swatches .sw').forEach(s => s.classList.remove('active'))
    d.classList.add('active')
    el('transparent').checked = false
    stage.style.background = g
  })
  bgSwatches.appendChild(d)
})

/* ---------- Word Wrap + Line Numbers ---------- */
function buildLineNumNodes(srcLines) {
  const frag = document.createDocumentFragment()
  if (!el('wordWrap').checked) {
    for (let i = 1; i <= srcLines.length; i++) {
      const d = document.createElement('div')
      d.textContent = i
      frag.appendChild(d)
    }
    return frag
  }
  const lhStr = getComputedStyle(output).lineHeight
  const lhPx = parseFloat(lhStr)
  const preEl = output.closest('pre')

  const wrapContainer = document.createElement('div')
  wrapContainer.style.cssText = `position:absolute;visibility:hidden;width:${preEl.clientWidth}px;font:${getComputedStyle(output).font};line-height:${lhStr};white-space:pre-wrap;word-break:break-all;overflow-wrap:break-word;padding:1em;box-sizing:border-box;`
  document.body.appendChild(wrapContainer)

  let globalLine = 1
  for (let i = 0; i < srcLines.length; i++) {
    wrapContainer.textContent = srcLines[i] || ' '
    const h = wrapContainer.scrollHeight
    const visualLines = Math.max(1, Math.round(h / lhPx))
    const label = document.createElement('div')
    label.textContent = globalLine
    label.dataset.logical = globalLine
    if (visualLines > 1) {
      label.style.height = (visualLines * lhPx) + 'px'
      label.style.display = 'flex'
      label.style.alignItems = 'flex-start'
    }
    frag.appendChild(label)
    globalLine++
  }
  document.body.removeChild(wrapContainer)
  return frag
}

function rebuildLineNumbers() {
  const src = codeInput.value
  const srcLines = src.split('\n')
  lineNums.innerHTML = ''
  lineNums.appendChild(buildLineNumNodes(srcLines))
}

/* ---------- Render ---------- */
let _renderRAF = null
function render() {
  if (_renderRAF) return
  _renderRAF = requestAnimationFrame(() => {
    _renderRAF = null
    const src = codeInput.value
    const lang = el('language').value

    if (lang === 'auto') {
      const result = hljs.highlightAuto(src)
      output.innerHTML = result.value
      el('langVal').textContent = result.language || '未知'
    } else {
      try {
        output.innerHTML = hljs.highlight(src, { language: lang }).value
      } catch {
        output.innerHTML = hljs.highlightAuto(src).value
      }
      el('langVal').textContent = lang
    }

    rebuildLineNumbers()

    const srcLines = src.split('\n')
    const maxLine = Math.max(srcLines.length, 1)
    const digits = String(maxLine).length
    lineNums.style.width = `calc(${digits}ch + 24px)`
    lineNums.style.minWidth = `calc(${digits}ch + 24px)`

    const pad = getComputedStyle(stage).padding
    const dims = el('dimensions')
    dims.textContent = `W:${stage.scrollWidth}px  H:${stage.scrollHeight}px  L:${maxLine}`
  })
}

/* ---------- Shadow ---------- */
function applyShadow() {
  const v = +el('shadow').value
  card.style.setProperty('--shadow', `0 20px ${v}px rgba(0,0,0,.55)`)
}

/* ---------- Typography ---------- */
function applyType() {
  const size = +el('fontSize').value
  const lh = (+el('lineHeight').value / 100)
  el('sizeVal').textContent = size
  el('lhVal').textContent = lh.toFixed(2)
  card.style.setProperty('--code-size', size + 'px')
  card.style.setProperty('--code-lh', lh)
}

/* ---------- Word Wrap CSS ---------- */
function applyWordWrap() {
  const wrap = el('wordWrap').checked
  const pre = output.closest('pre')
  if (pre) pre.style.whiteSpace = wrap ? 'pre-wrap' : 'pre'
  const codeWrap = card.querySelector('.code-wrap')
  if (codeWrap) codeWrap.style.overflowX = wrap ? 'hidden' : 'auto'
  if (wrap) output.style.wordBreak = 'break-all'
  else output.style.wordBreak = ''
}

/* ---------- Range slider sync ---------- */
function bindRange(id, valId, suffix, cb) {
  const r = el(id), v = el(valId)
  r.addEventListener('input', () => {
    v.textContent = r.value + (suffix || '')
    if (cb) cb()
  })
}
bindRange('padX', 'padXVal', 'px', () => stage.style.setProperty('--pad-x', el('padX').value + 'px'))
bindRange('padY', 'padYVal', 'px', () => stage.style.setProperty('--pad-y', el('padY').value + 'px'))
bindRange('radius', 'radVal', 'px', () => card.style.setProperty('--radius', el('radius').value + 'px'))
bindRange('shadow', 'shadowVal', '', applyShadow)
bindRange('fontSize', 'sizeVal', '', applyType)
bindRange('lineHeight', 'lhVal', '', applyType)
bindRange('maxWidth', 'maxWidthVal', 'px', () => card.style.maxWidth = el('maxWidth').value + 'px')
bindRange('scale', 'scaleVal', '×')

el('theme').addEventListener('change', (e) => {
  applyTheme(e.target.value)
  if (el('autoCardBg').checked) render()
})

el('showLines').addEventListener('change', render)
el('showWatermark').addEventListener('change', () => {
  el('watermark').classList.toggle('hidden', !el('showWatermark').checked)
})
el('transparent').addEventListener('change', () => {
  if (el('transparent').checked) stage.style.background = 'transparent'
  else {
    const active = document.querySelector('.bg-swatches .sw.active')
    stage.style.background = active ? active.dataset.bg : el('customBg').value
  }
})
el('customBg').addEventListener('input', () => {
  document.querySelectorAll('.bg-swatches .sw').forEach(s => s.classList.remove('active'))
  el('transparent').checked = false
  stage.style.background = el('customBg').value
})
el('cardBg').addEventListener('input', () => {
  el('autoCardBg').checked = false
  card.style.background = el('cardBg').value
})
el('autoCardBg').addEventListener('change', render)

el('windowStyle').addEventListener('change', () => {
  const v = el('windowStyle').value
  const hdr = el('windowHeader')
  const traffic = el('traffic')
  const spacer = hdr.querySelector('.header-spacer')
  hdr.classList.remove('hidden')
  traffic.style.visibility = 'visible'
  traffic.className = 'traffic'
  spacer.style.display = ''
  if (v === 'mac') {
    traffic.classList.add('mac')
    if (hdr.firstChild !== traffic) hdr.insertBefore(traffic, hdr.firstChild)
  } else if (v === 'windows') {
    traffic.classList.add('windows')
    hdr.appendChild(traffic)
    spacer.style.display = 'none'
  } else if (v === 'none') {
    traffic.style.visibility = 'hidden'
    if (hdr.firstChild !== traffic) hdr.insertBefore(traffic, hdr.firstChild)
  } else if (v === 'hide') {
    hdr.classList.add('hidden')
  }
})

el('titleInput').addEventListener('input', () => {
  el('windowTitle').value = el('titleInput').value
})
el('showTitle').addEventListener('change', () => {
  el('windowHeader').classList.toggle('no-title', !el('showTitle').checked)
})
el('titleBg').addEventListener('input', () => {
  el('autoTitleBg').checked = false
  card.style.setProperty('--title-bg', el('titleBg').value)
})
el('autoTitleBg').addEventListener('change', () => {
  if (el('autoTitleBg').checked) card.style.removeProperty('--title-bg')
  else card.style.setProperty('--title-bg', el('titleBg').value)
})
el('titleColor').addEventListener('input', () => {
  el('autoTitleColor').checked = false
  card.style.setProperty('--title-color', el('titleColor').value)
})
el('autoTitleColor').addEventListener('change', () => {
  if (el('autoTitleColor').checked) card.style.removeProperty('--title-color')
  else card.style.setProperty('--title-color', el('titleColor').value)
})
el('fontFamily').addEventListener('change', () => {
  card.style.setProperty('--code-font', el('fontFamily').value)
  rebuildLineNumbers()
})
el('indentStyle').addEventListener('change', () => {
  const v = el('indentStyle').value
  el('indentVal').textContent = (v === 'tab') ? 'Tab' : (v + ' 空格')
})

codeInput.addEventListener('input', render)
el('language').addEventListener('change', render)

codeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    const s = codeInput.selectionStart, end = codeInput.selectionEnd
    codeInput.value = codeInput.value.slice(0, s) + '  ' + codeInput.value.slice(end)
    codeInput.selectionStart = codeInput.selectionEnd = s + 2
    render()
  }
})

el('btnReset').addEventListener('click', () => {
  if (!confirm('清除所有已保存的设置并刷新？')) return
  try { localStorage.removeItem(SETTINGS_KEY) } catch(e) {}
  location.reload()
})

/* ---------- Flash toast ---------- */
function flash(msg) {
  const f = el('flash')
  f.textContent = msg
  f.classList.add('show')
  clearTimeout(flash._t)
  flash._t = setTimeout(() => f.classList.remove('show'), 1600)
}

/* ---------- Export ---------- */
const H2I_OPTS = () => ({
  pixelRatio: +el('scale').value,
  cacheBust: false,
  skipFonts: true,
  fontEmbedCSS: '',
})

function withNoScrollbars(fn) {
  const s = document.createElement('style')
  s.textContent = '::-webkit-scrollbar{width:0!important;height:0!important}*{scrollbar-width:none!important}'
  document.head.appendChild(s)
  return Promise.resolve().then(fn).finally(() => s.remove())
}

function filename(ext) {
  const base = (el('titleInput').value || 'CodeBeautify').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 40) || 'CodeBeautify'
  return `${base}_${Date.now()}.${ext}`
}

async function exportPng(download = true) {
  return withNoScrollbars(async () => {
    const dataUrl = await toPng(stage, H2I_OPTS())
    if (download) {
      const a = document.createElement('a')
      a.download = filename('png'); a.href = dataUrl; a.click()
      flash('PNG 已导出')
    }
    return dataUrl
  })
}

async function exportSvg() {
  return withNoScrollbars(async () => {
    const dataUrl = await toSvg(stage, H2I_OPTS())
    const a = document.createElement('a')
    a.download = filename('svg'); a.href = dataUrl; a.click()
    flash('SVG 已导出')
  })
}

async function copyPng() {
  try {
    await withNoScrollbars(async () => {
      const blob = await toBlob(stage, H2I_OPTS())
      await navigator.clipboard.write([ new ClipboardItem({ 'image/png': blob }) ])
      flash('PNG 已复制到剪贴板')
    })
  } catch (e) {
    console.error(e)
    flash('复制失败')
  }
}

/* ---------- HTML export ---------- */
function exportHtml() {
  const theme = el('theme').value
  const themeCss = (THEMES_CSS[theme] && THEMES_CSS[theme].css) || ''
  const codeHtml = output.innerHTML
  const lang = el('langVal').textContent
  const cardBg = getComputedStyle(card).backgroundColor
  const stageBg = stage.style.background || getComputedStyle(stage).background
  const radius = card.style.getPropertyValue('--radius') || '10px'
  const shadow = card.style.getPropertyValue('--shadow') || '0 20px 68px rgba(0,0,0,.55)'
  const padX = stage.style.getPropertyValue('--pad-x') || '56px'
  const padY = stage.style.getPropertyValue('--pad-y') || '56px'
  const font = el('fontFamily').value
  const size = el('fontSize').value + 'px'
  const lh = (el('lineHeight').value/100).toFixed(2)
  const title = el('titleInput').value || ''
  const wStyle = el('windowStyle').value
  const showTitleField = el('showTitle').checked
  const showLines = el('showLines').checked
  const maxWidthPx = el('maxWidth').value + 'px'
  const titleBgVal = el('autoTitleBg').checked ? 'transparent' : el('titleBg').value
  const titleColorVal = el('autoTitleColor').checked ? 'rgba(255,255,255,.55)' : el('titleColor').value
  const lineNumHtml = showLines ? lineNums.innerHTML : ''

  const trafficHtml = wStyle === 'mac'
    ? '<div class="traffic mac"><span></span><span></span><span></span></div>'
    : wStyle === 'windows'
    ? '<div class="traffic windows"><span></span><span></span><span></span></div>'
    : wStyle === 'none'
    ? '<div class="traffic" style="visibility:hidden"><span></span><span></span><span></span></div>'
    : ''

  const headerHtml = wStyle === 'hide' ? '' : `
    <div class="window-header" style="background:${titleBgVal};">
      ${trafficHtml}
      ${showTitleField && title ? `<div class="window-title-wrap"><span class="window-title">${title}</span></div>` : ''}
    </div>`

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${title || 'CodeBeautify Export'}</title>
<style>
${themeCss}
*{margin:0;padding:0;box-sizing:border-box}
body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:${stageBg};}
.card{background:${cardBg};border-radius:${radius};box-shadow:${shadow};max-width:${maxWidthPx};overflow:hidden;font-family:${font};}
.header{padding:12px 16px;display:flex;align-items:center;gap:10px;}
.traffic span{width:12px;height:12px;border-radius:50%;display:inline-block;}
.traffic span:nth-child(1){background:#ff5f57}.traffic span:nth-child(2){background:#febc2e}.traffic span:nth-child(3){background:#28c840}
.windows span:nth-child(1){background:#e81123}.windows span:nth-child(2){background:#999}.windows span:nth-child(3){background:#999;border-radius:0;width:10px;height:10px;clip-path:polygon(20% 50%,50% 80%,80% 50%,50% 20%)}
.window-title{color:${titleColorVal};font-size:13px;flex:1;text-align:center;}
.code-wrap{display:flex;overflow-x:auto;padding:${padY} ${padX};}
.line-nums{color:rgba(255,255,255,.25);text-align:right;user-select:none;padding-right:16px;font-size:${size};line-height:${lh};font-family:${font};}
pre{margin:0;font-size:${size};line-height:${lh};font-family:${font};white-space:pre;}
code.hljs{background:transparent;padding:0;}
</style></head><body>
<div class="card">
  ${headerHtml}
  <div class="code-wrap">
    ${lineNumHtml ? `<div class="line-nums">${lineNumHtml}</div>` : ''}
    <pre><code class="hljs">${codeHtml}</code></pre>
  </div>
</div>
</body></html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.download = filename('html'); a.href = url; a.click()
  URL.revokeObjectURL(url)
  flash('HTML 已导出')
}

/* ---------- RTF export ---------- */
async function exportRtf() {
  const dataUrl = await exportPng(false)
  const rtf = `{\\rtf1\\ansi{\\fonttbl{\\f0 Consolas;}}{\\pict\\pngblip ${dataUrl.split(',')[1]}}}`
  const blob = new Blob([rtf], { type: 'application/rtf' })
  const a = document.createElement('a')
  a.download = filename('rtf'); a.href = URL.createObjectURL(blob); a.click()
  flash('RTF 已导出')
}

/* ---------- Beautify ---------- */
const FORMAT_SUPPORT = {
  json: 'json', xml: 'xml', html: 'jsb-html', xhtml: 'jsb-html',
  svg: 'xml', css: 'jsb-css', scss: 'jsb-css', less: 'jsb-css', sass: 'jsb-css',
  sql: 'sql',
  java: 'jsb-cfamily', c: 'jsb-cfamily', cpp: 'jsb-cfamily', csharp: 'jsb-cfamily',
  kotlin: 'jsb-cfamily', swift: 'jsb-cfamily', rust: 'jsb-cfamily', go: 'jsb-cfamily',
  dart: 'jsb-cfamily', php: 'jsb-cfamily', objectivec: 'jsb-cfamily', scala: 'jsb-cfamily',
  groovy: 'jsb-cfamily', typescript: 'jsb-cfamily', ts: 'jsb-cfamily', tsx: 'jsb-cfamily',
  python: 'safe-ws', yaml: 'safe-ws', ruby: 'safe-ws', bash: 'safe-ws',
  shell: 'safe-ws', makefile: 'safe-ws',
  markdown: 'noop', plaintext: 'noop', diff: 'noop', ini: 'noop',
}

function getIndent() {
  const v = (el('indentStyle') && el('indentStyle').value) || '4'
  if (v === 'tab') return { size: 1, char: '\t', string: '\t', isTab: true }
  const n = parseInt(v, 10) || 4
  return { size: n, char: ' ', string: ' '.repeat(n), isTab: false }
}

function fmt_json(src) {
  const ind = getIndent()
  try { return JSON.stringify(JSON.parse(src), null, ind.string) }
  catch (e) {
    const cleaned = src.replace(/,(\s*[}\]])/g, '$1')
      .replace(/([{,\s])'([^'\\]*(?:\\.[^'\\]*)*)'(\s*:)/g, '$1"$2"$3')
      .replace(/:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, ': "$1"')
    try { return JSON.stringify(JSON.parse(cleaned), null, ind.string) }
    catch (e2) { throw new Error('无效 JSON: ' + e.message) }
  }
}

function fmt_xml(src) {
  const IND = getIndent().string
  let out = '', depth = 0
  const tokens = []
  let i = 0
  while (i < src.length) {
    if (src[i] === '<') {
      let end = src.indexOf('>', i)
      if (end === -1) { tokens.push(src.slice(i)); break }
      if (src.startsWith('<![CDATA[', i)) {
        end = src.indexOf(']]>', i)
        if (end === -1) { tokens.push(src.slice(i)); break }
        tokens.push({ type: 'cdata', text: src.slice(i, end + 3) }); i = end + 3; continue
      }
      if (src.startsWith('<!--', i)) {
        end = src.indexOf('-->', i)
        if (end === -1) { tokens.push(src.slice(i)); break }
        tokens.push({ type: 'comment', text: src.slice(i, end + 3) }); i = end + 3; continue
      }
      if (src[i+1] === '?') {
        end = src.indexOf('?>', i)
        if (end === -1) { tokens.push(src.slice(i)); break }
        tokens.push({ type: 'pi', text: src.slice(i, end + 2) }); i = end + 2; continue
      }
      if (src[i+1] === '!') {
        tokens.push({ type: 'directive', text: src.slice(i, end + 1) }); i = end + 1; continue
      }
      const raw = src.slice(i, end + 1)
      let type = 'open'
      if (raw.startsWith('</')) type = 'close'
      else if (raw.endsWith('/>')) type = 'self'
      tokens.push({ type, text: raw }); i = end + 1
    } else {
      let end = src.indexOf('<', i)
      if (end === -1) end = src.length
      const text = src.slice(i, end)
      if (text.trim()) tokens.push({ type: 'text', text: text.trim() })
      i = end
    }
  }
  for (let j = 0; j < tokens.length; j++) {
    const t = tokens[j]
    if (!t || typeof t === 'string') continue
    if (t.type === 'close') depth = Math.max(0, depth - 1)
    if (t.type === 'open' && tokens[j+1] && tokens[j+1].type === 'text' && tokens[j+2] && tokens[j+2].type === 'close') {
      out += IND.repeat(depth) + t.text + tokens[j+1].text + tokens[j+2].text + '\n'; j += 2; continue
    }
    out += IND.repeat(depth) + t.text + '\n'
    if (t.type === 'open') depth++
  }
  return out.replace(/\n+$/, '\n')
}

function fmt_jsb_js(src) {
  const ind = getIndent()
  return jsBeautify(src, {
    indent_size: ind.size, indent_char: ind.char, indent_with_tabs: ind.isTab,
    max_preserve_newlines: 2, preserve_newlines: true, keep_array_indentation: false,
    break_chained_methods: false, brace_style: 'collapse', space_before_conditional: true,
    unescape_strings: false, jslint_happy: false, end_with_newline: false,
    wrap_line_length: 0, indent_inner_html: false, comma_first: false, e4x: false,
  })
}

function fmt_jsb_cfamily(src) {
  let out = fmt_jsb_js(src)
  out = out.replace(/(\S) - > /g, '$1 -> ')
  for (let i = 0; i < 4; i++) {
    out = out.replace(/(\w) < ([\w][\w\[\] ,.<>?*&]*?) >/g, '$1<$2>')
  }
  return out
}

function fmt_jsb_html(src) {
  const ind = getIndent()
  return htmlBeautify(src, {
    indent_size: ind.size, indent_char: ind.char, indent_with_tabs: ind.isTab,
    max_preserve_newlines: 2, preserve_newlines: true, indent_inner_html: true,
    wrap_line_length: 0, wrap_attributes: 'auto', end_with_newline: false,
  })
}

function fmt_jsb_css(src) {
  const ind = getIndent()
  return cssBeautify(src, {
    indent_size: ind.size, indent_char: ind.char, indent_with_tabs: ind.isTab,
    preserve_newlines: true, newline_between_rules: true, end_with_newline: false,
  })
}

function fmt_safe_ws(src) {
  return src.replace(/\r\n?/g, '\n').split('\n').map(l => l.replace(/[ \t]+$/, '')).join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '')
}

function fmt_noop(src) { return src }

const FORMATTERS = {
  'json': fmt_json, 'xml': fmt_xml,
  'jsb-js': fmt_jsb_js, 'jsb-cfamily': fmt_jsb_cfamily,
  'jsb-html': fmt_jsb_html, 'jsb-css': fmt_jsb_css,
  'safe-ws': fmt_safe_ws, 'noop': fmt_noop,
}

function currentFormatterFor(lang) {
  if (!lang || lang === 'auto') {
    const detected = (el('langVal').textContent || '').toLowerCase()
    return FORMAT_SUPPORT[detected] || null
  }
  return FORMAT_SUPPORT[lang.toLowerCase()] || null
}

let _beautifyUndo = null
function doBeautify() {
  const lang = el('language').value
  const kind = currentFormatterFor(lang)
  if (!kind) {
    const label = (lang === 'auto' ? el('langVal').textContent : lang) || '未知'
    flash(`不支持格式化 "${label}"`)
    return
  }
  if (kind === 'sql') {
    flash('SQL 格式化暂不可用')
    return
  }
  const fn = FORMATTERS[kind]
  const before = codeInput.value
  let after
  try { after = fn(before) }
  catch (e) {
    flash('格式化错误: ' + (e.message || e))
    return
  }
  if (after === before) { flash('已经格式化过了'); return }
  _beautifyUndo = before
  codeInput.value = after
  render()
  const labels = {
    'json': 'JSON', 'xml': 'XML', 'sql': 'SQL',
    'jsb-js': 'js-beautify', 'jsb-cfamily': 'js-beautify',
    'jsb-html': 'js-beautify (HTML)', 'jsb-css': 'js-beautify (CSS)',
    'safe-ws': '空白清理', 'noop': '无变化'
  }
  flash('✨ ' + (labels[kind] || kind))
}

el('btnBeautify').addEventListener('click', doBeautify)
el('btnBeautifyUndo').addEventListener('click', () => {
  if (_beautifyUndo == null) { flash('没有可撤销的操作'); return }
  const cur = codeInput.value
  codeInput.value = _beautifyUndo
  _beautifyUndo = cur
  render()
  flash('↶ 已撤销')
})

/* ---------- Persistence ---------- */
const SETTINGS_KEY = 'CodeBeautify.settings.v1'

const SAVED_FIELDS = [
  ['theme', 'value'], ['language', 'value'], ['windowStyle', 'value'],
  ['titleInput', 'value'], ['showTitle', 'checked'], ['showLines', 'checked'],
  ['showWatermark', 'checked'], ['transparent', 'checked'],
  ['customBg', 'value'], ['cardBg', 'value'], ['autoCardBg', 'checked'],
  ['titleBg', 'value'], ['autoTitleBg', 'checked'],
  ['titleColor', 'value'], ['autoTitleColor', 'checked'],
  ['padX', 'value'], ['padY', 'value'], ['radius', 'value'], ['shadow', 'value'],
  ['fontFamily', 'value'], ['fontSize', 'value'], ['lineHeight', 'value'],
  ['scale', 'value'], ['indentStyle', 'value'], ['maxWidth', 'value'], ['wordWrap', 'checked'],
]

function gatherSettings() {
  const s = {}
  for (const [id, prop] of SAVED_FIELDS) {
    const e = el(id)
    if (e) s[id] = e[prop]
  }
  const active = document.querySelector('.bg-swatches .sw.active')
  s._activeGradient = active ? active.dataset.bg : null
  return s
}

function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(gatherSettings())) }
  catch (e) { console.warn('设置保存失败:', e.message) }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) { return null }
}

function applySettings(s) {
  if (!s) return
  for (const [id, prop] of SAVED_FIELDS) {
    if (s[id] !== undefined && el(id)) el(id)[prop] = s[id]
  }
  applyTheme(el('theme').value)
  el('padXVal').textContent = el('padX').value + 'px'
  el('padYVal').textContent = el('padY').value + 'px'
  el('radVal').textContent = el('radius').value + 'px'
  el('shadowVal').textContent = el('shadow').value
  el('sizeVal').textContent = el('fontSize').value
  el('lhVal').textContent = (el('lineHeight').value/100).toFixed(2)
  el('scaleVal').textContent = el('scale').value + '×'
  el('maxWidthVal').textContent = el('maxWidth').value + 'px'
  const iv = el('indentStyle').value
  el('indentVal').textContent = (iv === 'tab') ? 'Tab' : (iv + ' 空格')

  stage.style.setProperty('--pad-x', el('padX').value + 'px')
  stage.style.setProperty('--pad-y', el('padY').value + 'px')
  card.style.setProperty('--radius', el('radius').value + 'px')
  card.style.maxWidth = el('maxWidth').value + 'px'
  applyShadow()
  applyType()
  card.style.setProperty('--code-font', el('fontFamily').value)

  el('windowStyle').dispatchEvent(new Event('change'))
  el('windowTitle').value = el('titleInput').value
  el('windowHeader').classList.toggle('no-title', !el('showTitle').checked)
  el('watermark').classList.toggle('hidden', !el('showWatermark').checked)

  if (!el('autoTitleBg').checked && s.titleBg) card.style.setProperty('--title-bg', s.titleBg)
  else card.style.removeProperty('--title-bg')
  if (!el('autoTitleColor').checked && s.titleColor) card.style.setProperty('--title-color', s.titleColor)
  else card.style.removeProperty('--title-color')

  document.querySelectorAll('.bg-swatches .sw').forEach(sw => sw.classList.remove('active'))
  if (s.transparent) {
    stage.style.background = 'transparent'
  } else if (s._activeGradient) {
    stage.style.background = s._activeGradient
    document.querySelectorAll('.bg-swatches .sw').forEach(sw => {
      if (sw.dataset.bg === s._activeGradient) sw.classList.add('active')
    })
  } else if (s.customBg) {
    stage.style.background = s.customBg
  }

  if (!s.autoCardBg && s.cardBg) card.style.background = s.cardBg
  applyWordWrap()
}

function wireAutoSave() {
  let t = null
  const debouncedSave = () => { clearTimeout(t); t = setTimeout(saveSettings, 200) }
  for (const [id] of SAVED_FIELDS) {
    const e = el(id)
    if (!e) continue
    e.addEventListener('change', debouncedSave)
    e.addEventListener('input', debouncedSave)
  }
  document.querySelectorAll('.bg-swatches .sw').forEach(sw => {
    sw.addEventListener('click', debouncedSave)
  })
}

/* ---------- Export button bindings ---------- */
el('btnExportPng').addEventListener('click', () => exportPng())
el('btnExportPng2').addEventListener('click', () => exportPng())
el('btnCopyImg').addEventListener('click', copyPng)
el('btnExportSvg').addEventListener('click', exportSvg)
el('btnExportSvg2').addEventListener('click', exportSvg)
el('btnExportHtml').addEventListener('click', exportHtml)
el('btnExportHtml2').addEventListener('click', exportHtml)
el('btnExportRtf').addEventListener('click', exportRtf)
el('btnExportRtf2').addEventListener('click', exportRtf)

/* ---------- Keyboard shortcut ---------- */
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
    e.preventDefault()
    doBeautify()
  }
})

/* ---------- Init ---------- */
codeInput.value = DEFAULT_CODE
el('language').value = 'java'
applyTheme('atom-one-dark')
applyType()
applyShadow()
card.style.setProperty('--code-font', el('fontFamily').value)
card.style.setProperty('--radius', el('radius').value + 'px')
card.style.maxWidth = el('maxWidth').value + 'px'
stage.style.setProperty('--pad-x', el('padX').value + 'px')
stage.style.setProperty('--pad-y', el('padY').value + 'px')
stage.style.background = GRADIENTS[0]

const _saved = loadSettings()
if (_saved) applySettings(_saved)
wireAutoSave()
render()
