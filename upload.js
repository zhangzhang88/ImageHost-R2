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
    const res = await fetch("https://api.nbvil.com/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (res.ok && data.url) {
      resultDiv.innerHTML = `
        <p>✅ 上传成功</p>
        <p><a href="${data.url}" target="_blank">${data.url}</a></p>
        <img src="${data.url}" width="300" />
      `;
    } else {
      resultDiv.innerHTML = `<p>❌ 上传失败：${data.error || '未知错误'}</p>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<p>❌ 上传失败：${error.message}</p>`;
  }
});
