const fs = require('fs/promises');
const path = require('path');
const { performance } = require('perf_hooks');

const ROOT_DIR = __dirname;
const DATABASE_DIR = path.resolve(ROOT_DIR, 'database');
const DEDUP_PATH = path.resolve(DATABASE_DIR, 'hn-ids.json');
const API_BASE = 'https://hn.algolia.com/api/v1/search';
const HITS_PER_DIRECTION = 10;
const ID_RE = /item\?id=(\d+)/;

const DIRECTIONS = [
  {
    name: '推广获客与冷启动',
    keywords: ['reddit marketing', 'first paying customer', 'build in public'],
    jsonFolder: '认知库',
    mdFolder: '认知库',
    filenamePrefix: 'hn-推广获客',
  },
  {
    name: '独立开发者变现与定价',
    keywords: ['gumroad pricing', 'solo founder revenue', 'digital product pricing'],
    jsonFolder: '认知库',
    mdFolder: '认知库',
    filenamePrefix: 'hn-变现定价',
  },
  {
    name: '一人公司失败教训',
    keywords: ['shutting down project', 'solo founder burnout', 'failed launch'],
    jsonFolder: '经验库',
    mdFolder: '经验库',
    filenamePrefix: 'hn-失败教训',
  },
  {
    name: 'SEO与内容营销',
    keywords: ['SEO for solo founder', 'content marketing without budget'],
    jsonFolder: '方法论库',
    mdFolder: '方法论库',
    filenamePrefix: 'hn-SEO内容',
  },
  {
    name: 'GEO与AI搜索优化',
    keywords: ['GEO optimization', 'Generative Engine Optimization', 'AI search ranking', 'AI overviews optimization'],
    jsonFolder: '方法论库',
    mdFolder: '方法论库',
    filenamePrefix: 'hn-GEO优化',
  },
  {
    name: '信用卡退款与争议',
    keywords: ['credit card dispute', 'unauthorized charge', 'chargeback tips'],
    jsonFolder: '数据资产库',
    mdFolder: '认知库',
    filenamePrefix: 'hn-信用卡退款',
  },
  {
    name: '一人公司法律合规',
    keywords: ['solo founder legal compliance', 'YMYL content guidelines', 'digital product legal disclaimer'],
    jsonFolder: '认知库',
    mdFolder: '认知库',
    filenamePrefix: 'hn-法律合规',
  },
  {
    name: '合同解读与条款翻译',
    keywords: ['contract reading tool', 'lease agreement explained', 'legal document translation'],
    jsonFolder: '数据资产库',
    mdFolder: '认知库',
    filenamePrefix: 'hn-合同解读',
  },
  {
    name: 'Pinterest引流策略',
    keywords: ['pinterest marketing', 'pinterest SEO traffic', 'pinterest content strategy'],
    jsonFolder: '认知库',
    mdFolder: '认知库',
    filenamePrefix: 'hn-Pinterest引流',
  },
  {
    name: '独立开发者工具链',
    keywords: ['indie developer tool stack', 'free AI tools for solo founder', 'low cost SaaS infrastructure'],
    jsonFolder: '认知库',
    mdFolder: '认知库',
    filenamePrefix: 'hn-工具链',
  },
  {
    name: '用户反馈与评价收集',
    keywords: ['solo founder collecting feedback', 'gumroad reviews strategy', 'early user feedback'],
    jsonFolder: '认知库',
    mdFolder: '认知库',
    filenamePrefix: 'hn-用户反馈',
  },
];

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function buildApiUrl(keyword) {
  const params = new URLSearchParams({
    query: keyword,
    tags: 'story',
    hitsPerPage: String(HITS_PER_DIRECTION),
  });

  return `${API_BASE}?${params.toString()}`;
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, maxLength = 220) {
  if (!value) return '';
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function summarize(hit) {
  const storyText = stripHtml(hit.story_text || hit.comment_text || '');
  if (storyText) return truncate(storyText);

  const points = hit.points ?? 0;
  const comments = hit.num_comments ?? 0;
  let host = 'news.ycombinator.com';

  if (hit.url) {
    try {
      host = new URL(hit.url).hostname.replace(/^www\./, '');
    } catch {
      host = hit.url;
    }
  }

  return `${points} points and ${comments} comments on ${host}.`;
}

function extractObjectId(hnUrl) {
  const m = (hnUrl || '').match(ID_RE);
  return m ? m[1] : null;
}

function loadDedupDb() {
  try {
    const raw = require('fs').readFileSync(DEDUP_PATH, 'utf8');
    const data = JSON.parse(raw);
    return new Set(Array.isArray(data.ids) ? data.ids : []);
  } catch {
    return new Set();
  }
}

function saveDedupDb(idsSet) {
  const sorted = [...idsSet].sort();
  require('fs').writeFileSync(
    DEDUP_PATH,
    JSON.stringify({ ids: sorted }, null, 2) + '\n',
    'utf8',
  );
}

function normalizePost(hit, matchedKeyword) {
  const hnUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`;
  const link = hit.url || hnUrl;

  return {
    title: hit.title || hit.story_title || '(untitled)',
    link,
    hnUrl,
    author: hit.author || 'unknown',
    points: hit.points ?? 0,
    comments: hit.num_comments ?? 0,
    matchedKeyword,
    summary: summarize(hit),
  };
}

function buildMarkdown(direction, posts, fetchedAt, date, apiUrls) {
  const lines = [
    `# HN${direction.name}精选 - ${date}`,
    '',
    `- **抓取时间**：${fetchedAt}`,
    `- **方向**：${direction.name}`,
    `- **关键词**：${direction.keywords.join('；')}`,
    `- **数据来源**：Algolia Hacker News Search API`,
    `- **抓取数量**：${posts.length}`,
    '',
    '## API请求',
    '',
    ...apiUrls.map((url) => `- ${url}`),
    '',
    '## 相关帖子',
    '',
  ];

  posts.forEach((post, index) => {
    lines.push(`### ${index + 1}. ${post.title}`);
    lines.push(`- **链接**：${post.link}`);
    lines.push(`- **HN讨论**：${post.hnUrl}`);
    lines.push(`- **作者**：${post.author}`);
    lines.push(`- **点赞数**：${post.points}`);
    lines.push(`- **评论数**：${post.comments}`);
    lines.push(`- **匹配关键词**：${post.matchedKeyword}`);
    lines.push(`- **摘要**：${post.summary}`);
    lines.push('');
  });

  return lines.join('\n');
}

