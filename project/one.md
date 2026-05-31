# Class Memories Design System V1.0

## 颜色规范

| Token | CSS 变量 | 用途 | 色值 |
|-------|----------|------|------|
| accent | `--color-accent` | 主色调、链接、按钮 | `#f59e0b` (amber-500) |
| accent-hover | `--color-accent-hover` | 主色调悬停 | `#d97706` (amber-600) |
| bg-primary | `--color-bg-primary` | 页面背景 | `#0f0f0f` |
| bg-card | `--color-bg-card` | 卡片背景 | `#1a1a1a` |
| bg-elevated | `--color-bg-elevated` | 悬浮/输入框背景 | `#242424` |
| bg-secondary | `--color-bg-secondary` | 次要背景（tab 栏等） | `#2a2a2a` |
| text-primary | `--color-text-primary` | 主文字 | `#f5f5f5` |
| text-secondary | `--color-text-secondary` | 次要文字 | `#a3a3a3` |
| text-muted | `--color-text-muted` | 弱化文字 | `#737373` |
| border | `--color-border` | 边框 | `#2e2e2e` |
| error | `--color-error` | 错误/警告/点赞红 | `#ef4444` |
| success | `--color-success` | 成功 | `#22c55e` |

## 字体规范

| 层级 | 字号 | 字重 | 使用场景 |
|------|------|------|----------|
| h1 | 24px / 1.5rem | 700 | 页面标题 |
| h2 | 20px / 1.25rem | 700 | 区块标题 |
| h3 | 16px / 1rem | 600 | 卡片标题 |
| body | 14px / 0.875rem | 400 | 正文 |
| small | 12px / 0.75rem | 400 | 辅助文字、时间戳 |
| caption | 10px / 0.625rem | 400 | 标签、徽标 |

字体族：`Inter, system-ui, -apple-system, sans-serif`

## 按钮规范

| 变体 | 背景 | 悬停 | 文字色 | 用途 |
|------|------|------|--------|------|
| `default` | accent | accent-hover | white | 主要操作 |
| `ghost` | transparent | bg-elevated | text-primary | 次要操作 |
| `outline` | transparent | bg-elevated | text-primary | 边框按钮 |

尺寸：`sm` (h-8 px-3 text-xs) / 默认 (h-10 px-4 text-sm) / `lg` (h-12 px-6 text-base)

## 卡片规范

- 圆角：`rounded-xl` (12px)
- 边框：1px solid border
- 背景：bg-card
- 内边距：p-4 或 p-5
- 悬停效果：`hover:border-accent/20` + 可选 `hover:-translate-y-1`

## 动画规范

| 动画 | 持续时间 | 缓动 | 使用场景 |
|------|----------|------|----------|
| fadeIn | 0.3s | ease-out | 页面进场 |
| slideUp | 0.4s | ease-out | 卡片入场 |
| scaleIn | 0.3s | ease-out | 弹窗/聚焦 |
| stagger | idx * 0.03-0.05s | — | 列表逐项出现 |
| starGlow | 2-3s | ease-in-out, repeat | 星星闪烁 |

Three.js Starfield: 5000 粒子，浮动速度 0.0005，颜色渐变范围 `[0xffffff, 0xf59e0b, 0x6366f1]`

## 布局规范

- 最大内容宽度：`max-w-2xl` (672px) 或 `max-w-4xl` (896px)
- 页面内边距：`px-4 py-6`
- 栅格：`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` 等
- 间距体系：`gap-2, gap-3, gap-4, gap-6` 基于 4px 网格
