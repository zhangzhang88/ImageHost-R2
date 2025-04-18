const config = window.IMG_BED_CONFIG || {};
const apiBaseUrl = config.apiBaseUrl || "http://localhost:8787";

// 获取上传表单的事件监听
document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('file');
  const files = fileInput.files; // 获取所有选择的文件

  if (files.length === 0) return alert("请选择图片");

  const formData = new FormData();

  // 添加所有文件到 formData
  for (let i = 0; i < files.length; i++) {
    formData.append("file", files[i]);
  }

  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = "⏳ 上传中...";

  try {
    const res = await fetch(`${apiBaseUrl}/upload`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (res.ok && data.urls) {
      resultDiv.innerHTML = `
        <p>✅ 上传成功</p>
        <p>上传的图片：</p>
        ${data.urls.map(url => `
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
