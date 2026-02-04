// 引入API服务
const {
    api
} = require('../../utils/app');

Page({
    data: {
        // 搜索相关
        searchValue: '',
        showSearchTips: true,
        // 分页参数
        currentPage: 1,
        pageSize: 10, // 默认每页10条
        total: 0,
        totalPages: 1,
        // 数据
        productList: [],
        isLoading: false,
        // 防抖相关
        searchTimer: null,
    },
    onLoad(options) {
        this.loadData();
    },
    // 输入框输入事件（带防抖）
    onSearchInput(e) {
        const value = e.detail.value.trim();
        // 清除之前的定时器
        if (this.data.searchTimer) {
            clearTimeout(this.data.searchTimer);
        }
        // 设置防抖，500ms后更新搜索值
        const timer = setTimeout(() => {
            this.setData({
                searchValue: value
            });
        }, 500);
        this.setData({
            searchTimer: timer
        });
    },
    // 执行查询
    handleSearch() {
        // 重置为第一页
        this.setData({
            currentPage: 1,
            isLoading: true
        });
        // 加载数据
        this.loadData();
    },
    // 加载数据
    loadData() {
        // 显示加载状态
        wx.showLoading({
            title: '查询中...',
            mask: true
        });
        // 构造符合结构的对象
        const params = {
            "filter": {
                "title": this.data.searchValue
            },
            "page": {
                "pageNum": this.data.currentPage,
                "pageSize": this.data.pageSize
            }
        };
        //  调用后台接口
        api.getJjtzbPage(params).then(responseData => {
            wx.hideLoading();
            const page = responseData.data.page;
            this.setData({
                productList: responseData.data.list,
                total: responseData.data.total,
                totalPages: responseData.data.pageCount,
                isLoading: false,
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
    // 行点击事件 - 显示详情弹窗
    onRowClick(e) {
        const item = e.currentTarget.dataset.item;
        // 显示通知详情
        wx.showModal({
            title: item.title,
            content: item.content,
            showCancel: false,
            confirmText: '我知道了'
        });
    },
    // 阻止事件冒泡
    stopPropagation() {
        // 什么都不做，只为了阻止事件冒泡
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

});