# Class Memories -- 开发环境总览

> 最后更新: 2026-05-30

---

## 一、核心运行时

| 工具 | 版本 | 位置 |
|------|------|------|
| Node.js | v24.15.0 | `PATH` 全局可用 |
| npm | 11.12.1 | `PATH` 全局可用 |
| pnpm | 11.1.1 | `PATH` 全局可用 |

## 二、全局 CLI 工具

| 工具 | 版本 | 位置 |
|------|------|------|
| NestJS CLI | 11.0.21 | `D:\pnpm\bin\nest.CMD` |
| Prisma CLI | 7.8.0 | `D:\pnpm\bin\prisma.CMD` |
| pnpm 全局 store | -- | `D:\pnpm\global\v11\` |

> 注意: `D:\pnpm\bin` 需要加入系统 PATH 才能直接使用 nest / prisma 命令。

## 三、数据库与缓存

| 服务 | 版本 | 位置 | 状态 |
|------|------|------|------|
| PostgreSQL | 18.4 | `D:\postsql\postgresql-18.4-1-windows-x64-binaries\pgsql\bin\` | 运行中 (localhost:5432) |
| PostgreSQL 数据目录 | -- | `D:\postsql\data\` | -- |
| PostgreSQL 备份 | -- | `D:\postsql\backup\znl_20260530_005237.sql` | -- |
| Redis | 8.6.3 | `D:\Desktop\pylearn\tools\redis\redis-windows-8.6.3\redis-windows-8.6.3\` | 服务运行中 |
| MySQL 5.7 | 5.7.16 | `D:\Desktop\pylearn\mysql\mysql-5.7.16-winx64\bin\` | 已安装 |
| MySQL 5.7 (phpStudy) | 5.7.26 | `D:\Desktop\pylearn\phpstudy\phpstudy_pro\Extensions\MySQL5.7.26\bin\` | 已安装 |

## 四、其他开发工具

| 工具 | 位置 |
|------|------|
| Git | `PATH` 全局可用 (v2.51.2) |
| phpStudy | `D:\Desktop\pylearn\phpstudy\phpstudy_pro` |
| phpStudy -- Apache | `D:\Desktop\pylearn\phpstudy\phpstudy_pro\Extensions\Apache2.4.39\` |
| phpStudy -- Nginx | `D:\Desktop\pylearn\phpstudy\phpstudy_pro\Extensions\Nginx1.15.11\` |
| phpStudy -- PHP | `D:\Desktop\pylearn\phpstudy\phpstudy_pro\Extensions\php\php7.3.4nts\` |

## 五、全局 npm 包

```
C:\Users\耨文\AppData\Roaming\npm
+-- @anthropic-ai/claude-code
+-- @openai/codex
+-- pnpm
```

## 六、项目目录

```
D:\Desktop\graduate_school\
  ├── Class_Memories_ClaudeCode_Project.md    (项目规格书)
  ├── Class_Memories_V2_Blueprint.md          (V2 开发蓝图)
  └── env-summary.md                          (本文档)
```

---

## 附注：缺失组件

| 组件 | 说明 |
|------|------|
| **MinIO** | 开发环境对象存储，暂未安装。可用本地文件系统替代，或后续通过 Docker 补充 |
| **Elasticsearch** | 搜索服务，暂未安装。开发阶段可用 PostgreSQL 的 LIKE 查询暂代 |
