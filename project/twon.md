# Class Memories Architecture Blueprint V2

## 目录结构

### 后端 (`backend/`)

```
src/
├── main.ts                          # 入口：Swagger / CORS / Logger / Graceful Shutdown
├── app.module.ts                    # 根模块，注册所有 Feature Module
├── config/
│   └── env.ts                       # 环境变量加载（无硬编码回退）
├── common/
│   ├── prisma.service.ts            # Prisma 全局单例 (PrismaPg adapter)
│   ├── guards/
│   │   ├── auth.guard.ts            # JWT 认证守卫
│   │   └── roles.guard.ts           # 角色权限守卫 (VISITOR < MEMBER < MODERATOR < ADMIN)
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts # 全局异常过滤器，统一 JSON 格式
│   ├── pipes/
│   │   └── upload-validation.pipe.ts # 文件类型/大小校验
│   └── dto/
│       └── pagination.dto.ts        # 分页参数校验 (@Min/@Max)
├── modules/
│   ├── auth/                        # 注册、登录、JWT 签发
│   ├── user/                        # 用户列表、资料、宿舍分组
│   ├── photo/                       # 照片 CRUD、搜索、上传
│   ├── video/                       # 视频 CRUD、上传
│   ├── comment/                     # 评论 + 二级回复 + 通知联动
│   ├── like/                        # 点赞/取消点赞 + 通知联动
│   ├── moment/                      # 班级动态 CRUD
│   ├── mailbox/                     # 未来信箱（定时解锁）
│   ├── timeline/                    # 时间轴（照片+视频+动态 合并）
│   ├── notification/                # 通知列表、已读标记
│   ├── ai/                          # AI 回忆搜索（DeepSeek 摘要）
│   ├── health/                      # 健康检查端点
│   └── admin/                       # 管理后台（仅 ADMIN 角色）
└── storage/                         # 文件上传存储目录
```

### 前端 (`frontend/`)

```
src/
├── main.tsx                         # ReactDOM.createRoot
├── App.tsx                          # RouterProvider
├── index.css                        # TailwindCSS v4 + @theme tokens + 关键帧动画
├── routes/
│   └── index.tsx                    # 路由定义（createRoutesFromElements）
├── layouts/
│   └── MainLayout.tsx               # 全局导航栏 + 底部 + Outlet
├── components/
│   ├── ui/                          # 基础原子组件
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── skeleton.tsx
│   │   └── textarea.tsx
│   ├── Starfield.tsx                # Three.js 星空背景组件
│   ├── StarfieldInner.tsx           # 内页轻量星空
│   ├── ChinaMap.tsx                 # 中国地图可视化（城市分布）
│   └── Danmaku.tsx                  # 视频弹幕组件
├── pages/
│   ├── home/index.tsx               # 首页 Hero
│   ├── auth/Login.tsx               # 登录页
│   ├── auth/Register.tsx            # 注册页
│   ├── photos/PhotoWall.tsx         # 星空照片墙
│   ├── photos/PhotoDetail.tsx       # 照片详情 + 评论
│   ├── videos/VideoGallery.tsx      # 视频记忆馆
│   ├── timeline/index.tsx           # 时间轴
│   ├── map/index.tsx                # 班级地图
│   ├── members/index.tsx            # 人物档案馆列表
│   ├── members/MemberDetail.tsx     # 人物详情
│   ├── mailbox/index.tsx            # 未来信箱
│   ├── dormitory/index.tsx          # 宿舍空间
│   ├── moments/index.tsx            # 班级动态
│   ├── ai/index.tsx                 # AI 回忆助手
│   ├── notifications/index.tsx      # 通知中心
│   └── settings/index.tsx           # 个人设置
├── stores/
│   └── auth.ts                      # Zustand 鉴权状态
├── hooks/
│   └── useFavorites.ts              # 收藏操作 Hook
├── services/
│   ├── api.ts                       # Axios 实例 + 所有 API 方法
│   └── navigate.ts                  # 命令式导航（axios interceptor 使用）
├── lib/
│   └── utils.ts                     # cn() 工具函数
└── types/                           # (可选) 全局类型定义
```

## 路由表

| 路径 | 页面 | 布局 | 认证 |
|------|------|------|------|
| `/login` | Login | 无 | 否 |
| `/register` | Register | 无 | 否 |
| `/` | Home | MainLayout | 是 |
| `/photos` | PhotoWall | MainLayout | 是 |
| `/photos/:id` | PhotoDetail | MainLayout | 是 |
| `/videos` | VideoGallery | MainLayout | 是 |
| `/timeline` | Timeline | MainLayout | 是 |
| `/map` | Map | MainLayout | 是 |
| `/members` | Members | MainLayout | 是 |
| `/members/:id` | MemberDetail | MainLayout | 是 |
| `/mailbox` | Mailbox | MainLayout | 是 |
| `/dormitory` | Dormitory | MainLayout | 是 |
| `/moments` | Moments | MainLayout | 是 |
| `/ai` | AIAssistant | MainLayout | 是 |
| `/notifications` | Notifications | MainLayout | 是 |
| `/settings` | Settings | MainLayout | 是 |

