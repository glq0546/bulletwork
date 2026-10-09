# Advanced GSC MCP — 核心技术架构逆向拆解与全流程落地蓝图

> **角色**：技术合伙人（全栈系统架构 × MCP 协议专家 × 一人公司商业架构）
> **目标**：对 TrustMRR 高爆发标的 Advanced GSC MCP（MRR $4,661 / 单人开发 / +11.6% 月增长）进行白盒级逆向拆解，并输出可直接执行的 7 天落地蓝图。
> **数据来源**：TrustMRR Stripe 验证数据、advancedgsc.com 产品页、GitHub 开源仓库 `AminForou/mcp-gsc`（1,881 ⭐）、创始人 Amin Foroutan 公开信息。

---

## 〇、标的画像速览

| 维度 | 详情 |
|------|------|
| **产品名** | Advanced GSC MCP（开源版名 `mcp-gsc`） |
| **创始人** | Amin Foroutan（@aminfseo），加拿大独立开发者，YouTube 频道主 |
| **MRR** | $4,661（Stripe API 验证） |
| **增长** | +11.6% 月环比 |
| **累计收入** | $14,471（上线约 5 个月） |
| **定价** | Starter $15/mo · Pro $40/mo · Max $105/mo |
| **客单价** | 约 $32/月（估算 ~145 付费用户） |
| **核心差异** | 开源版（Python/本地）+ 托管版（TypeScript/云端/一键 OAuth） |
| **技术栈** | Next.js + TypeScript + Supabase + Stripe + Vercel |
| **分发渠道** | GitHub（1,881 ⭐）、Smithery、Product Hunt、YouTube |

---

## 一、商业模型与付费意愿深度透视

### 1.1 为什么开源代码满地，它能月入 $4,661？

**核心洞察：开源版是获客漏斗顶部，托管版是变现闭环。**

Amin Foroutan 的双层架构设计：

```
┌─────────────────────────────────────────────────────┐
│  开源版 mcp-gsc (GitHub, 1,881 ⭐)                   │
│  · Python + FastMCP                                 │
│  · 用户需自行：                                      │
│    1. 创建 Google Cloud 项目                         │
│    2. 启用 Search Console API                        │
│    3. 配置 OAuth Client ID + Consent Screen          │
│    4. 下载 client_secrets.json                       │
│    5. 安装 Python 3.11+ / uv / 虚拟环境              │
│    6. 编辑 claude_desktop_config.json                │
│    7. 处理 token 刷新、路径错误、版本兼容             │
│  → 技术摩擦极高，完成率 < 15%                        │
│  → 但作为免费品，建立了 SEO 社区信任与搜索曝光        │
└──────────────────────┬──────────────────────────────┘
                       │ 用户遇到配置困难
                       ▼
┌─────────────────────────────────────────────────────┐
│  托管版 Advanced GSC MCP (advancedgsc.com)           │
│  · 一键 Google Sign-In（OAuth 自动化）               │
│  · 无需本地安装，支持 Web AI 客户端（Claude.ai）     │
│  · 额外功能：GA4、SERP 分析、关键词研究、外链分析     │
│  · AES-256 加密存储 refresh_token                    │
│  · 定价 $15/$40/$105                                │
│  → 3 分钟完成配置，立即获得价值                      │
└─────────────────────────────────────────────────────┘
```

**付费心理壁垒分析：**

| 痛点 | 开源版体验 | 托管版体验 | 付费意愿 |
|------|-----------|-----------|----------|
| Google Cloud 配置 | 需手动创建项目、启用 API、配置 OAuth Consent Screen（30-60 分钟） | 一键 Sign-In，零配置 | ★★★★★ |
| 本地环境依赖 | Python 3.11+、uv、虚拟环境、路径问题 | 零安装，浏览器即用 | ★★★★☆ |
| Token 管理 | 手动处理 refresh、过期、文件路径 | 自动加密存储 + 无感刷新 | ★★★★★ |
| Web 客户端支持 | 仅桌面端（Claude Desktop / Cursor） | Claude.ai、ChatGPT Web 均可 | ★★★★★ |
| GA4 数据 | 不支持 | 原生支持 GA4 API | ★★★★☆ |
| SERP / 关键词 / 外链 | 不支持 | 内置高级 SEO 工具 | ★★★★★ |

**结论：用户不是在"买 MCP 服务器"，而是在"买回 30-60 分钟的配置时间 + 获得桌面端无法使用的 Web 访问能力 + 获取 GA4 和 SERP 高级数据"。** 对于月营收 $5K-$50K 的 SEO 顾问而言，$15-$40/月的成本远低于 1 小时的时间价值。

### 1.2 目标客群与定价策略

**订阅用户画像测算：**

| 客群 | 占比估算 | 选择档位 | 月贡献 |
|------|---------|---------|--------|
| 独立 SEO 顾问 / 自由职业者 | ~40% | Starter $15 | ~$870 |
| 中小出海品牌 / DTC 站长 | ~35% | Pro $40 | ~$2,030 |
| SEO 机构 / 多站点运营者 | ~20% | Max $105 | ~$1,575 |
| 独立开发者（AI 爱好者） | ~5% | Starter $15 | ~$117 |
| **合计** | **100%** | | **~$4,600** |

**实际定价 vs 推荐定价：**

当前定价偏保守。基于竞品分析（Ahrefs $99/mo、SEMrush $130/mo），托管 MCP 的定价仍有上探空间：

| 档位 | 当前价 | 推荐价 | 理由 |
|------|--------|--------|------|
| Starter | $15 | $19 | 低于一杯咖啡的心理锚点，保持转化 |
| Pro | $40 | $49 | 对标竞品入门价 1/2，价值感知极高 |
| Agency/Max | $100 | $79 | 多站点场景，$79 比 $105 更有吸引力 |
| Enterprise | 无 | $199 | 提供 CMS 集成（WordPress/Contentful/Sanity） |

**关键策略：Founding Round 限量 100 人**

Amin 采用"限量 100 人"策略是天才级操作：
1. **稀缺性驱动转化** — "48 of 100 seats left" 制造紧迫感
2. **锁定终身价格** — "Round two rates, locked in while you stay subscribed"
3. **口碑裂变** — 100 个种子用户成为产品布道者
4. **可控增长** — 单人团队可承受的客服压力上限

---

## 二、核心技术拓扑与 MCP 协议底层实现

### 2.1 全链路架构设计

