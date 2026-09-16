# 朝码夕拾

「朝花夕拾」的码农版：白天做用友 BIP 客开，晚上把学到的东西整理成笔记。

- **框架**：[Hexo 8](https://hexo.io/)（静态站点生成器）
- **主题**：[Butterfly 5](https://butterfly.js.org/)（支持标签、分类、本地搜索、目录）
- **部署**：[GitHub Pages](https://pages.github.com/)，推送后由 GitHub Actions 自动构建发布
- **视觉**：Sakura 风格布局（参照 [Sakura 主题](https://2heng.xin/theme-sakura/)）——整屏随机二次元壁纸当首屏（每次刷新换一张） + 底部漂移波浪 + 10px 大圆角卡片 + 暖橙 `#FE9600` 强调色

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
        ├── heroes/                   # ★ 壁纸池（当前 34 张，渲染前就随机取一张）
        ├── covers/                   # ★ 封面池（当前 45 张，丢图进去即生效）
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

### 4. 分类与标签约定

- **分类**：每篇只写一个，目前只有两个，别随手加新的。
  - `BIP客开` —— 用友 BIP 客开相关：规则链、单据联动、平台 API、联调排错
  - `工程杂记` —— Java / 后端 / 工具链 / 环境问题，以及不属于上面那类的
- **标签**：不用提前规划，写的时候顺手贴 2~4 个，用技术名（Arthas）、组件名（规则链）、问题类型（排错）这类词。
- **description**：一两句话，会出现在文章卡片和搜索结果里；留空则自动截取正文开头。
- 新建文章时这些字段已经在模板 `scaffolds/post.md` 里了，默认分类是 `BIP客开`，写别的类型记得改一行。

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
手机端适配的规则在文件末尾的两组 `@media`（`max-width: 768px` 和 `480px`）里：波浪高度、站名字号、
卡片圆角与缩略图高度、正文标题字号、代码块/表格防溢出、手机上隐藏目录卡片，都在那儿。

**想换配色？**
强调色要在两个地方一起改，否则主题自带的按钮和自定义样式会不同色：

1. `_config.butterfly.yml` 的 `theme_color.main` —— 管主题自带的组件（链接、按钮、目录高亮、代码块）
2. `source/css/custom.css` 顶部 `:root` 里的 `--sak-accent` —— 管自定义的那层（标题竖条、卡片 hover、波浪）

全局搜索 `#FE9600` 和 `--sak-accent` 替换即可。背景色、卡片色、圆角、阴影都在 `custom.css` 顶部那组 `--sak-*` 变量里。

**想换头像/网站图标？**
替换 `source/img/` 下的 `avatar.svg` / `favicon.svg` 同名文件即可，配置不用动。
换成照片也支持：把图片丢进去，改 `_config.butterfly.yml` 里 `avatar.img` 的路径。

**首屏的壁纸是哪来的？**
每次刷新都不一样。`scripts/inject-theme-assets.js` 会往页面注入一小段脚本，按随机顺序尝试这几个
国内动漫随机图接口：`https://www.dmoe.cc/random.php`、`https://t.alcy.cc/ycy`、
`https://www.loliapi.com/acg/`、`https://t.mwm.moe/pc`，第一个加载成功的就拿来当首屏。
        ├── heroes/                   # ★ 壁纸池（当前 34 张，渲染前就随机取一张）
要增删接口，改那个脚本顶部的 `RANDOM_IMG_APIS`。

更关键的是"先随机"这一步：脚本会往 `<head>` 里塞一小段内联 JS，页面渲染**之前**就从 `source/img/heroes/`
随机挑一张当壁纸（用 `!important` 覆盖服务端写死的那张），所以不会再出现"先显示固定一张、等一下才被换掉"。
接口图加载成功后，才会把它替换成线上随机图。加壁纸：把图丢进 `source/img/heroes/`（建议 1600x900 左右），不用改配置。

**文章封面怎么定的？**
封面池就是 `source/img/covers/` 这个目录（当前 45 张），构建时脚本扫目录拿到清单，每次刷新页面都会重新随机分配。
封面刻意不走接口：接口返回的是 1920x1080 大图（每张 0.5~1.4MB），一页 6 张卡片就是好几 MB。
想加封面：把图丢进 `source/img/covers/`（jpg/png/webp 都行），提交推送后自动生效，不用改配置。

**图标或样式偶尔加载不出来？**
主题默认从 `cdn.jsdelivr.net` 取图标和脚本，国内经常不通。现在 Font Awesome 图标已经自托管在
`source/pluginsSrc/fontawesome/`，不走任何 CDN；剩下两个小脚本（typed.js、infinitegrid）走
`_config.butterfly.yml` 里 `CDN.custom_format` 配的 `fastly.jsdelivr.net`（jsdelivr 的 Fastly 边缘，实测国内可达）。

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
