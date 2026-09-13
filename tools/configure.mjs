#!/usr/bin/env node
/**
 * 一键把博客里的占位符 YOUR_GITHUB_USERNAME 换成你的真实信息。
 *
 * 用法：
 *   npm run configure                          # 交互式提问
 *   npm run configure -- --user <用户名>        # 用户主页站点（用户名.github.io）
 *   npm run configure -- --user <用户名> --repo <仓库名>   # 项目站点（用户名.github.io/仓库名）
 *
 * 会改这几个文件：
 *   _config.yml            -> url / root / author
 *   _config.butterfly.yml  -> 侧边栏 GitHub 链接
 *   source/about/index.md  -> 关于页里的链接
 *   README.md              -> 文档里的示例链接
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLACEHOLDER = 'YOUR_GITHUB_USERNAME';

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

/** 解析 `--user xxx --repo yyy` 形式的参数 */
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--user' || a === '-u') out.user = argv[++i];
    else if (a === '--repo' || a === '-r') out.repo = argv[++i];
    else if (a === '--help' || a === '-h') out.help = true;
  }
  return out;
}

function usage() {
  console.log(`
${c.bold('用法')}
  npm run configure -- --user <用户名> [--repo <仓库名>]

${c.bold('说明')}
  --repo 省略或写成 <用户名>.github.io  ->  用户主页站点，地址是 https://<用户名>.github.io
  --repo 写成别的（如 myblog）          ->  项目站点，地址是 https://<用户名>.github.io/<仓库名>/
`);
}

/** GitHub 用户名规则：1-39 位，字母数字和连字符，不能以连字符开头/结尾 */
function validateUser(u) {
  if (!u) return '用户名不能为空';
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(u)) {
    return 'GitHub 用户名只能是字母、数字和连字符，且不能以连字符开头或结尾（1-39 位）';
  }
  return null;
}

function validateRepo(r) {
  if (!r) return null; // 允许为空，表示用户主页站点
  if (!/^[A-Za-z0-9._-]+$/.test(r)) return '仓库名只能包含字母、数字、点、下划线和连字符';
  return null;
}

/**
 * 读取文件 -> 做替换 -> 有变化才写回。
 * 返回 true 表示文件被修改了。
 */
function patch(relPath, transform) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) {
    console.log(`  ${c.yellow('跳过')} ${relPath} ${c.dim('（文件不存在）')}`);
    return false;
  }
  const before = fs.readFileSync(abs, 'utf8');
  const after = transform(before);
  if (after === before) {
    console.log(`  ${c.dim('无变化')} ${relPath}`);
    return false;
  }
  fs.writeFileSync(abs, after);
  console.log(`  ${c.green('已更新')} ${relPath}`);
  return true;
}

/** 把 `key: value` 这一行替换掉；如果 key 不存在，就插在 afterKey 那一行后面 */
function setYamlKey(source, key, value, afterKey) {
  const line = `${key}: ${value}`;
  const re = new RegExp(`^${key}:.*$`, 'm');
  if (re.test(source)) return source.replace(re, line);
  if (afterKey) {
    const anchor = new RegExp(`^${afterKey}:.*$`, 'm');
    if (anchor.test(source)) return source.replace(anchor, (m) => `${m}\n${line}`);
  }
  return `${source.trimEnd()}\n${line}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    return;
  }

  let user = args.user;
  let repo = args.repo;

  // 没有给参数就走交互式提问
  if (!user) {
    console.log(`\n${c.bold('配置博客')} ${c.dim('（直接回车使用方括号里的默认值）')}\n`);
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      user = (await rl.question('GitHub 用户名：')).trim();
      const repoAns = (await rl.question(`仓库名 ${c.dim('（回车 = 用户主页站点）')}：`)).trim();
      repo = repoAns || undefined;
    } finally {
      rl.close();
    }
  }

  user = (user || '').trim();
  repo = (repo || '').trim() || undefined;

  const userErr = validateUser(user);
  if (userErr) {
    console.error(`\n${c.red('✗')} ${userErr}\n`);
    process.exitCode = 1;
    return;
  }
  const repoErr = validateRepo(repo);
  if (repoErr) {
    console.error(`\n${c.red('✗')} ${repoErr}\n`);
    process.exitCode = 1;
    return;
  }

  // repo 等于 <用户名>.github.io 时，其实是用户主页站点，等同于没写 repo
  if (repo && repo.toLowerCase() === `${user.toLowerCase()}.github.io`) {
    repo = undefined;
  }

  const isUserSite = !repo;
  const siteUrl = isUserSite
    ? `https://${user.toLowerCase()}.github.io`
    : `https://${user.toLowerCase()}.github.io/${repo}`;
  const root = isUserSite ? '/' : `/${repo}/`;

  console.log(`\n${c.bold('将应用以下配置')}`);
  console.log(`  用户名    ${c.green(user)}`);
  console.log(`  站点类型  ${isUserSite ? '用户主页站点' : `项目站点（仓库 ${repo}）`}`);
  console.log(`  访问地址  ${c.green(siteUrl + '/')}`);
  console.log(`  root      ${root}\n`);

  console.log(c.bold('修改文件'));
  patch('_config.yml', (s) => {
    let out = setYamlKey(s, 'url', siteUrl, 'keywords');
    out = setYamlKey(out, 'root', root, 'url');
    out = setYamlKey(out, 'author', user, 'timezone');
    return out;
  });
  patch('_config.butterfly.yml', (s) => s.split(PLACEHOLDER).join(user));
  patch('source/about/index.md', (s) => s.split(PLACEHOLDER).join(user));
  patch('README.md', (s) => s.split(PLACEHOLDER).join(user));

  console.log(`\n${c.green('✓')} 配置完成。\n`);
  console.log(c.bold('接下来'));
  console.log(`  1. 本地预览        ${c.dim('npm run dev')}  然后打开 http://localhost:4000`);
  console.log(`  2. 看改动          ${c.dim('git diff')}`);
  console.log(`  3. 提交并推送      ${c.dim('git add . && git commit -m "chore: 配置站点信息" && git push')}`);
  console.log(`\n  推送后到 GitHub 仓库的 ${c.bold('Settings → Pages')}，把 Source 选成 ${c.bold('GitHub Actions')}。\n`);
}

main().catch((err) => {
  console.error(`\n${c.red('✗')} 出错了：${err.message}\n`);
  process.exitCode = 1;
});