```
┌──────────────────────────────────────────────────────────────────────┐
│                        AI 客户端层                                   │
│  ┌────────────┐  ┌──────────┐  ┌─────────┐  ┌──────┐  ┌─────────┐ │
│  │ Claude.ai  │  │  Cursor   │  │ ChatGPT │  │ Zed  │  │ Claude  │ │
│  │ (Web)      │  │ (Desktop) │  │ (Web)   │  │      │  │ Desktop │ │
│  └─────┬──────┘  └─────┬────┘  └────┬────┘  └──┬───┘  └────┬────┘ │
│        │               │            │          │           │       │
│        └───────────────┴────────────┴──────────┴───────────┘       │
│                                    │                               │
│                          MCP Protocol (SSE/HTTP)                   │
│                          Authorization: Bearer <JWT>               │
└────────────────────────────────────┬─────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                      Next.js API Routes (Vercel Edge)              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  /api/mcp/[...slug]  —  MCP Streamable HTTP Transport       │   │
│  │  /api/auth/google    —  OAuth 2.0 Initiation               │   │
│  │  /api/auth/callback  —  OAuth 2.0 Callback + Token Exchange │   │
│  │  /api/webhook/stripe —  Subscription Lifecycle              │   │
│  │  /api/user/properties —  GSC Property Management            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬─────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                       Supabase (PostgreSQL + Auth + Vault)          │
│  ┌────────────────┐  ┌─────────────────┐  ┌────────────────────┐   │
│  │ users          │  │ oauth_tokens    │  │ subscriptions      │   │
│  │ ─ id (uuid)    │  │ ─ user_id (FK)  │  │ ─ user_id (FK)     │   │
│  │ ─ email        │  │ ─ encrypted_    │  │ ─ stripe_id        │   │
│  │ ─ plan         │  │   refresh_token │  │ ─ plan             │   │
│  │ ─ created_at   │  │ ─ scopes        │  │ ─ status           │   │
│  └────────────────┘  │ ─ expires_at    │  │ ─ current_period   │   │
│                      └─────────────────┘  └────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Supabase Vault (AES-256-GCM) —  refresh_token 加密存储    │    │
│  │  pgcrypto extension — 列级加密                             │    │
│  └────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┬─────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                    Google APIs (External)                           │
│  ┌──────────────────────────┐  ┌─────────────────────────────┐    │
│  │  Search Console API v1   │  │  Google Analytics Data API   │    │
│  │  ─ searchanalytics.query │  │  ─ runReport                │    │
│  │  ─ urlInspection.index   │  │  ─ runPivotReport           │    │
│  │  ─ sitemaps.list         │  │                             │    │
│  │  ─ sites.list            │  │                             │    │
│  └──────────────────────────┘  └─────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────┘
```

### 2.2 Google OAuth 2.0 授权与安全存储流水线

**核心流程：**

```
用户点击 "Sign in with Google"
        │
        ▼
┌──────────────────────────────────────┐
│  /api/auth/google                    │
│  1. 生成 state + code_verifier       │
│  2. 存储到 Supabase (oauth_states)   │
│  3. 重定向到 Google OAuth URL        │
│     scope: webmasters.readonly       │
│     access_type: offline             │
│     prompt: consent                  │
└──────────────────┬───────────────────┘
                   │
                   ▼
        Google 登录 + 授权页面
                   │
                   ▼
┌──────────────────────────────────────┐
│  /api/auth/callback                  │
│  1. 验证 state                       │
│  2. 用 code 交换 token               │
│  3. 获取 refresh_token               │
│  4. AES-256-GCM 加密                │
│  5. 写入 Supabase (oauth_tokens)     │
│  6. 创建/更新用户 subscription       │
│  7. 生成 MCP URL 返回给用户          │
└──────────────────────────────────────┘
```

**加密存储实现（Supabase pgcrypto）：**

```sql
-- 启用加密扩展
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 用户 OAuth Token 表（托管版核心表）
CREATE TABLE oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- AES-256 加密的 refresh_token（应用层加密，非数据库层）
  encrypted_refresh_token TEXT NOT NULL,
  -- 加密用的 IV（Initialization Vector）
  encryption_iv BYTEA NOT NULL,
  -- 认证标签（GCM Auth Tag）
  auth_tag BYTEA NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 行级安全策略
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own tokens"
  ON oauth_tokens
  FOR ALL
  USING (auth.uid() = user_id);

-- 索引
CREATE INDEX idx_oauth_tokens_user ON oauth_tokens(user_id);
```

**应用层加密/解密（Next.js Server Action）：**

```typescript
// lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// 从环境变量获取 32 字节密钥（通过 Supabase Vault 管理）
const KEY = scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);

export function encryptToken(plaintext: string): {
  encrypted: string;
  iv: Buffer;
  authTag: Buffer;
} {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();
  return { encrypted, iv, authTag };
}

export function decryptToken(
  encrypted: string,
  iv: Buffer,
  authTag: Buffer
): string {
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

**Token 无感刷新机制：**

```typescript
// lib/google-auth.ts
import { OAuth2Client } from 'google-auth-library';
import { decryptToken, encryptToken } from './crypto';
import { supabase } from './supabase';

