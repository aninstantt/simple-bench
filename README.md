# Easy Bench

基于 **Vite+** 的前端项目（统一用 `vp` 管理开发/构建/校验/测试）。

## Quick Start

### 1. 安装依赖

```bash
vp install
```

### 2. 本地开发

```bash
vp dev
```

默认会在 `http://localhost:5173`（如被占用会自动换端口）打开。

## Build & Preview

```bash
vp build
vp preview
```

## Check & Test

```bash
vp check
vp test
```

- `vp check`：格式化、Lint、TypeScript 类型检查（必要时可加 `--fix` 自动修复）
- `vp test`：运行测试（Vitest）

## 依赖管理（可选）

安装新依赖建议走：

```bash
vp add <package>
```

删除依赖建议走：

```bash
vp remove <package>
```
