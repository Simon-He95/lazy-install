<p align="center">
<img height="200" src="./assets/kv.png" alt="Lazy Install">
</p>

<h1 align="center">🚀 Lazy Install</h1>

<p align="center">
  <strong>VS Code 智能包安装器</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=simonhe.lazy-install">
    <img src="https://img.shields.io/visual-studio-marketplace/v/simonhe.lazy-install.svg?style=flat-square&label=VS%20Code%20商店&logo=visual-studio-code" alt="Visual Studio Marketplace Version" />
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=simonhe.lazy-install">
    <img src="https://img.shields.io/visual-studio-marketplace/d/simonhe.lazy-install.svg?style=flat-square" alt="Visual Studio Marketplace Downloads" />
  </a>
  <a href="https://github.com/Simon-He95/lazy-install">
    <img src="https://img.shields.io/github/license/Simon-He95/lazy-install.svg?style=flat-square" alt="GitHub License" />
  </a>
</p>

<p align="center"> <a href="./README.md">English</a> | 简体中文</p>

---

## ✨ 为什么选择 Lazy Install？

**告别繁琐的工作流程！** 🛑

❌ **以前**: 导入 → 复制包名 → 切换到终端 → 输入安装命令 → 等待 → 切回编辑器
✅ **现在**: 导入 → 点击安装按钮 → 完成！🎉

Lazy Install 自动检测你导入语句中未安装的包，并在编辑器中提供**一键安装按钮**。无需切换上下文，无需复制粘贴！

## 🎯 核心功能

- 🔍 **智能检测**: 自动扫描你的导入语句
- ⚡ **一键安装**: 通过 CodeLens 按钮即时安装包
- 🛠️ **多包管理器**: 支持 npm、pnpm、yarn 和 ni
- 📦 **开发依赖**: 可选择安装为正式依赖或开发依赖
- 🚀 **零配置**: 开箱即用
- 🎨 **简洁界面**: 非侵入式内联按钮
- 🔧 **工作区支持**: 处理 monorepo 和工作区

## 🎬 演示

![演示 GIF](./assets/demo.gif)

*只需导入并点击 - 就这么简单！*

## 🚀 快速开始

1. **安装** 从 [VS Code 商店](https://marketplace.visualstudio.com/items?itemName=simonhe.lazy-install) 安装扩展
2. **编写** 导入语句: `import axios from 'axios'`
3. **点击** 出现的内联安装按钮
4. **完成！** 包已安装并可使用

## ⚙️ 配置

在 VS Code 设置中自定义包管理器：

```json
{
  "lazy-install.way": "pnpm" // 选项: "ni", "npm", "pnpm", "yarn"
}
```

**支持的包管理器:**
- 🔧 **ni** (默认) - 通用包管理器
- 📦 **npm** - Node 包管理器
- ⚡ **pnpm** - 快速、节省磁盘空间
- 🧶 **yarn** - 可靠、安全、快速

## 🛠️ 支持的语言

- ✅ JavaScript (.js)
- ✅ TypeScript (.ts)
- ✅ React (.jsx, .tsx)
- ✅ Vue (.vue)

## 💡 使用技巧

- **正式依赖**: 点击包名按钮
- **开发依赖**: 点击 "包名 -D" 按钮
- **多个包**: 一次性安装多个包
- **Monorepo**: 自动检测工作区配置

## 🤝 贡献

欢迎贡献！你可以：

- 🐛 报告 bug
- 💡 建议功能
- 🔧 提交 PR
- ⭐ 给项目点星

## 📄 许可证

[MIT](./LICENSE) © [Simon He](https://github.com/Simon-He95)

## ☕ 支持

如果这个扩展为你节省了时间，考虑请我喝杯咖啡！☕

<p align="center">
  <a href="https://github.com/Simon-He95/sponsor">
    <img src="https://img.shields.io/badge/赞助-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#EA4AAA" alt="赞助" />
  </a>
</p>

## 🙏 赞助者

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/Simon-He95/sponsor/sponsors.svg">
    <img src="https://cdn.jsdelivr.net/gh/Simon-He95/sponsor/sponsors.png"/>
  </a>
</p>

---

<p align="center">
  用 ❤️ 制作 by <a href="https://github.com/Simon-He95">Simon He</a>
</p>
