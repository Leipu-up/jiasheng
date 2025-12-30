Page({
  data: {
    // 搜索相关
    searchValue: '',
    showSearchTips: true,
    
    // 分页参数
    currentPage: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
    
    // 数据
    processList: [],
    isLoading: false,
    
    // 产品信息（从work页面传递）
    productInfo: {
      model: '',
      batchNumber: '',
      productName: '',
      version: ''
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
      actualValue: '', // 实测值
      result: 'OK', // 判定结果：OK/NG
      checkTime: '', // 检查时间，如 7:30
      workpieceStatus: '首件' // 工件状态
    },
    workpieceStatusOptions: ['首件', '工序检验', '尾件', '换刀确认'], // 工件状态选项
    resultOptions: ['OK', 'NG'] // 判定结果选项
  },

  onLoad(options) {
    // 接收work页面传递的参数
    const productInfo = {
      model: options.model || '',
      batchNumber: options.batchNumber || '',
      productName: decodeURIComponent(options.productName || ''),
      version: options.version || ''
    };
    
    this.setData({
      productInfo: productInfo
    });
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: `工序详情 - ${productInfo.model}`
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
    const { searchValue } = this.data;

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
    const { 
      searchValue, 
      currentPage, 
      pageSize, 
      totalDataCount,
      productInfo 
    } = this.data;

    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    setTimeout(() => {
      const mockData = this.generateMockData(
        productInfo,
        searchValue,
        currentPage, 
        pageSize
      );
      
      let total = totalDataCount;
      if (searchValue) {
        const allData = this.generateAllData(productInfo);
        total = allData.filter(item => 
          String(item.serialNumber).includes(searchValue)
        ).length;
      }

      const totalPages = Math.ceil(total / pageSize) || 1;

      this.setData({
        processList: mockData,
        total: total,
        totalPages: totalPages,
        isLoading: false,
        showSearchTips: !searchValue && currentPage === 1
      });

      wx.hideLoading();

      if (searchValue) {
        wx.showToast({
          title: `找到 ${mockData.length} 条工序记录`,
          icon: 'success',
          duration: 1500
        });
      }
    }, 600);
  },

  // 生成模拟数据（当前页）
  generateMockData(productInfo, keyword, page, pageSize) {
    const data = [];
    const startIndex = (page - 1) * pageSize;
    
    const allData = this.generateAllData(productInfo);
    
    let filteredData = allData;
    if (keyword) {
      filteredData = allData.filter(item => 
        String(item.serialNumber).includes(keyword)
      );
    }
    
    const pageData = filteredData.slice(startIndex, startIndex + pageSize);
    
    return pageData;
  },

  // 生成所有工序数据
  generateAllData(productInfo) {
    const data = [];
    const { model, batchNumber } = productInfo;
    
    const processNames = [
      '原料检验', '切割工序', 'CNC加工', '打磨工序', '电镀处理',
      '组装工序', '功能测试', '外观检查', '包装工序', '入库检查'
    ];
    
    const specifications = [
      '±0.1mm', '±0.05mm', '±0.2mm', '±0.3mm', '±0.15mm',
      '≤0.05mm', '≥99%', '100±2%', '无毛刺', '光滑平整'
    ];
    
    // 频次数组 - 包含不同的频次格式
    const frequencies = [
      '1pcs/6h',
      '1pcs/2h',
      '1pcs/4h',
      '1pcs/3h',
      '1pcs/1h',
      '1pcs/12h',
      '2pcs/8h',
      '1pcs/24h'
    ];
    
    for (let i = 1; i <= 50; i++) {
      const processIndex = (i - 1) % processNames.length;
      const specIndex = (i - 1) % specifications.length;
      const freqIndex = (i - 1) % frequencies.length;
      
      data.push({
        id: `${batchNumber}-P${String(i).padStart(3, '0')}`,
        serialNumber: i,
        processName: processNames[processIndex],
        specification: specifications[specIndex],
        frequency: frequencies[freqIndex],
        model: model,
        batchNumber: batchNumber,
        status: i % 5 === 0 ? '待完成' : i % 3 === 0 ? '进行中' : '已完成',
        operator: `操作员${String((i % 10) + 1).padStart(2, '0')}`,
        startTime: this.generateRandomTime(),
        endTime: this.generateRandomTime(),
        remark: i % 4 === 0 ? '需要特别关注' : i % 7 === 0 ? '关键工序' : '正常'
      });
    }
    
    return data;
  },

  // 生成随机时间
  generateRandomTime() {
    const now = new Date();
    const randomHours = Math.floor(Math.random() * 24);
    const randomMinutes = Math.floor(Math.random() * 60);
    
    const date = new Date(now);
    date.setHours(randomHours);
    date.setMinutes(randomMinutes);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 行点击事件
  onRowClick(e) {
    const item = e.currentTarget.dataset.item;
    
    // 根据频次生成填空项
    const blankItems = this.generateBlankItems(item.frequency);
    
    this.setData({
      showDetailModal: true,
      currentProcess: item,
      blankItems: blankItems
    });
  },

  // 根据频次生成填空项
  generateBlankItems(frequency) {
    // 解析频次字符串，如 "1pcs/6h"
    const regex = /(\d+)pcs\/(\d+)h/;
    const match = frequency.match(regex);
    
    if (!match) {
      // 如果没有匹配到格式，默认生成1个填空
      return [this.createBlankItem(1)];
    }
    
    const pcs = parseInt(match[1]); // 每X件
    const hours = parseInt(match[2]); // 每Y小时
    
    // 假设一天工作12小时，计算需要的填空数量
    const blankCount = Math.floor(12 / hours) * pcs;
    
    const items = [];
    for (let i = 1; i <= blankCount; i++) {
      items.push(this.createBlankItem(i));
    }
    
    return items;
  },

  // 创建填空项
  createBlankItem(index) {
    return {
      id: index,
      isFilled: false,
      data: null,
      status: '未填写'
    };
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
          actualValue: '',
          result: 'OK',
          checkTime: this.getCurrentTime(),
          workpieceStatus: '首件'
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

  // 关闭填空弹窗
  closeBlankModal() {
    this.setData({
      showBlankModal: false,
      currentBlankIndex: -1,
      currentBlankItem: null,
      blankFormData: {
        actualValue: '',
        result: 'OK',
        checkTime: '',
        workpieceStatus: '首件'
      }
    });
  },

  // 填空弹窗输入事件
  onBlankFormInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`blankFormData.${field}`]: value
    });
  },

  // 时间选择器变化
  onCheckTimeChange(e) {
    this.setData({
      'blankFormData.checkTime': e.detail.value
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
  saveBlankItem() {
    const { 
      blankFormData, 
      currentBlankIndex, 
      blankItems 
    } = this.data;

    // 验证表单
    if (!blankFormData.actualValue.trim()) {
      wx.showToast({
        title: '请输入实测值',
        icon: 'none'
      });
      return;
    }

    if (!blankFormData.checkTime) {
      wx.showToast({
        title: '请选择检查时间',
        icon: 'none'
      });
      return;
    }

    // 更新填空项
    const updatedBlankItems = [...blankItems];
    updatedBlankItems[currentBlankIndex] = {
      ...updatedBlankItems[currentBlankIndex],
      isFilled: true,
      data: { ...blankFormData },
      status: blankFormData.result === 'OK' ? '已完成(OK)' : '已完成(NG)'
    };

    this.setData({
      blankItems: updatedBlankItems,
      showBlankModal: false,
      currentBlankIndex: -1,
      currentBlankItem: null,
      blankFormData: {
        actualValue: '',
        result: 'OK',
        checkTime: '',
        workpieceStatus: '首件'
      }
    });

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500
    });
  },

  // 上一页
  goPrevPage() {
    const { currentPage } = this.data;
    if (currentPage > 1) {
      this.setData({
        currentPage: currentPage - 1
      });
      this.loadData();
    }
  },

  // 下一页
  goNextPage() {
    const { currentPage, totalPages } = this.data;
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