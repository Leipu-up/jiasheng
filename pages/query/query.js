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
      
      // 数据总数量配置（只需修改这里）
      totalDataCount: 480, // 这里定义总数据量
      
      // 新增：弹窗相关
      showDetailModal: false, // 详情弹窗显示状态
      currentProduct: null, // 当前选中的产品
      showAddModal: false, // 添加弹窗显示状态
      addFormData: {
        batchNumber: '', // 批次号
        deviceNumber: '', // 设备号
        time: '' // 时间
      },
      
      // 收藏相关
      showFavorites: false, // 是否显示收藏列表
      favoriteIds: [], // 收藏的产品ID数组
      favoriteCount: 0 // 收藏数量
    },
  
    onLoad() {
      // 页面加载时读取收藏数据
      this.loadFavoriteData();
    },
  
    // 加载收藏数据
    loadFavoriteData() {
      try {
        const favoriteIds = wx.getStorageSync('product_favorites') || [];
        this.setData({
          favoriteIds: favoriteIds,
          favoriteCount: favoriteIds.length
        });
        return favoriteIds;
      } catch (error) {
        console.error('读取收藏数据失败:', error);
        return [];
      }
    },
  
    // 保存收藏数据
    saveFavoriteData(favoriteIds) {
      try {
        wx.setStorageSync('product_favorites', favoriteIds);
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
      const { searchValue, showFavorites } = this.data;
  
      // 如果是收藏模式，直接加载收藏数据
      if (showFavorites) {
        this.loadFavoriteProducts();
        return;
      }
  
      // 验证输入
      if (!searchValue) {
        wx.showToast({
          title: '请输入查询关键词',
          icon: 'none',
          duration: 2000
        });
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
      const { showFavorites, favoriteCount } = this.data;
  
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
  
    // 加载收藏产品
    loadFavoriteProducts() {
      const { favoriteIds, totalDataCount } = this.data;
  
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
  
      // 模拟从缓存中获取收藏产品数据
      setTimeout(() => {
        // 生成所有产品数据并过滤出收藏的
        const allProducts = this.generateAllProducts(totalDataCount);
        const favoriteProducts = allProducts.filter(product =>
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
      }, 500);
    },
  
    // 加载数据
    loadData() {
      const { searchValue, currentPage, pageSize, totalDataCount } = this.data;
  
      // 显示加载状态
      wx.showLoading({
        title: '查询中...',
        mask: true
      });
  
      // 模拟API请求（实际开发中替换为 wx.request）
      setTimeout(() => {
        // 模拟数据生成
        const mockData = this.generateMockData(searchValue, currentPage, pageSize);
        
        // 使用 totalDataCount 作为总数据量
        const total = totalDataCount;
  
        // 计算总页数
        const totalPages = Math.ceil(total / pageSize);
  
        this.setData({
          productList: mockData,
          total: total,
          totalPages: totalPages,
          isLoading: false,
          showSearchTips: false
        });
  
        wx.hideLoading();
  
        // 显示搜索结果统计
        if (searchValue) {
          wx.showToast({
            title: `找到 ${total} 条结果`,
            icon: 'success',
            duration: 1500
          });
        }
  
      }, 800);
    },
  
    // 生成模拟数据
    generateMockData(keyword, page, pageSize) {
      const data = [];
      const startIndex = (page - 1) * pageSize;
      const { totalDataCount, favoriteIds } = this.data;
  
      // 产品名称数组（模拟不同长度的名称）
      const productNames = [
        `高端智能手机 ${keyword}`,
        `笔记本电脑轻薄本 ${keyword}`,
        `智能穿戴手表运动版 ${keyword}`,
        `平板电脑娱乐版 ${keyword}`,
        `蓝牙耳机降噪版 ${keyword}`,
        `智能家居控制中心 ${keyword}`,
        `高清投影仪家用 ${keyword}`,
        `游戏主机专业版 ${keyword}`,
        `数码相机全画幅 ${keyword}`,
        `无人机航拍专业版 ${keyword}`
      ];
  
      // 产品型号数组
      const models = ['A1', 'B2', 'C3', 'D4', 'E5', 'F6', 'G7', 'H8', 'I9', 'J10'];
  
      // 版本数组
      const versions = ['V1.0', 'V1.1', 'V2.0', 'V2.5', 'V3.0'];
  
      // 工序数组
      const processes = [
        '组装工序',
        '测试工序',
        '质检工序',
        '包装工序',
        '调试工序',
        '校准工序',
        '老化测试',
        '功能测试',
        '外观检查',
        '性能测试'
      ];
  
      // 生成当前页数据
      for (let i = 0; i < pageSize; i++) {
        const index = startIndex + i;
        // 使用 totalDataCount 判断是否超出范围
        if (index >= totalDataCount) break;
  
        const productId = `P${1000 + index}`;
        const isFavorite = favoriteIds.includes(productId);
  
        data.push({
          id: productId,
          productName: productNames[Math.floor(Math.random() * productNames.length)],
          model: models[Math.floor(Math.random() * models.length)],
          version: versions[Math.floor(Math.random() * versions.length)],
          processName: processes[Math.floor(Math.random() * processes.length)],
          isFavorite: isFavorite
        });
      }
  
      return data;
    },
  
    // 生成所有产品数据（用于收藏列表）
    generateAllProducts(count) {
      const products = [];
      const productNames = [
        '高端智能手机',
        '笔记本电脑轻薄本',
        '智能穿戴手表运动版',
        '平板电脑娱乐版',
        '蓝牙耳机降噪版',
        '智能家居控制中心',
        '高清投影仪家用',
        '游戏主机专业版',
        '数码相机全画幅',
        '无人机航拍专业版'
      ];
      
      const models = ['A1', 'B2', 'C3', 'D4', 'E5', 'F6', 'G7', 'H8', 'I9', 'J10'];
      
      const versions = ['V1.0', 'V1.1', 'V2.0', 'V2.5', 'V3.0'];
      
      const processes = [
        '组装工序',
        '测试工序',
        '质检工序',
        '包装工序',
        '调试工序',
        '校准工序',
        '老化测试',
        '功能测试',
        '外观检查',
        '性能测试'
      ];
  
      // 生成指定数量的产品
      for (let i = 0; i < count; i++) {
        const productId = `P${1000 + i}`;
        const isFavorite = this.data.favoriteIds.includes(productId);
        
        products.push({
          id: productId,
          productName: productNames[Math.floor(Math.random() * productNames.length)],
          model: models[Math.floor(Math.random() * models.length)],
          version: versions[Math.floor(Math.random() * versions.length)],
          processName: processes[Math.floor(Math.random() * processes.length)],
          isFavorite: isFavorite
        });
      }
  
      return products;
    },
  
    // 行点击事件 - 显示详情弹窗
    onRowClick(e) {
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
  
    // 详情弹窗中的 + 按钮点击事件
    onAddButtonClick() {
      // 打开添加弹窗
      this.setData({
        showDetailModal: false,
        showAddModal: true,
        addFormData: {
          batchNumber: '',
          deviceNumber: '',
          time: this.getCurrentTime()
        }
      });
    },
  
    // 获取当前时间
    getCurrentTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
  
    // 详情弹窗中的 ⭐️ 按钮点击事件
    onFavoriteButtonClick() {
      const { currentProduct, favoriteIds } = this.data;
      
      if (!currentProduct) return;
      
      const productId = currentProduct.id;
      const isCurrentlyFavorite = favoriteIds.includes(productId);
      
      if (isCurrentlyFavorite) {
        // 如果已经是收藏状态，提示是否取消收藏
        wx.showModal({
          title: '取消收藏',
          content: `确定要取消收藏 "${currentProduct.productName}" 吗？`,
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
              }
            }
          }
        });
      } else {
        // 如果是未收藏状态，提示是否加入收藏
        wx.showModal({
          title: '加入收藏',
          content: `确定要将 "${currentProduct.productName}" 加入收藏吗？`,
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
              }
            }
          }
        });
      }
    },
  
    // 更新产品收藏状态
    updateProductFavoriteStatus(productId, isFavorite) {
      const { productList } = this.data;
      const updatedList = productList.map(item => {
        if (item.id === productId) {
          return { ...item, isFavorite: isFavorite };
        }
        return item;
      });
      
      this.setData({
        productList: updatedList
      });
    },
  
    // 添加弹窗输入框变化事件
    onAddFormInput(e) {
      const { field } = e.currentTarget.dataset;
      const { value } = e.detail;
      
      this.setData({
        [`addFormData.${field}`]: value
      });
    },
  
    // 保存添加信息
    saveAddInfo() {
      const { addFormData, currentProduct } = this.data;
      
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
      
      if (!addFormData.time.trim()) {
        wx.showToast({
          title: '请选择时间',
          icon: 'none'
        });
        return;
      }
      
      // 显示保存中状态
      wx.showLoading({
        title: '保存中...',
        mask: true
      });
      
      // 模拟保存到服务器（实际开发中替换为 wx.request）
      setTimeout(() => {
        wx.hideLoading();
        
        // 构造保存的数据
        const saveData = {
          ...addFormData,
          productInfo: currentProduct
        };
        
        console.log('保存的数据:', saveData);
        
        // 显示保存成功提示
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1500
        });
        
        // 关闭弹窗
        this.closeAddModal();
      }, 800);
    },
  
    // 关闭添加弹窗
    closeAddModal() {
      this.setData({
        showAddModal: false,
        addFormData: {
          batchNumber: '',
          deviceNumber: '',
          time: ''
        }
      });
    },
  
    // 上一页
    goPrevPage() {
      const { currentPage, showFavorites } = this.data;
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
      const { currentPage, totalPages, showFavorites } = this.data;
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
        showFavorites: false
      });
    },
  
    // 页面卸载时清理定时器
    onUnload() {
      if (this.data.searchTimer) {
        clearTimeout(this.data.searchTimer);
      }
    }
  });