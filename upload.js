const config = window.IMG_BED_CONFIG || {};
const apiBaseUrl = config.apiBaseUrl || "http://localhost:8787";
const MAX_FILES = config.maxFiles || 5; // 默认最多上传 5 张

document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('file');
  const files = fileInput.files;

  if (!files.length) return alert("请选择图片");

  if (files.length > MAX_FILES) {
    return alert(`最多只能上传 ${MAX_FILES} 张图片`);
  }

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("file", files[i]);
  }

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
      return resultDiv.innerHTML = `<p>❌ 上传失败：响应格式错误</p>`;
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


