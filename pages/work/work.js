// 引入API服务
const {
    api
} = require('../../utils/app');

Page({
    data: {
        // 搜索条件
        searchKeyword: '', // 产品型号/批次号搜索关键词
        // 日期筛选
        startDate: '', // 开始日期
        endDate: '', // 结束日期
        // 分页参数
        currentPage: 1,
        pageSize: 10, // 每页10条
        total: 0,
        totalPages: 1,
        // 数据
        workList: [],
        isLoading: false,
        hasSearchCondition: false, // 是否有查询条件
        // 防抖相关
        searchTimer: null,
        // 编辑弹窗相关
        showEditModal: false, // 编辑弹窗显示状态
        editFormData: {
            id: '', //检查表id
            model: '', // 产品型号
            sbh: '', // 设备号
            pch: '', // 批次号
        }
    },

    onLoad() {
        // 页面加载时设置默认日期（今天）
        this.setToday();
    },

    onShow() {
        // 页面显示时刷新数据
        if (this.data.hasSearchCondition) {
            this.handleSearch();
        }
    },

    // 设置今天为默认日期
    setToday() {
        const today = this.formatDate(new Date());
        this.setData({
            startDate: today,
            endDate: today,
            currentPage: 1
        }, () => {
            this.handleSearch();
        });
    },

    // 设置近一周
    setLastWeek() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        this.setData({
            startDate: this.formatDate(startDate),
            endDate: this.formatDate(endDate),
            currentPage: 1
        }, () => {
            this.handleSearch();
        });
    },

    // 设置近一月
    setLastMonth() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);

        this.setData({
            startDate: this.formatDate(startDate),
            endDate: this.formatDate(endDate),
            currentPage: 1
        }, () => {
            this.handleSearch();
        });
    },

    // 清空日期
    clearDates() {
        this.setData({
            startDate: '',
            endDate: '',
            currentPage: 1,
            hasSearchCondition: false,
            workList: []
        });
    },

    // 格式化日期
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // 输入事件处理
    onKeywordInput(e) {
        this.debounceSearch('searchKeyword', e.detail.value);
    },

    // 日期选择变化
    onStartDateChange(e) {
        this.setData({
            startDate: e.detail.value,
            currentPage: 1
        }, () => {
            this.handleSearch();
        });
    },

    onEndDateChange(e) {
        this.setData({
            endDate: e.detail.value,
            currentPage: 1
        }, () => {
            this.handleSearch();
        });
    },

    // 防抖处理
    debounceSearch(field, value) {
        if (this.data.searchTimer) {
            clearTimeout(this.data.searchTimer);
        }

        const timer = setTimeout(() => {
            this.setData({
                [field]: value.trim(),
                currentPage: 1
            }, () => {
                this.handleSearch();
            });
        }, 500);

        this.setData({
            searchTimer: timer
        });
    },

    // 执行查询
    handleSearch() {
        const {
            startDate,
            endDate
        } = this.data;
        // 验证日期条件
        if (!startDate || !endDate) {
            wx.showToast({
                title: '请选择日期范围',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        // 验证日期合理性
        if (startDate > endDate) {
            wx.showToast({
                title: '开始日期不能晚于结束日期',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        this.setData({
            isLoading: true,
            hasSearchCondition: true
        });
        this.loadData();
    },

    // 加载数据
    loadData() {
        // 显示加载状态
        wx.showLoading({
            title: '查询中...',
            mask: true
        });
        const userInfo = wx.getStorageSync('userInfo');
        console.log("当前用户:", userInfo);
        // 构造符合结构的对象
        const params = {
            "filter": {
                "pch": this.data.searchKeyword,
                "jyy": {
                    id: userInfo ? userInfo.id : '1234567899876543241'
                }
            },
            "page": {
                "pageNum": this.data.currentPage,
                "pageSize": this.data.pageSize
            }
        };
        //  调用后台接口
        api.getWorkList(params).then(responseData => {
            wx.hideLoading();
            const page = responseData.data.page;
            this.setData({
                workList: responseData.data.list,
                total: responseData.data.total,
                totalPages: responseData.data.pageCount,
                isLoading: false
            });
            wx.hideLoading();

            // 显示搜索结果统计
            wx.showToast({
                title: ``,
                icon: 'success',
                duration: 1500
            });
        }).catch(error => {
            wx.hideLoading();
            if (error.type === 'empty') {
                wx.showToast({
                    title: '数据不存在!',
                    icon: 'none',
                    duration: 3000
                });
            } else {
                // 根据错误类型显示不同的提示
                api.handleApiError(error);
            }
        });
    },
    // 行点击事件（短按）
    onRowClick(e) {
        const index = e.currentTarget.dataset.index;
        const item = this.data.workList[index];
        if (!item) return;
        // 跳转到detail页面，传递必要参数
        // 在当前页面保存数据到缓存
        const cacheKey = 'temp_work_item_' + Date.now();
        wx.setStorageSync(cacheKey, item);
        console.log("跳转的对象:", item);
        wx.navigateTo({
            url: `/pages/workDetail/workDetail?cacheKey=${cacheKey}`,
        });
    },

    // 行长按事件
    onRowLongPress(e) {
        const index = e.currentTarget.dataset.index;
        const item = this.data.workList[index];
        if (!item) return;
        // 显示操作菜单
        wx.showActionSheet({
            itemList: ['修改工序表', '删除工序表'],
            itemColor: '#333',
            success: (res) => {
                if (res.tapIndex === 0) {
                    // 修改
                    this.showEditModal(index, item);
                } else if (res.tapIndex === 1) {
                    // 删除
                    this.showDeleteConfirm(index, item);
                }
            },
            fail: (err) => {
                console.log('操作取消', err);
            }
        });
    },

    // 显示编辑弹窗
    showEditModal(index, item) {
        const _this = item.jjgxbgl.jjcpbgl.cpmc + '   ' + item.jjgxbgl.jjcpbgl.cpxh
        this.setData({
            showEditModal: true,
            editFormData: {
                id: item.id,
                model: _this,
                sbh: item.sbh,
                pch: item.pch
            }
        });
    },

    // 显示删除确认
    showDeleteConfirm(index, item) {
        wx.showModal({
            title: '确认删除',
            content: `确定要删除 "${item.jjgxbgl.jjcpbgl.cpmc}  ${item.jjgxbgl.jjcpbgl.cpxh}" 的工序表吗？`,
            confirmText: '删除',
            confirmColor: '#ff4444',
            cancelText: '取消',
            success: (res) => {
                if (res.confirm) {
                    this.deleteRecord(item.id);
                }
            }
        });
    },

    // 删除工序表
    deleteRecord(id) {
        // 构造保存的数据
        const saveData = {
            id: id
        };
        wx.showLoading({
            title: '删除中...',
            mask: true
        });
        console.log(saveData);
        //  调用后台接口
        api.deleteWork(saveData).then(responseData => {
            console.log(responseData);
            wx.hideLoading();
            wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1500
            });
            this.handleSearch();
        }).catch(error => {
            wx.hideLoading();
            // 根据错误类型显示不同的提示
            api.handleApiError(error);
        });

    },

    // 编辑弹窗输入事件
    onEditFormInput(e) {
        const {
            field
        } = e.currentTarget.dataset;
        const {
            value
        } = e.detail;
        this.setData({
            [`editFormData.${field}`]: value
        });
    },

    // 保存修改
    saveEditInfo() {
        const {
            editFormData,
        } = this.data;
        // 验证表单
        if (!editFormData.sbh.trim()) {
            wx.showToast({
                title: '请输入设备号',
                icon: 'none'
            });
            return;
        }
        if (!editFormData.pch.trim()) {
            wx.showToast({
                title: '请输入批次号',
                icon: 'none'
            });
            return;
        }
        // 构造保存的数据
        const jjgxjcbEntity = {
            pch: editFormData.pch.trim(),
            sbh: editFormData.sbh.trim(),
            id: editFormData.id
        };
        // 显示保存中状态
        wx.showLoading({
            title: '保存中...',
            mask: true
        });
        console.log('修改请求的参数:', jjgxjcbEntity);
        //  调用后台接口
        api.updateWork(jjgxjcbEntity).then(responseData => {
            console.log(responseData);
            wx.hideLoading();
            wx.showToast({
                title: '修改成功',
                icon: 'success',
                duration: 1500
            });
            this.closeEditModal();
            this.handleSearch();
        }).catch(error => {
            wx.hideLoading();
            // 根据错误类型显示不同的提示
            api.handleApiError(error);
        });

    },

    // 关闭编辑弹窗
    closeEditModal() {
        this.setData({
            showEditModal: false,
            editFormData: {
                id: '',
                model: '',
                sbh: '',
                pch: ''
            }
        });
    },

    // 上一页
    goPrevPage() {
        const {
            currentPage
        } = this.data;
        if (currentPage > 1) {
            this.setData({
                currentPage: currentPage - 1
            });
            this.loadData();
        }
    },

    // 下一页
    goNextPage() {
        const {
            currentPage,
            totalPages
        } = this.data;
        if (currentPage < totalPages) {
            this.setData({
                currentPage: currentPage + 1
            });
            this.loadData();
        }
    },

    // 页面卸载时清理定时器
    onUnload() {
        if (this.data.searchTimer) {
            clearTimeout(this.data.searchTimer);
        }
    }
});