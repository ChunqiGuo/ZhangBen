const API_BASE_URL = '/api';

const AdminApp = {
    token: null,
    users: [],
    selectedUser: null,
    selectedNotebook: null,

    init() {
        this.token = localStorage.getItem('zhangben_token');
        this.bindEvents();
        
        if (this.token) {
            // 检查是否是管理员
            this.checkAdminAndShow();
        } else {
            this.showLoginPage();
        }
    },

    bindEvents() {
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
    },

    async login() {
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;

        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '登录失败');
            }

            this.token = data.token;
            localStorage.setItem('zhangben_token', this.token);
            
            await this.checkAdminAndShow();
        } catch (error) {
            console.error('登录失败:', error);
            alert('登录失败: ' + error.message);
        }
    },

    async checkAdminAndShow() {
        try {
            // 尝试请求管理员接口验证权限
            await this.request('/admin/users');
            this.showAdminPage();
            this.loadUsers();
        } catch (error) {
            // 如果不是管理员，显示登录页面
            localStorage.removeItem('zhangben_token');
            this.token = null;
            alert('需要管理员权限才能访问后台管理系统');
            this.showLoginPage();
        }
    },

    showLoginPage() {
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('adminPage').classList.remove('active');
    },

    showAdminPage() {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('adminPage').classList.add('active');
    },

    async request(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
            ...options.headers
        };

        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 403) {
                alert('需要管理员权限！');
            }
            throw new Error(data.error || '请求失败');
        }

        return data;
    },

    async loadUsers() {
        try {
            this.users = await this.request('/admin/users');
            this.renderUserList();
        } catch (error) {
            console.error('加载用户失败:', error);
            alert('加载用户失败: ' + error.message);
        }
    },

    renderUserList() {
        const container = document.getElementById('userList');
        if (this.users.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无用户</div>';
            return;
        }

        container.innerHTML = this.users.map(user => `
            <div class="user-item ${this.selectedUser && this.selectedUser.id === user.id ? 'active' : ''}" 
                 onclick="AdminApp.selectUser(${user.id})">
                <div class="username">${user.username}</div>
                <div class="stats">
                    📒 ${user.notebookCount} 个账本 | 📝 ${user.recordCount} 条记录
                </div>
            </div>
        `).join('');
    },

    async selectUser(userId) {
        this.selectedUser = this.users.find(u => u.id === userId);
        this.selectedNotebook = null;
        this.renderUserList();
        await this.renderUserDetail();
    },

    async renderUserDetail() {
        const emptyState = document.getElementById('emptyState');
        const userDetail = document.getElementById('userDetail');
        
        if (!this.selectedUser) {
            emptyState.style.display = 'block';
            userDetail.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        userDetail.style.display = 'block';

        const userInfo = document.getElementById('userInfo');
        userInfo.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <label>用户名</label>
                    <div class="value">${this.selectedUser.username}</div>
                </div>
                <div class="info-item">
                    <label>公司名称</label>
                    <div class="value">${this.selectedUser.company_name || '-'}</div>
                </div>
                <div class="info-item">
                    <label>联系电话</label>
                    <div class="value">${this.selectedUser.company_phone || '-'}</div>
                </div>
                <div class="info-item">
                    <label>地址</label>
                    <div class="value">${this.selectedUser.company_address || '-'}</div>
                </div>
                <div class="info-item">
                    <label>微信号</label>
                    <div class="value">${this.selectedUser.company_wechat || '-'}</div>
                </div>
                <div class="info-item">
                    <label>注册时间</label>
                    <div class="value">${this.selectedUser.created_at}</div>
                </div>
                <div class="info-item">
                    <label>账本数量</label>
                    <div class="value">${this.selectedUser.notebookCount}</div>
                </div>
                <div class="info-item">
                    <label>记录数量</label>
                    <div class="value">${this.selectedUser.recordCount}</div>
                </div>
            </div>
        `;

        const userActions = document.getElementById('userActions');
        userActions.innerHTML = `
            <button class="btn btn-secondary" onclick="AdminApp.showEditUserModal()">✏️ 修改信息</button>
            <button class="btn btn-warning" onclick="AdminApp.showChangePasswordModal()">🔐 修改密码</button>
            <button class="btn btn-primary" onclick="AdminApp.exportUserData()">📤 导出数据</button>
            <button class="btn btn-danger" onclick="AdminApp.showDeleteUserModal()">🗑️ 删除用户</button>
        `;

        await this.loadUserNotebooks();
        this.switchTab('notebooks');
    },

    async loadUserNotebooks() {
        try {
            const notebooks = await this.request(`/admin/users/${this.selectedUser.id}/notebooks`);
            this.renderNotebookList(notebooks);
        } catch (error) {
            console.error('加载账本失败:', error);
            alert('加载账本失败: ' + error.message);
        }
    },

    renderNotebookList(notebooks) {
        const container = document.getElementById('notebookList');
        if (notebooks.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无账本</div>';
            return;
        }

        container.innerHTML = notebooks.map(notebook => `
            <div class="notebook-item ${this.selectedNotebook && this.selectedNotebook.id === notebook.id ? 'active' : ''}"
                 onclick="AdminApp.selectNotebook(${notebook.id})">
                <div class="notebook-header">
                    <span class="notebook-name">${notebook.name}</span>
                    <span class="notebook-stats">📝 ${notebook.recordCount} 条记录</span>
                </div>
            </div>
        `).join('');
    },

    async selectNotebook(notebookId) {
        try {
            const notebooks = await this.request(`/admin/users/${this.selectedUser.id}/notebooks`);
            this.selectedNotebook = notebooks.find(n => n.id === notebookId);
            this.renderNotebookList(notebooks);
            await this.loadNotebookRecords();
        } catch (error) {
            console.error('加载账本记录失败:', error);
            alert('加载账本记录失败: ' + error.message);
        }
    },

    async loadNotebookRecords() {
        if (!this.selectedNotebook) return;

        try {
            const records = await this.request(`/admin/notebooks/${this.selectedNotebook.id}/records`);
            this.renderRecords(records);
            document.getElementById('recordsView').style.display = 'block';
        } catch (error) {
            console.error('加载记录失败:', error);
            alert('加载记录失败: ' + error.message);
        }
    },

    renderRecords(records) {
        const container = document.getElementById('recordsContainer');
        if (records.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无记录</div>';
            return;
        }

        container.innerHTML = `
            <table class="records-table">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>品名</th>
                        <th>单位</th>
                        <th>数量</th>
                        <th>单价</th>
                        <th>金额</th>
                        <th>备注</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.map(record => `
                        <tr>
                            <td>${record.date}</td>
                            <td>${record.category}</td>
                            <td>${record.unit}</td>
                            <td>${record.quantity}</td>
                            <td>${record.price}</td>
                            <td>${record.amount}</td>
                            <td>${record.remark || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    hideRecords() {
        this.selectedNotebook = null;
        this.loadUserNotebooks();
        document.getElementById('recordsView').style.display = 'none';
    },

    switchTab(tab) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(`tab-${tab}`).classList.add('active');
    },

    showCreateUserModal() {
        document.getElementById('createUserModal').classList.add('active');
    },

    async createUser() {
        const username = document.getElementById('newUsername').value.trim();
        const password = document.getElementById('newPassword').value;
        const companyName = document.getElementById('newCompanyName').value.trim();
        const companyPhone = document.getElementById('newCompanyPhone').value.trim();
        const companyAddress = document.getElementById('newCompanyAddress').value.trim();
        const companyWechat = document.getElementById('newCompanyWechat').value.trim();

        if (!username || !password) {
            alert('用户名和密码不能为空！');
            return;
        }

        try {
            await this.request('/admin/users', {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    password,
                    companyName,
                    companyPhone,
                    companyAddress,
                    companyWechat
                })
            });
            alert('创建成功！');
            closeModal('createUserModal');
            this.clearCreateUserForm();
            this.loadUsers();
        } catch (error) {
            console.error('创建用户失败:', error);
            alert('创建用户失败: ' + error.message);
        }
    },

    clearCreateUserForm() {
        document.getElementById('newUsername').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('newCompanyName').value = '';
        document.getElementById('newCompanyPhone').value = '';
        document.getElementById('newCompanyAddress').value = '';
        document.getElementById('newCompanyWechat').value = '';
    },

    showChangePasswordModal() {
        if (!this.selectedUser) {
            alert('请先选择用户！');
            return;
        }
        document.getElementById('changePasswordModal').classList.add('active');
    },

    async changePassword() {
        const password = document.getElementById('changePassword').value;
        if (!password) {
            alert('密码不能为空！');
            return;
        }

        try {
            await this.request(`/admin/users/${this.selectedUser.id}/password`, {
                method: 'PUT',
                body: JSON.stringify({ password })
            });
            alert('密码修改成功！');
            closeModal('changePasswordModal');
            document.getElementById('changePassword').value = '';
        } catch (error) {
            console.error('修改密码失败:', error);
            alert('修改密码失败: ' + error.message);
        }
    },

    showEditUserModal() {
        if (!this.selectedUser) {
            alert('请先选择用户！');
            return;
        }
        document.getElementById('editCompanyName').value = this.selectedUser.company_name || '';
        document.getElementById('editCompanyPhone').value = this.selectedUser.company_phone || '';
        document.getElementById('editCompanyAddress').value = this.selectedUser.company_address || '';
        document.getElementById('editCompanyWechat').value = this.selectedUser.company_wechat || '';
        document.getElementById('editUserModal').classList.add('active');
    },

    async updateUser() {
        const companyName = document.getElementById('editCompanyName').value.trim();
        const companyPhone = document.getElementById('editCompanyPhone').value.trim();
        const companyAddress = document.getElementById('editCompanyAddress').value.trim();
        const companyWechat = document.getElementById('editCompanyWechat').value.trim();

        try {
            await this.request(`/admin/users/${this.selectedUser.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    companyName,
                    companyPhone,
                    companyAddress,
                    companyWechat
                })
            });
            alert('更新成功！');
            closeModal('editUserModal');
            this.loadUsers();
            this.selectedUser = this.users.find(u => u.id === this.selectedUser.id);
            this.renderUserDetail();
        } catch (error) {
            console.error('更新用户失败:', error);
            alert('更新用户失败: ' + error.message);
        }
    },

    showDeleteUserModal() {
        if (!this.selectedUser) {
            alert('请先选择用户！');
            return;
        }
        document.getElementById('deleteUserModal').classList.add('active');
    },

    async deleteUser() {
        try {
            await this.request(`/admin/users/${this.selectedUser.id}`, {
                method: 'DELETE'
            });
            alert('删除成功！');
            closeModal('deleteUserModal');
            this.selectedUser = null;
            this.loadUsers();
            this.renderUserDetail();
        } catch (error) {
            console.error('删除用户失败:', error);
            alert('删除用户失败: ' + error.message);
        }
    },

    async exportUserData() {
        if (!this.selectedUser) {
            alert('请先选择用户！');
            return;
        }

        try {
            const data = await this.request(`/admin/users/${this.selectedUser.id}/export`);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.selectedUser.username}_backup_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            alert('导出成功！');
        } catch (error) {
            console.error('导出失败:', error);
            alert('导出失败: ' + error.message);
        }
    },

    showImportModal() {
        document.getElementById('importModal').classList.add('active');
    },

    async importData() {
        const fileInput = document.getElementById('importFile');
        const password = document.getElementById('importPassword').value;
        
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('请选择文件！');
            return;
        }
        
        if (!password) {
            alert('请设置密码！');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                data.password = password;
                
                await this.request('/admin/users/import', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                
                alert('导入成功！');
                closeModal('importModal');
                this.clearImportForm();
                this.loadUsers();
            } catch (error) {
                console.error('导入失败:', error);
                alert('导入失败: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    },

    clearImportForm() {
        document.getElementById('importFile').value = '';
        document.getElementById('importPassword').value = '';
    },

    logout() {
        localStorage.removeItem('zhangben_token');
        this.token = null;
        this.users = [];
        this.selectedUser = null;
        this.selectedNotebook = null;
        this.showLoginPage();
    },

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    bindModalEvents() {
        // 点击弹窗外部关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    AdminApp.init();
    AdminApp.bindModalEvents();
});
