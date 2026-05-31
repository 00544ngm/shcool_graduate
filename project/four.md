# Class Memories High Fidelity Visual Prompts

以下为三个核心页面的高保真视觉生成提示词，用于 AI 图像生成工具（Midjourney / DALL·E / Stable Diffusion）。

---

## 1. 首页 Hero — 班级回忆主视觉

**用途**: 网站首页的全屏 Hero 背景氛围图，配合 Three.js 星场粒子叠加。

### 提示词

```
A nostalgic graduation memory website hero scene, dark midnight blue space theme,
a vintage glowing amber polaroid photo floating in the center with soft light leaks,
surrounded by thousands of tiny floating stars and sparkles (gold, white, indigo),
a faint transparent clock overlay showing "countdown" concept,
warm amber (#f59e0b) accent glow, deep dark background (#0f0f1a),
cinematic lighting, ethereal atmosphere, dreamy, emotional,
overlay particles, bokeh effects, 16:9 aspect ratio,
text negative space in center for headline overlay,
--ar 16:9 --v 6 --style raw --s 250
```

**色彩基调**: 深蓝黑背景 (`#0f0f1a`) + 琥珀色辉光 (`#f59e0b`) + 白色星光

**关键视觉元素**:
- 中央悬浮一张老式拍立得照片（光晕漏光效果）
- 照片表面有微弱的文字/图像痕迹
- 周围环绕数千星点粒子
- 时钟/倒计时元素（半透明叠加）
- 情感化、怀旧氛围

**CSS/实现参考**:
- Three.js 星场配置: 5000 particles, speed 0.0005, 颜色渐变 `[0xffffff, 0xf59e0b, 0x6366f1]`
- 标题使用渐变文字: `bg-gradient-to-r from-accent to-indigo-400 bg-clip-text text-transparent`
- 倒计时使用 `font-mono` 数字块 + `glow` 动画

---

## 2. Memory Wall — 星空照片墙

**用途**: 照片列表页的背景氛围 / 空状态插图 / 页面顶部装饰。

### 提示词

```
A wall of floating polaroid photos arranged in a grid in deep space,
each photo frame has warm amber glowing edges,
stars and nebula dust between the floating photos,
dark cosmic background with subtle purple-blue gradient,
photos appear to be floating in zero gravity,
soft warm light from behind the photos creating rim light,
nostalgic memory concept, class reunion theme,
polaroid frames slightly rotated organically,
--ar 16:9 --v 6 --style raw --s 200
```

**色彩基调**: 深空紫蓝渐变 `(#0f0f1a → #1a1a2e → #16213e)` + 琥珀色边框辉光

**关键视觉元素**:
- 多张拍立得照片悬浮在太空中
- 照片背面发出温暖柔光（轮廓光效果）
- 网格排列但略有自然旋转
- 星云尘埃粒子在照片之间漂浮
- 怀旧回忆主题

**CSS/实现参考**:
- 卡片设计: `rounded-xl border border-border bg-bg-card hover:border-accent/20`
- 悬停效果: `hover:scale-110` + 底部渐变遮罩 `bg-gradient-to-t from-black/50`
- 页面背景: Three.js StarfieldInner 组件 + `bg-bg-primary`

---

## 3. StoryModal — 照片详情/故事弹窗

**用途**: 点击照片后展开的详情模态框视觉氛围。

### 提示词

```
A close-up of a vintage photograph being held by warm hands,
the photo shows blurry silhouettes of graduating students throwing caps in the air,
warm golden hour sunlight streaming through,
amber particles floating in the light beams,
soft lens flare, film grain texture, analog feel,
the edges of the photo have slight burn and wear,
emotional graduation moment captured in time,
dark vignette around the edges focusing on the warm center,
--ar 4:3 --v 6 --style raw --s 300
```

**色彩基调**: 暖金色逆光 + 暗角 + 胶片颗粒纹理

**关键视觉元素**:
- 手持老照片的特写
- 照片内容是毕业帽抛向空中的模糊剪影
- 金色阳光光束穿过画面
- 琥珀色粒子在光束中漂浮
- 胶片颗粒和轻微的边缘磨损
- 暗角效果聚焦中心暖色区域

**CSS/实现参考**:
- 弹窗组件: `bg-bg-card border border-border rounded-xl p-4`
- 图片全宽显示: `object-contain max-h-[70vh]`
- 动画: `scaleIn 0.3s ease-out`
- 光影效果: `shadow-lg shadow-accent/10`

---

## 补充说明

### 与设计系统的一致性

所有视觉元素的颜色必须对齐以下 Token:

| Token | 色值 | 用途 |
|-------|------|------|
| accent | `#f59e0b` | 主色调辉光、按钮、链接 |
| bg-primary | `#0f0f0f` | 主背景 |
| bg-card | `#1a1a1a` | 卡片背景 |
| border | `#2e2e2e` | UI 边框 |

### AI 图片使用建议

1. **实际使用**: 生成图片后作为页面背景/空状态插图，降低透明度 (opacity 0.15~0.3) 叠加
2. **替代方案**: 若无 AI 生图条件，可使用 CSS 渐变 + Three.js 星场替代纯视觉氛围
3. **性能优化**: 图片使用 WebP 格式，压缩至 <200KB
4. **版权注意**: AI 生成图片仅用于项目展示，注意确认使用的 AI 工具的版权条款
