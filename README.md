# Vidora

Windows desktop shell for searching YouTube and managing downloads of content you are allowed to save. The product boundary and the build phases are in [docs/architecture.md](docs/architecture.md).

## Scripts

```bash
pnpm install
pnpm dev          # browser shell at http://localhost:1420
pnpm test
pnpm typecheck
pnpm tauri dev    # native window
```

## Native window

`pnpm tauri dev` needs the stable Rust toolchain and the Microsoft C++ build tools with the Windows SDK. WebView2 is already present on current Windows 11 installs. The installer target is NSIS for Windows x64.
