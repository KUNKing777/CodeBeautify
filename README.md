# CodeBeautify

代码截图美化器 — 粘贴代码，选择主题，一键导出精美截图。

## 功能

- **200+ 编程语言** — 基于 highlight.js 的语法高亮，自动检测语言
- **23 种语法主题** — 暗色/亮色主题自由切换，Atom One Dark、Dracula、GitHub 等
- **多种导出格式** — PNG、SVG、HTML、RTF，支持 1x-4x 倍率导出
- **窗口样式** — macOS 红绿灯、Windows 控件、无控件、隐藏标题栏
- **背景定制** — 18 种渐变预设 + 自定义颜色 + 透明背景
- **布局控制** — 内边距、圆角、阴影、最大宽度可调
- **字体设置** — 9 种系统等宽字体，字号/行高可调
- **代码格式化** — 支持 JS/TS/HTML/CSS/JSON/XML/Java/C++/Rust/Go 等
- **一键复制** — 复制 PNG 到剪贴板，直接粘贴到聊天/文档
- **100% 离线** — 零网络请求，所有资源内嵌，隐私安全
- **设置持久化** — 自动保存偏好到 localStorage

## 开发

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建
npm run build

# 预览构建产物
npm run preview
```

## 部署

### Cloudflare Pages

```bash
npm run deploy
```

或在 Cloudflare Dashboard 连接 GitHub 仓库：
- Build command: `npm run build`
- Output directory: `dist`

### 其他平台

构建产物在 `dist/` 目录，可部署到任何静态托管服务（Vercel、Netlify、GitHub Pages 等）。

## 技术栈

- **Vite** — 构建工具
- **highlight.js** — 语法高亮
- **html-to-image** — DOM 转图片导出
- **js-beautify** — 代码格式化
- **纯 CSS** — 无 UI 框架，零依赖

## 许可

MIT
