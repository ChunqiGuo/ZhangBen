const API_BASE_URL = '/api';

const AdminApp = {
    token: null,
    users: [],
    selectedUser: null,
    selectedNotebook: null,
    imagesByDate: {},

    init() {
        this.token = localStorage.getItem('zhangben_token');
        this.bindModalEvents();
        
        if (this.token) {
            // 检查是否是管理员
            this.checkAdminAndShow();
        } else {
            // 没有token，跳转回首页
            location.href = 'index.html';
        }
    },

    async checkAdminAndShow() {
        try {
            // 尝试请求管理员接口验证权限
            await this.request('/admin/users');
            this.showAdminPage();
            this.loadUsers();
        } catch (error) {
            // 如果不是管理员，清除token并跳转回首页
            localStorage.removeItem('zhangben_token');
            this.token = null;
            alert('需要管理员权限才能访问后台管理系统');
            location.href = 'index.html';
        }
    },

    showAdminPage() {
        document.getElementById('adminPage').style.display = 'block';
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
            throw new Error(data.error || '请求失败');
        }

        return data;
    },

    async loadUsers() {
        try {
            this.users = await this.request('/admin/users');
            this.renderUserList();
        } catch (error) {
            console.error('加载用户列表失败:', error);
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
            </div>
            <div class="user-actions">
                <button class="btn btn-primary" onclick="AdminApp.showEditUserModal()">✏️ 修改信息</button>
                <button class="btn btn-warning" onclick="AdminApp.showChangePasswordModal()">🔐 修改密码</button>
                <button class="btn btn-primary" onclick="AdminApp.exportUserData()">📤 导出数据</button>
                <button class="btn btn-danger" onclick="AdminApp.showDeleteUserModal()">🗑️ 删除用户</button>
            </div>
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
        }
    },

    async loadNotebookRecords() {
        const recordsView = document.getElementById('recordsView');
        const recordsContainer = document.getElementById('recordsContainer');

        if (!this.selectedNotebook) {
            recordsView.style.display = 'none';
            return;
        }

        try {
            // 加载记录
            const records = await this.request(`/admin/notebooks/${this.selectedNotebook.id}/records`);
            // 加载所有图片
            const images = await this.request(`/admin/notebooks/${this.selectedNotebook.id}/images`);
            
            // 按日期分组图片
            this.imagesByDate = {};
            images.forEach(img => {
                if (!this.imagesByDate[img.date]) {
                    this.imagesByDate[img.date] = [];
                }
                this.imagesByDate[img.date].push(img);
            });

            // 按日期分组记录
            const recordsByDate = {};
            records.forEach(record => {
                if (!recordsByDate[record.date]) {
                    recordsByDate[record.date] = [];
                }
                recordsByDate[record.date].push(record);
            });

            recordsView.style.display = 'block';

            if (records.length === 0) {
                recordsContainer.innerHTML = '<div class="empty-state">暂无记录</div>';
                return;
            }

            recordsContainer.innerHTML = `
                <table class="records-table">
                    <thead>
                        <tr>
                            <th>日期</th>
                            <th>品类</th>
                            <th>单价</th>
                            <th>单位</th>
                            <th>数量</th>
                            <th>金额</th>
                            <th>备注</th>
                            <th>图片</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(recordsByDate).map(([date, dateRecords]) => {
                            const dateImages = this.imagesByDate[date] || [];
                            const rowspan = dateRecords.length;
                            return dateRecords.map((record, index) => `
                                <tr>
                                    ${index === 0 ? `
                                        <td rowspan="${rowspan}" valign="top">${date}</td>
                                    ` : ''}
                                    <td>${record.category || '-'}</td>
                                    <td>${record.price || '-'}</td>
                                    <td>${record.unit || '-'}</td>
                                    <td>${record.quantity || '-'}</td>
                                    <td>${record.amount || '-'}</td>
                                    <td>${record.remark || '-'}</td>
                                    ${index === 0 ? `
                                        <td rowspan="${rowspan}" valign="top">
                                            <div class="images-preview">
                                                ${dateImages.length > 0 ? 
                                                    dateImages.slice(0, 3).map(img => `
                                                        <img src="${img.url}" class="preview-img" onclick="AdminApp.showImageModal('${img.url}')" />
                                                    `).join('') + (dateImages.length > 3 ? `<span class="more-images">+${dateImages.length - 3}</span>` : '') 
                                                    : '-'
                                                }
                                            </div>
                                        </td>
                                    ` : ''}
                                </tr>
                            `).join('');
                        }).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            console.error('加载记录失败:', error);
        }
    },

    hideRecords() {
        document.getElementById('recordsView').style.display = 'none';
        this.selectedNotebook = null;
        this.loadUserNotebooks();
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        event.target.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
    },

    showCreateUserModal() {
        if (this.selectedUser && this.selectedUser.username === 'xiaoqimate') {
            alert('超级管理员需要先初始化数据库才能创建用户');
            return;
        }
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
            alert('请填写必要信息');
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

            alert('创建成功');
            this.closeModal('createUserModal');
            this.loadUsers();
        } catch (error) {
            alert(error.message);
        }
    },

    showEditUserModal() {
        if (this.selectedUser && this.selectedUser.username === 'xiaoqimate') {
            alert('超级管理员不允许修改信息');
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

            alert('修改成功');
            this.closeModal('editUserModal');
            this.loadUsers();
        } catch (error) {
            alert(error.message);
        }
    },

    showChangePasswordModal() {
        if (this.selectedUser && this.selectedUser.username === 'xiaoqimate') {
            alert('超级管理员不允许修改密码');
            return;
        }
        document.getElementById('changePassword').value = '';
        document.getElementById('changePasswordModal').classList.add('active');
    },

    async changePassword() {
        const password = document.getElementById('changePassword').value;

        if (!password) {
            alert('请填写新密码');
            return;
        }

        try {
            await this.request(`/admin/users/${this.selectedUser.id}/password`, {
                method: 'PUT',
                body: JSON.stringify({ password })
            });

            alert('修改成功');
            this.closeModal('changePasswordModal');
        } catch (error) {
            alert(error.message);
        }
    },

    showDeleteUserModal() {
        if (this.selectedUser && this.selectedUser.username === 'xiaoqimate') {
            alert('超级管理员不允许删除');
            return;
        }
        document.getElementById('deleteUserModal').classList.add('active');
    },

    async deleteUser() {
        try {
            await this.request(`/admin/users/${this.selectedUser.id}`, {
                method: 'DELETE'
            });

            alert('删除成功');
            this.closeModal('deleteUserModal');
            this.selectedUser = null;
            this.renderUserDetail();
            this.loadUsers();
        } catch (error) {
            alert(error.message);
        }
    },

    showImportModal() {
        if (this.selectedUser && this.selectedUser.username === 'xiaoqimate') {
            alert('超级管理员需要先初始化数据库才能导入数据');
            return;
        }
        document.getElementById('importModal').classList.add('active');
    },

    async importData() {
        const fileInput = document.getElementById('importFile');
        const passwordInput = document.getElementById('importPassword');
        
        if (!fileInput.files[0] || !passwordInput.value) {
            alert('请选择文件并设置密码');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                importData.password = passwordInput.value;

                await this.request('/admin/users/import', {
                    method: 'POST',
                    body: JSON.stringify(importData)
                });

                alert('导入成功');
                this.closeModal('importModal');
                this.loadUsers();
            } catch (error) {
                alert('导入失败: ' + error.message);
            }
        };

        reader.readAsText(file);
    },

    async exportUserData() {
        try {
            const data = await this.request(`/admin/users/${this.selectedUser.id}/export`);
            
            if (data.message) {
                alert(data.message);
                return;
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.selectedUser.username}_export_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            alert('导出失败: ' + error.message);
        }
    },

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    bindModalEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    },

    showImageModal(imageUrl) {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('imageModalImg');
        modalImg.src = imageUrl;
        modal.classList.add('active');
    },

    closeImageModal() {
        document.getElementById('imageModal').classList.remove('active');
    },

    logout() {
        localStorage.removeItem('zhangben_token');
        this.token = null;
        location.href = 'index.html';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AdminApp.init();
});
