const config = window.IMG_BED_CONFIG || {};
const apiBaseUrl = config.apiBaseUrl || "http://localhost:8787";

document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('file');
  const file = fileInput.files[0];

  if (!file) return alert("请选择图片");

  const formData = new FormData();
  formData.append("file", file);

  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = "⏳ 上传中...";

  try {
    const res = await fetch(`${apiBaseUrl}/upload`, {
      method: "POST",
      body: formData,
    });

    let data = {};
    try {
      data = await res.json();
    } catch (jsonError) {
      return resultDiv.innerHTML = `<p>❌ 上传失败：响应格式不合法（非 JSON）</p>`;
    }

    const urls = data.urls || (data.url ? [data.url] : null);

    if (res.ok && urls) {
      resultDiv.innerHTML = `
        <p>✅ 上传成功</p>
        ${urls.map(url => `
          <p><a href="${url}" target="_blank">${url}</a></p>
          <img src="${url}" width="300" />
        `).join('')}
      `;
    } else {
      resultDiv.innerHTML = `<p>❌ 上传失败：${data.error || '未知错误'}</p>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<p>❌ 上传失败：${error.message}</p>`;
  }
});

