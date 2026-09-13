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

/* ===== 4. 每次刷新随机换图 ===============================================

   横幅大图走国内动漫随机图接口，每次刷新换一张：首页 + 归档/标签/分类/关于都用它，
   文章页除外（文章页用文章自己的封面，不能乱换）。接口全部失败时
   （断网、代理不通、接口挂了）退回本地壁纸，页面永远不会开天窗。

   卡片封面则只在本地封面池里重新洗牌 —— 封面刻意不走接口：
   接口返回的是 1920x1080 大图（每张 0.5~1.4MB），一页 6 张卡片就是
   好几 MB，手机上很难受；本地小图（800x500，几十 KB）随便刷。
   ========================================================================== */

const HERO_FALLBACK = ['/img/hero-1.jpg', '/img/hero-2.jpg', '/img/hero-3.jpg'];

const RANDOM_IMG_APIS = [
  'https://www.dmoe.cc/random.php',
  'https://t.alcy.cc/ycy',
  'https://www.loliapi.com/acg/',
  'https://t.mwm.moe/pc'
];

/* 封面池：source/img/covers/ 里的图，构建时扫目录拿到清单。
   想加封面就往那个目录丢图（jpg/png/webp 都行），重新构建即可生效。 */
function readCoverFiles() {
  const dir = path.join(hexo.base_dir, 'source', 'img', 'covers');
  try {
    return fs.readdirSync(dir)
      .filter(file => /\.(jpe?g|png|webp|avif|gif)$/i.test(file))
      .sort()
      .map(file => `/img/covers/${file}`);
  } catch (err) {
    hexo.log.warn(`[theme-assets] 读取封面目录失败 ${dir}：${err.message}`);
    return [];
  }
}
function randomImageScript(heroList, coverList) {
  return `<script id="hx-random-image">
(function () {
  var APIS = ${JSON.stringify(RANDOM_IMG_APIS)};
  var HERO = ${JSON.stringify(heroList)};
  var COVER = ${JSON.stringify(coverList)};
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function bust(u) { return u + (u.indexOf('?') < 0 ? '?' : '&') + '_r=' + Date.now() + Math.floor(Math.random() * 10000); }
  function apply(u) {
    var h = document.querySelector('#page-header:not(.post-bg)');
    if (h) { h.style.backgroundImage = 'url("' + u + '")'; }
  }
  function tryApi(list, i) {
    if (i >= list.length) { if (HERO.length) { apply(pick(HERO)); } return; }
    var url = bust(list[i]);
    var img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.onload = function () { apply(url); };
    img.onerror = function () { tryApi(list, i + 1); };
    img.src = url;
  }
  function init() {
    if (document.querySelector('#page-header:not(.post-bg)')) { tryApi(shuffle(APIS), 0); }
    var cards = document.querySelectorAll('.post_cover img.post-bg');
    if (cards.length && COVER.length) {
      var pool = shuffle(COVER);
      for (var i = 0; i < cards.length; i++) { cards[i].src = pool[i % pool.length]; }
    }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
</script>`;
}
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

  // ---- 4. 每次刷新随机换图 ----
  if (out.includes('</body>')) {
    const dirCovers = readCoverFiles();
    const cfgCovers = hexo.theme.config.cover && hexo.theme.config.cover.default_cover;
    const coverList = dirCovers.length
      ? dirCovers
      : (Array.isArray(cfgCovers) ? cfgCovers : (cfgCovers ? [cfgCovers] : []));
    out = out.replace('</body>', `${randomImageScript(HERO_FALLBACK, coverList)}\n</body>`);
  }
  return out;
});