## 后端 API 端点

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| Auth | POST | `/api/auth/register` | 注册 (限流 3/min) |
| Auth | POST | `/api/auth/login` | 登录 (限流 5/min) |
| User | GET | `/api/user` | 用户列表（分页） |
| User | GET | `/api/user/profile` | 当前用户资料 |
| User | PUT | `/api/user/profile` | 更新资料 |
| User | GET | `/api/user/map` | 城市分布 |
| User | GET | `/api/user/dormitory-groups` | 宿舍分组 |
| Photo | GET/POST/DELETE | `/api/photos/:id` | 照片 CRUD |
| Photo | GET | `/api/photos` | 照片列表（分页） |
| Photo | GET | `/api/photos/search` | 照片搜索 |
| Video | GET/POST/DELETE | `/api/videos/:id` | 视频 CRUD |
| Video | GET | `/api/videos` | 视频列表（分页） |
| Comment | GET/POST/DELETE | `/api/comments/:id` | 评论 CRUD（多态） |
| Like | POST | `/api/likes/toggle` | 点赞/取消 |
| Like | GET | `/api/likes/:targetType/:targetId` | 获取点赞 |
| Moment | GET/POST/DELETE | `/api/moments/:id` | 班级动态 CRUD |
| Mailbox | POST | `/api/mailbox` | 创建时光信 |
| Mailbox | GET | `/api/mailbox` | 我的信件 |
| Mailbox | GET | `/api/mailbox/opened` | 收到的信件 |
| Mailbox | POST | `/api/mailbox/:id/open` | 拆信任意 |
| Timeline | GET | `/api/timeline` | 时间轴（全类型） |
| AI | POST | `/api/ai/search` | AI 回忆搜索 |
| Notification | GET | `/api/notifications` | 通知列表 |
| Notification | POST | `/api/notifications/:id/read` | 标记已读 |
| Notification | POST | `/api/notifications/read-all` | 全部已读 |
| Health | GET | `/api/health` | 健康检查 |
| Admin | * | `/api/admin/*` | 管理后台（ADMIN） |

## 状态管理

采用 **Zustand** 轻量状态管理，仅存储全局鉴权状态：

```
useAuthStore {
  user: User | null      // 用户信息（持久化到 localStorage）
  token: string | null   // JWT token（持久化到 localStorage）
  loading: boolean       // 登录/注册加载状态

  login(username, password)     → 调用 API → 保存 token + user
  register(data)                → 调用 API → 保存 token + user
  logout()                      → 清除 localStorage → 重置 state
  loadProfile()                 → 重新获取用户资料 → 更新 state
  isAuthenticated()             → !!token
  isAdmin()                     → role === 'ADMIN'
  isModerator()                 → role === 'ADMIN' || role === 'MODERATOR'
}
```

页面级数据（照片列表、视频列表、动态等）使用 React `useState` + `useEffect` 本地管理，不进入全局 store。

## 认证与授权

```
认证: JWT Bearer Token → AuthGuard → @CurrentUser()
授权: RolesGuard + @Roles(VISITOR | MEMBER | MODERATOR | ADMIN)
权限函数:
  canModify(ownerId, user) → user.role === 'ADMIN' || user.id === ownerId
```

## 数据库模型 (Prisma)

| 模型 | 说明 |
|------|------|
| User | 用户（username, email, password, nickname, avatar, bio, city, dormitory, role） |
| Photo | 照片（title, description, imageUrl, thumbnailUrl, tags, userId） |
| Video | 视频（title, description, videoUrl, thumbnailUrl, userId） |
| Moment | 班级动态（content, images[], userId） |
| Comment | 评论（content, targetType, targetId, userId, parentId） |
| Like | 点赞（targetType, targetId, userId） — 唯一约束防重复 |
| Letter | 时光信（title, content, unlockType, unlockDate, userId） |
| Notification | 通知（type, content, userId, read, relatedId） |

## 关键设计决策

1. **Prisma 7 + @prisma/adapter-pg**: 使用 Prisma 7 的 Driver Adapter 模式连接 PostgreSQL，非传统二进制引擎
2. **PBKDF2-SHA512 密码哈希**: `crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512')`，salt 以 `salt:hash` 格式存储
3. **targetType 多态**: Like 和 Comment 通过 `targetType: 'photo'|'video'|'moment'` + `targetId` 支持多实体关联
4. **分页标准化**: 所有列表接口返回 `{ items, total, page, totalPages }`
5. **DeepSeek AI**: 关键词搜索 + AI 摘要双轨制，AI 失败时降级为简单计数文本
