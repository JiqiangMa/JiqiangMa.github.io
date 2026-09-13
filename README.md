# 我的技术笔记

记录对技术的理解，以及每天学到的新东西。

- **框架**：[Hexo 8](https://hexo.io/)（静态站点生成器）
- **主题**：[Butterfly 5](https://butterfly.js.org/)（支持标签、分类、本地搜索、目录）
- **部署**：[GitHub Pages](https://pages.github.com/)，推送后由 GitHub Actions 自动构建发布
- **视觉**：Sakura 风格布局（参照 [Sakura 主题](https://2heng.xin/theme-sakura/)）——整屏随机摄影壁纸当首屏 + 底部漂移波浪 + 10px 大圆角卡片 + 暖橙 `#FE9600` 强调色

---

## 目录结构

```
.
├── _config.yml                      # 站点主配置：标题、作者、URL、根路径
├── _config.butterfly.yml            # 主题配置：菜单、搜索、代码高亮、侧边栏……
├── package.json                     # 依赖与快捷命令
├── tools/configure.mjs              # 一键填写用户名的脚本
├── scripts/inject-theme-assets.js   # 注入自定义样式 + 波浪 + 首屏头像（Hexo 插件）
├── .github/workflows/deploy.yml     # 自动部署工作流
├── scaffolds/                       # 新建文章时的模板
└── source/
    ├── _posts/                      # ★ 你的文章都放这里（Markdown）
    ├── css/custom.css               # ★ 视觉定制都在这里
    ├── about/index.md               # 关于页
    ├── tags/index.md                # 标签汇总页
    ├── categories/index.md          # 分类汇总页
    └── img/                         # 图片资源
        ├── avatar.svg               # 头像（首屏和侧边栏都用它）
        ├── favicon.svg              # 网站图标
        ├── cover-fallback.svg       # 封面加载失败时的兜底图
        └── avatar-fallback.svg      # 头像加载失败时的兜底图
```

> `node_modules/` 和 `public/`（构建产物）已在 `.gitignore` 中排除，不需要提交。

---

## 日常写作

### 1. 新建一篇文章

```bash
npm run new -- "文章标题"
```

会在 `source/_posts/` 下生成 `2026-09-10-文章标题.md`（文件名带日期，同标题不会互相覆盖）。

### 2. 本地预览

```bash
npm run dev
```

打开 <http://localhost:4000> 。改完文章保存，刷新浏览器即可看到效果。

### 3. 发布

```bash
git add .
git commit -m "post: 新增一篇笔记"
git push
```

推送后 GitHub Actions 自动构建，约 1 分钟后线上更新。构建进度在仓库的 **Actions** 标签页查看。

---

## 首次部署（只做一次）

### 第 1 步：在 GitHub 上创建仓库

登录 GitHub，点右上角 `+` → **New repository**，根据你想要的效果二选一：

| 方案 | 仓库名怎么填 | 最终访问地址 |
|---|---|---|
| **方案 A：用户主页站点**（推荐，地址最干净） | `你的用户名.github.io` | `https://你的用户名.github.io` |
| **方案 B：项目站点** | 任意，比如 `myblog` | `https://你的用户名.github.io/myblog/` |

> 方案 A 的仓库名**必须**和用户名完全一致，一个账号只能有一个。
> 仓库设为 **Public**（私有仓库用 GitHub Pages 需要付费）。

### 第 2 步：填入你的信息

在项目目录下执行（把 `你的用户名` 换成真的）：

```bash
# 方案 A
npm run configure -- --user 你的用户名

# 方案 B（多一个 --repo）
npm run configure -- --user 你的用户名 --repo myblog
```

这个脚本会自动改好 `_config.yml` 的 `url` / `root` / `author`，以及主题配置和关于页里的占位符。
**方案 A 和方案 B 的差别就在这里**：方案 B 会把 `root` 设成 `/myblog/`，文章里的图片路径才能正确解析。

也可以不带参数运行，脚本会交互式提问：

```bash
npm run configure
```

### 第 3 步：推送到 GitHub

```bash
git add .
git commit -m "chore: 初始化博客"
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

> 首次推送可能要求登录。推荐用 [SSH key](https://docs.github.com/cn/authentication/connecting-to-github-with-ssh) 或 [Personal Access Token](https://github.com/settings/tokens) 代替密码。

### 第 4 步：开启 GitHub Pages

推送完成后，进入仓库页面：

**Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。

然后再去 **Actions** 标签页，会看到 "构建并部署到 GitHub Pages" 正在运行。等它变成绿色对勾，访问上面的地址就能看到博客了。

---

## 常用命令

| 命令 | 作用 |
|---|---|
| `npm run new -- "标题"` | 新建文章 |
| `npm run draft -- "标题"` | 新建草稿（不会发布） |
| `npm run dev` | 清理缓存 + 构建 + 本地预览 |
| `npm run build` | 只构建，产物在 `public/` |
| `npm run clean` | 清空缓存和构建产物 |
| `npm run configure -- --user <用户名>` | 填写站点信息 |

---

## 常见问题

**图片不显示？**
用 Markdown 语法 `![](img/图片名.png)`，图片放在 `source/img/` 下。
**不要用裸 HTML 的 `<img src="...">`**——Markdown 语法会被 Hexo 自动补上站点根路径，裸 HTML 不会，项目站点下会 404。

**线上没更新？**
先看仓库的 **Actions** 标签页，构建失败的话点进去看日志。本地 `npm run dev` 能正常显示但线上不行，一般是 `_config.yml` 里的 `url` / `root` 没配对。

**想改配色、菜单、开关某个功能？**
大部分在 `_config.butterfly.yml` 里，每个选项都有注释。主题完整文档：<https://butterfly.js.org/>

**想改视觉细节（圆角、阴影、间距、字体）？**
全在 `source/css/custom.css`。改完存盘，`npm run dev` 的服务器会自动重新构建，刷新即可。

**想换配色？**
强调色要在两个地方一起改，否则主题自带的按钮和自定义样式会不同色：

1. `_config.butterfly.yml` 的 `theme_color.main` —— 管主题自带的组件（链接、按钮、目录高亮、代码块）
2. `source/css/custom.css` 顶部 `:root` 里的 `--sak-accent` —— 管自定义的那层（标题竖条、卡片 hover、波浪）

全局搜索 `#FE9600` 和 `--sak-accent` 替换即可。背景色、卡片色、圆角、阴影都在 `custom.css` 顶部那组 `--sak-*` 变量里。

**想换头像/网站图标？**
替换 `source/img/` 下的 `avatar.svg` / `favicon.svg` 同名文件即可，配置不用动。
换成照片也支持：把图片丢进去，改 `_config.butterfly.yml` 里 `avatar.img` 的路径。

**首屏的壁纸是哪来的？**
来自 [Picsum](https://picsum.photos/)（真实摄影，安全不露），所以仓库里不用存大图。
接口地址写在 `_config.butterfly.yml` 的 `index_img` / `default_top_img` / `cover.default_cover` 里。
想换成固定的图，把那些 URL 换成自己的图片地址即可。
接口挂掉时会自动显示 `cover-fallback.svg` / `avatar-fallback.svg` 兜底，不会出现裂图。

**底部的波浪是怎么做的？**
Butterfly 没有这个功能，是 `scripts/inject-theme-assets.js` 往首页横幅里插了两个 `<div>`，
形状由 `custom.css` 里的 `--sak-wave-1` / `--sak-wave-2` 两个内联 SVG 画出来（不依赖任何外链图片），
再用 `@keyframes hx-wave-drift` 让背景横向滚动。
只加在首页——文章页和归档页的标题是吸在横幅底部 30px 处的，加了会被波浪盖住。

**首屏那颗圆形头像？**
也是上面那个插件插进去的（主题原本首屏只有站名）。鼠标移上去会转一圈。

**访客统计是怎么来的？**
主题默认用 [busuanzi](https://busuanzi.ibruce.info/) 统计访问量，由第三方服务提供。不想要的话在 `_config.butterfly.yml` 里把 `busuanzi` 下的三项改成 `false`。

---

## 写作语法速查

见站点里的示例文章 `source/_posts/markdown-cheatsheet.md`（确认博客正常后可以直接删掉）。
