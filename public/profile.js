export async function loadProfilePage(session) {
  const user = session?.user;
  if (!user) return;

  const container = document.getElementById('profile-form-container');
  if (!container) return;

  const { data, error } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('加载用户资料失败', error);
    return;
  }

  const avatarUrl = data?.avatar_url || 'https://api.dicebear.com/7.x/bottts/png?seed=default';

  container.innerHTML = `
    <div class="max-w-xl mx-auto bg-white bg-opacity-40 backdrop-blur p-6 rounded-xl shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">个人资料</h2>

      <!-- 头像上传 -->
      <div class="flex items-center space-x-4 mb-6">
        <img id="avatar-preview" src="${avatarUrl}" 
             alt="头像" class="w-20 h-20 rounded-full border border-gray-300 object-cover">
        <div>
          <input type="file" id="avatar-input" accept="image/*" class="text-sm text-gray-600">
          <p class="text-xs text-gray-500 mt-1">点击上传新头像</p>
        </div>
      </div>

      <!-- 昵称 -->
      <div class="mb-4">
        <label class="block text-gray-700 mb-1">昵称</label>
        <input id="username" type="text" value="${data?.username || ''}" 
               class="w-full px-4 py-2 border rounded-md bg-white bg-opacity-60 focus:outline-none focus:ring focus:border-blue-300">
      </div>

      <!-- 邮箱 -->
      <div class="mb-4">
        <label class="block text-gray-700 mb-1">邮箱（不可更改）</label>
        <input id="email" type="email" value="${user.email}" disabled 
               class="w-full px-4 py-2 bg-gray-100 border rounded-md text-gray-600">
      </div>

      <!-- 按钮区 -->
      <div class="flex justify-between items-center">
        <button id="save-profile" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          保存更改
        </button>
        <button id="change-password" class="text-sm text-blue-600 hover:underline">修改密码</button>
      </div>
    </div>

    <!-- 密码修改模态框 -->
    <div id="password-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
        <h3 class="text-xl font-semibold">修改密码</h3>
        <input type="password" id="new-password" placeholder="新密码（至少6位）"
               class="w-full px-4 py-2 border rounded focus:outline-none focus:ring" />
        <input type="password" id="confirm-password" placeholder="确认新密码"
               class="w-full px-4 py-2 border rounded focus:outline-none focus:ring" />
        <div class="flex justify-end space-x-2">
          <button id="cancel-password" class="text-gray-500 hover:underline">取消</button>
          <button id="confirm-password-btn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">确认修改</button>
        </div>
      </div>
    </div>
  `;

  // 头像上传逻辑
  const avatarInput = document.getElementById('avatar-input');
  avatarInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const timestamp = Date.now();
    const filePath = `${user.id}/avatar/${timestamp}_${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      alert('上传头像失败');
      console.error(uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(uploadData.path);

    document.getElementById('avatar-preview').src = publicUrl;
  });

  // 保存资料
  document.getElementById('save-profile')?.addEventListener('click', async () => {
    const username = document.getElementById('username')?.value.trim();
    const avatar_url = document.getElementById('avatar-preview')?.src;

    if (!username) {
      alert('昵称不能为空');
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username, avatar_url })
      .eq('id', user.id);

    if (updateError) {
      alert('保存失败，请重试。');
      console.error(updateError);
    } else {
      alert('保存成功！');
    }
  });

  // 修改密码按钮点击
  document.getElementById('change-password')?.addEventListener('click', () => {
    document.getElementById('password-modal').classList.remove('hidden');
  });

  // 取消修改密码
  document.getElementById('cancel-password')?.addEventListener('click', () => {
    document.getElementById('password-modal').classList.add('hidden');
  });

  // 确认修改密码
  document.getElementById('confirm-password-btn')?.addEventListener('click', async () => {
    const newPassword = document.getElementById('new-password')?.value;
    const confirmPassword = document.getElementById('confirm-password')?.value;

    if (!newPassword || newPassword.length < 6) {
      alert('密码长度不能少于 6 位');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('两次输入密码不一致');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      alert('密码修改失败');
      console.error(error);
    } else {
      alert('密码修改成功');
      document.getElementById('password-modal').classList.add('hidden');

    

    // 注销当前用户
    await supabase.auth.signOut();

    // 清空页面内容（如有需要）
    const container = document.getElementById('profile-form-container');
    if (container) container.innerHTML = '';

    // 显示登录弹窗
    const authModal = document.getElementById('auth-modal');
    if (authModal) authModal.classList.remove('hidden');
    }
  });
}