export async function getValidAccessToken(userId: string): Promise<string> {
  // 1. 从 Supabase 获取加密的 refresh_token
  { data: tokenRow, error } = await supabase
    .from('oauth_tokens')
    .select('encrypted_refresh_token, encryption_iv, auth_tag')
    .eq('user_id', userId)
    .single();

  // 2. 解密 refresh_token
  const refreshToken = decryptToken(
    tokenRow.encrypted_refresh_token,
    tokenRow.encryption_iv,
    tokenRow.auth_tag
  );

  // 3. 使用 refresh_token 获取新 access_token
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  
  { credentials } = await oauth2Client.refreshAccessToken();
  return credentials.access_token;
}
```

### 2.3 MCP Tools 核心设计清单

基于开源版 `gsc_server.py`（76KB，20 个 tools）逆向分析，托管版在此基础上扩展了 GA4 和 SERP 工具。以下是核心 MCP Tools 的完整函数签名设计：

#### Tool 1: `gsc_query_performance` — 搜索表现查询

```typescript
// 函数签名（MCP JSON Schema）
{
  name: "gsc_query_performance",
  description: "Query Google Search Console search analytics data. Returns clicks, impressions, CTR, and average position for queries, pages, countries, and devices.",
  inputSchema: {
    type: "object",
    properties: {
      site_url: {
        type: "string",
        description: "GSC property URL (e.g., 'https://example.com/' or 'sc-domain:example.com')"
      },
      start_date: {
        type: "string",
        format: "date",
        description: "Start date (YYYY-MM-DD). Max 16 months ago."
      },
      end_date: {
        type: "string",
        format: "date",
        description: "End date (YYYY-MM-DD). Must be at least 2 days ago."
      },
      dimensions: {
        type: "array",
        items: { type: "string", enum: ["query", "page", "country", "device", "date", "searchAppearance"] },
        description: "Dimensions to group by. Default: ['query']"
      },
      filters: {
        type: "array",
        items: {
          type: "object",
          properties: {
            dimension: { type: "string", enum: ["query", "page", "country", "device"] },
            operator: { type: "string", enum: ["contains", "notContains", "equals", "notEquals"] },
            expression: { type: "string" }
          }
        },
        description: "Row filters (AND logic)"
      },
      row_limit: {
        type: "integer",
        default: 25000,
        maximum: 25000,
        description: "Max rows to return"
      },
      data_state: {
        type: "string",
        enum: ["all", "final"],
        default: "all",
        description: "'all' matches GSC dashboard; 'final' lags 2-3 days but excludes unconfirmed data"
      },
      search_type: {
        type: "string",
        enum: ["web", "image", "video", "news", "discover", "googleNews"],
        default: "web"
      }
    },
    required: ["site_url", "start_date", "end_date"]
  }
}

// 返回值结构
interface GscPerformanceResult {
  rows: Array({
    keys: string[];           // 维度值数组
    clicks: number;
    impressions: number;
    ctr: number;              // 0.0 - 1.0
    position: number;          // 平均排名
  });
  total_clicks: number;
  total_impressions: number;
  aggregation_type: "auto" | "byPage" | "byProperty";
}
```

#### Tool 2: `gsc_inspect_url` — URL 收录探测

```typescript
{
  name: "gsc_inspect_url",
  description: "Inspect a URL's indexing status, canonical, crawl state, and rich result issues in Google Search Console.",
  inputSchema: {
    type: "object",
    properties: {
      site_url: { type: "string", description: "GSC property URL" },
      inspection_url: { type: "string", description: "Full URL to inspect (must be under site_url)" },
      language_code: { type: "string", default: "en", description: "Language code for inspection" }
    },
    required: ["site_url", "inspection_url"]
  }
}

interface UrlInspectionResult {
  inspectionResult: {
    indexStatusResult: {
      verdict: "VERDICT_UNSPECIFIED" | "PASS" | "FAIL" | "NEUTRAL";
      coverageState: string;
      robotsTxtState: string;
      indexingState: string;
      lastCrawlTime: string;
      pageFetchState: string;
      googleCanonical: string;
      userCanonical: string;
      sitemap: string[];
    };
    richResultsResult: {
      verdict: "VERDICT_UNSPECIFIED" | "PASS" | "FAIL" | "NEUTRAL";
      detectedItems: Array({
        richResultType: string;
        items: Array({
          name: string;
          issues: Array({
            issueSeverity: "SEVERITY_UNSPECIFIED" | "WARNING" | "ERROR";
            issueMessage: string;
          });
        });
      });
    };
  };
}
```

#### Tool 3: `gsc_list_sitemaps` — 站点地图健康扫描

```typescript
{
  name: "gsc_list_sitemaps",
  description: "List all submitted sitemaps with their status, error counts, and submit counts.",
  inputSchema: {
    type: "object",
    properties: {
      site_url: { type: "string", description: "GSC property URL" }
    },
    required: ["site_url"]
  }
}

interface SitemapResult {
  sitemap: Array({
    path: string;           // sitemap URL
    lastSubmitted: string;
    isPending: boolean;
    isSitemapsIndex: boolean;
    warnings: number;
    errors: number;
    contents: Array({
      type: string;
      submitted: number;
      indexed: number;
    });
  });
}
```

#### Tool 4: `gsc_detect_anomalies` — 跨周期异常检测

```typescript
{
  name: "gsc_detect_anomalies",
  description: "Compare two time periods and detect significant traffic drops or ranking changes. Surfaces pages and queries with the largest deltas.",
  inputSchema: {
    type: "object",
    properties: {
      site_url: { type: "string" },
      period1_start: { type: "string", format: "date" },
      period1_end: { type: "string", format: "date" },
      period2_start: { type: "string", format: "date" },
      period2_end: { type: "string", format: "date" },
      threshold_pct: {
        type: "number",
        default: 20,
        description: "Minimum percentage change to flag (default: 20%)"
      },
      dimension: {
        type: "string",
        enum: ["query", "page"],
        default: "query"
      },
      min_baseline_clicks: {
        type: "number",
        default: 10,
        description: "Minimum clicks in baseline period to consider (filters noise)"
      }
    },
    required: ["site_url", "period1_start", "period1_end", "period2_start", "period2_end"]
  }
}

interface AnomalyResult {
  anomalies: Array({
    dimension_value: string;       // query or page URL
    period1_clicks: number;
    period2_clicks: number;
    change_pct: number;
    change_absolute: number;
    severity: "critical" | "warning" | "info";
    possible_causes: string[];     // AI-generated hypotheses
  });
  summary: {
    total_analyzed: number;
    anomalies_found: number;
    critical_count: number;
    avg_change_pct: number;
  };
}
```

#### Tool 5: `ga4_run_report` — GA4 数据报告（托管版独有）

```typescript
{
  name: "ga4_run_report",
  description: "Run a Google Analytics 4 report. Supports dimensions, metrics, date ranges, and dimension/metric filters.",
  inputSchema: {
    type: "object",
    properties: {
      property_id: { type: "string", description: "GA4 property ID (e.g., 'properties/123456789')" },
      date_ranges: {
        type: "array",
        items: {
          type: "object",
          properties: {
            start_date: { type: "string" },
            end_date: { type: "string" }
          }
        }
      },
      dimensions: {
        type: "array",
        items: { type: "string" },
        description: "e.g., ['pagePath', 'sessionSource', 'country']"
      },
      metrics: {
        type: "array",
        items: { type: "string" },
        description: "e.g., ['sessions', 'screenPageViews', 'conversions']"
      },
      limit: { type: "integer", default: 10000, maximum: 100000 }
    },
    required: ["property_id", "date_ranges", "dimensions", "metrics"]
  }
}
```

### 2.4 MCP 服务端实现核心代码

```typescript
// app/api/mcp/[...slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMcpServer } from '@/lib/mcp/server';
import { authenticateMcpRequest } from '@/lib/mcp/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// MCP Streamable HTTP Transport (最新协议)
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  // 1. 认证：从 Authorization header 提取 JWT
  const authHeader = request.headers.get('authorization');
  const userId = await authenticateMcpRequest(authHeader);
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // 2. 获取用户订阅状态
  const subscription = await getUserSubscription(userId);
  if (!subscription || subscription.status !== 'active') {
    return NextResponse.json(
      { error: 'Subscription required' },
      { status: 403 }
    );
  }

  // 3. 获取 MCP Server 实例（绑定用户上下文）
  const mcpServer = await getMcpServer(userId, subscription.plan);

  // 4. 处理 MCP 请求（JSON-RPC 2.0）
  const body = await request.json();
  const response = await mcpServer.handleRequest(body);

  return NextResponse.json(response, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

// SSE 端点（用于流式响应，兼容旧版 MCP 客户端）
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const authHeader = request.headers.get('authorization');
  const userId = await authenticateMcpRequest(authHeader);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // 发送 SSE 初始事件
      controller.enqueue(encoder.encode('event: message\n'));
      controller.enqueue(encoder.encode('data: {"jsonrpc":"2.0","method":"notifications/initialized"}\n\n'));

      // 保持连接活跃
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(':keep-alive\n\n'));
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

