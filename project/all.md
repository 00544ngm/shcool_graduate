# Class Memories Frontend Bible V2.0 — 单⼀真相源

## 项目定位

班级毕业纪念平台，支持照片墙、视频记忆馆、时间轴、班级地图、未来信箱、AI 回忆搜索、宿舍分组、班级动态等功能。暗色主题、琥珀色基调、动效丰富。

---

## 技术栈

| 层 | 技术 | 版本 |
|----|------|------|
| 前端框架 | React | ^19.2.6 |
| 构建工具 | Vite | ^8.0.12 |
| 类型系统 | TypeScript | ~6.0.2 |
| CSS | TailwindCSS | ^4.3.0 |
| 动画 | Framer Motion | ^12.40.0 |
| 状态管理 | Zustand | ^5.0.14 |
| 3D 渲染 | Three.js + @react-three/fiber | 0.184.0 / 9.6.1 |
| 路由 | react-router-dom | ^7.16.0 |
| HTTP | axios | ^1.16.1 |
| 图标 | lucide-react | ^1.17.0 |
| UI 基础 | Radix Slot + CVA + tailwind-merge | — |
| 后端框架 | NestJS | ^11.1.24 |
| ORM | Prisma 7 + @prisma/adapter-pg | ^7.8.0 |
| 数据库 | PostgreSQL | 18.4 |
| 认证 | JWT (passport-jwt) | — |
| API 文档 | Swagger (@nestjs/swagger) | ^11.4.4 |
| 测试 | Jest + Supertest | ^30.4.2 / ^7.2.2 |
| 限流 | @nestjs/throttler | ^6.5.0 |
| 日志 | pino + nestjs-pino | — |
| 验证 | class-validator + class-transformer | — |

---

## 页面地图

| # | 页面 | 路由 | 组件文件 | 状态 |
|---|------|------|----------|------|
| 1 | 登录 | `/login` | `pages/auth/Login.tsx` | ✅ 完成 |
| 2 | 注册 | `/register` | `pages/auth/Register.tsx` | ✅ 完成 |
| 3 | 首页 Hero | `/` | `pages/home/index.tsx` | ✅ 完成 |
| 4 | 星空照片墙 | `/photos` | `pages/photos/PhotoWall.tsx` | ✅ 完成 |
| 5 | 照片详情 | `/photos/:id` | `pages/photos/PhotoDetail.tsx` | ✅ 完成 |
| 6 | 视频记忆馆 | `/videos` | `pages/videos/VideoGallery.tsx` | ✅ 完成 |
| 7 | 时间轴 | `/timeline` | `pages/timeline/index.tsx` | ✅ 完成 |
| 8 | 班级地图 | `/map` | `pages/map/index.tsx` | ✅ 完成 |
| 9 | 人物档案馆 | `/members` | `pages/members/index.tsx` | ✅ 完成 |
| 10 | 人物详情 | `/members/:id` | `pages/members/MemberDetail.tsx` | ✅ 完成 |
| 11 | 未来信箱 | `/mailbox` | `pages/mailbox/index.tsx` | ✅ 完成 |
| 12 | 宿舍空间 | `/dormitory` | `pages/dormitory/index.tsx` | ✅ 完成 |
| 13 | 班级动态 | `/moments` | `pages/moments/index.tsx` | ✅ 完成 |
| 14 | AI 回忆助手 | `/ai` | `pages/ai/index.tsx` | ✅ 完成 |
| 15 | 通知中心 | `/notifications` | `pages/notifications/index.tsx` | ✅ 完成 |
| 16 | 个人设置 | `/settings` | `pages/settings/index.tsx` | ✅ 完成 |

---

## 后端模块清单

| # | 模块 | 文件 | 测试 |
|---|------|------|------|
| 1 | Auth | `auth.service.ts`, `auth.controller.ts`, `jwt.strategy.ts` | ✅ `auth.service.spec.ts` |
| 2 | User | `user.service.ts`, `user.controller.ts` | ✅ `user.service.spec.ts` |
| 3 | Photo | `photo.service.ts`, `photo.controller.ts` | ✅ `photo.service.spec.ts` |
| 4 | Video | `video.service.ts`, `video.controller.ts` | ✅ `video.service.spec.ts` |
| 5 | Comment | `comment.service.ts`, `comment.controller.ts` | ✅ `comment.service.spec.ts` |
| 6 | Like | `like.service.ts`, `like.controller.ts` | ✅ `like.service.spec.ts` |
| 7 | Moment | `moments.service.ts`, `moments.controller.ts` | ✅ `moments.service.spec.ts` |
| 8 | Mailbox | `mailbox.service.ts`, `mailbox.controller.ts` | ✅ `mailbox.service.spec.ts` |
| 9 | Timeline | `timeline.service.ts`, `timeline.controller.ts` | ✅ `timeline.service.spec.ts` |
| 10 | Notification | `notification.service.ts`, `notification.controller.ts` | ✅ `notification.service.spec.ts` |
| 11 | AI | `ai.service.ts`, `ai.controller.ts` | ✅ `ai.service.spec.ts` |
| 12 | Health | `health.controller.ts` | ✅ `health.controller.spec.ts` |
| 13 | Upload | `upload.controller.ts` | ⬜ 无 |
| 14 | Admin | `admin.controller.ts` | ✅ `admin.controller.spec.ts` |

