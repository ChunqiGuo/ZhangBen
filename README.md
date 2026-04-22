# 记账软件 - 前端

本目录包含记账软件的前端代码，托管在 Vercel 上。

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- 响应式设计

## 目录结构

```
├── index.html          # 主页面
├── css/
│   └── style.css      # 样式文件
├── js/
│   ├── app.js         # 应用逻辑
│   └── storage.js     # 数据访问层（API调用）
├── images/            # 背景图片
└── .gitignore         # Git忽略文件
```

## 开发

前端代码会自动调用后端 API，确保后端服务已启动。

API 地址在 `js/storage.js` 中配置，部署时会自动使用当前域名。

## 部署到 Vercel

1. 将此目录推送到 GitHub 仓库
2. 登录 [Vercel](https://vercel.com)
3. Import GitHub 仓库
4. Vercel 会自动检测并部署

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| VERCEL_API_URL | 后端 API 地址 | 自动使用当前域名 |

## 注意事项

- 本目录不包含后端代码
- 后端代码位于独立的 `server` 仓库
- 部署前请确保后端服务已部署并可访问
