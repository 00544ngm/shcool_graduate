# Class Memories（班级时光馆）- Claude Code 开发项目书

## 项目定位

Class Memories 是一个面向毕业班级的数字记忆存档平台。

目标不是制作普通毕业相册，而是打造一个可长期运营、可持续沉淀回忆的数字时光馆。

核心关键词：

- 高内聚
- 低耦合
- DDD领域驱动设计
- 前后端分离
- 可扩展架构
- AI增强检索
- 长期存档

---

# 一、技术选型

## Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- Shadcn UI
- Framer Motion
- Three.js
- Zustand
- Axios

## Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis

## Storage

- MinIO（开发）
- S3 / OSS / COS（生产）

## Search

- Elasticsearch

## AI

- OpenAI Compatible API
- DeepSeek API
- Claude API

---

# 二、系统架构

```text
Browser

    │

Frontend (React)

    │

API Gateway

    │

┌───────────────┐
│ Auth Module   │
│ User Module   │
│ Photo Module  │
│ Video Module  │
│ CommentModule │
│ Timeline      │
│ Moments       │
│ MailBox       │
│ AI Service    │
└───────────────┘

    │

Redis

    │

PostgreSQL

    │

Object Storage
```

---

# 三、DDD目录结构

```text
backend/

src/

├─ modules/
│
├─ auth/
│
├─ user/
│
├─ photo/
│
├─ video/
│
├─ comment/
│
├─ timeline/
│
├─ moments/
│
├─ mailbox/
│
├─ ai/
│
├─ notification/
│
└─ admin/
│

frontend/

src/

├─ pages/
├─ components/
├─ features/
├─ services/
├─ hooks/
├─ stores/
├─ layouts/
├─ routes/
└─ utils/
```

---

# 四、核心功能模块

## 1. 星空照片墙

功能：

- 上传照片
- 分类照片
- 标签管理
- 时间管理
- 搜索照片

展示：

- 粒子漂浮
- 星空效果
- 无限滚动
- 点击聚焦

技术：

- Three.js
- Framer Motion

---

## 2. 照片详情页

展示：

- 原图
- 故事描述
- 拍摄时间
- 地点
- 人物

支持：

- 点赞
- 评论
- 收藏

---

## 3. 留言系统

支持：

- 一级评论
- 二级回复
- 表情
- 点赞

数据库隔离设计：

Comment Domain

独立维护。

---

## 4. 时间轴系统

自动聚合：

2022 入学

2023 军训

2024 竞赛

2025 实习

2026 毕业

支持无限扩展。

---

## 5. 视频记忆馆

支持：

- 上传视频
- 自动转码
- 封面生成
- 视频分类

扩展：

- 弹幕
- 字幕

---

## 6. 人物档案馆

每位同学拥有：

- 个人主页
- 头像
- 毕业照
- 寄语
- 收到留言

---

## 7. 宿舍空间

按宿舍聚合。

例如：

A302

包含：

- 相册
- 视频
- 留言

---

## 8. 班级动态

类似朋友圈。

支持：

- 文字
- 图片
- 视频

---

## 9. 班级地图

毕业后所在地。

支持：

- 中国地图
- 世界地图

统计：

- 城市人数
- 地区分布

---

## 10. 未来信箱

核心亮点。

支持：

- 1年后开启
- 3年后开启
- 5年后开启
- 自定义开启

---

## 11. AI回忆助手

示例：

用户输入：

军训

系统返回：

- 照片
- 视频
- 留言

并自动总结。

---

# 五、数据库设计

## users

```sql
id
username
nickname
avatar
email
password_hash
role
created_at
updated_at
```

## photos

```sql
id
user_id
title
description
image_url
taken_at
location
created_at
```

## videos

```sql
id
user_id
title
video_url
cover_url
created_at
```

## comments

```sql
id
target_type
target_id
user_id
content
parent_id
created_at
```

## moments

```sql
id
user_id
content
created_at
```

## future_letters

```sql
id
user_id
title
content
unlock_time
status
```

---

# 六、REST API设计

## 登录

```http
POST /api/auth/login
```

## 注册

```http
POST /api/auth/register
```

## 获取照片

```http
GET /api/photos
```

## 上传照片

```http
POST /api/photos
```

## 获取时间轴

```http
GET /api/timeline
```

## 获取留言

```http
GET /api/comments
```

## AI搜索

```http
POST /api/ai/search
```

---

# 七、前端页面规划

## 首页

- 校园视频背景
- 毕业倒计时
- 进入时光馆

## 星空照片墙

- 粒子动画
- 动态聚焦

## 时间轴

- 纵向滚动

## 视频馆

- 视频瀑布流

## 地图页

- 人员分布

## 人物页

- 校友档案

---

# 八、权限设计

## Visitor

只读

## Member

上传

评论

点赞

留言

## Admin

审核

删除

管理用户

管理资源

---

# 九、性能要求

首页首屏

≤ 2 秒

图片

懒加载

视频

分片加载

缓存

Redis

CDN

可选

---

# 十、安全要求

JWT

RBAC

限流

XSS防御

CSRF防御

上传校验

敏感词过滤

---

# 十一、开发里程碑

## Phase 1

用户系统

登录

注册

权限

预计：3天

---

## Phase 2

照片墙

上传

展示

评论

预计：5天

---

## Phase 3

时间轴

人物档案

预计：3天

---

## Phase 4

视频馆

未来信箱

预计：4天

---

## Phase 5

AI助手

地图模块

预计：4天

---

## Phase 6

性能优化

部署

测试

预计：3天

---

# 十二、毕业设计答辩亮点

1. Three.js 星空照片墙
2. 班级数字时光馆概念
3. AI回忆助手
4. 未来信箱系统
5. 班级地图
6. DDD架构设计
7. 高内聚低耦合
8. 前后端分离
9. 云存储架构
10. 长期可运营

---

# Claude Code执行要求

必须遵守：

- 领域驱动设计
- 模块化开发
- 单模块单职责
- TypeScript严格模式
- 完整单元测试
- 完整API文档
- Docker部署
- 环境变量管理
- Git规范提交
- 所有代码可生产部署

最终目标：

打造一个毕业十年后仍然能够访问、浏览、留言和回忆青春的数字时光馆。
