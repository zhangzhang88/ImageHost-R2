const config = window.IMG_BED_CONFIG || {};
const apiBaseUrl = config.apiBaseUrl || "http://localhost:8787";
const MAX_FILES = config.maxFiles || 5;

document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('file');
  const files = fileInput.files;

  if (!files.length) return alert("请选择图片");

  if (files.length > MAX_FILES) {
    return alert(`最多只能上传 ${MAX_FILES} 张图片`);
  }

  const formData = new FormData();
  for (const file of files) {
    formData.append("file", file);
  }

  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = "⏳ 上传中...";

  try {
    const res = await fetch(`${apiBaseUrl}/upload`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (res.ok && data.urls && Array.isArray(data.urls)) {
      resultDiv.innerHTML = `<p>✅ 上传成功，共 ${data.urls.length} 张</p>`;
      data.urls.forEach(url => {
        resultDiv.innerHTML += `
          <p><a href="${url}" target="_blank">${url}</a></p>
          <img src="${url}" width="300" />
        `;
      });
    } else {
      resultDiv.innerHTML = `<p>❌ 上传失败：${data.error || '未知错误'}</p>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<p>❌ 上传失败：${error.message}</p>`;
  }
});
