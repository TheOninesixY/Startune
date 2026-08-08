# Startune

**Startune** 是一款采用 Google Material You (Material Design 3) 设计风格的轻量级、无依赖、高颜值的浏览器起始页/新标签页。

界面优雅通透、色彩柔和，原生支持深色模式与多款 Dynamic Accent 配色方案，所有数据均保存在本地，零依赖且保护隐私。

---

## ✨ 功能特性

* **🎨 纯正的 Material You (MD3) 设计风格**
  * **色阶渗透（Dynamic Tonal Palette）**：告别冷冰冰的纯白，界面各元素混入柔和的主题色调，富有质感而不浓重。
  * **极轻无阴影**：通过 Surface Container 色阶对比呈现空间层级，摆脱笨重的投影效果。
  * **MD3 标准圆角**：采用大圆角（28px）与全圆角（Pill-shape）胶囊元素，符合 Google 最新视觉规范。

* **🌗 深色/浅色主题与色彩自适应**
  * 支持深色模式（Dark Mode）、浅色模式（Light Mode）以及跟随系统偏好设置。
  * 提供 4 款经典 Material 动态 Accent 配色：**Google 蓝**、**翡翠绿**、**珊瑚橙**、**薰衣紫**，切换配色时全页背景与组件色调联动变化。

* **🔍 灵活的搜索引擎切换**
  * 内置常用搜索引擎：Google、百度、Bing、哔哩哔哩、GitHub。
  * 纯粹简洁的文字选择菜单，与平滑的搜索框无缝融为一体。

* **📌 自定义快捷访问 (Shortcuts)**
  * 支持自由添加常用网站，自动拉取高清网站 Favicon 图标，并赋予符合 MD3 规范的平铺圆角样式。
  * 悬浮即现快速删除按钮，可随时调整常用链接。

* **🕒 动态时间与时段问候**
  * 实时数字时钟与日期显示。
  * 智能根据早晨、下午、夜晚自动变换温暖问候语与天气/时段图标。

* **🔒 隐私安全与纯净体验**
  * **零后端/零依赖**：单文件 HTML/CSS/JS 实现，无任何外部 JS 框架或追踪代码。
  * **本地存储**：快捷方式与主题设置均保存在本地 `localStorage`，数据完全掌控在自己手中。

---

## 🚀 使用方法

### 方法一：本地直接打开
1. 克隆或下载本项目：
   ```bash
   git clone https://github.com/OninesixY/Startune.git
   ```
2. 在浏览器中直接双击 `index.html` 打开。

### 方法二：设为浏览器起始页 / 新标签页
1. 打开浏览器的 **设置** -> **启动时**（或 **新标签页** 设置）。
2. 选择 **打开特定网页或一组网页**，添加 `index.html` 的本地绝对路径或部署后的网址。
3. *（推荐）* 你也可以搭配 Chrome/Edge 的扩展程序（如 **Custom New Tab URL**）将 `index.html` 设为默认新标签页。

---

## 🛠️ 技术栈

* **HTML5** & **原生 CSS3**（CSS Variables, Flexbox, CSS Grid）
* **原生 JavaScript (ES6+)**（DOM 操作、`localStorage` 持久化）
* **Google Fonts & Material Symbols**（Google Sans & Material Symbols Rounded 字体图库）

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 协议开源。
