const App = {
    currentUser: null,
    currentNotebook: null,
    currentDate: new Date().toISOString().split('T')[0],

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
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        document.getElementById('register-btn').addEventListener('click', () => {
            this.showRegisterModal();
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
        return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 + (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 + (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    },

    loadTheme() {
        const savedColor = localStorage.getItem('zhangben_theme_color');
        if (savedColor) {
            this.applyTheme(savedColor);
        }
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

    showSettingsModal() {
        const info = this.getCompanyInfo();
        const content = `
            <h2>销售方设置</h2>
            <div class="modal-form-group">
                <label>公司名称</label>
                <input type="text" id="settings-company-name" value="${info.name}" placeholder="请输入公司名称">
            </div>
            <div class="modal-form-group">
                <label>公司电话</label>
                <input type="tel" id="settings-company-phone" value="${info.phone}" placeholder="请输入公司电话">
            </div>
            <div class="modal-form-group">
                <label>公司地址</label>
                <input type="text" id="settings-company-address" value="${info.address}" placeholder="请输入公司地址">
            </div>
            <div class="modal-form-group">
                <label>微信号</label>
                <input type="text" id="settings-company-wechat" value="${info.wechat}" placeholder="请输入微信号">
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                <button class="btn btn-primary" onclick="App.saveSettings()">保存</button>
            </div>
        `;
        this.showModal(content);
    },

    saveSettings() {
        const info = {
            name: document.getElementById('settings-company-name').value.trim(),
            phone: document.getElementById('settings-company-phone').value.trim(),
            address: document.getElementById('settings-company-address').value.trim(),
            wechat: document.getElementById('settings-company-wechat').value.trim()
        };
        localStorage.setItem('zhangben_company_info', JSON.stringify(info));
        this.loadCompanyInfoToBill();
        this.closeModal();
    },

    getCompanyInfo() {
        const infoStr = localStorage.getItem('zhangben_company_info');
        if (infoStr) {
            return JSON.parse(infoStr);
        }
        return { name: '', phone: '', address: '', wechat: '' };
    },

    loadCompanyInfoToBill() {
        const info = this.getCompanyInfo();
        document.getElementById('company-name').value = info.name || '';
        document.getElementById('company-phone').value = info.phone || '';
        document.getElementById('company-address').value = info.address || '';
        document.getElementById('company-wechat').value = info.wechat || '';
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

    saveCustomerInfo() {
        if (!this.currentUser || !this.currentNotebook) return;
        
        const info = {
            name: document.getElementById('customer-name').value,
            phone: document.getElementById('customer-phone').value,
            address: document.getElementById('customer-address').value,
            contact: document.getElementById('customer-contact').value
        };
        localStorage.setItem(`zhangben_customer_${this.currentUser}_${this.currentNotebook.id}`, JSON.stringify(info));
    },

    loadCustomerInfo() {
        if (!this.currentUser || !this.currentNotebook) return;
        
        const infoStr = localStorage.getItem(`zhangben_customer_${this.currentUser}_${this.currentNotebook.id}`);
        if (infoStr) {
            const info = JSON.parse(infoStr);
            document.getElementById('customer-name').value = info.name || '';
            document.getElementById('customer-phone').value = info.phone || '';
            document.getElementById('customer-address').value = info.address || '';
            document.getElementById('customer-contact').value = info.contact || '';
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

    checkLogin() {
        const user = Storage.getCurrentUser();
        if (user) {
            this.currentUser = user;
            this.showPage('home-page');
            this.loadNotebooks();
            const info = this.getCompanyInfo();
            if (!info.name && !info.phone && !info.address && !info.wechat) {
                setTimeout(() => {
                    this.showSettingsModal();
                }, 500);
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

    login() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        const users = Storage.getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            this.currentUser = username;
            Storage.setCurrentUser(username);
            this.showPage('home-page');
            this.loadNotebooks();
            const info = this.getCompanyInfo();
            if (!info.name && !info.phone && !info.address && !info.wechat) {
                setTimeout(() => {
                    this.showSettingsModal();
                }, 500);
            }
        } else {
            alert('用户名或密码错误');
        }
    },

    showRegisterModal() {
        const content = `
            <h2>注册</h2>
            <div class="modal-form-group">
                <label>用户名</label>
                <input type="text" id="reg-username" placeholder="请输入用户名">
            </div>
            <div class="modal-form-group">
                <label>密码</label>
                <input type="password" id="reg-password" placeholder="请输入密码">
            </div>
            <div class="modal-form-group">
                <label>确认密码</label>
                <input type="password" id="reg-password-confirm" placeholder="请再次输入密码">
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                <button class="btn btn-primary" onclick="App.register()">注册</button>
            </div>
        `;
        this.showModal(content);
    },

    register() {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-password-confirm').value;

        if (!username) {
            alert('请输入用户名');
            return;
        }

        if (!password) {
            alert('请输入密码');
            return;
        }

        if (password !== confirmPassword) {
            alert('两次密码输入不一致');
            return;
        }

        const users = Storage.getUsers();
        if (users.find(u => u.username === username)) {
            alert('用户名已存在');
            return;
        }

        users.push({ username, password });
        Storage.saveUsers(users);
        alert('注册成功');
        this.closeModal();
    },

    logout() {
        Storage.clearCurrentUser();
        this.currentUser = null;
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        this.showPage('login-page');
    },

    loadNotebooks() {
        document.getElementById('current-user').textContent = this.currentUser;
        const notebooks = Storage.getNotebooks(this.currentUser);
        const list = document.getElementById('notebook-list');

        if (notebooks.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7); margin-top: 30px;">暂无账本，请点击创建</p>';
            return;
        }

        list.innerHTML = notebooks.map(nb => `
            <div class="notebook-item" data-id="${nb.id}" onclick="App.openNotebook('${nb.id}')">
                <h3>${nb.name}</h3>
                <p style="color: #999; font-size: 12px; margin-top: 5px;">创建于：${new Date(nb.createdAt).toLocaleDateString()}</p>
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

    createNotebook() {
        const name = document.getElementById('notebook-name').value.trim();
        if (!name) {
            alert('请输入账本名称');
            return;
        }

        const notebook = {
            id: Date.now().toString(),
            name,
            createdAt: new Date().toISOString()
        };

        Storage.saveNotebook(this.currentUser, notebook);
        this.closeModal();
        this.loadNotebooks();
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
                <button class="btn btn-primary" onclick="App.calculateStatistics('${notebookId}')">确认统计</button>
            </div>
        `;
        this.showModal(content);
    },

    calculateStatistics(notebookId) {
        const startDate = document.getElementById('stat-start-date').value;
        const endDate = document.getElementById('stat-end-date').value;

        if (!startDate || !endDate) {
            alert('请选择开始和结束日期');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            alert('开始日期不能大于结束日期');
            return;
        }

        let totalAmount = 0;
        const dailyTotals = [];

        const current = new Date(start);
        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            const records = Storage.getRecords(this.currentUser, notebookId, dateStr);
            
            const dayTotal = records.reduce((sum, record) => sum + (parseFloat(record.amount) || 0), 0);
            
            if (dayTotal > 0) {
                dailyTotals.push({
                    date: dateStr,
                    amount: dayTotal
                });
                totalAmount += dayTotal;
            }

            current.setDate(current.getDate() + 1);
        }

        let detailsHtml = dailyTotals.map(d => `
            <div style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; display: flex; justify-content: space-between;">
                <span>${d.date}</span>
                <span style="font-weight: bold;">${d.amount.toFixed(2)}元</span>
            </div>
        `).join('');

        const content = `
            <h2>统计结果</h2>
            <div style="max-height: 300px; overflow-y: auto; margin-bottom: 15px;">
                ${dailyTotals.length > 0 ? detailsHtml : '<p style="text-align: center; color: #999;">此期间无账单记录</p>'}
            </div>
            <div style="text-align: right; font-size: 18px; font-weight: bold; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                总计：${totalAmount.toFixed(2)}元
            </div>
            <div class="modal-buttons" style="margin-top: 15px;">
                <button class="btn btn-secondary" onclick="App.closeModal()" style="width: 100%;">返回</button>
            </div>
        `;
        this.showModal(content);
    },

    deleteNotebook(notebookId) {
        if (confirm('确定要删除此账本吗？此操作不可恢复。')) {
            Storage.deleteNotebook(this.currentUser, notebookId);
            this.closeModal();
            this.loadNotebooks();
        }
    },

    openNotebook(notebookId) {
        const notebook = Storage.getNotebook(this.currentUser, notebookId);
        if (!notebook) return;

        this.currentNotebook = notebook;
        document.getElementById('notebook-title-display').textContent = notebook.name;

        document.getElementById('date-picker').value = this.currentDate;

        document.getElementById('company-name').readOnly = true;
        document.getElementById('company-phone').readOnly = true;
        document.getElementById('company-address').readOnly = true;
        document.getElementById('company-wechat').readOnly = true;

        this.showPage('notebook-page');
        this.loadCompanyInfoToBill();
        this.loadCustomerInfo();
        this.loadDayData();
        
        document.getElementById('bill-no').textContent = this.generateBillNo();
    },

    loadDayData() {
        this.loadRecords();
        this.loadImages();
        document.getElementById('bill-no').textContent = this.generateBillNo();
    },

    loadRecords() {
        const records = Storage.getRecords(this.currentUser, this.currentNotebook.id, this.currentDate);
        const tbody = document.getElementById('bill-records-tbody');

        if (records.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="padding: 30px; color: #999;">暂无记录，请点击添加记录</td>
                </tr>
            `;
        } else {
            tbody.innerHTML = records.map((record, index) => `
                <tr data-index="${index}">
                    <td class="col-product">${record.category}</td>
                    <td class="col-price">${record.price}元</td>
                    <td class="col-unit">${record.unit}</td>
                    <td class="col-quantity quantity-cell" onclick="App.showQuantityModal(${index})">${record.quantity || '-'}</td>
                    <td class="col-amount">${record.amount ? record.amount + '元' : '-'}</td>
                    <td class="col-remark">${record.remark || '-'}</td>
                </tr>
            `).join('');

            tbody.querySelectorAll('tr').forEach(tr => {
                let pressTimer;
                tr.addEventListener('mousedown', (e) => {
                    if (e.target.closest('.quantity-cell')) return;
                    pressTimer = setTimeout(() => {
                        this.showRecordOptions(parseInt(tr.dataset.index));
                    }, 800);
                });

                tr.addEventListener('mouseup', () => {
                    clearTimeout(pressTimer);
                });

                tr.addEventListener('touchstart', (e) => {
                    if (e.target.closest('.quantity-cell')) return;
                    pressTimer = setTimeout(() => {
                        this.showRecordOptions(parseInt(tr.dataset.index));
                    }, 800);
                });

                tr.addEventListener('touchend', () => {
                    clearTimeout(pressTimer);
                });
            });
        }

        this.calculateTotal();
    },

    calculateTotal() {
        const records = Storage.getRecords(this.currentUser, this.currentNotebook.id, this.currentDate);
        let total = 0;
        records.forEach(record => {
            total += parseFloat(record.amount) || 0;
        });
        document.getElementById('total-amount').textContent = total.toFixed(2);
        document.getElementById('total-amount-cn').textContent = this.convertToChineseCapital(total);
    },

    preparePrint() {
        const companyName = document.getElementById('company-name').value || '（未填写）';
        const companyPhone = document.getElementById('company-phone').value || '';
        const companyAddress = document.getElementById('company-address').value || '';
        const companyWechat = document.getElementById('company-wechat').value || '';

        const customerName = this.currentNotebook ? this.currentNotebook.name : '（未填写）';
        const customerPhone = document.getElementById('customer-phone').value || '';
        const customerAddress = document.getElementById('customer-address').value || '';

        const billNo = document.getElementById('bill-no').textContent;
        const dateStr = document.getElementById('date-picker').value;

        const records = Storage.getRecords(this.currentUser, this.currentNotebook.id, this.currentDate);
        const total = records.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

        const toChineseCapital = (num) => {
            const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
            const units = ['', '拾', '佰', '仟', '万'];
            if (num === 0) return '零元整';
            let result = '';
            const intPart = Math.floor(num);
            const intStr = intPart.toString();
            for (let i = 0; i < intStr.length; i++) {
                const digit = parseInt(intStr[i]);
                const unitIndex = intStr.length - 1 - i;
                if (digit !== 0) {
                    result += digits[digit] + units[unitIndex % 4];
                    if (unitIndex === 4) result += '万';
                }
            }
            return result + '元' + (num % 1 === 0 ? '整' : '');
        };

        // 分页：每页18条
        const maxPerPage = 18;
        const pages = [];
        for (let i = 0; i < records.length; i += maxPerPage) {
            pages.push(records.slice(i, i + maxPerPage));
        }

        const customerSection = (customerName || customerPhone || customerAddress)
            ? `<div style="border-bottom:1px solid #000;padding:4px 0;margin-bottom:6px;font-size:8pt;">
                ${customerName ? `<div>客户：${customerName}</div>` : ''}
                ${customerPhone ? `<div>电话：${customerPhone}</div>` : ''}
                ${customerAddress ? `<div>地址：${customerAddress}</div>` : ''}
               </div>` : '';

        let pagesHtml = '';
        pages.forEach((pageRecords, pageIndex) => {
            const isLastPage = pageIndex === pages.length - 1;
            const startIndex = pageIndex * maxPerPage;

            const recordsHtml = pageRecords.map((record, idx) => `
                <tr>
                    <td style="width:8%;text-align:center;border:1px solid #000;padding:2px;font-size:8pt;">${startIndex + idx + 1}</td>
                    <td style="width:30%;text-align:left;border:1px solid #000;padding:2px;font-size:8pt;">${record.category}</td>
                    <td style="width:12%;text-align:center;border:1px solid #000;padding:2px;font-size:8pt;">${record.price}</td>
                    <td style="width:10%;text-align:center;border:1px solid #000;padding:2px;font-size:8pt;">${record.unit}</td>
                    <td style="width:15%;text-align:center;border:1px solid #000;padding:2px;font-size:8pt;">${record.quantity || '-'}</td>
                    <td style="width:15%;text-align:right;border:1px solid #000;padding:2px;font-size:8pt;">${(parseFloat(record.amount) || 0).toFixed(2)}</td>
                </tr>
            `).join('');

            const pageHtml = `
                <div style="page-break-after: ${isLastPage ? 'avoid' : 'always'}; width: 190mm; height: calc(100vh - 10mm); position: relative; padding: 5mm; padding-bottom: 40px; box-sizing: border-box;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 4px;">
                        <div>
                            <div style="font-size: 11pt; font-weight: bold;">${companyName}</div>
                            <div style="font-size: 7pt; color: #333;">${[companyPhone, companyAddress].filter(Boolean).join(' ')}</div>
                        </div>
                        <div style="font-size: 14pt; font-weight: bold; text-align: center;">送货单</div>
                        <div style="text-align: right; font-size: 8pt;">
                            <div>No. ${billNo}</div>
                            <div>${dateStr}</div>
                        </div>
                    </div>
                    ${customerSection}
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 4px;">
                        <thead>
                            <tr>
                                <th style="width:8%;background:#f0f0f0;border:1px solid #000;padding:2px;font-size:8pt;">序</th>
                                <th style="width:30%;background:#f0f0f0;border:1px solid #000;padding:2px;font-size:8pt;">产品名称</th>
                                <th style="width:12%;background:#f0f0f0;border:1px solid #000;padding:2px;font-size:8pt;">单价</th>
                                <th style="width:10%;background:#f0f0f0;border:1px solid #000;padding:2px;font-size:8pt;">单位</th>
                                <th style="width:15%;background:#f0f0f0;border:1px solid #000;padding:2px;font-size:8pt;">数量</th>
                                <th style="width:15%;background:#f0f0f0;border:1px solid #000;padding:2px;font-size:8pt;">金额</th>
                            </tr>
                        </thead>
                        <tbody>${recordsHtml}</tbody>
                    </table>
                    ${isLastPage ? `
                        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-top: 1px solid #000; font-weight: bold; position: absolute; bottom: 25px; left: 5mm; right: 5mm;">
                            <div>合计（大写）：${toChineseCapital(total)}</div>
                            <div>¥ ${total.toFixed(2)}</div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 8pt; position: absolute; bottom: 0; left: 5mm; right: 5mm;">
                            <div>发货人签字：___________ &nbsp;&nbsp;&nbsp;收货人签字：___________</div>
                            <div>${companyWechat ? '微信：' + companyWechat : ''}</div>
                        </div>
                    ` : ''}
                </div>
            `;
            pagesHtml += pageHtml;
        });

        const printHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>打印送货单</title>
<style>
html, body { height: auto; margin: 0; padding: 0; font-family: 'SimSun', '宋体', serif; font-size: 8pt; }
body { padding: 5mm; display: flex; justify-content: center; flex-direction: column; align-items: center; }
@page { size: A5 landscape; margin: 0; }
</style>
</head>
<body>
${pagesHtml}
</body>
</html>`;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(printHtml);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        } else {
            alert('请允许弹出窗口以便打印');
        }
    },

    showCategoryListModal() {
        const categories = Storage.getCategories(this.currentUser, this.currentNotebook.id);

        let categoriesHtml = categories.map((cat, index) => `
            <div class="category-item" onclick="App.addCategoryToRecord(${index})">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: bold;">${cat.name}</span>
                    <span onclick="event.stopPropagation(); App.deleteCategory(${index})" style="color: #ff4d4f; cursor: pointer; padding: 5px;">🗑️</span>
                </div>
                <div style="color: #999; font-size: 12px;">单价：${cat.price}元/${cat.unit}</div>
            </div>
        `).join('');

        const content = `
            <h2>选择产品</h2>
            <div class="category-list">
                ${categories.length > 0 ? categoriesHtml : '<p style="text-align: center; color: #999; padding: 20px;">暂无产品，请先添加</p>'}
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.showAddCategoryModal()">添加产品</button>
                <button class="btn btn-primary" onclick="App.closeModal()">取消</button>
            </div>
        `;
        this.showModal(content);
    },

    deleteCategory(index) {
        if (!confirm('确定要删除这个产品吗？')) return;

        const categories = Storage.getCategories(this.currentUser, this.currentNotebook.id);
        categories.splice(index, 1);
        Storage.saveCategories(this.currentUser, this.currentNotebook.id, categories);
        this.closeModal();
        this.showCategoryListModal();
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
                <input type="text" id="category-unit" placeholder="请输入单位，如：斤、箱、个">
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消创建</button>
                <button class="btn btn-primary" onclick="App.addCategory()">确认</button>
            </div>
        `;
        this.showModal(content);
    },

    addCategory() {
        const name = document.getElementById('category-name').value.trim();
        const price = document.getElementById('category-price').value;
        const unit = document.getElementById('category-unit').value.trim();

        if (!name) {
            alert('请输入产品名称');
            return;
        }

        if (!price || parseFloat(price) <= 0) {
            alert('请输入有效的单价');
            return;
        }

        if (!unit) {
            alert('请输入单位');
            return;
        }

        const categories = Storage.getCategories(this.currentUser, this.currentNotebook.id);
        categories.push({
            name,
            price: parseFloat(price),
            unit: unit
        });

        Storage.saveCategories(this.currentUser, this.currentNotebook.id, categories);
        this.closeModal();
        this.showCategoryListModal();
    },

    addCategoryToRecord(categoryIndex) {
        const categories = Storage.getCategories(this.currentUser, this.currentNotebook.id);
        const category = categories[categoryIndex];

        const records = Storage.getRecords(this.currentUser, this.currentNotebook.id, this.currentDate);
        records.push({
            category: category.name,
            price: category.price,
            unit: category.unit,
            quantity: '',
            amount: '',
            remark: ''
        });

        Storage.saveRecords(this.currentUser, this.currentNotebook.id, this.currentDate, records);
        this.closeModal();
        this.loadRecords();
    },

    showQuantityModal(recordIndex) {
        const records = Storage.getRecords(this.currentUser, this.currentNotebook.id, this.currentDate);
        const record = records[recordIndex];
        
        const content = `
            <h2>输入数量</h2>
            <div class="modal-form-group">
                <label>数量（单位：${record.unit}）</label>
                <input type="number" id="quantity-value" placeholder="请输入数量" step="0.01">
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                <button class="btn btn-primary" onclick="App.saveQuantity(${recordIndex})">确定</button>
            </div>
        `;
        this.showModal(content);
    },

    saveQuantity(recordIndex) {
        const quantity = document.getElementById('quantity-value').value;

        if (!quantity || parseFloat(quantity) <= 0) {
            alert('请输入有效的数量');
            return;
        }

        const records = Storage.getRecords(this.currentUser, this.currentNotebook.id, this.currentDate);
        const record = records[recordIndex];
        record.quantity = quantity + record.unit;
        record.amount = (record.price * parseFloat(quantity)).toFixed(2);

        Storage.saveRecords(this.currentUser, this.currentNotebook.id, this.currentDate, records);
        this.closeModal();
        this.loadRecords();
    },

    showRecordOptions(recordIndex) {
        const content = `
            <h2>记录选项</h2>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.deleteRecord(${recordIndex})" style="width: 100%; background: #ff4d4f;">删除记录</button>
            </div>
            <div class="modal-buttons" style="margin-top: 10px;">
                <button class="btn btn-secondary" onclick="App.closeModal()" style="width: 100%;">取消</button>
            </div>
        `;
        this.showModal(content);
    },

    deleteRecord(recordIndex) {
        if (confirm('确定要删除此记录吗？')) {
            const records = Storage.getRecords(this.currentUser, this.currentNotebook.id, this.currentDate);
            records.splice(recordIndex, 1);
            Storage.saveRecords(this.currentUser, this.currentNotebook.id, this.currentDate, records);
            this.closeModal();
            this.loadRecords();
        }
    },

    loadImages() {
        const images = Storage.getImages(this.currentUser, this.currentNotebook.id, this.currentDate);
        const container = document.getElementById('image-list');

        if (images.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = images.map((img, index) => `
            <div class="image-item" data-index="${index}">
                <img src="${img}" onclick="App.previewImage('${img}')" alt="账单图片">
            </div>
        `).join('');

        container.querySelectorAll('.image-item').forEach(item => {
            let pressTimer;
            item.addEventListener('mousedown', () => {
                pressTimer = setTimeout(() => {
                    this.showImageOptions(parseInt(item.dataset.index));
                }, 800);
            });

            item.addEventListener('mouseup', () => {
                clearTimeout(pressTimer);
            });

            item.addEventListener('touchstart', () => {
                pressTimer = setTimeout(() => {
                    this.showImageOptions(parseInt(item.dataset.index));
                }, 800);
            });

            item.addEventListener('touchend', () => {
                clearTimeout(pressTimer);
            });
        });
    },

    showImageUploadOptions() {
        const content = `
            <h2>上传图片</h2>
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="App.triggerImageUpload()" style="width: 100%;">选择照片</button>
            </div>
            <div class="modal-buttons" style="margin-top: 10px;">
                <button class="btn btn-secondary" onclick="App.closeModal()" style="width: 100%;">取消</button>
            </div>
        `;
        this.showModal(content);
    },

    triggerImageUpload() {
        this.closeModal();
        document.getElementById('image-input').click();
    },

    handleImageUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const images = Storage.getImages(this.currentUser, this.currentNotebook.id, this.currentDate);
            if (images.length >= 5) {
                alert('最多只能上传5张图片');
                return;
            }

            this.compressImage(e.target.result, (compressedDataUrl) => {
                images.push(compressedDataUrl);
                Storage.saveImages(this.currentUser, this.currentNotebook.id, this.currentDate, images);
                this.loadImages();
            });
        };
        reader.onerror = () => {
            alert('图片读取失败，请尝试其他图片');
        };
        reader.readAsDataURL(file);
    },

    compressImage(dataUrl, callback) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxWidth = 1200;
            const maxHeight = 1200;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            callback(compressedDataUrl);
        };
        img.src = dataUrl;
    },

    previewImage(imageSrc) {
        const preview = document.createElement('div');
        preview.className = 'image-preview-modal';
        preview.innerHTML = `<img src="${imageSrc}" onclick="this.parentElement.remove()">`;
        preview.onclick = (e) => {
            if (e.target === preview) {
                preview.remove();
            }
        };
        document.body.appendChild(preview);
    },

    showImageOptions(imageIndex) {
        const content = `
            <h2>图片选项</h2>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="App.deleteImage(${imageIndex})" style="width: 100%; background: #ff4d4f;">删除图片</button>
            </div>
            <div class="modal-buttons" style="margin-top: 10px;">
                <button class="btn btn-secondary" onclick="App.closeModal()" style="width: 100%;">取消</button>
            </div>
        `;
        this.showModal(content);
    },

    deleteImage(imageIndex) {
        if (confirm('确定要删除此图片吗？')) {
            const images = Storage.getImages(this.currentUser, this.currentNotebook.id, this.currentDate);
            images.splice(imageIndex, 1);
            Storage.saveImages(this.currentUser, this.currentNotebook.id, this.currentDate, images);
            this.closeModal();
            this.loadImages();
        }
    },

    showModal(content) {
        document.getElementById('modal-content').innerHTML = content;
        document.getElementById('modal-overlay').classList.add('active');
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
