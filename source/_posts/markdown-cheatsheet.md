---
title: 写作模板：Markdown 与 Front-matter 速查
date: 2026-09-10 10:30:00
updated: 2026-09-10 10:30:00
categories:
  - 使用说明
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
---
```

几个要点：

- `categories` 一般只写 1~2 个，`tags` 可以随便加，站内标签云就是靠它聚合的
- `description` 建议写，首页卡片和本地搜索都会用到；不写的话主题会自动截取正文前 500 字
- `updated` 可选，用于文章底部"最后更新时间"

## 3. 正文语法

### 文字

`**粗体**`、`*斜体*`、`~~删除线~~`、`\`行内代码\``。

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
