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
        if (img) {
            const hourStr = hour.toString().padStart(2, '0');
            img.style.backgroundImage = `url('images/hour_${hourStr}.jpg')`;
        }
    },

    bindEvents() {
        if (this.eventsBound) return;
        this.eventsBound = true;

        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        const createNotebookBtn = document.getElementById('create-notebook-btn');
        if (createNotebookBtn) {
            createNotebookBtn.addEventListener('click', () => {
                this.showCreateNotebookModal();
            });
        }

        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.showColorPickerModal();
            });
        }

        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettingsModal();
            });
        }

        const backToHomeBtn = document.getElementById('back-to-home-btn');
        if (backToHomeBtn) {
            backToHomeBtn.addEventListener('click', () => {
                this.showPage('home-page');
                this.loadNotebooks();
            });
        }

        const datePicker = document.getElementById('date-picker');
        if (datePicker) {
            datePicker.addEventListener('change', (e) => {
                this.currentDate = e.target.value;
                this.loadDayData();
            });
        }

        const prevDayBtn = document.getElementById('prev-day-btn');
        if (prevDayBtn) {
            prevDayBtn.addEventListener('click', () => {
                const date = new Date(this.currentDate);
                date.setDate(date.getDate() - 1);
                this.currentDate = date.toISOString().split('T')[0];
                datePicker.value = this.currentDate;
                this.loadDayData();
            });
        }

        const nextDayBtn = document.getElementById('next-day-btn');
        if (nextDayBtn) {
            nextDayBtn.addEventListener('click', () => {
                const date = new Date(this.currentDate);
                date.setDate(date.getDate() + 1);
                this.currentDate = date.toISOString().split('T')[0];
                datePicker.value = this.currentDate;
                this.loadDayData();
            });
        }

        const addRecordBtn = document.getElementById('add-record-btn');
        if (addRecordBtn) {
            addRecordBtn.addEventListener('click', () => {
                this.showCategoryListModal();
            });
        }

        const uploadImageBtn = document.getElementById('upload-image-btn');
        if (uploadImageBtn) {
            uploadImageBtn.addEventListener('click', () => {
                this.showImageUploadOptions();
            });
        }

        const printBtn = document.getElementById('print-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.preparePrint();
            });
        }

        const imageInput = document.getElementById('image-input');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                this.handleImageUpload(e.target.files[0]);
                e.target.value = '';
            });
        }

        const customerName = document.getElementById('customer-name');
        if (customerName) {
            customerName.addEventListener('input', () => {
                this.saveCustomerInfo();
            });
        }

        const customerPhone = document.getElementById('customer-phone');
        if (customerPhone) {
            customerPhone.addEventListener('input', () => {
                this.saveCustomerInfo();
            });
        }

        const customerAddress = document.getElementById('customer-address');
        if (customerAddress) {
            customerAddress.addEventListener('input', () => {
                this.saveCustomerInfo();
            });
        }

        const customerContact = document.getElementById('customer-contact');
        if (customerContact) {
            customerContact.addEventListener('input', () => {
                this.saveCustomerInfo();
            });
        }
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
                
                // 如果是管理员，直接跳转到后台
                if (user.username === 'xiaoqimate') {
                    location.href = 'admin.html';
                    return;
                }
                
                // 普通用户进入用户界面
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
            
            // 判断是否是管理员，如果是直接跳转到后台管理
            if (data.user.isAdmin || data.user.username === 'xiaoqimate') {
                location.href = 'admin.html';
                return;
            }
            
            // 普通用户进入用户界面
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
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const formatDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };
        
        const content = `
            <h2>统计总价</h2>
            <div class="modal-form-group">
                <label>开始日期</label>
                <input type="date" id="stat-start-date" value="${formatDate(firstDay)}">
            </div>
            <div class="modal-form-group">
                <label>结束日期</label>
                <input type="date" id="stat-end-date" value="${formatDate(today)}">
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
            
            // 按日期分组统计
            const dailyStats = {};
            let grandTotal = 0;
            
            records.forEach(r => {
                const amount = parseFloat(r.amount) || 0;
                if (!dailyStats[r.date]) {
                    dailyStats[r.date] = 0;
                }
                dailyStats[r.date] += amount;
                grandTotal += amount;
            });
            
            // 显示统计结果
            this.showStatisticsResult(dailyStats, grandTotal, startDate, endDate);
        } catch (error) {
            alert('统计失败: ' + error.message);
        }
    },

    showStatisticsResult(dailyStats, grandTotal, startDate, endDate) {
        const sortedDates = Object.keys(dailyStats).sort();
        
        const content = `
            <h2>统计结果</h2>
            <div style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">
                ${sortedDates.length === 0 ? 
                    '<p style="text-align: center; color: #999; padding: 20px;">该日期范围内没有记录</p>' :
                    sortedDates.map(date => `
                        <div style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #f0f0f0;">
                            <span style="color: #666;">${date}</span>
                            <span style="font-weight: 600; color: #333;">¥${dailyStats[date].toFixed(2)}</span>
                        </div>
                    `).join('')
                }
            </div>
            <div style="background: var(--primary-gradient); padding: 15px; border-radius: 10px; color: #fff;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="opacity: 0.9;">合计</span>
                    <span style="font-size: 24px; font-weight: 700;">¥${grandTotal.toFixed(2)}</span>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.closeModal()">关闭</button>
            </div>
        `;
        this.showModal(content);
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
            
            // 默认隐藏销售方和购买方信息
            document.getElementById('company-section').classList.add('collapsed');
            document.getElementById('company-toggle').classList.add('collapsed');
            document.getElementById('customer-section').classList.add('collapsed');
            document.getElementById('customer-toggle').classList.add('collapsed');
            
            // 添加客户信息自动保存监听
            this.setupCustomerInfoAutoSave();
            
            await this.loadDayData();
            await this.loadCompanyInfo();
        } catch (error) {
            alert('打开账本失败: ' + error.message);
        }
    },
    
    setupCustomerInfoAutoSave() {
        const inputs = ['customer-name', 'customer-phone', 'customer-contact', 'customer-address'];
        let saveTimeout;
        
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    // 清除之前的定时器
                    if (saveTimeout) clearTimeout(saveTimeout);
                    
                    // 延迟500ms保存，避免频繁请求
                    saveTimeout = setTimeout(() => {
                        this.saveCustomerInfo();
                    }, 500);
                });
            }
        });
    },
    
    async saveCustomerInfo() {
        if (!this.currentNotebook) return;
        
        const customerData = {
            customerName: document.getElementById('customer-name').value || '',
            customerPhone: document.getElementById('customer-phone').value || '',
            customerContact: document.getElementById('customer-contact').value || '',
            customerAddress: document.getElementById('customer-address').value || ''
        };
        
        try {
            await Storage.saveCustomerInfo(this.currentNotebook.id, customerData);
        } catch (error) {
            console.error('保存客户信息失败:', error);
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
        const tbody = document.getElementById('bill-records-tbody');
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
            // 截断备注显示，正确处理中英文混合
            let displayRemark = r.remark;
            if (displayRemark) {
                // 计算可见字符数（中文算2个字符，英文算1个字符）
                let visibleLength = 0;
                let result = '';
                for (let i = 0; i < displayRemark.length; i++) {
                    const char = displayRemark.charAt(i);
                    // 中文及其他宽字符算2个字符
                    const charLength = /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char) ? 2 : 1;
                    if (visibleLength + charLength > 10) {
                        break;
                    }
                    result += char;
                    visibleLength += charLength;
                }
                // 如果被截断，添加省略号
                if (result.length < displayRemark.length) {
                    displayRemark = result + '...';
                }
            }
            return `
                <tr data-record-id="${r.id}" style="height: 50px;">
                    <td>${r.category}</td>
                    <td>${r.price}</td>
                    <td>${r.unit}</td>
                    <td>${r.quantity}</td>
                    <td>${r.amount}</td>
                    <td style="cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;" onclick="event.stopPropagation(); App.showEditRemarkModal(${r.id}, '${r.remark.replace(/'/g, "\\'")}')">${displayRemark || '<span style="color:#999;">点击添加备注</span>'}</td>
                </tr>
            `;
        }).join('');

        // 添加长按事件监听
        this.addRecordLongPressEvents();

        document.getElementById('total-amount').textContent = '¥' + total.toFixed(2);
    },

    addRecordLongPressEvents() {
        const tbody = document.getElementById('bill-records-tbody');
        if (!tbody) return;
        
        let longPressTimer = null;
        let currentRecordId = null;
        
        const rows = tbody.querySelectorAll('tr[data-record-id]');
        rows.forEach(row => {
            row.addEventListener('mousedown', (e) => {
                currentRecordId = row.dataset.recordId;
                longPressTimer = setTimeout(() => {
                    this.showRecordOptions(0, currentRecordId);
                }, 500);
            });
            
            row.addEventListener('mouseup', () => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });
            
            row.addEventListener('mouseleave', () => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });
            
            // 移动端触摸事件
            row.addEventListener('touchstart', (e) => {
                currentRecordId = row.dataset.recordId;
                longPressTimer = setTimeout(() => {
                    this.showRecordOptions(0, currentRecordId);
                }, 500);
            });
            
            row.addEventListener('touchend', () => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });
            
            row.addEventListener('touchmove', () => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });
        });
    },

    async showCategoryListModal() {
        try {
            const categories = await Storage.getCategories(this.currentNotebook.id);

            let content = '<h2>选择产品</h2>';
            
            if (categories.length === 0) {
                content += `
                    <div style="text-align: center; padding: 20px; color: #999;">
                        暂无产品
                    </div>
                `;
            } else {
                content += `
                    <div class="category-list">
                        ${categories.map(c => `
                            <div class="category-item" style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="flex: 1; cursor: pointer;" onclick="App.selectCategory('${c.name}', ${c.price}, '${c.unit}')">
                                    <span>${c.name}</span>
                                    <span>¥${c.price}/${c.unit}</span>
                                </div>
                                <button class="btn btn-icon" onclick="event.stopPropagation(); App.deleteCategory(${c.id})" style="background: #ff4d4f; padding: 4px 8px; margin-left: 10px;">删除</button>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            content += `
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

    async deleteCategory(categoryId) {
        if (!confirm('确定要删除这个产品吗？')) return;
        try {
            await Storage.deleteCategory(categoryId);
            await this.showCategoryListModal();
        } catch (error) {
            alert('删除失败: ' + error.message);
        }
    },

    selectCategory(name, price, unit) {
        this.closeModal();
        this.showAddRecordModal(name, price, unit);
    },

    showAddRecordModal(category, price, unit) {
        const content = `
            <h2>添加记录</h2>
            <div class="modal-form-group">
                <label>产品</label>
                <input type="text" value="${category}" disabled>
            </div>
            <div class="modal-form-group">
                <label>单价</label>
                <input type="text" value="¥${price}/${unit}" disabled>
            </div>
            <div class="modal-form-group">
                <label>数量 *</label>
                <input type="number" id="record-quantity" value="1" step="1" placeholder="请输入数量">
            </div>
            <div class="modal-form-group">
                <label>备注</label>
                <input type="text" id="record-remark" placeholder="请输入备注（选填）">
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                <button class="btn btn-primary" onclick="App.addRecordFromCategory('${category}', ${price}, '${unit}')">添加</button>
            </div>
        `;
        this.showModal(content);
    },

    async addRecordFromCategory(category, price, unit) {
        const quantity = document.getElementById('record-quantity').value;
        const remark = document.getElementById('record-remark').value || '';

        if (!quantity) {
            alert('请输入数量');
            return;
        }

        const amount = (parseFloat(price) * parseFloat(quantity)).toFixed(2);

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
            this.closeModal();
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
                <button class="btn btn-primary" onclick="App.showEditRemarkModal(${recordId}, '')" style="width: 100%;">编辑备注</button>
            </div>
            <div class="modal-buttons" style="margin-top: 10px;">
                <button class="btn btn-primary" onclick="App.deleteRecord(${recordId})" style="width: 100%; background: #ff4d4f;">删除记录</button>
            </div>
            <div class="modal-buttons" style="margin-top: 10px;">
                <button class="btn btn-secondary" onclick="App.closeModal()" style="width: 100%;">取消</button>
            </div>
        `;
        this.showModal(content);
    },

    showEditRemarkModal(recordId, currentRemark) {
        // 保存原始备注，用于比较
        this._originalRemark = currentRemark;
        
        const content = `
            <h2>编辑备注</h2>
            <div class="modal-form-group">
                <label>备注</label>
                <input type="text" id="edit-remark-input" value="${currentRemark}" placeholder="请输入备注">
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                <button class="btn btn-primary" onclick="App.updateRecordRemark(${recordId})">保存</button>
            </div>
        `;
        this.showModal(content);
    },

    async updateRecordRemark(recordId) {
        const newRemark = document.getElementById('edit-remark-input').value || '';
        
        // 检查是否有修改
        if (newRemark === this._originalRemark) {
            this.closeModal();
            return;
        }
        
        // 确认保存
        if (!confirm('确定要保存备注修改吗？')) {
            return;
        }
        
        try {
            await Storage.updateRecord(recordId, { remark: newRemark });
            this.closeModal();
            await this.loadDayData();
        } catch (error) {
            alert('更新备注失败: ' + error.message);
        }
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

        try {
            // 压缩图片
            const compressedFile = await this.compressImage(file);
            await Storage.uploadImage(this.currentNotebook.id, this.currentDate, compressedFile);
            await this.loadImages();
        } catch (error) {
            alert('上传图片失败: ' + error.message);
        }
    },

    compressImage(file) {
        return new Promise((resolve, reject) => {
            const maxWidth = 1920;
            const maxHeight = 1080;
            const quality = 0.7;
            
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    
                    // 计算缩放比例
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.floor(width * ratio);
                        height = Math.floor(height * ratio);
                    }
                    
                    // 创建画布
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // 转换为 Blob
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error('图片压缩失败'));
                            return;
                        }
                        
                        // 创建新的 File 对象
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        
                        resolve(compressedFile);
                    }, 'image/jpeg', quality);
                };
                
                img.onerror = () => {
                    reject(new Error('图片加载失败'));
                };
            };
            
            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };
        });
    },

    async loadImages() {
        if (!this.currentNotebook) return;

        try {
            const images = await Storage.getImages(this.currentNotebook.id, this.currentDate);
            const container = document.getElementById('image-list');
            
            if (!container) {
                console.warn('图片容器未找到');
                return;
            }
            
            if (images.length === 0) {
                container.innerHTML = '';
                return;
            }

            container.innerHTML = images.map(img => `
                <div class="image-item" data-image-id="${img.id}" data-filename="${img.filename}">
                    <img src="/uploads/${img.filename}" alt="单据图片">
                </div>
            `).join('');
            
            // 添加图片事件监听
            this.addImageEvents();
        } catch (error) {
            console.error('加载图片失败:', error);
        }
    },

    addImageEvents() {
        const container = document.getElementById('image-list');
        if (!container) return;
        
        const items = container.querySelectorAll('.image-item');
        items.forEach(item => {
            let longPressTimer = null;
            const imageId = item.dataset.imageId;
            const filename = item.dataset.filename;
            
            // 点击放大
            item.addEventListener('click', (e) => {
                if (!longPressTimer) { // 只有不是长按才放大
                    this.showImagePreview(filename);
                }
                longPressTimer = null;
            });
            
            // 长按删除
            item.addEventListener('mousedown', (e) => {
                longPressTimer = setTimeout(() => {
                    longPressTimer = 'longpress';
                    this.showImageOptions(imageId);
                }, 500);
            });
            
            item.addEventListener('mouseup', () => {
                if (longPressTimer && longPressTimer !== 'longpress') {
                    clearTimeout(longPressTimer);
                }
                longPressTimer = null;
            });
            
            item.addEventListener('mouseleave', () => {
                if (longPressTimer && longPressTimer !== 'longpress') {
                    clearTimeout(longPressTimer);
                }
                longPressTimer = null;
            });
            
            // 移动端触摸事件
            item.addEventListener('touchstart', (e) => {
                longPressTimer = setTimeout(() => {
                    longPressTimer = 'longpress';
                    this.showImageOptions(imageId);
                }, 500);
            });
            
            item.addEventListener('touchend', (e) => {
                if (longPressTimer && longPressTimer !== 'longpress') {
                    clearTimeout(longPressTimer);
                    this.showImagePreview(filename);
                }
                longPressTimer = null;
            });
            
            item.addEventListener('touchmove', () => {
                if (longPressTimer && longPressTimer !== 'longpress') {
                    clearTimeout(longPressTimer);
                }
                longPressTimer = null;
            });
        });
    },

    showImagePreview(filename) {
        const content = `
            <div class="image-preview-modal" onclick="App.closeModal()">
                <img src="/uploads/${filename}" alt="放大图片" style="max-width: 95%; max-height: 95%; border-radius: 10px;">
            </div>
        `;
        this.showModal(content);
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

    async preparePrint() {
        // 先显示选择纸张的弹窗
        const content = `
            <h2>选择打印纸张</h2>
            <div class="modal-form-group">
                <label>纸张尺寸</label>
                <select id="paper-size" style="width: 100%; padding: 12px; border: 2px solid #e8e8e8; border-radius: 10px; font-size: 16px;">
                    <option value="241x93">241mm × 93mm（送货单）</option>
                    <option value="A5">A5（148mm × 210mm）</option>
                </select>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                <button class="btn btn-primary" onclick="App.proceedToPrint()">确定</button>
            </div>
        `;
        this.showModal(content);
    },

    async proceedToPrint() {
        try {
            const paperSize = document.getElementById('paper-size').value;
            const records = await Storage.getRecords(this.currentNotebook.id, this.currentDate);
            const userProfile = await Storage.getUserProfile();
            
            let totalAmount = 0;
            records.forEach(r => {
                totalAmount += parseFloat(r.amount) || 0;
            });
            
            // 转换为中文大写金额
            const capitalAmount = this.convertToChineseCapital(totalAmount);
            
            // 关闭选择弹窗
            this.closeModal();
            
            // 创建打印模板
            const printContent = this.createDeliveryNoteTemplate(
                userProfile,
                records,
                totalAmount,
                capitalAmount,
                paperSize
            );
            
            // 创建临时打印窗口
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>送货单</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: "SimSun", "宋体", sans-serif;
                            font-size: 13px;
                            line-height: 1.4;
                        }
                        
                        .delivery-note {
                            ${paperSize === 'A5' ? 
                                'width: 210mm; min-height: 148mm; padding: 8mm 10mm; display: flex; flex-direction: column;' : 
                                'width: 241mm; height: 93mm; padding: 5mm 10mm; display: flex; flex-direction: column;'
                            }
                            margin: 0 auto;
                        }
                        
                        @media print {
                            .delivery-note {
                                ${paperSize === 'A5' ? 
                                    'width: 210mm; min-height: 148mm; padding: 8mm 10mm;' : 
                                    'width: 241mm; height: 93mm; padding: 5mm 10mm;'
                                }
                            }
                            
                            @page {
                                size: ${paperSize === 'A5' ? 'A5 landscape' : '241mm 93mm landscape'};
                                margin: 0;
                                orientation: landscape;
                            }
                        }
                        
                        .company-name {
                            text-align: center;
                            font-size: ${paperSize === 'A5' ? '22px' : '18px'};
                            font-weight: bold;
                            letter-spacing: 4px;
                            margin-bottom: ${paperSize === 'A5' ? '4px' : '3px'};
                        }
                        
                        .customer-date-row {
                            display: flex;
                            justify-content: space-between;
                            font-size: ${paperSize === 'A5' ? '13px' : '11px'};
                            margin-bottom: ${paperSize === 'A5' ? '4px' : '3px'};
                        }
                        
                        .customer-name, .date {
                            display: flex;
                            align-items: center;
                        }
                        
                        .label {
                            font-weight: bold;
                        }
                        
                        .goods-table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: ${paperSize === 'A5' ? '12px' : '11px'};
                            flex: 1;
                        }
                        
                        .table-header th {
                            border: 1px solid #000;
                            padding: ${paperSize === 'A5' ? '3px 2px' : '2px 2px'};
                            text-align: center;
                            background: #f5f5f5;
                            font-weight: bold;
                        }
                        
                        .goods-row td {
                            border: 1px solid #000;
                            padding: ${paperSize === 'A5' ? '3px 2px' : '2px 2px'};
                            text-align: center;
                            height: ${paperSize === 'A5' ? '18px' : '12px'};
                            min-height: ${paperSize === 'A5' ? '18px' : '12px'};
                            line-height: ${paperSize === 'A5' ? '12px' : '8px'};
                            vertical-align: middle;
                        }
                        
                        .total-row td {
                            border: 1px solid #000;
                            padding: ${paperSize === 'A5' ? '3px 2px' : '2px 2px'};
                            height: ${paperSize === 'A5' ? '18px' : '12px'};
                            min-height: ${paperSize === 'A5' ? '18px' : '12px'};
                            line-height: ${paperSize === 'A5' ? '12px' : '8px'};
                            vertical-align: middle;
                        }
                        
                        .total-capital-cell {
                            text-align: left;
                            font-weight: bold;
                        }
                        
                        .total-small-cell {
                            text-align: right;
                            font-weight: bold;
                        }
                        
                        .col-no { width: 8%; }
                        .col-name { width: 32%; }
                        .col-unit { width: 10%; }
                        .col-quantity { width: 10%; }
                        .col-price { width: 13%; }
                        .col-amount { width: 14%; }
                        .col-remark { width: 13%; }
                        
                        .signature-section {
                            display: flex;
                            justify-content: space-between;
                            margin-top: auto;
                            padding-top: ${paperSize === 'A5' ? '4px' : '3px'};
                            font-size: ${paperSize === 'A5' ? '11px' : '10px'};
                        }
                        
                        .signature-item {
                            text-align: center;
                        }
                        
                        .signature-line {
                            border-bottom: 1px solid #000;
                            width: ${paperSize === 'A5' ? '90px' : '70px'};
                            margin: 0 auto 2px;
                        }
                        
                        .signature-label {
                            font-size: ${paperSize === 'A5' ? '11px' : '10px'};
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                }, 300);
            };
            
        } catch (error) {
            alert('准备打印失败: ' + error.message);
        }
    },
    
    createDeliveryNoteTemplate(userProfile, records, totalAmount, capitalAmount, paperSize) {
        const date = new Date(this.currentDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        const companyName = userProfile.companyName || '送货单位';
        const customerName = document.getElementById('customer-name').value || '';
        
        // 根据纸张尺寸确定显示的最大行数
        const maxRows = paperSize === 'A5' ? 16 : 9;
        
        let goodsRows = '';
        records.forEach((r, index) => {
            if (index < maxRows) {
                goodsRows += `
                    <tr class="goods-row">
                        <td class="col-no">${index + 1}</td>
                        <td class="col-name">${r.category}</td>
                        <td class="col-unit">${r.unit}</td>
                        <td class="col-quantity">${r.quantity}</td>
                        <td class="col-price">${r.price}</td>
                        <td class="col-amount">${r.amount}</td>
                        <td class="col-remark">${r.remark || ''}</td>
                    </tr>
                `;
            }
        });
        
        // 如果记录不足，填充空行
        const emptyRows = Math.max(0, maxRows - records.length);
        for (let i = 0; i < emptyRows; i++) {
            goodsRows += `
                <tr class="goods-row">
                    <td class="col-no">&nbsp;</td>
                    <td class="col-name">&nbsp;</td>
                    <td class="col-unit">&nbsp;</td>
                    <td class="col-quantity">&nbsp;</td>
                    <td class="col-price">&nbsp;</td>
                    <td class="col-amount">&nbsp;</td>
                    <td class="col-remark">&nbsp;</td>
                </tr>
            `;
        }
        
        return `
            <div class="delivery-note">
                <div class="company-name">${companyName}</div>
                
                <div class="customer-date-row">
                    <div class="customer-name">
                        <span class="label">客户名称：</span>
                        <span>${customerName}</span>
                    </div>
                    <div class="date">
                        <span class="label">日期：</span>
                        <span>${year}年${month}月${day}日</span>
                    </div>
                </div>
                
                <table class="goods-table">
                    <thead>
                        <tr class="table-header">
                            <th class="col-no">序号</th>
                            <th class="col-name">产品名称</th>
                            <th class="col-unit">单位</th>
                            <th class="col-quantity">数量</th>
                            <th class="col-price">单价</th>
                            <th class="col-amount">金额</th>
                            <th class="col-remark">备注</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${goodsRows}
                        <tr class="total-row">
                            <td colspan="5" class="total-capital-cell">合计（大写）：${capitalAmount}</td>
                            <td colspan="2" class="total-small-cell">¥${totalAmount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="signature-section">
                    <div class="signature-item">
                        <div class="signature-line"></div>
                        <div class="signature-label">送货单位（签章）</div>
                    </div>
                    <div class="signature-item">
                        <div class="signature-line"></div>
                        <div class="signature-label">收货单位（签章）</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    convertToChineseCapital(num) {
        const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
        const units = ['', '拾', '佰', '仟'];
        const bigUnits = ['', '万', '亿'];
        
        if (num === 0) return '零元整';
        
        // 处理整数部分
        let intPart = Math.floor(num);
        let intStr = '';
        
        let unitIndex = 0;
        while (intPart > 0) {
            let part = intPart % 10000;
            let partStr = '';
            
            let zeroFlag = true;
            for (let i = 0; i < 4; i++) {
                let digit = part % 10;
                part = Math.floor(part / 10);
                
                if (digit === 0) {
                    if (!zeroFlag) {
                        partStr = '零' + partStr;
                        zeroFlag = true;
                    }
                } else {
                    partStr = digits[digit] + units[i] + partStr;
                    zeroFlag = false;
                }
            }
            
            if (partStr !== '') {
                intStr = partStr + bigUnits[unitIndex] + intStr;
            }
            unitIndex++;
            intPart = Math.floor(intPart / 10000);
        }
        
        if (intStr === '') intStr = '零';
        intStr += '元';
        
        // 处理小数部分
        let decPart = Math.round((num - Math.floor(num)) * 100);
        let decStr = '';
        
        if (decPart === 0) {
            decStr = '整';
        } else {
            let jiao = Math.floor(decPart / 10);
            let fen = decPart % 10;
            
            if (jiao > 0) {
                decStr += digits[jiao] + '角';
            }
            if (fen > 0) {
                decStr += digits[fen] + '分';
            }
        }
        
        return intStr + decStr;
    },

    showModal(content) {
        const modal = document.getElementById('modal');
        modal.querySelector('#modal-content').innerHTML = content;
        document.getElementById('modal-overlay').classList.add('active');
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});