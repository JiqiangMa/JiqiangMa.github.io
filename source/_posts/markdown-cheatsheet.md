---
title: 写作模板：Markdown 与 Front-matter 速查
date: 2026-09-10 10:30:00
updated: 2026-09-10 10:30:00
categories:
  - 工程杂记
tags:
  - Markdown
  - Hexo
  - 模板
description: 这篇是示例文章，同时也是这个博客的 Markdown 写法速查。看完可以直接删掉。
---

> 这是一篇**示例文章**，同时也是写作速查表。确认博客搭好后，删掉 `source/_posts/markdown-cheatsheet.md` 即可。

## 1. 新建一篇文章

文章按目录归置，目前有两个分类目录（也可以直接放在 `_posts` 根下）：

- `yonyou/` — 用友相关
- `myprograms/` — 自己项目代码的理解

```bash
# 放进指定目录
npm run new -- --path "yonyou/文件名" "文章标题"
npm run new -- --path "myprograms/文件名" "文章标题"

# 放根目录（默认）
npm run new -- "文章标题"
```

例如 `npm run new -- --path "yonyou/用友接口调试" "用友接口调试"`，会生成 `source/_posts/yonyou/用友接口调试.md`。

> **子目录里的文件名别带日期前缀。** 根目录下会自动生成 `2026-09-10-文章标题.md`；但放进子目录后，文件夹名会被拼进链接（如 `/2026/09/10/yonyou-xxx/`），文件名里的日期前缀反而会把链接变成 `yonyou-2026-09-10-xxx` 这种。日期统一写在 front-matter 的 `date` 里即可。

## 2. Front-matter：文章头部的元信息

文件开头 `---` 之间的部分是 front-matter，用来控制分类、标签、摘要等：

```yaml
---
title: 文章标题
date: 2026-09-10 10:30:00
updated: 2026-09-10 11:00:00
categories:
  - 后端
  - 数据库
tags:
  - MySQL
  - 索引
description: 显示在首页卡片和搜索结果里的摘要
permalink: /2026/09/10/my-first-post/   # 可选：想固定成短地址就写一行
---
```

几个要点：

- `categories` 一般只写 1~2 个，`tags` 可以随便加，站内标签云就是靠它聚合的
- `description` 建议写，首页卡片和本地搜索都会用到；不写的话主题会自动截取正文前 500 字
- `updated` 可选，用于文章底部"最后更新时间"

### 想固定成短网址：permalink

不写 `permalink` 时，地址由 `_config.yml` 里的 `permalink: :year/:month/:day/:title/` 决定，
而 `:title` 取的是**文件路径**——所以文章放在子目录里，目录名也会进 URL：
`_posts/yonyou/规则链-销售发货单.md` 生成的地址是 `.../2026/09/16/yonyou-规则链-销售发货单/`，
标题又长又是中文的话，网址会很难看（还会有大量百分号编码）。

在 front-matter 里加一行就能固定成短地址：

```yaml
permalink: /2026/09/16/ship-info-rule/
```

生成结果：`https://jiqiangma.github.io/2026/09/16/ship-info-rule/`

几个要点：

- **以 `/` 开头**，写到路径为止，不要带域名；用英文、数字、连字符最稳（中文能用但不建议）
- **发布之后不要再改**：改了等于换了网址，之前分享出去的链接、搜索引擎收录的都会变成 404
- 好处是**文件名和标题随便改，网址不变**
- `_config.yml` 里那行 `permalink:` 是**全站默认格式**，改它会让所有文章的地址一起变，老文章多了以后慎改
## 3. 正文语法

### 文字

`**粗体**`、`*斜体*`、`~~删除线~~`、`\`行内代码\``。

### 给文字上色

先分清两件事：**让文字本身变色**（比如蓝色）用下面 1、2 两种；**给文字套一个带底色的小标签**是第 3 种，那叫"色块"，不是文字变色。

**1）行内 HTML —— 最直接**：

```html
把 <span style="color:#1E6FEB">关键结论</span> 标成蓝色。
```

效果：把 <span style="color:#1E6FEB;font-weight:600">关键结论</span> 标成蓝色。

**2）语义化类（推荐）**：颜色定义在 `source/css/custom.css` 的"正文文字变色工具类"一节，文章里只写类名，以后统一改色：

```html
<span class="c-accent">站点主色（橙）</span>
<span class="c-blue">蓝色</span>
<span class="c-warn">红色（风险）</span>
<span class="c-ok">绿色（正常 / 通过）</span>
<span class="c-muted">灰色（次要说明）</span>
```

效果：<span class="c-accent">站点主色</span>　<span class="c-blue">蓝色</span>　<span class="c-warn">红色</span>　<span class="c-ok">绿色</span>　<span class="c-muted">灰色</span>

**3）带底色的小标签**（这一种是色块，不是文字变色）：

````markdown
{% label 重要 orange %}
````

效果：{% label 重要 orange %}　{% label 注意 red %}　{% label 结论 green %}

可选颜色：`blue` `pink` `red` `purple` `orange` `green`，不写就是灰色。

> **两个注意点**
>
> 1. 在 Markdown 里混写 HTML 时，标签要**顶格写、前后各空一行**，否则标签里面的内容不会被解析。
> 2. 颜色别用太多，一篇里 1~2 处重点就够了；想统一调色，改 `custom.css` 里那几个类即可。
### 列表与表格

| 语法 | 效果 | 常用场景 |
|---|---|---|
| `## 标题` | 二级标题 | 自动进入右侧目录 |
| `- 项` | 无序列表 | 罗列要点 |
| `1. 项` | 有序列表 | 步骤说明 |
| `> 引用` | 引用块 | 摘抄、提示 |

### 代码块

用三个反引号包裹，**务必标上语言**，这样才有高亮和右上角的语言标签：

````markdown
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
```
````

### 数学公式

行内公式用单个 `$`：$O(n \log n)$

独立公式用两个 `$$`：

$$
T(n) = 2T\left(\frac{n}{2}\right) + O(n) = O(n \log n)
$$

> 公式按需加载：只有在文章 front-matter 里写了 `katex: true`，或者页面里出现了公式语法时才会引入 KaTeX，不影响其他页面的加载速度。

### 图片

图片放在 `source/img/` 下，然后用 Markdown 语法引用：

```markdown
![图片说明](img/example.png)
```

> **路径随便写，别用裸 HTML 标签。**
>
> Markdown 的 `![]()` 语法会自动补上站点根路径（Hexo 的 `prependRoot`），所以 `img/x.png` 和 `/img/x.png` 都行，
> 将来把站点从 `用户名.github.io` 改成 `用户名.github.io/myblog/` 也不用回头改文章。
>
> 但**裸 HTML 的 `<img src="...">` 不会被处理**，在带子路径的项目站点下会 404。图片一律用 Markdown 语法写。

## 4. 本地预览

```bash
npm run dev
```

然后打开 http://localhost:4000 。这个命令会先清理缓存再构建，改完文章保存刷新即可（Hexo 会监听文件变化重新生成）。

## 5. 发布

```bash
git add .
git commit -m "post: 新增一篇笔记"
git push
```

推送后 GitHub Actions 会自动构建并发布，通常 1 分钟左右就能在线上看到。