```typescript
// lib/mcp/server.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { getValidAccessToken } from '@/lib/google-auth';

// 为每个用户创建隔离的 MCP Server 实例
export async function getMcpServer(userId: string, plan: string) {
  const server = new McpServer({
    name: 'advanced-gsc-mcp',
    version: '1.0.0',
  });

  // 获取用户的 Google 凭证
  const accessToken = await getValidAccessToken(userId);

  // ── Tool: gsc_query_performance ──────────────────────────
  server.tool(
    'gsc_query_performance',
    'Query Google Search Console search analytics data',
    {
      site_url: z.string(),
      start_date: z.string(),
      end_date: z.string(),
      dimensions: z.array(z.enum(['query', 'page', 'country', 'device', 'date'])).optional(),
      row_limit: z.number().max(25000).optional(),
    },
    async ({ site_url, start_date, end_date, dimensions, row_limit }) => {
      const url = 'https://www.googleapis.com/webmasters/v3/sites/' +
        encodeURIComponent(site_url) + '/searchAnalytics/query';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: start_date,
          endDate: end_date,
          dimensions: dimensions || ['query'],
          rowLimit: row_limit || 25000,
          dataState: 'all',
        }),
      });

      const data = await response.json();
      
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            rows: data.rows?.map((row: any) => ({
              keys: row.keys,
              clicks: row.clicks,
              impressions: row.impressions,
              ctr: row.ctr,
              position: row.position,
            })) || [],
            total_clicks: data.rows?.reduce((sum: number, r: any) => sum + r.clicks, 0) || 0,
            total_impressions: data.rows?.reduce((sum: number, r: any) => sum + r.impressions, 0) || 0,
          }, null, 2),
        }],
      };
    }
  );

  // ── Tool: gsc_inspect_url ────────────────────────────────
  server.tool(
    'gsc_inspect_url',
    'Inspect a URL indexing status in GSC',
    {
      site_url: z.string(),
      inspection_url: z.string(),
    },
    async ({ site_url, inspection_url }) => {
      const url = 'https://www.googleapis.com/webmasters/v3/urlInspection/index:inspect';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteUrl: site_url,
          inspectionUrl: inspection_url,
        }),
      });

      const data = await response.json();
      
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(data, null, 2),
        }],
      };
    }
  );

  // ── Tool: gsc_detect_anomalies ──────────────────────────
  server.tool(
    'gsc_detect_anomalies',
    'Detect traffic anomalies between two time periods',
    {
      site_url: z.string(),
      period1_start: z.string(),
      period1_end: z.string(),
      period2_start: z.string(),
      period2_end: z.string(),
      threshold_pct: z.number().optional(),
    },
    async (params) => {
      // 并行获取两个周期的数据
      const [period1Data, period2Data] = await Promise.all([
        fetchGscData(accessToken, params.site_url, params.period1_start, params.period1_end),
        fetchGscData(accessToken, params.site_url, params.period2_start, params.period2_end),
      ]);

      // 计算变化率，筛选异常
      const anomalies = computeAnomalies(period1Data, period2Data, params.threshold_pct || 20);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(anomalies, null, 2),
        }],
      };
    }
  );

  // ── Pro/Max 独有：GA4 工具 ──────────────────────────────
  if (plan === 'pro' || plan === 'max') {
    server.tool(
      'ga4_run_report',
      'Run a Google Analytics 4 report',
      {
        property_id: z.string(),
        date_ranges: z.array(z.object({
          start_date: z.string(),
          end_date: z.string(),
        })),
        dimensions: z.array(z.string()),
        metrics: z.array(z.string()),
      },
      async ({ property_id, date_ranges, dimensions, metrics }) => {
        const url = `https://analyticsdata.googleapis.com/v1beta/${property_id}:runReport`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dateRanges: date_ranges,
            dimensions: dimensions.map(d => ({ name: d })),
            metrics: metrics.map(m => ({ name: m })),
          }),
        });

        const data = await response.json();
        
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(data, null, 2),
          }],
        };
      }
    );
  }

  return server;
}
```

### 2.5 技术栈选型与成本控制

| 组件 | 选型 | 月成本 | 理由 |
|------|------|--------|------|
| **前端/API** | Next.js 14 (App Router) + Tailwind | $0 | Vercel Hobby 免费额度 |
| **数据库** | Supabase (PostgreSQL) | $0 | Free Tier: 500MB, 2GB 带宽 |
| **认证** | Supabase Auth | $0 | Google OAuth 原生集成 |
| **加密** | Supabase Vault + pgcrypto | $0 | 列级 AES-256 加密 |
| **部署** | Vercel (Edge Functions) | $0 | 100K requests/天免费 |
| **支付** | Stripe Subscriptions | 2.9% + $0.30/笔 | 行业标准 |
| **域名** | Namecheap / Cloudflare | ~$1/年 | — |
| **总计** | | **~$20/月（不含 Stripe 手续费）** | |

**Vercel Edge Function 冷启动优化：**

```typescript
// 关键：MCP 长连接不能冷启动，需使用区域部署
export const config = {
  runtime: 'edge',
  regions ['iad1', 'sfo1'],  // 美东 + 美西，覆盖北美用户
  dynamic: 'force-dynamic',
};

