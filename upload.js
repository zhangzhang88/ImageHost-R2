document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('file');
  const files = fileInput.files; // 获取所有选择的文件

  const MAX_FILES = 5;  // 限制最大上传文件数为 5

  if (files.length > MAX_FILES) {
    return alert(`您最多只能上传 ${MAX_FILES} 张图片`);
  }

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