---

## 设计原则

### 1. Dark-First 暗色优先
- 主背景 `#0f0f1a` (`bg-primary`)，卡片背景 `#16213e` (`bg-card`)
- 输入框/悬浮 `#1e2a4a` (`bg-elevated`)
- 文字层次: `#f1f5f9`(primary) → `#94a3b8`(secondary) → `#64748b`(muted)

### 2. 琥珀色强调
- 主色 `#f59e0b` (amber-500)，悬浮 `#d97706` (amber-600)
- 所有交互元素（链接、按钮、激活状态）使用琥珀色
- 渐变标题: `bg-gradient-to-r from-accent to-indigo-400 bg-clip-text text-transparent`

### 3. 动效丰富
- 页面进场: `fadeIn 0.3s ease-out`
- 卡片入场: `slideUp 0.4s ease-out` + stagger delay (idx * 0.03~0.05s)
- 弹窗: `scaleIn 0.3s ease-out`
- 星星闪烁: `starGlow 2-3s ease-in-out infinite`
- Three.js 星场粒子持续动画

### 4. 响应式设计
- 移动优先，TailwindCSS 断点体系
- 导航在 md 以下折叠为 hamburger menu
- 照片墙栅格: 移动端 2 列 → sm: 3 列 → lg: 4 列

### 5. 组件化
- 所有 UI 基础组件在 `components/ui/` 目录
- 复杂组件（Starfield, ChinaMap, Danmaku）独立封装
- 页面组件按功能放在 `pages/` 子目录

---

## API 契约要点

### 分页格式 (所有列表接口)
```typescript
{ items: T[], total: number, page: number, totalPages: number }
```

### 认证
- 注册/登录返回 `{ accessToken: string, user: User }`
- 所有受保护接口请求头: `Authorization: Bearer <token>`
- Token 过期返回 401 → axios interceptor 自动跳转登录页

### targetType 多态 (Comment / Like)
- 可选值: `'photo'` | `'video'` | `'moment'`
- **必须小写** — 前端传参必须使用小写

### 错误格式 (全局 ExceptionFilter)
```typescript
{ statusCode: number, message: string, error: string, timestamp: string, path: string }
```

---

## 开发顺序（按优先级）

### P0 — 核心功能 (已全部完成)
1. ✅ 认证（登录/注册/JWT）
2. ✅ 照片墙 + 详情 + 评论
3. ✅ 视频库
4. ✅ 导航布局

### P1 — 互动功能 (已全部完成)
5. ✅ 时间轴
6. ✅ 班级动态
7. ✅ 点赞 + 收藏
8. ✅ 通知系统
9. ✅ 评论回复

### P2 — 增强体验 (已全部完成)
10. ✅ 班级地图
11. ✅ 未来信箱
12. ✅ AI 回忆助手
13. ✅ 宿舍空间
14. ✅ 人物档案馆
15. ✅ 个人设置
16. ✅ 弹幕系统

---

## 验收标准

| 页面 | 标准 |
|------|------|
| 登录/注册 | 输入校验 → 成功跳转首页 → token 持久化 |
| 首页 | Three.js 星场渲染 → 倒计时准确 → CTA 可点击 |
| 照片墙 | 分页加载 → 标签筛选 → 时间筛选 → 悬停效果 → 点击跳转 |
| 照片详情 | 大图显示 → 元信息 → 评论列表 → 提交评论 → 二级回复 → 点赞 → 收藏 |
| 视频库 | 视频列表 → 播放器 → 弹幕开关 → 点赞评论 |
| 时间轴 | 混合时间线 → 照片/视频/动态交替 → 按年分组 |
| 班级地图 | 中国地图显示 → 城市标记 → 列表联动 |
| 人物列表 | 用户分页 → 点击详情 |
| 宿舍空间 | 按宿舍分组 → 成员列表 → 入口链接 |
| AI 助手 | 关键词输入 → 照片结果 → 动态结果 → AI 摘要 → 建议词 |
| 未来信箱 | 写信表单 → 信件列表 → 解锁处理 |
| 班级动态 | 发布表单 → 动态列表 → 图片附件 → 互动 |
| 通知中心 | 通知列表 → 未读标记 → 已读操作 → 全部已读 |
| 个人设置 | 资料编辑 → 保存 → 实时生效 |

---

## 环境变量参考

```env
# 后端
DATABASE_URL=postgresql://user:password@localhost:5432/class_memories
JWT_SECRET=<your-secret>
JWT_EXPIRES_IN=7d
DEEPSEEK_API_KEY=<deepseek-api-key>    # 或放在 backend/apikey.txt

# 前端
VITE_API_BASE_URL=/api                  # vite 代理到 backend:3000
```

## 构建与部署

```bash
# 后端
cd backend
pnpm install
npx prisma generate
npx prisma db push
pnpm start:dev          # 开发 http://localhost:3000
pnpm test               # 运行 73 个测试

# 前端
cd frontend
pnpm install
pnpm dev                # 开发 http://localhost:5173
pnpm build              # 生产构建 → dist/
```

API 文档: 启动后端后访问 `http://localhost:3000/docs/`