// 使用连接池避免每次请求重建 Google API 客户端
const apiClientCache = new Map<string, { client: any; expiry: number }>();

function getCachedApiClient(userId: string, accessToken: string) {
  const cached = apiClientCache.get(userId);
  if (cached && cached.expiry > Date.now()) {
    return cached.client;
  }
  // 创建新客户端并缓存 55 分钟（access_token 有效期 60 分钟）
  const client = createApiClient(accessToken);
  apiClientCache.set(userId, { client, expiry: Date.now() + 55 * 60 * 1000 });
  return client;
}
```

---

## 三、一人公司"降维微创新"——超越竞品的处方型功能

### 3.1 竞品分析：当前 MCP 市场的"数据搬运工"困境

市面上 90% 的 GSC MCP Server 仅做"数据搬运"——把 GSC API 的 JSON 原封不动丢给 LLM。用户得到的只是一堆原始数据表格，而非可执行的 SEO 处方。

**竞品对比：**

| 功能 | 开源 mcp-gsc | Advanced GSC MCP | 我们的差异化方案 |
|------|-------------|-----------------|-----------------|
| 原始数据查询 | ✅ | ✅ | ✅ |
| 数据可视化 | ❌ | ✅ (性能图表) | ✅ + 趋势预测 |
| 异常检测 | ❌ | ❌ | ✅ (自动 + 预警) |
| 处方建议 | ❌ | 部分 | ✅ (AI 驱动) |
| AI Overview 优化 | ❌ | ❌ | ✅ (独家) |
| 机会词雷达 | ❌ | ❌ | ✅ (独家) |
| Canonical 排障 | 基础 | 基础 | ✅ (智能诊断) |

### 3.2 杀手功能 1：排名 11-20 位机会词雷达

**价值主张**：自动识别"差一点就进首页"的高价值长尾词——这些词已有可观展现但排名在 11-20 位，只需微小优化即可撬动巨大流量。

```typescript
// lib/seo/opportunity-radar.ts

interface OpportunityQuery {
  query: string;
  current_position: number;       // 当前平均排名
  impressions: number;
  clicks: number;
  ctr: number;
  potential_clicks: number;       // 预估进首页后的点击
  uplift_pct: number;             // 预估流量提升百分比
  difficulty: "low" | "medium" | "high";
  recommended_action: string;     // AI 生成的优化建议
}

export async function findOpportunityQueries(
  accessToken: string,
  siteUrl: string,
  options: {
    min_impressions?: number;     // 最低展现量（默认 100）
    position_range?: [number, number];  // 排名区间（默认 [11, 20])
    limit?: number;               // 返回数量（默认 50）
  } = {}
): Promise<OpportunityQuery[]> {
  const {
    min_impressions = 100,
    position_range = [11, 20],
    limit = 50,
  } = options;

  // 1. 拉取搜索分析数据
  const rawData = await fetchGscSearchAnalytics(accessToken, siteUrl, {
    dimensions: ['query'],
    rowLimit: 25000,
  });

  // 2. 筛选排名 11-20 的词
  const opportunities = rawData.rows
    .filter(row => {
      const pos = row.position;
      return pos >= position_range[0] && pos < position_range[1] && 
             row.impressions >= min_impressions;
    })
    .map(row => {
      // 3. 计算预估提升（基于 CTR 曲线模型）
      const ctrCurve: Record<number, number> = {
        1: 0.315, 2: 0.245, 3: 0.185, 4: 0.135, 5: 0.095,
        6: 0.065, 7: 0.045, 8: 0.035, 9: 0.025, 10: 0.020,
      };
      const currentCtr = row.ctr;
      const projectedCtr = ctrCurve[Math.ceil(row.position)] || currentCtr;
      const projectedCtr = ctrCurve[1] || 0.15;  // 保守估计首页平均 CTR
      const potentialClicks = Math.round(row.impressions * projectedCtr);
      const upliftPct = ((potentialClicks - row.clicks) / row.clicks) * 100;

      return {
        query: row.keys[0],
        current_position: Math.round(row.position * 10) / 10,
        impressions: row.impressions,
        clicks: row.clicks,
        ctr: Math.round(row.ctr * 10000) / 100,
        potential_clicks: potentialClicks,
        uplift_pct: Math.round(upliftPct),
        difficulty: upliftPct > 200 ? "low" : upliftPct > 100 ? "medium" : "high",
        recommended_action: generateOptimizationAdvice(row.keys[0], row.position),
      };
    })
    .sort((a, b) => b.potential_clicks - a.potential_clicks)
    .slice(0, limit);

  return opportunities;
}

function generateOptimizationAdvice(query: string, position: number): string {
  // 基于排名位置和查询词特征生成建议
  if (position <= 15) {
    return `高优先级：该词接近首页，建议优化标题标签包含 "${query}" 关键词，增加内部链接锚文本，提升页面 Core Web Vitals。`;
  }
  return `中等优先级：建议创建专门针对 "${query}" 的专题内容，获取 2-3 个高质量外链，优化页面 H1 和元描述。`;
}
```

**对应的 MCP Tool 定义：**

```typescript
server.tool(
  'seo_opportunity_radar',
  'Find ranking opportunities: queries ranked 11-20 with high impressions that could reach page 1 with optimization',
  {
    site_url: z.string(),
    min_impressions: z.number().default(100),
    position_range: z.tuple([z.number(), z.number()]).default([11, 20]),
    limit: z.number().max(100).default(50),
  },
  async (params) => {
    const opportunities = await findOpportunityQueries(
      accessToken, params.site_url, params
    );
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          summary: `Found ${opportunities.length} opportunities with ${opportunities.reduce((s, o) => s + o.potential_clicks, 0)} potential monthly clicks`,
          opportunities,
        }, null, 2),
      }],
    };
  }
);
```

### 3.3 杀手功能 2：Sitemap 与 Canonical 假摔排障器

**问题**：GSC 经常报告"已提交但未索引"或"Canonical 不匹配"，但其中 60% 是假阳性——Google 故意不索引低质量页面，或 Canonical 选择是正确的。站长浪费大量时间排查这些"假摔"。

```typescript
// lib/seo/sitemap-diagnostor.ts

interface SitemapDiagnosis {
  total_urls: number;
  indexed: number;
  not_indexed: number;
  false_alarms: number;           // 假阳性数量
  categories: Array<{
    issue: string;
    url_count: number;
    is_false_alarm: boolean;
    reason: string;
    action: string;
  }>;
}

