const App = {
    currentUser: null,
    currentNotebook: null,
    currentDate: new Date().toISOString().split('T')[0],
    eventsBound: false,

    init() {
        this.loadTheme();
        this.updateScenicBackground();
        this.bindEvents();
        this.checkLogin();
        setInterval(() => this.updateScenicBackground(), 60000);
    },

    updateScenicBackground() {
        const hour = new Date().getHours();
        const img = document.getElementById('scenic-image');
        const hourStr = hour.toString().padStart(2, '0');
        img.style.backgroundImage = `url('images/hour_${hourStr}.jpg')`;
    },

    bindEvents() {
        if (this.eventsBound) return;
        this.eventsBound = true;

        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('create-notebook-btn').addEventListener('click', () => {
            this.showCreateNotebookModal();
        });

        document.getElementById('theme-btn').addEventListener('click', () => {
            this.showColorPickerModal();
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettingsModal();
        });

        document.getElementById('back-to-home-btn').addEventListener('click', () => {
            this.showPage('home-page');
            this.loadNotebooks();
        });

        document.getElementById('date-picker').addEventListener('change', (e) => {
            this.currentDate = e.target.value;
            this.loadDayData();
        });

        document.getElementById('prev-day-btn').addEventListener('click', () => {
            const date = new Date(this.currentDate);
            date.setDate(date.getDate() - 1);
            this.currentDate = date.toISOString().split('T')[0];
            document.getElementById('date-picker').value = this.currentDate;
            this.loadDayData();
        });

        document.getElementById('next-day-btn').addEventListener('click', () => {
            const date = new Date(this.currentDate);
            date.setDate(date.getDate() + 1);
            this.currentDate = date.toISOString().split('T')[0];
            document.getElementById('date-picker').value = this.currentDate;
            this.loadDayData();
        });

        document.getElementById('add-record-btn').addEventListener('click', () => {
            this.showCategoryListModal();
        });

        document.getElementById('upload-image-btn').addEventListener('click', () => {
            this.showImageUploadOptions();
        });

        document.getElementById('print-btn').addEventListener('click', () => {
            this.preparePrint();
        });

        document.getElementById('image-input').addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
            e.target.value = '';
        });

        document.getElementById('customer-name').addEventListener('input', () => {
            this.saveCustomerInfo();
        });
        document.getElementById('customer-phone').addEventListener('input', () => {
            this.saveCustomerInfo();
        });
        document.getElementById('customer-address').addEventListener('input', () => {
            this.saveCustomerInfo();
        });
        document.getElementById('customer-contact').addEventListener('input', () => {
            this.saveCustomerInfo();
        });
    },

    showColorPickerModal() {
        const savedColor = localStorage.getItem('zhangben_theme_color') || '#667eea';
        const content = `
            <h2>选择主题颜色</h2>
            <div class="color-picker-wrap">
                <div class="color-preview" id="color-preview" style="background: ${savedColor};"></div>
                <input type="color" id="color-picker" class="color-picker-input" value="${savedColor}">
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                <button class="btn btn-primary" onclick="App.saveColor()">保存</button>
            </div>
            <script>
                document.getElementById('color-picker').addEventListener('input', function(e) {
                    document.getElementById('color-preview').style.background = e.target.value;
                });
            <\/script>
        `;
        this.showModal(content);
    },

    saveColor() {
        const color = document.getElementById('color-picker').value;
        localStorage.setItem('zhangben_theme_color', color);
        this.applyTheme(color);
        this.closeModal();
    },

    applyTheme(color) {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', color);
        const lighterColor = this.lightenColor(color, 20);
        root.style.setProperty('--primary-light', lighterColor);
        const darkerColor = this.darkenColor(color, 15);
        root.style.setProperty('--primary-dark', darkerColor);
        root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${color} 0%, ${darkerColor} 100%)`);
    },

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    },

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 + (G > 0 ? G : 0) * 0x100 + (B > 0 ? B : 0)).toString(16).slice(1);
    },

    loadTheme() {
        const savedColor = localStorage.getItem('zhangben_theme_color') || '#667eea';
        this.applyTheme(savedColor);
    },

    toggleSection(section) {
        const sectionEl = document.getElementById(section + '-section');
        const toggle = document.getElementById(section + '-toggle');
        
        if (sectionEl.classList.contains('collapsed')) {
            sectionEl.classList.remove('collapsed');
            toggle.classList.remove('collapsed');
        } else {
            sectionEl.classList.add('collapsed');
            toggle.classList.add('collapsed');
        }
    },

    async showSettingsModal() {
        const info = await this.getCompanyInfo();
        const content = `
            <h2>销售方设置</h2>
            <div class="modal-form-group">
                <label>公司名称</label>
                <input type="text" id="settings-company-name" value="${info.companyName || ''}" placeholder="请输入公司名称">
            </div>
            <div class="modal-form-group">
                <label>公司电话</label>
                <input type="tel" id="settings-company-phone" value="${info.companyPhone || ''}" placeholder="请输入公司电话">
            </div>
            <div class="modal-form-group">
                <label>公司地址</label>
                <input type="text" id="settings-company-address" value="${info.companyAddress || ''}" placeholder="请输入公司地址">
            </div>
            <div class="modal-form-group">
                <label>微信号</label>
                <input type="text" id="settings-company-wechat" value="${info.companyWechat || ''}" placeholder="请输入微信号">
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                <button class="btn btn-primary" onclick="App.saveSettings()">保存</button>
            </div>
        `;
        this.showModal(content);
    },

    async saveSettings() {
        const info = {
            companyName: document.getElementById('settings-company-name').value.trim(),
            companyPhone: document.getElementById('settings-company-phone').value.trim(),
            companyAddress: document.getElementById('settings-company-address').value.trim(),
            companyWechat: document.getElementById('settings-company-wechat').value.trim()
        };
        try {
            await Storage.updateCompanyInfo(info);
            this.loadCompanyInfoToBill(info);
            this.closeModal();
        } catch (error) {
            alert(error.message);
        }
    },

    async getCompanyInfo() {
        try {
            return await Storage.getUserProfile();
        } catch (error) {
            return { companyName: '', companyPhone: '', companyAddress: '', companyWechat: '' };
        }
    },

    loadCompanyInfoToBill(info) {
        document.getElementById('company-name').value = info.companyName || '';
        document.getElementById('company-phone').value = info.companyPhone || '';
        document.getElementById('company-address').value = info.companyAddress || '';
        document.getElementById('company-wechat').value = info.companyWechat || '';
    },

    convertToChineseCapital(amount) {
        const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
        const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿'];
        const decimalUnits = ['角', '分'];

        if (amount === 0) return '零元整';

        let result = '';
        
        const integerPart = Math.floor(amount);
        if (integerPart > 0) {
            let intStr = integerPart.toString();
            let intLen = intStr.length;
            let zeroFlag = false;
            
            for (let i = 0; i < intLen; i++) {
                let digit = parseInt(intStr[i]);
                let unitIndex = intLen - 1 - i;
                
                if (digit === 0) {
                    zeroFlag = true;
                    if (unitIndex === 4) {
                        result += '万';
                    } else if (unitIndex === 8) {
                        result += '亿';
                    }
                } else {
                    if (zeroFlag) {
                        result += '零';
                        zeroFlag = false;
                    }
                    result += digits[digit] + units[unitIndex];
                }
            }
            result += '元';
        } else {
            result += '零元';
        }

        const decimalPart = Math.round((amount - integerPart) * 100);
        if (decimalPart === 0) {
            result += '整';
        } else {
            const jiao = Math.floor(decimalPart / 10);
            const fen = decimalPart % 10;
            
            if (jiao > 0) {
                result += digits[jiao] + decimalUnits[0];
            } else if (integerPart > 0) {
                result += '零';
            }
            
            if (fen > 0) {
                result += digits[fen] + decimalUnits[1];
            }
        }

        return result;
    },

    async saveCustomerInfo() {
        if (!this.currentUser || !this.currentNotebook) return;
        
        const info = {
            customerName: document.getElementById('customer-name').value,
            customerPhone: document.getElementById('customer-phone').value,
            customerAddress: document.getElementById('customer-address').value,
            customerContact: document.getElementById('customer-contact').value
        };
        try {
            await Storage.saveCustomerInfo(this.currentNotebook.id, info);
        } catch (error) {
            console.error('保存客户信息失败:', error);
        }
    },

    async loadCustomerInfo() {
        if (!this.currentUser || !this.currentNotebook) return;
        
        try {
            const info = await Storage.getCustomerInfo(this.currentNotebook.id);
            document.getElementById('customer-name').value = info.customer_name || '';
            document.getElementById('customer-phone').value = info.customer_phone || '';
            document.getElementById('customer-address').value = info.customer_address || '';
            document.getElementById('customer-contact').value = info.customer_contact || '';
        } catch (error) {
            console.error('加载客户信息失败:', error);
        }
    },

    generateBillNo() {
        const date = new Date(this.currentDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        return `No.XS-${year}${month}${day}-${random}`;
    },

    async checkLogin() {
        const token = Storage.getToken();
        if (token) {
            try {
                const user = await Storage.getUserProfile();
                this.currentUser = user;
                this.showPage('home-page');
                await this.loadNotebooks();
                if (!user.companyName && !user.companyPhone && !user.companyAddress && !user.companyWechat) {
                    setTimeout(() => {
                        this.showSettingsModal();
                    }, 500);
                }
            } catch (error) {
                Storage.clearToken();
                this.showPage('login-page');
            }
        } else {
            this.showPage('login-page');
        }
    },

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    },

    async login() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }

        try {
            const data = await Storage.login(username, password);
            this.currentUser = data.user;
            this.showPage('home-page');
            await this.loadNotebooks();
            if (!data.user.companyName && !data.user.companyPhone && !data.user.companyAddress && !data.user.companyWechat) {
                setTimeout(() => {
                    this.showSettingsModal();
                }, 500);
            }
        } catch (error) {
            alert(error.message);
        }
    },

    async logout() {
        await Storage.logout();
        this.currentUser = null;
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        this.showPage('login-page');
    },

    async loadNotebooks() {
        document.getElementById('current-user').textContent = this.currentUser.username;
        try {
            const notebooks = await Storage.getNotebooks();
            const list = document.getElementById('notebook-list');

            if (notebooks.length === 0) {
                list.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7); margin-top: 30px;">暂无账本，请点击创建</p>';
                return;
            }

            list.innerHTML = notebooks.map(nb => `
                <div class="notebook-item" data-id="${nb.id}" onclick="App.openNotebook('${nb.id}')">
                    <h3>${nb.name}</h3>
                    <p style="color: #999; font-size: 12px; margin-top: 5px;">创建于：${new Date(nb.created_at).toLocaleDateString()}</p>
                </div>
            `).join('');

            list.querySelectorAll('.notebook-item').forEach(item => {
                let pressTimer;
                item.addEventListener('mousedown', (e) => {
                    pressTimer = setTimeout(() => {
                        this.showNotebookOptions(item.dataset.id);
                    }, 800);
                });

                item.addEventListener('mouseup', () => {
                    clearTimeout(pressTimer);
                });

                item.addEventListener('touchstart', (e) => {
                    pressTimer = setTimeout(() => {
                        this.showNotebookOptions(item.dataset.id);
                    }, 800);
                });

                item.addEventListener('touchend', () => {
                    clearTimeout(pressTimer);
                });
            });
        } catch (error) {
            alert('加载账本失败: ' + error.message);
        }
    },

    showCreateNotebookModal() {
        const content = `
            <h2>创建账本</h2>
            <div class="modal-form-group">
                <label>账本名称</label>
                <input type="text" id="notebook-name" placeholder="请输入账本名称">
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                <button class="btn btn-primary" onclick="App.createNotebook()">创建</button>
            </div>
        `;
        this.showModal(content);
    },

    async createNotebook() {
        const name = document.getElementById('notebook-name').value.trim();
        if (!name) {
            alert('请输入账本名称');
            return;
        }

        try {
            await Storage.createNotebook(name);
            this.closeModal();
            await this.loadNotebooks();
        } catch (error) {
            alert(error.message);
        }
    },

    showNotebookOptions(notebookId) {
        const content = `
            <h2>账本选项</h2>
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="App.showStatisticsModal('${notebookId}')">统计总价</button>
            </div>
            <div class="modal-buttons" style="margin-top: 10px;">
                <button class="btn btn-secondary" onclick="App.deleteNotebook('${notebookId}')" style="width: 100%; background: #ff4d4f;">删除账本</button>
            </div>
            <div class="modal-buttons" style="margin-top: 10px;">
                <button class="btn btn-secondary" onclick="App.closeModal()" style="width: 100%;">取消</button>
            </div>
        `;
        this.showModal(content);
    },

    showStatisticsModal(notebookId) {
        const content = `
            <h2>统计总价</h2>
            <div class="modal-form-group">
                <label>开始日期</label>
                <input type="date" id="stat-start-date">
            </div>
            <div class="modal-form-group">
                <label>结束日期</label>
                <input type="date" id="stat-end-date">
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                <button class="btn btn-primary" onclick="App.calculateStatistics('${notebookId}')">计算</button>
            </div>
        `;
        this.showModal(content);
    },

    async calculateStatistics(notebookId) {
        const startDate = document.getElementById('stat-start-date').value;
        const endDate = document.getElementById('stat-end-date').value;
        
        if (!startDate || !endDate) {
            alert('请选择日期范围');
            return;
        }

        try {
            const records = await Storage.getRecords(notebookId, startDate, endDate);
            let total = 0;
            records.forEach(r => {
                total += parseFloat(r.amount) || 0;
            });
            
            const capitalAmount = this.convertToChineseCapital(total);
            alert(`总价: ¥${total.toFixed(2)}\n（大写）${capitalAmount}`);
            this.closeModal();
        } catch (error) {
            alert('统计失败: ' + error.message);
        }
    },

    async deleteNotebook(notebookId) {
        if (!confirm('确定要删除这个账本吗？')) return;

        try {
            await Storage.deleteNotebook(notebookId);
            this.closeModal();
            await this.loadNotebooks();
        } catch (error) {
            alert(error.message);
        }
    },

    async openNotebook(notebookId) {
        try {
            const notebook = await Storage.getNotebook(notebookId);
            this.currentNotebook = notebook;
            this.currentDate = new Date().toISOString().split('T')[0];
            document.getElementById('date-picker').value = this.currentDate;
            document.getElementById('notebook-title-display').textContent = notebook.name;
            document.getElementById('bill-no').textContent = this.generateBillNo();
            this.showPage('notebook-page');
            await this.loadDayData();
            await this.loadCompanyInfo();
        } catch (error) {
            alert('打开账本失败: ' + error.message);
        }
    },

    async loadCompanyInfo() {
        try {
            const info = await Storage.getUserProfile();
            this.loadCompanyInfoToBill(info);
        } catch (error) {
            console.error('加载公司信息失败:', error);
        }
    },

    async loadDayData() {
        if (!this.currentNotebook) return;

        try {
            const records = await Storage.getRecords(this.currentNotebook.id, this.currentDate);
            this.renderRecords(records);
            await this.loadCustomerInfo();
            await this.loadImages();
        } catch (error) {
            alert('加载数据失败: ' + error.message);
        }
    },

    renderRecords(records) {
        const tbody = document.querySelector('#records-table tbody');
        if (!tbody) return;

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">今日暂无记录</td></tr>';
            document.getElementById('total-amount').textContent = '¥0.00';
            return;
        }

        let total = 0;
        tbody.innerHTML = records.map((r, index) => {
            const amount = parseFloat(r.amount) || 0;
            total += amount;
            return `
                <tr onclick="App.showRecordOptions(${index}, ${r.id})">
                    <td>${r.category}</td>
                    <td>${r.price}</td>
                    <td>${r.unit}</td>
                    <td>${r.quantity}</td>
                    <td>${r.amount}</td>
                    <td>${r.remark}</td>
                </tr>
            `;
        }).join('');

        document.getElementById('total-amount').textContent = '¥' + total.toFixed(2);
    },

    async showCategoryListModal() {
        try {
            const categories = await Storage.getCategories(this.currentNotebook.id);
            if (categories.length === 0) {
                alert('请先添加产品类目');
                this.showAddCategoryModal();
                return;
            }

            const content = `
                <h2>选择产品</h2>
                <div class="category-list">
                    ${categories.map(c => `
                        <div class="category-item" onclick="App.selectCategory('${c.name}', ${c.price}, '${c.unit}')">
                            <span>${c.name}</span>
                            <span>¥${c.price}/${c.unit}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="modal-buttons" style="margin-top: 10px;">
                    <button class="btn btn-secondary" onclick="App.showAddCategoryModal()">添加新产品</button>
                    <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                </div>
            `;
            this.showModal(content);
        } catch (error) {
            alert('加载产品列表失败: ' + error.message);
        }
    },

    selectCategory(name, price, unit) {
        this.closeModal();
        this.addRecordFromCategory(name, price, unit);
    },

    async addRecordFromCategory(category, price, unit) {
        const quantity = prompt('数量:', '1');
        if (quantity === null) return;

        const amount = (parseFloat(price) * parseFloat(quantity)).toFixed(2);
        const remark = prompt('备注:', '') || '';

        const recordData = {
            date: this.currentDate,
            category,
            price,
            unit,
            quantity,
            amount,
            remark
        };

        try {
            await Storage.addRecord(this.currentNotebook.id, recordData);
            await this.loadDayData();
        } catch (error) {
            alert('添加记录失败: ' + error.message);
        }
    },

    showAddCategoryModal() {
        const content = `
            <h2>添加产品</h2>
            <div class="modal-form-group">
                <label>产品名称</label>
                <input type="text" id="category-name" placeholder="请输入产品名称">
            </div>
            <div class="modal-form-group">
                <label>单价</label>
                <input type="number" id="category-price" placeholder="请输入单价" step="0.01">
            </div>
            <div class="modal-form-group">
                <label>单位</label>
                <input type="text" id="category-unit" placeholder="如：箱、件、斤">
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                <button class="btn btn-primary" onclick="App.addCategory()">添加</button>
            </div>
        `;
        this.showModal(content);
    },

    async addCategory() {
        const name = document.getElementById('category-name').value.trim();
        const price = document.getElementById('category-price').value;
        const unit = document.getElementById('category-unit').value.trim();

        if (!name || !price || !unit) {
            alert('请填写完整信息');
            return;
        }

        try {
            await Storage.addCategory(this.currentNotebook.id, { name, price, unit });
            this.closeModal();
            this.showCategoryListModal();
        } catch (error) {
            alert(error.message);
        }
    },

    async showRecordOptions(index, recordId) {
        const content = `
            <h2>记录选项</h2>
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="App.deleteRecord(${recordId})" style="width: 100%; background: #ff4d4f;">删除记录</button>
            </div>
            <div class="modal-buttons" style="margin-top: 10px;">
                <button class="btn btn-secondary" onclick="App.closeModal()" style="width: 100%;">取消</button>
            </div>
        `;
        this.showModal(content);
    },

    async deleteRecord(recordId) {
        if (!confirm('确定要删除这条记录吗？')) return;

        try {
            await Storage.deleteRecord(recordId);
            this.closeModal();
            await this.loadDayData();
        } catch (error) {
            alert(error.message);
        }
    },

    showImageUploadOptions() {
        const content = `
            <h2>上传图片</h2>
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="document.getElementById('image-input').click(); App.closeModal();">选择图片</button>
            </div>
            <div class="modal-buttons" style="margin-top: 10px;">
                <button class="btn btn-secondary" onclick="App.closeModal()" style="width: 100%;">取消</button>
            </div>
        `;
        this.showModal(content);
    },

    async handleImageUpload(file) {
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('date', this.currentDate);

        try {
            await Storage.uploadImage(this.currentNotebook.id, formData);
            await this.loadImages();
        } catch (error) {
            alert('上传图片失败: ' + error.message);
        }
    },

    async loadImages() {
        if (!this.currentNotebook) return;

        try {
            const images = await Storage.getImages(this.currentNotebook.id, this.currentDate);
            const container = document.getElementById('image-list');
            
            if (images.length === 0) {
                container.innerHTML = '';
                return;
            }

            container.innerHTML = images.map(img => `
                <div class="image-item" onclick="App.showImageOptions(${img.id})">
                    <img src="/uploads/${img.filename}" alt="单据图片">
                </div>
            `).join('');
        } catch (error) {
            console.error('加载图片失败:', error);
        }
    },

    showImageOptions(imageId) {
        const content = `
            <h2>图片选项</h2>
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="App.deleteImage(${imageId})" style="width: 100%; background: #ff4d4f;">删除图片</button>
            </div>
            <div class="modal-buttons" style="margin-top: 10px;">
                <button class="btn btn-secondary" onclick="App.closeModal()" style="width: 100%;">取消</button>
            </div>
        `;
        this.showModal(content);
    },

    async deleteImage(imageId) {
        if (!confirm('确定要删除这张图片吗？')) return;

        try {
            await Storage.deleteImage(imageId);
            this.closeModal();
            await this.loadImages();
        } catch (error) {
            alert(error.message);
        }
    },

    preparePrint() {
        window.print();
    },

    showModal(content) {
        const modal = document.getElementById('modal');
        modal.querySelector('#modal-content').innerHTML = content;
        modal.classList.add('active');
    },

    closeModal() {
        document.getElementById('modal').classList.remove('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});