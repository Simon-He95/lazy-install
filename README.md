<p align="center">
<img height="200" src="./assets/kv.png" alt="Lazy Install">
</p>

<h1 align="center">🚀 Lazy Install</h1>

<p align="center">
  <strong>Smart Package Installer for VS Code</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=simonhe.lazy-install">
    <img src="https://img.shields.io/visual-studio-marketplace/v/simonhe.lazy-install.svg?style=flat-square&label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" />
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=simonhe.lazy-install">
    <img src="https://img.shields.io/visual-studio-marketplace/d/simonhe.lazy-install.svg?style=flat-square" alt="Visual Studio Marketplace Downloads" />
  </a>
  <a href="https://github.com/Simon-He95/lazy-install">
    <img src="https://img.shields.io/github/license/Simon-He95/lazy-install.svg?style=flat-square" alt="GitHub License" />
  </a>
</p>

<p align="center"> English | <a href="./README_zh.md">简体中文</a></p>

---

## ✨ Why Lazy Install?

**Stop the tedious workflow!** 🛑

❌ **Before**: Import → Copy package name → Switch to terminal → Type install command → Wait → Switch back to editor
✅ **After**: Import → Click install button → Done! 🎉

Lazy Install automatically detects uninstalled packages in your import statements and provides **one-click installation buttons** right in your editor. No more context switching, no more copy-pasting!

## 🎯 Features

- 🔍 **Smart Detection**: Automatically scans your import statements
- ⚡ **One-Click Install**: Install packages instantly with CodeLens buttons
- 🛠️ **Multiple Package Managers**: Supports npm, pnpm, yarn, and ni
- 📦 **Dev Dependencies**: Choose between regular or dev dependencies
- 🚀 **Zero Configuration**: Works out of the box
- 🎨 **Clean UI**: Non-intrusive inline buttons
- 🔧 **Workspace Support**: Handles monorepos and workspaces

## 🎬 Demo

![Demo GIF](./assets/demo.gif)

*Just import and click - it's that simple!*

## 🚀 Quick Start

1. **Install** the extension from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=simonhe.lazy-install)
2. **Write** your import statement: `import axios from 'axios'`
3. **Click** the install button that appears inline
4. **Done!** Package installed and ready to use

## ⚙️ Configuration

Customize your package manager in VS Code settings:

```json
{
  "lazy-install.way": "pnpm" // Options: "ni", "npm", "pnpm", "yarn"
}
```

**Supported Package Managers:**
- 🔧 **ni** (default) - Universal package manager
- 📦 **npm** - Node Package Manager
- ⚡ **pnpm** - Fast, disk space efficient
- 🧶 **yarn** - Reliable, secure, fast

## 🛠️ Supported Languages

- ✅ JavaScript (.js)
- ✅ TypeScript (.ts)
- ✅ React (.jsx, .tsx)
- ✅ Vue (.vue)

## 💡 Pro Tips

- **Regular Dependency**: Click the package name button
- **Dev Dependency**: Click the "package-name -D" button
- **Multiple Packages**: Install multiple packages in one go
- **Monorepos**: Automatically detects workspace configuration

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests
- ⭐ Star the project

## 📄 License

[MIT](./LICENSE) © [Simon He](https://github.com/Simon-He95)

## ☕ Support

If this extension saves you time, consider buying me a coffee! ☕

<p align="center">
  <a href="https://github.com/Simon-He95/sponsor">
    <img src="https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#EA4AAA" alt="Sponsor" />
  </a>
</p>

## 🙏 Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/Simon-He95/sponsor/sponsors.svg">
    <img src="https://cdn.jsdelivr.net/gh/Simon-He95/sponsor/sponsors.png"/>
  </a>
</p>

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Simon-He95">Simon He</a>
</p>
