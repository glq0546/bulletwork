// worker.js - Service Worker format
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://glq-api.asia",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }

  // Root endpoint — service info
  if (url.pathname === "/" || url.pathname === "") {
    return new Response(JSON.stringify({
      status: "ok",
      service: "bulletwork-proxy (twilight-morning-f9f0)",
      routes: ["/longcat/* → api.longcat.chat", "/deepseek/* → api.deepseek.com"],
      timestamp: new Date().toISOString()
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://glq-api.asia"
      }
    });
  }

  // LongCat API proxy
  if (url.pathname.startsWith("/longcat")) {
    const targetPath = url.pathname.replace(/^\/longcat/, "");
    const targetUrl = `https://api.longcat.chat${targetPath}${url.search}`;

    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: new Headers({
        "Host": "api.longcat.chat",
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_LONGCAT_API_KEY_HERE"
      }),
      body: request.body,
      redirect: "follow"
    });

    let response;
    try {
      response = await fetch(proxyRequest);
    } catch (err) {
      return new Response(JSON.stringify({
        error: "proxy_fetch_failed",
        message: err.message,
        targetUrl
      }), {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://glq-api.asia"
        }
      });
    }

    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "https://glq-api.asia");
    newHeaders.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }

  // DeepSeek API proxy
  if (url.pathname.startsWith("/deepseek")) {
    const targetPath = url.pathname.replace(/^\/deepseek/, "");
    const targetUrl = `https://api.deepseek.com${targetPath}${url.search}`;

    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: new Headers({
        "Host": "api.deepseek.com",
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_DEEPSEEK_API_KEY_HERE"
      }),
      body: request.body,
      redirect: "follow"
    });

    let response;
    try {
      response = await fetch(proxyRequest);
    } catch (err) {
      return new Response(JSON.stringify({
        error: "proxy_fetch_failed",
        message: err.message,
        targetUrl
      }), {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://glq-api.asia"
        }
      });
    }

    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "https://glq-api.asia");
    newHeaders.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }

  // 404 for unknown routes
  return new Response(JSON.stringify({
    error: "not_found",
    message: `No route for ${url.pathname}`,
    routes: ["/", "/longcat/*", "/deepseek/*"]
  }), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://glq-api.asia"
    }
  });
}
