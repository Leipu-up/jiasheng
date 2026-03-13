// 引入API服务
const {
    api
} = require('../../utils/app');

Page({
    data: {
        // 搜索相关
        searchValue: '',
        // 分页参数
        currentPage: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
        // 数据
        processList: [],
        isLoading: false,
        productInfo: {
            pch: '',
            phsl: '',
            ccslwg: '',
            ccslcc: '',
            pdjg: '',
            bz: '',
            id: '',
            jjcljcb: {
                jjcpbgl: {
                    cpbb: "",
                    cpmc: "",
                    cpxh: "",
                },
                id: '',
                gysmc: '',
            }
        },
        // 防抖相关
        searchTimer: null,
        // 数据总数量
        totalDataCount: 50,
        // 详情弹窗相关
        showDetailModal: false,
        currentProcess: null,
        // 填空项相关
        blankItems: [], // 根据频次生成的填空项
        showBlankModal: false, // 填空输入弹窗
        currentBlankItem: null, // 当前编辑的填空项
        currentBlankIndex: -1, // 当前编辑的填空项索引
        blankFormData: {
            id: '', // 主键
            actualValue: '', // 实测值
            result: 'OK', // 判定结果：OK/NG
            checkTime: '', // 检查时间，如 7:30
            workpieceStatus: '工序检验' // 工件状态
        },
        workpieceStatusOptions: ['工序检验', '首件', '尾件'], // 工件状态选项
        resultOptions: ['OK', 'NG'] // 判定结果选项
    },
    onLoad(options) {
        if (options.cacheKey) {
            const item = wx.getStorageSync(options.cacheKey);
            if (item) {
                this.setData({
                    productInfo: item
                });
                // 清理缓存
                wx.removeStorageSync(options.cacheKey);
            }
        }
        // 设置页面标题
        wx.setNavigationBarTitle({
            title: `工序详情`
        });
        // 加载数据
        this.loadData();
    },
    // 输入框输入事件（带防抖）
    onSearchInput(e) {
        const value = e.detail.value.trim();
        if (this.data.searchTimer) {
            clearTimeout(this.data.searchTimer);
        }
        const timer = setTimeout(() => {
            this.setData({
                searchValue: value,
                currentPage: 1
            }, () => {
                this.loadData();
            });
        }, 500);

        this.setData({
            searchTimer: timer
        });
    },
    // 执行查询
    handleSearch() {
        const {
            searchValue
        } = this.data;
        if (!searchValue) {
            this.setData({
                currentPage: 1
            });
            this.loadData();
            return;
        }
        this.setData({
            currentPage: 1,
            isLoading: true
        });
        this.loadData();
    },
    // 加载数据
    loadData() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        // 构造符合结构的对象
        const params = {
            "filter": {
                "jjcljcbId": this.data.productInfo.jjcljcb.id,
                "jjcljcjgbId": this.data.productInfo.id, // 机加工序检查表ID
                "xh": this.data.searchValue
            },
            "page": {
                "pageNum": this.data.currentPage,
                "pageSize": this.data.pageSize
            }
        };
        //  调用后台接口
        api.getCljcjgbWorkDetailList(params).then(responseData => {
            wx.hideLoading();
            const page = responseData.data.page;
            this.setData({
                processList: responseData.data.list,
                total: responseData.data.total,
                totalPages: responseData.data.pageCount,
                isLoading: false
            });
            wx.hideLoading();
            if (this.data.searchValue) {
                wx.showToast({
                    title: ``,
                    icon: 'success',
                    duration: 1500
                });
            }
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
    // 行点击事件
    onRowClick(e) {
        const item = e.currentTarget.dataset.item;
        // 直接调用API获取检查记录，不再通过单独的loadCheckRecords函数
        const params = {
            "jjcljcjgb": {
                "id": this.data.productInfo.id, // 机加工序检查表ID
            },
            "jjcljcxxbId": item.id // 机加工序详情表ID
        };
        // 显示加载中
        wx.showLoading({
            title: '加载中...',
            mask: true
        });

        // 直接调用API
        api.getCljcjgbJjgxjcjgbList(params).then(responseData => {
            wx.hideLoading();
            console.log('检查记录响应:', responseData.data);
            let checkRecords = [];
            // 处理API响应，确保checkRecords是数组
            if (responseData.data) {
                checkRecords = responseData.data;
            }
            // 根据频次生成填空项，并回填已有数据
            const blankItems = this.generateBlankItems(item.ypsl, checkRecords, item.id);
            this.setData({
                showDetailModal: true,
                currentProcess: item,
                blankItems: blankItems
            });

        }).catch(error => {
            wx.hideLoading();
            // 出错时生成空白的填空项
            const blankItems = this.generateBlankItems(item.ypsl, [], item.id);
            this.setData({
                showDetailModal: true,
                currentProcess: item,
                blankItems: blankItems
            });
        });
    },

    // 根据样品数量生成填空项，并回填已有数据 - 确保参数安全
    generateBlankItems(frequency, checkRecords) {
        // 确保 checkRecords 是数组
        if (!Array.isArray(checkRecords)) {
            checkRecords = [];
        }
        // 确保 frequency 是字符串
        if (typeof frequency !== 'string') {
            frequency = '1';
        }
        const num1 = parseInt(frequency);
        let items = [];
        for (let i = 1; i <= num1; i++) {
            items.push(this.createBlankItem(i, checkRecords));
        }
        return items;
    },

    // 根据序号查找检查记录
    findCheckRecordByIndex(checkRecords, index) {
        if (!checkRecords || !Array.isArray(checkRecords) || checkRecords.length === 0) {
            return null;
        }
        // 简单的方法：尝试匹配序号
        // 这里可以根据您的业务逻辑调整匹配规则
        for (let i = 0; i < checkRecords.length; i++) {
            const record = checkRecords[i];
            // 如果有序号字段，可以按序号匹配
            if (record.order === index || record.index === index) {
                return record;
            }
        }
        // 如果没有匹配到，尝试按数组顺序
        if (index <= checkRecords.length) {
            return checkRecords[index - 1];
        }

        return null;
    },
    // 创建填空项，并尝试回填已有数据
    createBlankItem(index, checkRecords) {
        // 确保 checkRecords 是数组
        if (!Array.isArray(checkRecords)) {
            checkRecords = [];
        }
        // 首先检查是否有对应的检查记录
        const existingRecord = this.findCheckRecordByIndex(checkRecords, index);
        if (existingRecord) {
            // 如果有记录，回填数据
            return {
                id: existingRecord.id, // 使用数据库中的ID
                index: index, // 填空序号
                isFilled: true,
                data: {
                    id: existingRecord.id || '',
                    actualValue: existingRecord.scz || existingRecord.actualValue || '', // 实测值
                },
                status: (existingRecord.scz) ?
                    (existingRecord.scz) : '未填写'
            };
        } else {
            // 没有记录，创建空的填空项
            return {
                id: '', // 没有ID，表示新增
                index: index, // 填空序号
                isFilled: false,
                data: null,
                status: '未填写'
            };
        }
    },
    // 关闭详情弹窗
    closeDetailModal() {
        this.setData({
            showDetailModal: false,
            currentProcess: null,
            blankItems: []
        });
    },
    // 点击填空项
    onBlankItemClick(e) {
        const index = e.currentTarget.dataset.index;
        const blankItem = this.data.blankItems[index];
        // 设置当前编辑的填空项
        this.setData({
            showBlankModal: true,
            currentBlankIndex: index,
            currentBlankItem: blankItem,
            blankFormData: blankItem.isFilled ?
                blankItem.data : {
                    id: '', // 主键
                    actualValue: '',
                    result: 'OK',
                    checkTime: this.getCurrentTime(),
                    workpieceStatus: '工序检验'
                }
        });
    },
    // 获取当前时间
    getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    },
    // 简化closeBlankModal函数，只做基本重置
    closeBlankModal() {
        this.setData({
            showBlankModal: false,
            currentBlankIndex: -1,
            currentBlankItem: null,
            blankFormData: {
                id: '',
                actualValue: '',
                result: 'OK',
                checkTime: '',
                workpieceStatus: '工序检验'
            }
        });
    },
    // 填空弹窗输入事件
    onBlankFormInput(e) {
        const {
            field
        } = e.currentTarget.dataset;
        const {
            value
        } = e.detail;
        this.setData({
            [`blankFormData.${field}`]: value
        });
    },
    // 填空弹窗输入事件
    onBlankFormGxInput(e) {
        const {
            field
        } = e.currentTarget.dataset;
        const {
            value
        } = e.detail;
        this.setData({
            [`productInfo.${field}`]: value
        });
    },
    // 工件状态选择
    onWorkpieceStatusChange(e) {
        const index = e.detail.value;
        this.setData({
            'blankFormData.workpieceStatus': this.data.workpieceStatusOptions[index]
        });
    },
    // 判定结果选择
    onResultChange(e) {
        const index = e.detail.value;
        this.setData({
            'blankFormData.result': this.data.resultOptions[index]
        });
    },
    // 保存填空项
    savePdjg() {
        console.log("点击保存");
        const {
            productInfo
        } = this.data;
        if (!productInfo.pdjg.trim()) {
            wx.showToast({
                title: '请输入判定结果',
                icon: 'none'
            });
            return;
        }
        // 准备保存数据
        const saveData = {
            id: this.data.productInfo.id,
            pdjg: productInfo.pdjg, // 判定结果
            bz: productInfo.bz, // 备注
        };
        console.log(saveData);
        // 显示加载中
        wx.showLoading({
            title: '保存中...',
            mask: true
        });
        // 调用API保存检查记录
        api.updateJjcljcjgb(saveData).then(response => {
            this.loadData();
            console.log(this.data.currentProcess);
            wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1500
            });
        }).catch(error => {
            wx.hideLoading();
            wx.showToast({
                title: '保存失败',
                icon: 'none'
            });
        });
    },
    // 保存填空项
    saveBlankItem() {
        const {
            blankFormData,
            currentBlankIndex,
            blankItems,
            currentProcess,
            productInfo
        } = this.data;
        // 验证表单
        if (!blankFormData.actualValue.trim()) {
            wx.showToast({
                title: '请输入实测值',
                icon: 'none'
            });
            return;
        }
        // 准备保存数据
        const saveData = {
            id: blankFormData.id, // 如果有ID是修改，没有是新增
            scz: blankFormData.actualValue, // 实测值
            jjcljcjgb: {
                id: productInfo.id, // 机加工序检查表ID
            },
            jjcljcxxbId: currentProcess.id, // 当前工序ID
            jjcljcbId: productInfo.jjcljcb.id // 机加工序表ID
        };
        // 显示加载中
        wx.showLoading({
            title: '保存中...',
            mask: true
        });
        // 调用API保存检查记录
        api.updateCljcjgbCheckRecord(saveData).then(response => {
            wx.hideLoading();
            // 更新填空项
            const updatedBlankItems = [...blankItems];
            updatedBlankItems[currentBlankIndex] = {
                ...updatedBlankItems[currentBlankIndex],
                id: response.data.id || saveData.id, // 更新ID（如果是新增，会返回新ID）
                isFilled: true,
                data: {
                    id: response.data.id || saveData.id,
                    actualValue: saveData.scz
                },
                status: saveData.scz
            };
            // 直接在这里关闭弹窗，不使用closeBlankModal函数
            this.setData({
                blankItems: updatedBlankItems,
                showBlankModal: false, // 直接关闭弹窗
                currentBlankIndex: -1,
                currentBlankItem: null
                // 注意：这里不重置blankFormData，因为closeBlankModal会处理
            });
            wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1500
            });
            this.closeBlankModal();
        }).catch(error => {
            wx.hideLoading();
            wx.showToast({
                title: '保存失败',
                icon: 'none'
            });
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

    // 返回work页面
    goBack() {
        wx.navigateBack({
            delta: 1
        });
    },

    // 清空搜索
    clearSearch() {
        this.setData({
            searchValue: '',
            currentPage: 1
        }, () => {
            this.loadData();
        });
    },

    // 页面卸载时清理定时器
    onUnload() {
        if (this.data.searchTimer) {
            clearTimeout(this.data.searchTimer);
        }
    }
});