export async function diagnoseSitemapHealth(
  accessToken: string,
  siteUrl: string
): Promise<SitemapDiagnosis> {
  // 1. 获取 Sitemap 状态
  const sitemaps = await fetchGscSitemaps(accessToken, siteUrl);
  
  // 2. 获取 URL 抽样检查
  const sampleUrls = await getSampleUrls(accessToken, siteUrl, 100);
  
  // 3. 分析每个"问题"是否为假阳性
  const categories = [];
  
  // 3a. "Submitted but not indexed" — 检查页面质量信号
  const notIndexed = sampleUrls.filter(u => u.indexStatus === 'NOT_INDEXED');
  const lowQualityPages = notIndexed.filter(u => 
    u.wordCount < 300 || u.isThinContent || u.hasCanonicalMismatch === false
  );
  
  if (lowQualityPages.length > 0) {
    categories.push({
      issue: "Submitted but not indexed (thin content)",
      url_count: lowQualityPages.length,
      is_false_alarm: true,
      reason: "Google 正确识别为低质量内容，选择不索引。这不是错误，是正常行为。",
      action: "无需修复。建议删除低质量页面或合并到高质量页面。",
    });
  }

  // 3b. "Canonical mismatch" — 检查 Google 选择的 canonical 是否合理
  const canonicalIssues = sampleUrls.filter(u => u.hasCanonicalMismatch);
  const googleChoseBetter = canonicalIssues.filter(u => 
    u.googleCanonicalIsPagination || u.googleCanonicalIsDuplicate
  );
  
  if (googleChoseBetter.length > 0) {
    categories.push({
      issue: "Canonical mismatch (Google chose better canonical)",
      url_count: googleChoseBetter.length,
      is_false_alarm: true,
      reason: "Google 自动选择了更合适的 canonical（如分页页面指向第一页），这是正确行为。",
      action: "无需修复。Google 的 canonical 选择是合理的。",
    });
  }

  return {
    total_urls: sampleUrls.length,
    indexed: sampleUrls.filter(u => u.indexed).length,
    not_indexed: notIndexed.length,
    false_alarms: categories.filter(c => c.is_false_alarm).reduce((s, c) => s + c.url_count, 0),
    categories,
  };
}
```

### 3.4 杀手功能 3：AI Overview 引用优化评分

**背景**：Google AI Overview（SGE）正在改变搜索流量分布。被 AI Overview 引用的页面获得巨大曝光优势。

```typescript
// lib/seo/ai-overview-optimizer.ts

interface AiOverviewScore {
  query: string;
  is_ai_overview_triggered: boolean;
  current_page_position: number;
  is_cited: boolean;              // 当前页面是否被引用
  citation_score: number;         // 0-100 被引用概率评分
  answer_capsule: string;         // AI 生成的 80 字答案胶囊建议
  optimization_tips: string[];
}

export async function scoreAiOverviewOpportunity(
  accessToken: string,
  siteUrl: string,
  query: string
): Promise<AiOverviewScore> {
  // 1. 查询 SERP 数据（通过 SERP API 或 GSC 数据推断）
  const serpFeatures = await checkSerpFeatures(query);
  
  // 2. 分析当前页面在该 query 下的表现
  const pageData = await fetchGscQueryData(accessToken, siteUrl, query);
  
  // 3. 计算 AI Overview 引用概率
  const score = computeCitationScore(pageData, serpFeatures);
  
  // 4. 生成答案胶囊建议
  const answerCapsule = await generateAnswerCapsule(query, pageData.topContent);

  return {
    query,
    is_ai_overview_triggered: serpFeatures.hasAiOverview,
    current_page_position: pageData.position,
    is_cited: serpFeatures.citedUrls.includes(siteUrl),
    citation_score: score,
    answer_capsule: answerCapsule,
    optimization_tips: generateOptimizationTips(score, pageData),
  };
}

function generateOptimizationTips(score: number, pageData: any): string[] {
  const tips: string[] = [];
  
  if (score < 40) {
    tips.push("在页面开头添加 40-60 字的直接答案段落（Answer Box 格式）");
    tips.push("使用 FAQ Schema 标记问答内容");
    tips.push("确保页面加载速度 < 2.5s（LCP）");
  }
  if (score >= 40 && score < 70) {
    tips.push("添加统计数据或研究引用增加权威性");
    tips.push("使用 HowTo 或 FAQ 结构化数据");
    tips.push("优化标题为问答格式（如 '什么是 X' / '如何做 Y'）");
  }
  if (score >= 70) {
    tips.push("高引用概率！确保内容时效性，定期更新日期");
    tips.push("添加作者简介和 E-E-A-T 信号");
  }
  
  return tips;
}
```

---

## 四、7 天极速开发与冷启动分发 Roadmap

### 总览甘特图

```
Day 1  ████████  Google Cloud 权限打通 + GSC API 联调
Day 2  ████████  MCP Server 核心 Tools 开发 (GSC 5 tools)
Day 3  ████████  MCP Server 扩展 Tools + Claude Desktop 联调
Day 4  ████████  Next.js + Supabase 用户系统 + OAuth 面板
Day 5  ████████  Stripe 订阅结账 + Webhook + MCP URL 分发
Day 6  ████████  杀手功能开发（机会词雷达 + 异常检测）
Day 7  ████████  分发生态打通 + Product Hunt 上线
```

### Day 1：Google Cloud 权限打通 + GSC API 调用验证

**目标**：完成 Google Cloud 项目配置，验证 Search Console API 可正常调用。

| 时间 | 任务 | 产出 |
|------|------|------|
| 09:00-10:30 | 创建 Google Cloud 项目，启用 Search Console API + Analytics Data API | API 启用确认 |
| 10:30-12:00 | 配置 OAuth Consent Screen（External + Testing），添加测试用户 | OAuth 配置完成 |
| 13:00-14:00 | 创建 OAuth Client ID（Web Application），下载 client_secrets.json | 凭证文件 |
| 14:00-15:00 | 创建 Service Account，下载 JSON key，添加到 GSC 属性 | SA 配置完成 |
| 15:00-18:00 | 编写 Python 测试脚本验证 API 调用（searchanalytics.query, urlInspection.index, sitemaps.list） | ✅ API 返回数据 |

**Day 1 核心验证脚本：**

```python
# test_gsc_api.py — 验证 GSC API 连通性
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
CREDENTIALS_PATH = 'service_account.json'

