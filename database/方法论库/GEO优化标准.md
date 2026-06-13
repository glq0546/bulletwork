# GEO优化标准

**日期**：2026-06-13

## 核心内容

GEO（Generative Engine Optimization）目标是让页面更容易被AI搜索、摘要工具和问答引擎引用。对当前项目来说，GEO必须和SEO一起做：**搜索引擎负责带来用户，AI引用负责建立信任。**

## 一、基础SEO要素清单

每个页面必须包含唯一Title、Meta Description、Canonical标签、Open Graph标签、Twitter Card标签、唯一H1、清晰H2/H3、允许抓取的robots.txt、包含页面的sitemap.xml、真实内链、正确页脚年份和法律页面。

## 二、Schema标签标准

FAQPage JSON-LD适用于文章页和工具页，FAQ必须是真问题，例如 What is APLPRINCES on my credit card statement、Is DRI*AVAST SOFTWARE a scam、Can I dispute a foreign transaction fee、Is BulletWork free to try。

WebApplication JSON-LD适用于BulletWork这类工具页，必须包含 name、description、applicationCategory、offers/price、operatingSystem、url。

Article/WebPage JSON-LD适用于ChargeDecode文章页，必须包含 headline、description、datePublished、dateModified、author/publisher、mainEntityOfPage。

## 三、GEO引用块标准

每篇文章必须有一个能被AI直接摘录的短块。格式：

> Quick answer: [商户代码] usually refers to [真实商户/扣款类型]. It commonly appears when [常见场景]. If you do not recognize it, check [第一步] and contact [第二步].

要求：50–90词；直接回答；包含关键词原文；包含行动建议；不承诺结果。

## 四、ChargeDecode文章GEO模板

```text
Quick answer: [MERCHANT_CODE] on your credit card statement usually refers to [REAL_MERCHANT]. It may appear after [COMMON_REASON_1] or [COMMON_REASON_2]. If you do not recognize the charge, first check your subscriptions and receipts, then contact the merchant or your card issuer. This information is for educational purposes and is not financial advice.
```

## 五、BulletWork页面GEO模板

```text
Quick answer: BulletWork is an AI weekly report generator that turns messy work notes into a structured English weekly report in about 60 seconds. It is designed for developers, remote workers, and solo builders who dislike formatting status updates manually. Users can try it for free before upgrading.
```

## 六、内链标准

每篇内容至少包含2个相关文章链接、1个产品CTA链接、1个返回首页或目录页链接。ChargeDecode必须有A-Z索引，不能只有锚点，必须是真实href链接，方便Google抓取。

## 七、已完成项目标准

BulletWork已完成Title优化、Meta Description、OG/Twitter Card、FAQPage JSON-LD、WebApplication JSON-LD、robots.txt、sitemap.xml、canonical、site.webmanifest。ChargeDecode已完成20篇文章、FAQ Schema、GEO引用块、Related Articles内链、合规声明，并在全站复查后修复GEO缺失、年份错误、AI套话残留。

## 八、上线前检查

用浏览器打开页面；查看源代码确认Schema存在；检查sitemap是否包含URL；检查robots.txt是否声明Sitemap；检查GSC是否可抓取；检查AI引用块是否自然、准确、无夸大。
