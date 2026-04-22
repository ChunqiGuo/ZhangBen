const API_BASE_URL = '/api';

const Storage = {
    getToken() {
        return localStorage.getItem('zhangben_token');
    },

    setToken(token) {
        localStorage.setItem('zhangben_token', token);
    },

    clearToken() {
        localStorage.removeItem('zhangben_token');
    },

    async request(url, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

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

    // 用户认证
    async login(username, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        this.setToken(data.token);
        return data;
    },

    async register(username, password) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        this.setToken(data.token);
        return data;
    },

    async logout() {
        this.clearToken();
    },

    async getUserProfile() {
        return await this.request('/auth/profile');
    },

    async updateCompanyInfo(companyData) {
        return await this.request('/auth/company', {
            method: 'PUT',
            body: JSON.stringify(companyData)
        });
    },

    // 账本管理
    async getNotebooks() {
        return await this.request('/notebooks');
    },

    async createNotebook(name) {
        return await this.request('/notebooks', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
    },

    async deleteNotebook(notebookId) {
        return await this.request(`/notebooks/${notebookId}`, {
            method: 'DELETE'
        });
    },

    async getNotebook(notebookId) {
        return await this.request(`/notebooks/${notebookId}`);
    },

    // 账单记录
    async getRecords(notebookId, date) {
        return await this.request(`/notebooks/${notebookId}/records?date=${date}`);
    },

    async addRecord(notebookId, recordData) {
        return await this.request(`/notebooks/${notebookId}/records`, {
            method: 'POST',
            body: JSON.stringify(recordData)
        });
    },

    async deleteRecord(recordId) {
        return await this.request(`/records/${recordId}`, {
            method: 'DELETE'
        });
    },

    async updateRecord(recordId, recordData) {
        return await this.request(`/records/${recordId}`, {
            method: 'PUT',
            body: JSON.stringify(recordData)
        });
    },

    // 类目管理
    async getCategories(notebookId) {
        return await this.request(`/notebooks/${notebookId}/categories`);
    },

    async addCategory(notebookId, categoryData) {
        return await this.request(`/notebooks/${notebookId}/categories`, {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    },

    async deleteCategory(categoryId) {
        return await this.request(`/categories/${categoryId}`, {
            method: 'DELETE'
        });
    },

    // 图片管理
    async uploadImage(notebookId, date, file) {
        const token = this.getToken();
        const formData = new FormData();
        formData.append('image', file);
        formData.append('date', date);

        const response = await fetch(`${API_BASE_URL}/notebooks/${notebookId}/images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '上传失败');
        }

        return data;
    },

    async getImages(notebookId, date) {
        return await this.request(`/notebooks/${notebookId}/images?date=${date}`);
    },

    async deleteImage(imageId) {
        return await this.request(`/images/${imageId}`, {
            method: 'DELETE'
        });
    },

    // 客户信息
    async getCustomerInfo(notebookId) {
        return await this.request(`/notebooks/${notebookId}/customer`);
    },

    async saveCustomerInfo(notebookId, customerData) {
        return await this.request(`/notebooks/${notebookId}/customer`, {
            method: 'PUT',
            body: JSON.stringify(customerData)
        });
    },

    // 账单标题和电话（这些保存在本地，因为每个账本通用）
    getBillTitle(username, notebookId) {
        return localStorage.getItem(`zhangben_billtitle_${username}_${notebookId}`) || '';
    },

    saveBillTitle(username, notebookId, title) {
        localStorage.setItem(`zhangben_billtitle_${username}_${notebookId}`, title);
    },

    getPhoneNumber(username, notebookId) {
        return localStorage.getItem(`zhangben_phone_${username}_${notebookId}`) || '';
    },

    savePhoneNumber(username, notebookId, phone) {
        localStorage.setItem(`zhangben_phone_${username}_${notebookId}`, phone);
    }
};