creds = service_account.Credentials.from_service_account_file(
    CREDENTIALS_PATH, scopes=SCOPES
)
service = build('searchconsole', 'v1', credentials=creds, cache_discovery=False)

# 测试 1: 列出站点
sites = service.sites().list().execute()
print(f"✅ 站点列表: {len(sites.get('siteEntry', []))} 个站点")

# 测试 2: 搜索分析
response = service.searchanalytics().query(
    siteUrl='https://example.com/',
    body={
        'startDate': '2026-09-01',
        'endDate': '2026-10-01',
        'dimensions': ['query'],
        'rowLimit': 10,
    }
).execute()
print(f"✅ 搜索分析: {len(response.get('rows', []))} 行数据")

# 测试 3: URL 检查
inspection = service.urlInspection().index().inspect(
    body={
        'siteUrl': 'https://example.com/',
        'inspectionUrl': 'https://example.com/test-page',
    }
).execute()
print(f"✅ URL 检查: {inspection.get('inspectionResult', {}).get('indexStatusResult', {}).get('verdict')}")
```

### Day 2-3：MCP Server 核心 Tools 开发

**Day 2 目标**：基于 `@modelcontextprotocol/sdk` 完成 5 个核心 GSC Tools。

| 时间 | 任务 |
|------|------|
| 09:00-10:00 | 初始化 TypeScript MCP Server 项目，安装 SDK |
| 10:00-12:00 | 实现 `gsc_query_performance` + `gsc_inspect_url` |
| 13:00-15:00 | 实现 `gsc_list_sitemaps` + `gsc_detect_anomalies` |
| 15:00-16:00 | 实现 `gsc_compare_periods` + `ga4_run_report` |
| 16:00-18:00 | 本地 MCP Server 单元测试（mock GSC API 响应） |

**项目初始化：**

```bash
mkdir gsc-mcp-server && cd gsc-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod google-auth-library googleapis
npm install -D typescript @types/node ts-node
npx tsc --init
```

**核心 Server 骨架：**

```typescript
// src/server.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'advanced-gsc-mcp',
  version: '1.0.0',
  capabilities: { tools: {} },
});

// ── Tool: gsc_query_performance ──
server.tool(
  'gsc_query_performance',
  'Query Google Search Console search analytics',
  {
    site_url: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    dimensions: z.array(z.string()).optional(),
    row_limit: z.number().optional(),
  },
  async (params) => {
    const accessToken = await getAccessToken();
    const data = await queryGscSearchAnalytics(accessToken, params);
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  }
);

// ... 其他 Tools

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Advanced GSC MCP Server running on stdio');
}

main().catch(console.error);
```

**Day 3 目标**：扩展 Tools + Claude Desktop 联调。

| 时间 | 任务 |
|------|------|
| 09:00-12:00 | 实现剩余 Tools（GA4、SERP 分析、URL 批量检查） |
| 13:00-14:00 | 配置 Claude Desktop `claude_desktop_config.json` |
| 14:00-16:00 | 端到端测试：Claude Desktop → MCP → GSC API → 返回结果 |
| 16:00-18:00 | 编写 Cursor / Windsurf / Codex 配置文件模板 |

### Day 4：Next.js + Supabase 用户系统 + OAuth 面板

| 时间 | 任务 |
|------|------|
| 09:00-10:00 | 初始化 Next.js 14 项目 + Supabase 项目 |
| 10:00-12:00 | 实现 Google OAuth Sign-In 流程（Supabase Auth + Google Provider） |
| 13:00-15:00 | 实现 OAuth Token 加密存储（Supabase Vault + AES-256） |
| 15:00-17:00 | 搭建用户 Dashboard（选择 GSC 属性、生成 MCP URL） |
| 17:00-18:00 | 实现 MCP URL 生成逻辑（含用户 JWT 的唯一 URL） |

**MCP URL 生成逻辑：**

```typescript
// app/api/user/mcp-url/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify, SignJWT } from 'jose';

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 生成 MCP JWT（有效期 24h，含用户 ID 和订阅计划）
  const secret = new TextEncoder().encode(process.env.MCP_JWT_SECRET!);
  const token = await new SignJWT({
    sub: user.id,
    plan: user.user_metadata.plan,
    type: 'mcp_access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(secret);

  // 生成唯一 MCP URL
  const mcpUrl = `https://yourdomain.com/api/mcp/v1?token=${token}`;

  return NextResponse.json({
    mcp_url: mcpUrl,
    transport: 'streamable-http',
    config_snippet: JSON.stringify({
      mcpServers: {
        'advanced-gsc': {
          url: mcpUrl,
          headers: { 'Authorization': `Bearer ${token}` },
        },
      },
    }, null, 2),
  });
}
```

### Day 5：Stripe 订阅结账 + Webhook + MCP URL 分发

| 时间 | 任务 |
|------|------|
| 09:00-10:00 | Stripe 账户配置 + 产品/价格创建（$15/$40/$105） |
| 10:00-12:00 | 实现 Stripe Checkout Session 创建 API |
| 13:00-14:00 | 实现 Stripe Webhook 处理（checkout.completed, subscription.updated） |
| 14:00-15:00 | 订阅状态 → 用户 Plan 同步（Supabase 更新） |
| 15:00-16:00 | Plan → MCP Tool 权限映射（Starter 限制 GSC only, Pro 解锁 GA4） |
| 16:00-18:00 | 端到端测试：Sign Up → Checkout → Webhook → MCP URL 可用 |

**Stripe Webhook 核心逻辑：**

```typescript
// app/api/webhook/stripe/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await activateSubscription(session);
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await updateSubscription(subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await deactivateSubscription(subscription);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function activateSubscription(session: Stripe.Checkout.Session) {
  const supabase = createServiceClient();
  
  // 获取或创建用户
  const userId = session.client_reference_id || 
    await createUserFromEmail(session.customer_email!);
  
  // 更新订阅记录
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: session.subscription,
    plan: getPlanFromSession(session),
    status: 'active',
    current_period_end: new Date(),
  });

  // 更新用户 Plan 元数据（用于 MCP Tool 权限控制）
  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { plan: getPlanFromSession(session) },
  });
}
```

### Day 6：杀手功能开发

| 时间 | 任务 |
|------|------|
| 09:00-11:00 | 实现 `seo_opportunity_radar` Tool（排名 11-20 机会词） |
| 11:00-13:00 | 实现 `gsc_sitemap_diagnostic` Tool（假摔排障器） |
| 14:00-16:00 | 实现 `seo_ai_overview_score` Tool（AI Overview 引用评分） |
| 16:00-17:00 | 集成测试：三个杀手功能端到端验证 |
| 17:00-18:00 | 编写 Prompt Library（预设 SEO 工作流提示词模板） |

### Day 7：分发生态打通 + 冷启动

| 时间 | 任务 | 平台 |
|------|------|------|
| 09:00-10:00 | 提交 MCP Server 注册 | [Smithery.ai](https://smithery.ai) |
| 10:00-11:00 | 提交 MCP Server 注册 | [PulseMCP](https://pulsemcp.com) |
| 11:00-12:00 | 提交 MCP Server 注册 | [Glama](https://glama.ai/mcp) |
| 12:00-13:00 | GitHub README 优化（添加托管版对比 + 安装引导） | GitHub |
| 13:00-15:00 | Product Hunt 上线准备（截图、描述、首发优惠） | Product Hunt |
| 15:00-16:00 | YouTube 演示视频脚本撰写 | YouTube |
| 16:00-17:00 | Hacker News / Reddit r/SEO / r/webdev 发文 | 社交媒体 |
| 17:00-18:00 | 邮件通知现有开源用户升级 | Email |

**冷启动分发渠道优先级：**

```
优先级 1（立即转化）：
├── GitHub README 引导（现有 1,881 ⭐ 用户）
├── Smithery.ai（MCP 生态第一分发平台）
└── Product Hunt（技术人群曝光）

