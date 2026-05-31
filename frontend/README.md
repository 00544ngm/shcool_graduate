# Class Memories Frontend

班级毕业纪念平台前端 — 暗色主题、琥珀色基调、动效丰富的回忆空间。

## 技术栈

| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| TypeScript 6 | 类型安全 |
| Vite 8 | 构建工具 |
| TailwindCSS 4 | 样式系统 |
| Framer Motion | 页面/卡片动画 |
| Three.js + R3F | 3D 星空背景 |
| Zustand | 轻量状态管理 |
| React Router 7 | 客户端路由 |
| Axios | HTTP 请求 |
| Lucide React | 图标库 |

## 页面列表

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 Hero | 倒计时 + Three.js 星空 + CTA |
| `/photos` | 星空照片墙 | 标签/时间筛选, 3D 星场背景 |
| `/photos/:id` | 照片详情 | 大图 + 评论 + 点赞 + 收藏 |
| `/videos` | 视频记忆馆 | 视频列表 + 弹幕播放器 |
| `/timeline` | 时间轴 | 照片/视频/动态混合时间线 |
| `/map` | 班级地图 | 中国地图城市分布可视化 |
| `/members` | 人物档案馆 | 同学列表 + 个人详情 |
| `/mailbox` | 未来信箱 | 定时解锁的时光信 |
| `/dormitory` | 宿舍空间 | 按宿舍分组聚合 |
| `/moments` | 班级动态 | 图文发布 + 互动 |
| `/ai` | AI 回忆助手 | DeepSeek 关键词搜索 |
| `/notifications` | 通知中心 | 评论/点赞通知 |
| `/settings` | 个人设置 | 资料编辑 |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (默认 https://localhost:5173)
# 需要后端同时运行 (http://localhost:3000)
pnpm dev

# 生产构建
pnpm build

# 预览生产构建
pnpm preview
```

开发服务器自动代理 `/api` 和 `/uploads` 到 `http://localhost:3000`。

## 构建产物

```
dist/
├── assets/
│   ├── index-{hash}.css        # 样式 (45KB)
│   ├── index-{hash}.js         # 主包 (584KB)
│   └── StarfieldInner-{hash}.js # Three.js 星场 (880KB)
└── index.html
```

## 设计规范

参见 `project/` 目录下的设计文档：
- `one.md` — 设计系统 Token (颜色/字体/按钮/动画)
- `twon.md` — 架构蓝图
- `three.md` — UI 线框图
- `all.md` — 前端圣经 SSOT
