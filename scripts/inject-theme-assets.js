/* =============================================================================
   把视觉层需要的东西塞进每个页面。做三件事：

   1. 内联 source/css/custom.css
      为什么不直接用 _config.butterfly.yml 的 inject？
      因为主题的 injectHtml 实现是 `data.join('')`，不会经过 url_for 处理。
      在那边写 `/css/custom.css` 这种绝对路径，一旦部署到项目站点
      （用户名.github.io/仓库名/）就会 404。
      这里在构建时把 CSS 内容直接内联，与站点根路径无关。

   2. 往横幅里插两层波浪（首页那条大图底部的动效）
      Butterfly 没有波浪功能，只能自己插节点，波浪形状用 CSS 里的 SVG 背景画。

   3. 往首屏插一个圆形头像
      参照的 Sakura 主题首屏是「头像 + 站名」居中，主题原本只有站名。

   注意：站点根目录的 scripts/ 是 Hexo 的插件目录，本文件会被 Hexo 用 require 加载，
        所以只能是 CommonJS，不能放 .mjs（tools/ 那个一键配置脚本就是因此才分开的）。
   ========================================================================== */

const fs = require('node:fs');
const path = require('node:path');

const CSS_PATH = path.join(hexo.base_dir, 'source', 'css', 'custom.css');

// 按 mtime 缓存：构建时只读一次，但改了 CSS 后 hexo server 的热更新也能生效
let cache = { mtime: 0, css: '' };

function readCss() {
  try {
    const { mtimeMs } = fs.statSync(CSS_PATH);
    if (mtimeMs !== cache.mtime) {
      cache = { mtime: mtimeMs, css: fs.readFileSync(CSS_PATH, 'utf8') };
    }
    return cache.css;
  } catch (err) {
    hexo.log.warn(`[theme-assets] 读取失败 ${CSS_PATH}：${err.message}`);
    return '';
  }
}

// 波浪容器。两层是故意的：错开速度叠出前后景，像真的水波。
const WAVES = '<div class="hx-waves" aria-hidden="true">' +
  '<div class="hx-wave hx-wave-1"></div>' +
  '<div class="hx-wave hx-wave-2"></div>' +
  '</div>';

hexo.extend.filter.register('after_render:html', function (html) {
  if (!html.includes('</head>')) return html;

  let out = html;

  // ---- 1. 自定义样式 ----
  const css = readCss();
  if (css) {
    out = out.replace('</head>', `<style id="hx-custom-css">\n${css}\n</style>\n</head>`);
  }

  // ---- 2. 波浪 ----
  // 只加在首页。full_page 这个 class 只有首页横幅有。
  // 文章页 / 归档页的横幅不能用：它们的 #page-info 是绝对定位吸在底部 30px 的
  // （node_modules/hexo-theme-butterfly/source/css/_layout/head.styl:115），
  // 标题会正好落在波浪里被盖住。
  // 属性顺序不写死在正则里：先抓出整个 header 开标签，再判断里面有没有 full_page，
  // 这样主题调整属性顺序也不会失效。
  const headerTag = out.match(/<header\b[^>]*id="page-header"[^>]*>/);
  if (headerTag && /\bfull_page\b/.test(headerTag[0])) {
    out = out.replace(/<\/header>/, `${WAVES}</header>`);
  }

  // ---- 3. 首屏头像 ----
  // #site-info 只存在于首页横幅里，所以这段天然只会命中首页。
  const avatar = hexo.theme.config.avatar && hexo.theme.config.avatar.img;
  if (avatar) {
    const urlFor = hexo.extend.helper.get('url_for').bind(hexo);
    const src = urlFor(avatar);
    const el = `<div class="hx-hero-avatar"><img src="${src}" alt="avatar"></div>`;
    out = out.replace('<div id="site-info">', `<div id="site-info">${el}`);
  }

  return out;
});
