<p align="center">
<img height="200" src="./assets/kv.png" alt="Lazy Install">
</p>

<h1 align="center">🚀 Lazy Install</h1>

<p align="center">
  <strong>VS Code extension to auto install missing npm packages from import statements</strong>
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

<p align="center">
  Lazy Install detects missing dependencies in JavaScript, TypeScript, React, and Vue files, then lets you install them with one click via npm, pnpm, yarn, or ni.
</p>

---

## ✨ Why Lazy Install for VS Code?

**Stop the tedious workflow!** 🛑

❌ **Before**: Import → Copy package name → Switch to terminal → Type install command → Wait → Switch back to editor
✅ **After**: Import → Click install button → Done! 🎉

Lazy Install automatically detects uninstalled packages in `import`, `export from`, `require()`, and `import()` statements, then provides **one-click install buttons** directly in the editor. No more terminal switching or copy-pasting package names.

## 🎯 Features

- 🔍 **Missing Package Detection**: Automatically scans import statements for dependencies that are not installed yet
- ⚡ **One-Click Install**: Install npm packages instantly with inline CodeLens actions
- 🛠️ **Multiple Package Managers**: Supports npm, pnpm, yarn, and ni
- 🧩 **Common Import Forms**: Supports `import`, `export from`, `require()`, and `import()`
- 📦 **Dev Dependencies**: Choose between regular dependencies and dev dependencies
- 🔧 **Monorepo Support**: Works with pnpm workspaces and `package.json` workspaces
- 🚀 **Zero Configuration**: Works out of the box for JavaScript, TypeScript, React, and Vue projects

*Just import and click - it's that simple!*

## 🚀 Quick Start

1. **Install** the extension from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=simonhe.lazy-install)
2. **Write** a missing import such as `import axios from 'axios'`
3. **Click** the inline install button above the import
4. **Done!** The missing dependency is installed and ready to use

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
- **Common Import Styles**: Works with `import`, `require()`, and `import()`
- **Monorepos**: Detects pnpm workspaces and `package.json` workspaces

## ❓ FAQ

### Does Lazy Install work with monorepos?

Yes. It detects pnpm workspaces and `package.json` workspaces, then installs dependencies in the current package instead of always using the repository root.

### Which import styles are supported?

Lazy Install detects packages referenced by `import`, `export from`, `require()`, and `import()` syntax in supported files.

### Can I install dev dependencies?

Yes. Each missing package gets both a regular install action and a `-D` install action in the CodeLens UI.

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
