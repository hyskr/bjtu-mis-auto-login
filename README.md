# BJTU MIS Helper V1.1.0

一个用于北京交通大学统一认证系统的 Chrome 扩展，支持自动填充用户名、密码和验证码，以及教学评教自动填写。

## 功能特点

- 🔐 自动填充登录表单
- 🖼️ 自动验证码识别
- 🔄 支持多账号快速切换
- 💾 配置本地保存
- 🎨 简洁的用户界面
- 📝 教学评估自动填写
- 🔒 安全性保障：所有数据均存储在本地浏览器中

## 使用方法

1. 从 [Releases](https://github.com/hyskr/bjtu-mis-helper/releases) 页面下载最新版本的扩展包（.zip文件）

2. 解压下载的扩展包到本地文件夹

3. 在 Chrome 浏览器中打开扩展管理页面：
   - 点击浏览器右上角的"更多"按钮（⋮）
   - 选择"更多工具" > "扩展程序"
   - 或直接在地址栏输入 `chrome://extensions`

4. 在扩展管理页面右上角启用"开发者模式"

5. 点击"加载已解压的扩展程序"，选择之前解压的扩展文件夹

6. 扩展安装完成后，点击工具栏中的扩展图标进行配置：
   - 设置登录账号和密码
   - 配置教学评估选项（可选）

## 功能说明

### 自动登录
- 自动填充用户名和密码
- 智能识别验证码
- 支持多账号配置和快速切换

### 教学评估助手
- 自动填写评教表单
- 支持自定义评教文本
- 可配置最优选项
- 实时同步配置更新

## 注意事项

- 首次使用时需要配置账号信息
- 所有数据均保存在本地浏览器中，不会上传到任何服务器
- 如遇到问题，可以尝试重新加载扩展或清除浏览器缓存

## 开发相关

### 本地开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建生产版本
pnpm run build
```

### 技术栈

- Vue 3
- TypeScript
- Chrome Extension API
- Vite

## 反馈与贡献

如果您在使用过程中遇到任何问题，或有任何建议，欢迎：

- 提交 [Issue](https://github.com/hyskr/bjtu-mis-helper/issues)
- 提交 Pull Request

## 许可证

MIT License