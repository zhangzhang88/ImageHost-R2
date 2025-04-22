export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const UPLOAD_PATH = env.UPLOAD_PATH || '/upload';
    const LIST_PATH = env.LIST_PATH || '/list';

    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    // ✅ 上传接口（支持多张图片）并添加格式限制
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

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']; // 允许的图片格式
      const urls = [];

      for (const file of files) {
        if (typeof file === "string") continue;

        // 检查文件类型
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

    // 📄 图片列表页面
    if (request.method === 'GET' && url.pathname === LIST_PATH) {
      const list = await env.R2_BUCKET.list({ limit: 1000 });
      const files = list.objects;

      let html = `<html><head><meta charset="UTF-8"><title>图片列表</title></head><body>`;
      html += `<h2>🖼 已上传图片 (${files.length})</h2><ul style="list-style: none; padding: 0;">`;

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

    // 🖼 访问图片
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
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
