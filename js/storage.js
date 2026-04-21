const Storage = {
    getUsers() {
        const users = localStorage.getItem('zhangben_users');
        return users ? JSON.parse(users) : [];
    },

    saveUsers(users) {
        localStorage.setItem('zhangben_users', JSON.stringify(users));
    },

    getCurrentUser() {
        return localStorage.getItem('zhangben_current_user');
    },

    setCurrentUser(username) {
        localStorage.setItem('zhangben_current_user', username);
    },

    clearCurrentUser() {
        localStorage.removeItem('zhangben_current_user');
    },

    getNotebooks(username) {
        const notebooks = localStorage.getItem(`zhangben_notebooks_${username}`);
        return notebooks ? JSON.parse(notebooks) : [];
    },

    saveNotebooks(username, notebooks) {
        localStorage.setItem(`zhangben_notebooks_${username}`, JSON.stringify(notebooks));
    },

    getNotebook(username, notebookId) {
        const notebooks = this.getNotebooks(username);
        return notebooks.find(nb => nb.id === notebookId);
    },

    saveNotebook(username, notebook) {
        const notebooks = this.getNotebooks(username);
        const index = notebooks.findIndex(nb => nb.id === notebook.id);
        if (index >= 0) {
            notebooks[index] = notebook;
        } else {
            notebooks.push(notebook);
        }
        this.saveNotebooks(username, notebooks);
    },

    deleteNotebook(username, notebookId) {
        const notebooks = this.getNotebooks(username);
        const filtered = notebooks.filter(nb => nb.id !== notebookId);
        this.saveNotebooks(username, filtered);
    },

    getCategories(username, notebookId) {
        const categories = localStorage.getItem(`zhangben_categories_${username}_${notebookId}`);
        return categories ? JSON.parse(categories) : [];
    },

    saveCategories(username, notebookId, categories) {
        localStorage.setItem(`zhangben_categories_${username}_${notebookId}`, JSON.stringify(categories));
    },

    getRecords(username, notebookId, date) {
        const records = localStorage.getItem(`zhangben_records_${username}_${notebookId}_${date}`);
        return records ? JSON.parse(records) : [];
    },

    saveRecords(username, notebookId, date, records) {
        localStorage.setItem(`zhangben_records_${username}_${notebookId}_${date}`, JSON.stringify(records));
    },

    getImages(username, notebookId, date) {
        const images = localStorage.getItem(`zhangben_images_${username}_${notebookId}_${date}`);
        return images ? JSON.parse(images) : [];
    },

    saveImages(username, notebookId, date, images) {
        localStorage.setItem(`zhangben_images_${username}_${notebookId}_${date}`, JSON.stringify(images));
    },

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