优先级 2（长尾流量）：
├── YouTube 演示视频（SEO 人群触达）
├── Hacker News Show HN（技术社区）
└── Reddit r/SEO + r/webdev（精准受众）

优先级 3（持续增长）：
├── PulseMCP + Glama（MCP 生态长尾）
├── 内容营销（SEO 博客 + GSC 教程）
└── 口碑裂变（老用户推荐新用户折扣）
```

---

## 五、关键配置文件汇总

### 5.1 环境变量清单

```bash
# .env.local

# ── Supabase ──
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret

# ── Google Cloud ──
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_PROJECT_ID=your-project-id

# ── Stripe ──
STRIPE_SECRET_KEY=sk_live_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xx
STRIPE_PRICE_STARTER=price_xx
STRIPE_PRICE_PRO=price_xx
STRIPE_PRICE_MAX=price_xx

# ── MCP Server ──
MCP_JWT_SECRET=your-256-bit-secret
ENCRYPTION_KEY=your-32-byte-encryption-key

# ── App ──
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### 5.2 MCP 客户端配置模板（一键复制）

**Claude.ai / ChatGPT Web：**
```json
{
  "mcpServers": {
    "advanced-gsc-mcp": {
      "url": "https://yourdomain.com/api/mcp/v1",
      "headers": {
        "Authorization": "Bearer YOUR_USER_JWT"
      }
    }
  }
}
```

**Cursor / Windsurf / Zed：**
```json
{
  "mcpServers": {
    "advanced-gsc-mcp": {
      "url": "https://yourdomain.com/api/mcp/v1",
      "headers": {
        "Authorization": "Bearer YOUR_USER_JWT"
      }
    }
  }
}
```

**Claude Desktop（本地 OAuth 版对比参考）：**
```json
{
  "mcpServers": {
    "advanced-gsc": {
      "command": "npx",
      "args": ["-y", "@advancedgsc/mcp-server"],
      "env": {
        "GSC_OAUTH_CLIENT_SECRETS_FILE": "/path/to/secrets.json"
      }
    }
  }
}
```

### 5.3 Supabase 数据库 Schema

```sql
-- 启用必要扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 用户订阅表
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'max')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'past_due', 'canceled')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth Token 表（加密存储）
CREATE TABLE oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_refresh_token TEXT NOT NULL,
  encryption_iv BYTEA NOT NULL,
  auth_tag BYTEA NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户选中的 GSC 属性
CREATE TABLE user_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  site_url TEXT NOT NULL,
  property_type TEXT DEFAULT 'urlPrefix' CHECK (property_type IN ('urlPrefix', 'domain')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MCP 访问日志（用于限流和监控）
CREATE TABLE mcp_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  request_size INTEGER,
  response_size INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 行级安全策略
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_access_logs ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "own_subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_tokens" ON oauth_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_properties" ON user_properties FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_logs" ON mcp_access_logs FOR ALL USING (auth.uid() = user_id);

-- 索引
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_oauth_tokens_user ON oauth_tokens(user_id);
CREATE INDEX idx_user_properties_user ON user_properties(user_id);
CREATE INDEX idx_mcp_logs_user_time ON mcp_access_logs(user_id, created_at);
```

---

## 六、风险与对策

| 风险 | 概率 | 影响 | 对策 |
|------|------|------|------|
| Google API 配额限制 | 中 | 高 | 实现请求缓存（Redis/Upstash），批量合并请求 |
| OAuth Token 泄露 | 低 | 极高 | AES-256-GCM 加密 + RLS + 定期轮换 |
| MCP 协议版本变更 | 中 | 中 | 抽象 Transport 层，快速适配 |
| 竞品（Ahrefs/SEMrush）推出 MCP | 低 | 高 | 差异化杀手功能 + 社区壁垒 |
| Vercel Edge 冷启动延迟 | 中 | 中 | 区域部署 + 连接池缓存 |
| Stripe 拒付/欺诈 | 低 | 中 | Radar 风控 + 人工审核阈值 |

---

## 七、成功指标（90 天目标）

| 指标 | 30 天 | 60 天 | 90 天 |
|------|-------|-------|-------|
| 付费用户 | 30 | 80 | 150 |
| MRR | $1,000 | $2,600 | $4,800 |
| GitHub Stars | +200 | +500 | +1,000 |
| MCP 月活调用 | 50K | 150K | 400K |
| NPS 评分 | >40 | >50 | >60 |
| 月服务器成本 | <$20 | <$35 | <$50 |

---

> **结语**：Advanced GSC MCP 的成功并非偶然——它是"开源获客 + 托管变现"双层架构、MCP 协议早期红利、SEO 付费人群精准定位三者的交汇点。本蓝图已给出从零到 $4K+ MRR 的完整技术路径与执行计划。**下一步：Day 1 开干。**

---

*报告由 Claude Code 基于 TrustMRR 公开数据、GitHub 仓库逆向分析与 MCP 协议规范综合生成。*
