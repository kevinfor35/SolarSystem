# 🌌 3D太阳系探索 - Solar System Explorer

一个基于 React + Three.js 构建的沉浸式3D太阳系可视化网站，展示八大行星及月球的真实纹理和运动轨迹。

**🌐 在线预览**: [https://solar-system-six-topaz.vercel.app](https://solar-system-six-topaz.vercel.app)

## ✨ 功能特性

- **3D太阳系场景**
  - 真实星体纹理贴图
  - 星空背景（银河纹理）
  - 椭圆轨道（基于真实轨道参数）
  - 太阳发光效果

- **交互功能**
  - 鼠标拖拽旋转视角
  - 滚轮缩放
  - 点击行星查看详细信息
  - 动画暂停/播放
  - 速度调节（0.1x - 20x）
  - 视角复位

- **行星信息面板**
  - 行星名称（中英文）
  - 直径、质量
  - 与太阳距离（AU）
  - 公转周期、自转周期
  - 轨道偏心率、轨道倾角

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **3D渲染**: Three.js
- **样式**: Tailwind CSS 3
- **构建工具**: Vite 6

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173/ 查看效果。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/
│   ├── SolarSystem.tsx   # 3D太阳系场景组件
│   ├── ControlPanel.tsx  # 控制面板组件
│   └── InfoPanel.tsx     # 行星信息面板组件
├── data/
│   └── planets.ts        # 行星数据和工具函数
├── App.tsx               # 主应用组件
├── main.tsx              # 入口文件
└── index.css             # 全局样式
```

## 🎨 纹理资源

纹理图片位于 `public/textures/` 目录，包含：

| 文件 | 描述 |
|------|------|
| 2k_earth_daymap.jpg | 地球日面纹理 |
| 2k_jupiter.jpg | 木星纹理 |
| 2k_mars.jpg | 火星纹理 |
| 2k_mercury.jpg | 水星纹理 |
| 2k_moon.jpg | 月球纹理 |
| 2k_neptune.jpg | 海王星纹理 |
| 2k_saturn.jpg | 土星纹理 |
| 2k_sun.jpg | 太阳纹理 |
| 2k_uranus.jpg | 天王星纹理 |
| 2k_venus_surface.jpg | 金星表面纹理 |
| 2k_stars_milky_way.jpg | 银河星空背景 |

## 🌍 Vercel 部署

1. 将项目推送到 GitHub/GitLab
2. 在 Vercel 上连接仓库
3. Vercel 会自动检测项目配置并部署

## 📝 操作说明

- **旋转视角**: 鼠标拖拽
- **缩放**: 滚轮
- **查看行星信息**: 点击行星
- **暂停/播放**: 点击控制面板的播放按钮
- **调节速度**: 使用速度滑块（0.1x - 20x）
- **复位视角**: 点击复位按钮

## 📊 行星数据说明

行星数据基于真实天文参数：
- 轨道偏心率决定椭圆形状
- 公转周期影响运动速度
- 自转周期影响行星旋转速度

## 📄 License

MIT License