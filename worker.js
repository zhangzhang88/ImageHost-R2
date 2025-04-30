export default {
  async fetch(request, env) {
    // 配置对象
    const config = {
      apiBaseUrl: env.API_BASE_URL,
      supabaseUrl: env.SUPABASE_URL,
      supabaseAnonKey: env.SUPABASE_ANON_KEY,
      maxFiles: env.MAX_FILES,
      imageListPath: env.LIST_PATH || '/list',  // 添加图片列表路径
    };

    // 定义允许的来源（可以根据实际需求修改）
    const allowedOrigins = [
      'https://myimgbed.pages.dev',  // Cloudflare Pages 正式地址
      'https://username.github.io',  // GitHub Pages 地址
      'http://localhost:8787'        // 本地开发调试
    ];

    // 获取请求的 Origin
    const origin = request.headers.get('Origin') || '';
    const referer = request.headers.get('Referer') || '';

    // 检查是否来自允许的来源
    const isAllowedOrigin = allowedOrigins.some(site =>
      origin.startsWith(site) || referer.startsWith(site)
    );

    // 如果不符合允许的来源，则返回 403 错误
    if (!isAllowedOrigin) {
      return new Response('Forbidden', { status: 403 });
    }

    // 假设是 GET 请求时返回配置
    if (request.method === 'GET' && new URL(request.url).pathname === '/config') {
      return new Response(JSON.stringify(config), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(), // 必须加这个
        },
      });
    }

    // 处理其他 API 路径...
    const url = new URL(request.url);
    const UPLOAD_PATH = env.UPLOAD_PATH || '/upload';
    const LIST_PATH = env.LIST_PATH || '/list';

    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    // 上传操作
    if (request.method === 'POST' && url.pathname === UPLOAD_PATH) {
      const formData = await request.formData();
      const files = formData.getAll("file");

      if (!files.length) {
        return new Response(JSON.stringify({ error: "No files received" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders()
          }
        });
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const urls = [];

      for (const file of files) {
        if (typeof file === "string") continue;

        if (!allowedTypes.includes(file.type)) {
          return new Response(JSON.stringify({ error: "Invalid file type. Only images are allowed." }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders()
            }
          });
        }

        const ext = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${ext}`;

        await env.R2_BUCKET.put(fileName, file.stream(), {
          httpMetadata: {
            contentType: file.type
          }
        });

        urls.push(`${url.origin}/${fileName}`);
      }

      return new Response(JSON.stringify({ urls }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders()
        }
      });
    }

    // 图片列表页面
    if (request.method === 'GET' && url.pathname === LIST_PATH) {
      const list = await env.R2_BUCKET.list({ limit: 1000 });
      const files = list.objects;

      let html = `<html><head><meta charset="UTF-8"><title>图片列表</title></head><body>`;
      html += `<h2>🖼 已上传图片 (${files.length})</h2><ul style="list-style: none; padding: 0;">`;

      files.sort((a, b) => b.created - a.created); // 按照创建时间倒序排序

      for (const obj of files) {
        const fileUrl = `${url.origin}/${obj.key}`;
        html += `
          <li style="margin-bottom: 20px;">
            <p><a href="${fileUrl}" target="_blank">${obj.key}</a></p>
            <img src="${fileUrl}" style="max-width: 300px; border: 1px solid #ddd;" />
          </li>
        `;
      }

      html += `</ul></body></html>`;

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          ...corsHeaders()
        }
      });
    }

    // 访问图片
    if (request.method === 'GET') {
      const key = url.pathname.slice(1);
      if (!key) return new Response("Missing file key", { status: 400 });

      const object = await env.R2_BUCKET.get(key);
      if (!object) return new Response("File not found", { status: 404 });

      return new Response(object.body, {
        headers: {
          "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000",
          ...corsHeaders()
        }
      });
    }

    return new Response("Method Not Allowed", { status: 405 });
  }
};

// CORS 跨域头
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization" // 允许 Authorization 头部
  };
}