async function fetchKeyword(keyword) {
  const apiUrl = buildApiUrl(keyword);
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`${keyword} HN API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    apiUrl,
    hits: (data.hits || []).map((hit) => normalizePost(hit, keyword)),
  };
}

async function fetchDirection(direction, date, fetchedAt, dedupSet) {
  const keywordResults = [];
  for (const keyword of direction.keywords) {
    keywordResults.push(await fetchKeyword(keyword));
  }

  // Dedup: skip posts whose objectID is already in the global dedup DB,
  // and also skip duplicates within this single run.
  const seen = new Set();
  const newPosts = [];
  let dupCount = 0;
  for (const result of keywordResults) {
    for (const post of result.hits) {
      const oid = extractObjectId(post.hnUrl);
      if (seen.has(post.hnUrl)) continue;
      seen.add(post.hnUrl);
      if (oid && dedupSet.has(oid)) {
        dupCount++;
        continue;
      }
      newPosts.push(post);
      if (newPosts.length >= HITS_PER_DIRECTION) break;
    }
    if (newPosts.length >= HITS_PER_DIRECTION) break;
  }

  // Register new IDs in the dedup set so subsequent directions in the same run also dedup
  for (const post of newPosts) {
    const oid = extractObjectId(post.hnUrl);
    if (oid) dedupSet.add(oid);
  }

  const apiUrls = keywordResults.map((result) => result.apiUrl);
  const jsonDir = path.join(DATABASE_DIR, direction.jsonFolder);
  const mdDir = path.join(DATABASE_DIR, direction.mdFolder);
  await Promise.all([
    fs.mkdir(jsonDir, { recursive: true }),
    fs.mkdir(mdDir, { recursive: true }),
  ]);

  const jsonPath = path.join(jsonDir, `${direction.filenamePrefix}-${date}.json`);
  const mdPath = path.join(mdDir, `${direction.filenamePrefix}-${date}.md`);

  const payload = {
    fetchedAt,
    direction: direction.name,
    keywords: direction.keywords,
    sources: apiUrls,
    count: newPosts.length,
    posts: newPosts,
  };

  await fs.writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  await fs.writeFile(mdPath, buildMarkdown(direction, newPosts, fetchedAt, date, apiUrls), 'utf8');

  const [jsonStat, mdStat] = await Promise.all([fs.stat(jsonPath), fs.stat(mdPath)]);

  return {
    direction: direction.name,
    count: newPosts.length,
    dupCount,
    jsonPath,
    jsonSize: jsonStat.size,
    mdPath,
    mdSize: mdStat.size,
  };
}

async function main() {
  const started = performance.now();
  const fetchedAt = new Date().toISOString();
  const date = todayString();

  // ── Load global dedup DB ──────────────────────────────────────────────────
  const dedupSet = loadDedupDb();
  console.log(`抓取时间：${fetchedAt}`);
  console.log(`历史去重库：${dedupSet.size} 条已抓取ID（加载自 hn-ids.json）`);

  const results = [];
  for (const direction of DIRECTIONS) {
    const result = await fetchDirection(direction, date, fetchedAt, dedupSet);
    results.push(result);
    const dupInfo = result.dupCount > 0 ? `（跳过重复 ${result.dupCount} 条）` : '';
    console.log(`完成：${result.direction}，新增：${result.count} 条${dupInfo}`);
    console.log(`JSON保存路径：${result.jsonPath}（${result.jsonSize} bytes）`);
    console.log(`MD保存路径：${result.mdPath}（${result.mdSize} bytes）`);
  }

  // ── Persist updated dedup DB ─────────────────────────────────────────────
  saveDedupDb(dedupSet);

  const elapsedSeconds = ((performance.now() - started) / 1000).toFixed(2);
  const totalCount = results.reduce((sum, item) => sum + item.count, 0);
  const totalDup = results.reduce((sum, item) => sum + (item.dupCount || 0), 0);

  console.log('---');
  console.log(`方向数量：${results.length}`);
  console.log(`新增帖子：${totalCount} 条`);
  console.log(`跳过重复：${totalDup} 条`);
  console.log(`去重库总量：${dedupSet.size} 条`);
  console.log(`总耗时：${elapsedSeconds}秒`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
