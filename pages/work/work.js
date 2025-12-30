Page({
    data: {
        // 搜索条件
        searchKeyword: '', // 产品型号/批次号搜索关键词

        // 日期筛选
        startDate: '', // 开始日期
        endDate: '', // 结束日期

        // 分页参数
        currentPage: 1,
        pageSize: 15, // 每页15条
        total: 0,
        totalPages: 1,

        // 数据
        workList: [],
        isLoading: false,
        hasSearchCondition: false, // 是否有查询条件

        // 防抖相关
        searchTimer: null,

        // 数据总数量配置
        totalDataCount: 360,

        // 编辑弹窗相关
        showEditModal: false, // 编辑弹窗显示状态
        editingIndex: -1, // 正在编辑的行索引
        editFormData: {
            model: '', // 产品型号
            version: '', // 版本号
            batchNumber: '', // 批次号
            status: '', // 状态
            statusIndex: 0 // 状态选择器索引
        },
        statusOptions: ['进行中', '已完成'] // 状态选项
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
        const {
            searchKeyword,
            startDate,
            endDate,
            currentPage,
            pageSize,
            totalDataCount
        } = this.data;

        // 显示加载状态
        wx.showLoading({
            title: '查询中...',
            mask: true
        });

        // 模拟API请求
        setTimeout(() => {
            // 生成模拟数据
            const mockData = this.generateMockData(
                searchKeyword,
                startDate,
                endDate,
                currentPage,
                pageSize
            );

            // 使用 totalDataCount 作为总数据量
            const total = totalDataCount;

            // 计算总页数
            const totalPages = Math.ceil(total / pageSize);

            this.setData({
                workList: mockData,
                total: total,
                totalPages: totalPages,
                isLoading: false
            });

            wx.hideLoading();

            // 显示搜索结果统计
            wx.showToast({
                title: `找到 ${mockData.length} 条记录`,
                icon: 'success',
                duration: 1500
            });

        }, 800);
    },

    // 生成模拟数据
    generateMockData(keyword, startDate, endDate, page, pageSize) {
        const data = [];
        const startIndex = (page - 1) * pageSize;

        // 产品型号数组
        const models = ['A1-2024', 'B2-Pro', 'C3-Max', 'D4-Lite', 'E5-Ultra', 'F6-Plus', 'G7-Mini', 'H8-Standard'];

        // 产品名称对应关系
        const modelNames = {
            'A1-2024': '高端智能手机',
            'B2-Pro': '笔记本电脑',
            'C3-Max': '智能手表',
            'D4-Lite': '平板电脑',
            'E5-Ultra': '蓝牙耳机',
            'F6-Plus': '智能家居',
            'G7-Mini': '投影仪',
            'H8-Standard': '游戏主机'
        };

        // 版本数组
        const versions = ['V1.0', 'V1.1', 'V2.0', 'V2.5', 'V3.0', 'V3.5', 'V4.0'];

        // 批次号前缀
        const batchPrefixes = ['BATCH-2024', 'LOT-2024', 'PROD-2024', 'MFG-2024'];

        // 状态数组
        const statuses = ['completed', 'processing'];

        // 生成当前页数据
        for (let i = 0; i < pageSize; i++) {
            const index = startIndex + i;
            if (index >= this.data.totalDataCount) break;

            const randomModel = models[Math.floor(Math.random() * models.length)];
            const randomVersion = versions[Math.floor(Math.random() * versions.length)];
            const randomBatch = `${batchPrefixes[Math.floor(Math.random() * batchPrefixes.length)]}-${String(1000 + index).padStart(6, '0')}`;
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

            // 应用筛选条件
            if (keyword &&
                !randomModel.toLowerCase().includes(keyword.toLowerCase()) &&
                !randomBatch.toLowerCase().includes(keyword.toLowerCase())) {
                continue;
            }

            data.push({
                id: `W${10000 + index}`,
                model: randomModel,
                productName: modelNames[randomModel] || randomModel,
                version: randomVersion,
                batchNumber: randomBatch,
                status: randomStatus
            });
        }

        return data;
    },

    // ========== 长按操作相关方法 ==========

    // 行点击事件（短按）
    onRowClick(e) {
        const index = e.currentTarget.dataset.index;
        const item = this.data.workList[index];

        if (!item) return;

        //   wx.showModal({
        //     title: '工作记录详情',
        //     content: `产品型号：${item.model}\n产品名称：${item.productName}\n版本号：${item.version}\n批次号：${item.batchNumber}\n状态：${item.status === 'completed' ? '已完成' : '进行中'}`,
        //     showCancel: true,
        //     confirmText: '确定',
        //     cancelText: '关闭'
        //   });
        // 跳转到detail页面，传递必要参数
        wx.navigateTo({
            url: `/pages/workDetail/workDetail?model=${item.model}&batchNumber=${item.batchNumber}&productName=${encodeURIComponent(item.productName)}&version=${item.version}`,
        });
    },

    // 行长按事件
    onRowLongPress(e) {
        const index = e.currentTarget.dataset.index;
        const item = this.data.workList[index];

        if (!item) return;

        // 显示操作菜单
        wx.showActionSheet({
            itemList: ['修改记录', '删除记录'],
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
        const statusIndex = item.status === 'completed' ? 1 : 0;

        this.setData({
            showEditModal: true,
            editingIndex: index,
            editFormData: {
                model: item.model,
                version: item.version,
                batchNumber: item.batchNumber,
                status: item.status,
                statusIndex: statusIndex
            }
        });
    },

    // 显示删除确认
    showDeleteConfirm(index, item) {
        wx.showModal({
            title: '确认删除',
            content: `确定要删除 "${item.model}" 的记录吗？`,
            confirmText: '删除',
            confirmColor: '#ff4444',
            cancelText: '取消',
            success: (res) => {
                if (res.confirm) {
                    this.deleteRecord(index, item.id);
                }
            }
        });
    },

    // 删除记录
    deleteRecord(index, id) {
        wx.showLoading({
            title: '删除中...',
            mask: true
        });

        // 模拟删除请求
        setTimeout(() => {
            const {
                workList,
                total
            } = this.data;

            // 从列表中移除
            const updatedList = [...workList];
            updatedList.splice(index, 1);

            this.setData({
                workList: updatedList,
                total: total - 1
            });

            wx.hideLoading();
            wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1500
            });

            // 如果删除后列表为空，重置页面状态
            if (updatedList.length === 0) {
                this.setData({
                    hasSearchCondition: false
                });
            }
        }, 600);
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

    // 状态选择变化
    onStatusChange(e) {
        const index = e.detail.value;
        const status = index === 1 ? 'completed' : 'processing';

        this.setData({
            'editFormData.statusIndex': index,
            'editFormData.status': status
        });
    },

    // 保存修改
    saveEditInfo() {
        const {
            editFormData,
            editingIndex,
            workList
        } = this.data;

        if (editingIndex === -1) return;

        // 验证表单
        if (!editFormData.model.trim()) {
            wx.showToast({
                title: '请输入产品型号',
                icon: 'none'
            });
            return;
        }

        if (!editFormData.version.trim()) {
            wx.showToast({
                title: '请输入版本号',
                icon: 'none'
            });
            return;
        }

        if (!editFormData.batchNumber.trim()) {
            wx.showToast({
                title: '请输入批次号',
                icon: 'none'
            });
            return;
        }

        // 显示保存中状态
        wx.showLoading({
            title: '保存中...',
            mask: true
        });

        // 模拟保存请求
        setTimeout(() => {
            // 更新列表数据
            const updatedList = [...workList];
            const originalItem = updatedList[editingIndex];

            if (!originalItem) {
                wx.hideLoading();
                wx.showToast({
                    title: '数据错误',
                    icon: 'error'
                });
                return;
            }

            // 保持原有ID不变
            updatedList[editingIndex] = {
                ...originalItem,
                model: editFormData.model,
                version: editFormData.version,
                batchNumber: editFormData.batchNumber,
                status: editFormData.status
            };

            this.setData({
                workList: updatedList,
                showEditModal: false,
                editingIndex: -1,
                editFormData: {
                    model: '',
                    version: '',
                    batchNumber: '',
                    status: '',
                    statusIndex: 0
                }
            });

            wx.hideLoading();
            wx.showToast({
                title: '修改成功',
                icon: 'success',
                duration: 1500
            });
        }, 800);
    },

    // 关闭编辑弹窗
    closeEditModal() {
        this.setData({
            showEditModal: false,
            editingIndex: -1,
            editFormData: {
                model: '',
                version: '',
                batchNumber: '',
                status: '',
                statusIndex: 0
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