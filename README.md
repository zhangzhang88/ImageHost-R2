
# NBVIL 图床（Cloudflare R2 + Worker 实现）

一个极简图床解决方案，支持拖拽上传、多图上传、自动生成图片链接等，部署于 Cloudflare Worker，使用 R2 作为存储，无需服务器、无需数据库。

## ✨ 项目特性

- ✅ 免费图床，基于 Cloudflare R2 存储
- ✅ 上传支持多图，格式校验，仅支持常见图片格式
- ✅ 使用 Cloudflare Worker 处理上传、访问逻辑
- ✅ 部署简便，前后端可独立托管，支持绑定自定义域名
- ✅ 极简前端，轻量无依赖，易于修改

## 🔧 后续计划

- 🌈 UI 优化与暗黑模式支持
- 🔐 用户注册与认证（如 Supabase）
- 📁 云盘视图与图片管理界面

## 📚 教程指南
- 📖 文章教程：[博客教程](https://blog.nbvil.com/posts/imagehost)
- 🎬 视频教程：
  - B站：[B站视频](https://blog.nbvil.com/posts/imagehost)
  - YouTube：[YouTube视频](https://blog.nbvil.com/posts/imagehost)
    
## 🚀 快速开始

### 1. 配置 Cloudflare 环境

- 创建 R2 储存桶，例如：`img`
- 创建 Worker 服务，绑定 R2 资源
- 绑定
  - R2 存储桶

### 2. 部署 Worker代码

将 `worker.js`代码 部署到 Cloudflare Workers

### 3. 前端部署

将前端静态页面（含 `index.html`、`upload.js`、`styles.css`、`config.js`）部署到任意支持静态站点的平台（如 Cloudflare Pages、Vercel、GitHub Pages 等）。

自定义配置 `config.js` 文件：

```js
window.IMG_BED_CONFIG = {
  apiBaseUrl: "https://your-worker-domain.workers.dev",  //worker访问地址
  maxFiles: 5     //自定义最大上传文件数量                                          
}
```

## 📦 项目结构

```
/
├── worker.js          # Worker 服务端逻辑
├── public/
│   ├── index.html     # 前端页面
│   ├── upload.js      # 上传逻辑
│   ├── config.js      # 自定义配置
│   └── styles.css     # 样式文件
```

## 💡 支持图片格式

仅支持上传以下图片类型：

- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`

若尝试上传非图片格式（如 mp3、zip）将被拦截。

## 💬 支持与交流

如果你有任何问题或建议，可以：

- 提交 [Issue](https://github.com/sindricn/ImageHost-R2/issues)
- 加入交流群（可在项目页说明）
  
<img src="https://api.nbvil.com/de942d82-f3d5-456b-9c37-84dda2ad7a58.png" alt="赞赏码" width="200" />          <img src="https://api.nbvil.com/273590a8-90a2-4dc6-939a-436d8ba11ef8.jpg" alt="赞赏码" width="200" />

## 📝 License

本项目基于 MIT 开源许可，详见 [LICENSE](#license) 文件。

## ☕ 赞赏支持
如果你觉得这个项目对你有帮助，可以通过以下方式支持我：

<img src="https://api.nbvil.com/7ee6b22b-c966-451d-ba55-69ccce37b9fb.jpg" alt="赞赏码" width="200" />

## 🙏 鸣谢

- [Cloudflare](https://cloudflare.com) - 提供 Worker 和 R2 存储


