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
        // 新增：弹窗相关
        showDetailModal: false, // 详情弹窗显示状态
        currentProduct: null, // 当前选中的产品
        showAddModal: false, // 添加弹窗显示状态
        addFormData: {
            batchNumber: '', // 批次号
            deviceNumber: '', // 设备号
            date: '', // 日期
            time: '' // 时间
        },
        // 收藏相关
        showFavorites: false, // 是否显示收藏列表
        favoriteIds: [], // 收藏的产品ID数组
        favoriteCount: 0, // 收藏数量
        // 新增：跳转参数
        jumpToFavorites: false // 是否从我的页面跳转过来
    },

    onLoad(options) {
        console.log('查询页面加载，参数:', options);
        
        // 检查是否有跳转参数
        if (options && options.showFavorites === 'true') {
            // 如果是从我的页面跳转过来的，自动进入收藏模式
            const userId = options.userId;
            const currentUser = wx.getStorageSync('userInfo');
            
            if (currentUser && currentUser.userId === userId) {
                // 确保是当前用户
                this.setData({
                    jumpToFavorites: true,
                    showFavorites: true
                });
                
                // 初始化收藏数据
                this.initFavoriteData();
                
                // 加载收藏产品
                if (this.data.showFavorites) {
                    this.loadFavoriteProducts();
                } else {
                    this.loadData();
                }
                
                // 显示提示
                wx.showToast({
                    title: '进入收藏模式',
                    icon: 'success',
                    duration: 1500
                });
                
                return;
            }
        }
        
        // 正常加载逻辑
        this.initFavoriteData();
        
        if (this.data.showFavorites) {
            this.loadFavoriteProducts();
        } else {
            this.loadData();
        }
    },

    // 获取用户专属的收藏数据键名
    getFavoriteKey() {
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo && userInfo.userId) {
            // 登录用户：使用用户ID作为键名的一部分
            return `product_favorites_${userInfo.userId}`;
        } else {
            // 未登录用户：使用临时键名（会有数据共享风险）
            return 'product_favorites_temp';
        }
    },

    // 初始化收藏数据
    initFavoriteData() {
        try {
            // 尝试从新格式加载
            const favoriteKey = this.getFavoriteKey();
            const favoriteData = wx.getStorageSync(favoriteKey);
            
            if (favoriteData) {
                // 新格式：包含版本、时间戳等信息
                this.setData({
                    favoriteIds: favoriteData.ids || [],
                    favoriteCount: favoriteData.ids ? favoriteData.ids.length : 0
                });
            } else {
                // 尝试从旧格式迁移
                const oldFavorites = wx.getStorageSync('product_favorites') || [];
                if (oldFavorites.length > 0) {
                    // 迁移到新格式
                    this.migrateOldFavorites(oldFavorites);
                } else {
                    // 初始化空数据
                    this.setData({
                        favoriteIds: [],
                        favoriteCount: 0
                    });
                }
            }
        } catch (error) {
            console.error('初始化收藏数据失败:', error);
            this.setData({
                favoriteIds: [],
                favoriteCount: 0
            });
        }
    },

    // 迁移旧格式的收藏数据
    migrateOldFavorites(oldFavorites) {
        try {
            const favoriteKey = this.getFavoriteKey();
            const favoriteData = {
                ids: oldFavorites,
                lastUpdate: Date.now(),
                version: '2.0'
            };
            
            wx.setStorageSync(favoriteKey, favoriteData);
            
            this.setData({
                favoriteIds: oldFavorites,
                favoriteCount: oldFavorites.length
            });
        } catch (error) {
            console.error('迁移收藏数据失败:', error);
        }
    },

    // 加载收藏数据
    loadFavoriteData() {
        try {
            const favoriteKey = this.getFavoriteKey();
            const favoriteData = wx.getStorageSync(favoriteKey);
            
            if (favoriteData) {
                this.setData({
                    favoriteIds: favoriteData.ids || [],
                    favoriteCount: favoriteData.ids ? favoriteData.ids.length : 0
                });
                return favoriteData.ids || [];
            }
            
            return [];
        } catch (error) {
            console.error('读取收藏数据失败:', error);
            return [];
        }
    },

    // 保存收藏数据
    saveFavoriteData(favoriteIds) {
        try {
            const favoriteKey = this.getFavoriteKey();
            const favoriteData = {
                ids: favoriteIds,
                lastUpdate: Date.now(),
                version: '2.0'
            };
            
            wx.setStorageSync(favoriteKey, favoriteData);
            
            this.setData({
                favoriteIds: favoriteIds,
                favoriteCount: favoriteIds.length
            });
            
            return true;
        } catch (error) {
            console.error('保存收藏数据失败:', error);
            wx.showToast({
                title: '保存失败',
                icon: 'error'
            });
            return false;
        }
    },

    // 关闭跳转提示
    closeJumpTip() {
        this.setData({
            jumpToFavorites: false
        });
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
        const {
            showFavorites
        } = this.data;
        // 如果是收藏模式，直接加载收藏数据
        if (showFavorites) {
            this.loadFavoriteProducts();
            return;
        }
        // 重置为第一页
        this.setData({
            currentPage: 1,
            isLoading: true
        });
        // 加载数据
        this.loadData();
    },

    // 切换收藏/全部显示
    toggleFavorites() {
        const {
            showFavorites,
            favoriteCount
        } = this.data;
        if (!showFavorites && favoriteCount === 0) {
            wx.showToast({
                title: '暂无收藏记录',
                icon: 'none',
                duration: 1500
            });
            return;
        }
        const newState = !showFavorites;
        this.setData({
            showFavorites: newState,
            searchValue: '', // 清空搜索框
            currentPage: 1 // 重置为第一页
        });
        // 重新加载数据
        if (newState) {
            this.loadFavoriteProducts();
        } else {
            // 如果有搜索值，执行搜索，否则不清除列表
            if (this.data.searchValue) {
                this.loadData();
            }
        }
        // 提示
        wx.showToast({
            title: newState ? '显示收藏列表' : '显示全部列表',
            icon: 'success',
            duration: 1000
        });
    },

    //切换收藏数据
    toggleFavoriteMode() {
        if (!api.checkLogin()) {
            api.goToLogin();
            return;
        }
        
        this.setData({
            searchValue: '',
            jumpToFavorites: false // 清除跳转标记
        });
        
        if (this.data.showFavorites) {
            this.setData({
                showFavorites: false
            });
            this.loadData();
        } else {
            this.setData({
                showFavorites: true
            });
            this.loadFavoriteProducts();
        }
    },

    // 加载收藏产品
    loadFavoriteProducts() {
        const {
            favoriteIds,
            productList
        } = this.data;
        if (favoriteIds.length === 0) {
            this.setData({
                productList: [],
                total: 0,
                totalPages: 1
            });
            return;
        }
        // 显示加载状态
        wx.showLoading({
            title: '加载收藏...',
            mask: true
        });
        const favoriteProducts = productList.filter(product =>
            favoriteIds.includes(product.id)
        );
        this.setData({
            productList: favoriteProducts,
            total: favoriteProducts.length,
            totalPages: Math.ceil(favoriteProducts.length / this.data.pageSize),
            isLoading: false
        });
        wx.hideLoading();
        wx.showToast({
            title: `已加载 ${favoriteProducts.length} 个收藏`,
            icon: 'success',
            duration: 1000
        });
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
                "gxmc": this.data.searchValue
            },
            "page": {
                "pageNum": this.data.currentPage,
                "pageSize": this.data.pageSize
            }
        };
        //  调用后台接口
        api.getProductList(params).then(responseData => {
            wx.hideLoading();
            const page = responseData.data.page;
            
            // 获取当前用户的收藏ID
            const currentFavoriteIds = this.data.favoriteIds;
            
            // 为产品列表标记收藏状态
            const productListWithFavorite = responseData.data.list.map(product => ({
                ...product,
                isFavorite: currentFavoriteIds.includes(product.id)
            }));
            
            this.setData({
                productList: productListWithFavorite,
                total: responseData.data.total,
                totalPages: responseData.data.pageCount,
                isLoading: false,
                showSearchTips: false
            });
            
            // 显示搜索结果统计
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

    // 行点击事件 - 显示详情弹窗
    onRowClick(e) {
        if (!api.checkLogin()) {
            api.goToLogin();
            return;
        }
        const item = e.currentTarget.dataset.item;
        this.setData({
            showDetailModal: true,
            currentProduct: item
        });
    },

    // 关闭详情弹窗
    closeDetailModal() {
        this.setData({
            showDetailModal: false,
            currentProduct: null
        });
    },
    
    // 阻止事件冒泡
    stopPropagation() {
        // 什么都不做，只为了阻止事件冒泡
    },
    
    // 详情弹窗中的 + 按钮点击事件
    onAddButtonClick() {
        // 打开添加弹窗
        this.setData({
            showDetailModal: false,
            showAddModal: true,
            addFormData: {
                batchNumber: '',
                deviceNumber: '',
                time: this.getCurrentTime(),
                date: this.getCurrentDate()
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
    
    // 获取当前日期
    getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // 详情弹窗中的 ⭐️ 按钮点击事件
    onFavoriteButtonClick() {
        const {
            currentProduct,
            favoriteIds
        } = this.data;

        if (!currentProduct) return;

        const productId = currentProduct.id;
        const isCurrentlyFavorite = favoriteIds.includes(productId);

        if (isCurrentlyFavorite) {
            // 如果已经是收藏状态，提示是否取消收藏
            wx.showModal({
                title: '取消收藏',
                content: `确定要取消收藏 "${currentProduct.jjcpbgl.cpmc}" 吗？`,
                confirmText: '取消收藏',
                confirmColor: '#ff4444',
                success: (res) => {
                    if (res.confirm) {
                        // 从收藏列表中移除
                        const updatedFavoriteIds = favoriteIds.filter(id => id !== productId);
                        const saveSuccess = this.saveFavoriteData(updatedFavoriteIds);

                        if (saveSuccess) {
                            // 更新当前产品列表中的收藏状态
                            this.updateProductFavoriteStatus(productId, false);
                            wx.showToast({
                                title: '已取消收藏',
                                icon: 'success'
                            });

                            // 关闭弹窗
                            this.closeDetailModal();
                            this.loadData();
                        }
                    }
                }
            });
        } else {
            // 如果是未收藏状态，提示是否加入收藏
            wx.showModal({
                title: '加入收藏',
                content: `确定要将 "${currentProduct.jjcpbgl.cpmc}" 加入收藏吗？`,
                confirmText: '加入收藏',
                success: (res) => {
                    if (res.confirm) {
                        // 添加到收藏列表
                        const updatedFavoriteIds = [...favoriteIds, productId];
                        const saveSuccess = this.saveFavoriteData(updatedFavoriteIds);

                        if (saveSuccess) {
                            // 更新当前产品列表中的收藏状态
                            this.updateProductFavoriteStatus(productId, true);
                            wx.showToast({
                                title: '已加入收藏',
                                icon: 'success'
                            });

                            // 关闭弹窗
                            this.closeDetailModal();
                            this.loadData();
                        }
                    }
                }
            });
        }
    },

    // 更新产品收藏状态
    updateProductFavoriteStatus(productId, isFavorite) {
        const {
            productList
        } = this.data;
        const updatedList = productList.map(item => {
            if (item.id === productId) {
                return {
                    ...item,
                    isFavorite: isFavorite
                };
            }
            return item;
        });

        this.setData({
            productList: updatedList
        });
    },

    // 添加弹窗输入框变化事件
    onAddFormInput(e) {
        console.log("输入框变化事件触发");
        const {
            field
        } = e.currentTarget.dataset;
        const {
            value
        } = e.detail;

        this.setData({
            [`addFormData.${field}`]: value
        });
    },

    // 保存添加信息
    saveAddInfo() {
        const {
            addFormData,
            currentProduct
        } = this.data;

        // 验证表单
        if (!addFormData.batchNumber.trim()) {
            wx.showToast({
                title: '请输入批次号',
                icon: 'none'
            });
            return;
        }

        if (!addFormData.deviceNumber.trim()) {
            wx.showToast({
                title: '请输入设备号',
                icon: 'none'
            });
            return;
        }

        if (!addFormData.date.trim()) {
            wx.showToast({
                title: '请选择日期',
                icon: 'none'
            });
            return;
        }
        if (!addFormData.time.trim()) {
            wx.showToast({
                title: '请选择时间',
                icon: 'none'
            });
            return;
        }

        const userInfo = wx.getStorageSync('userInfo');
        // 显示保存中状态
        wx.showLoading({
            title: '保存中...',
            mask: true
        });
        const rq = addFormData.date.trim() + ' ' + addFormData.time.trim()
        // 构造保存的数据
        const saveData = {
            pch: addFormData.batchNumber.trim(),
            sbh: addFormData.deviceNumber.trim(),
            rq: rq,
            jyy: {
                id: userInfo.userId
            },
            qrz: {
                id: userInfo.userId
            },
            jjgxbgl: {
                id: currentProduct.id
            },
            productInfo: currentProduct
        };
        console.log('保存的数据:', saveData);
        //  调用后台接口
        api.saveProduct(saveData).then(responseData => {
            wx.hideLoading();
            console.log(responseData);
            // 显示保存成功提示
            wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1500
            });
            // 关闭弹窗
            this.closeAddModal();
        }).catch(error => {
            wx.hideLoading();
            // 根据错误类型显示不同的提示
            api.handleApiError(error);
        });
    },

    // 关闭添加弹窗
    closeAddModal() {
        this.setData({
            showAddModal: false,
            addFormData: {
                batchNumber: '',
                deviceNumber: '',
                date: '',
                time: ''
            }
        });
    },

    // 上一页
    goPrevPage() {
        const {
            currentPage,
            showFavorites
        } = this.data;
        if (currentPage > 1) {
            this.setData({
                currentPage: currentPage - 1
            });

            // 根据当前模式加载数据
            if (showFavorites) {
                this.loadFavoriteProducts();
            } else {
                this.loadData();
            }
        }
    },

    // 下一页
    goNextPage() {
        const {
            currentPage,
            totalPages,
            showFavorites
        } = this.data;
        if (currentPage < totalPages) {
            this.setData({
                currentPage: currentPage + 1
            });

            // 根据当前模式加载数据
            if (showFavorites) {
                this.loadFavoriteProducts();
            } else {
                this.loadData();
            }
        }
    },

    // 清空搜索
    clearSearch() {
        this.setData({
            searchValue: '',
            productList: [],
            currentPage: 1,
            total: 0,
            showSearchTips: true,
            showFavorites: false,
            jumpToFavorites: false
        });
    },

    // 页面卸载时清理定时器
    onUnload() {
        if (this.data.searchTimer) {
            clearTimeout(this.data.searchTimer);
        }
        
        // 清除跳转标记，避免下次进入时误判
        this.setData({
            jumpToFavorites: false
        });
    },
    
    // 页面显示时也检查一下
    onShow() {
        // 如果是从收藏跳转过来的，保持状态
        if (this.data.jumpToFavorites) {
            // 不需要重新加载，保持当前状态
            return;
        }
        
        // 否则正常加载收藏数据
        this.initFavoriteData();
    }
});