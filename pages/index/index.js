Page({
    data: {
      // 轮播图数据
      swiperList: [
        {
          id: 1,
          imageUrl: '/images/swiper/yanmo.jpg',
          title: '智能制造，引领未来',
          link: ''
        },
        {
          id: 2,
          imageUrl: '/images/swiper/mochuang.jpg',
          title: '安全生产，质量第一',
          link: ''
        },
        {
          id: 3,
          imageUrl: '/images/swiper/qingxiji.jpg',
          title: '高效生产，精益求精',
          link: ''
        },
        {
          id: 4,
          imageUrl: '/images/swiper/chejian.jpg',
          title: '数字化转型，降本增效',
          link: ''
        }
      ],
      
      // 通知公告数据
      noticeList: [
        {
          id: 1,
          title: '关于2024年第一季度安全生产大检查的通知',
          time: '2024-03-15',
          isNew: true,
          content: '为进一步加强安全生产管理，消除安全隐患，公司决定于3月20日至3月25日开展第一季度安全生产大检查。'
        },
        {
          id: 2,
          title: '质量管理制度更新公告',
          time: '2024-03-10',
          isNew: true,
          content: '根据最新国家标准，公司质量管理制度已更新，请各部门组织学习并严格执行。'
        },
        {
          id: 3,
          title: '优秀员工评选结果公示',
          time: '2024-03-05',
          isNew: false,
          content: '2023年度优秀员工评选结果已出，共评选出10名优秀员工，详情请查看公告栏。'
        },
        {
          id: 4,
          title: '关于启用新生产管理系统的通知',
          time: '2024-02-28',
          isNew: false,
          content: '为提高生产效率，公司决定从3月1日起启用新的生产管理系统，请各位员工及时学习使用。'
        }
      ],
      
      // 功能模块
      functionModules: [
        {
          id: 1,
          icon: '🏭',
          title: '生产管理',
          color: '#667eea',
          description: '生产计划、进度跟踪',
          enabled: false
        },
        {
          id: 2,
          icon: '📊',
          title: '质量管理',
          color: '#52c41a',
          description: '质量检验、统计分析',
          enabled: true
        },
        {
          id: 3,
          icon: '📦',
          title: '采购管理',
          color: '#fa8c16',
          description: '供应商、采购订单',
          enabled: false
        },
        {
          id: 4,
          icon: '🚚',
          title: '物流管理',
          color: '#1890ff',
          description: '库存、运输管理',
          enabled: false
        }
      ],
      
      // 快捷操作
      quickActions: [
        {
          id: 1,
          icon: '➕',
          title: '快速报工',
          action: 'quickReport'
        },
        {
          id: 2,
          icon: '📝',
          title: '质量异常',
          action: 'qualityException'
        },
        {
          id: 3,
          icon: '📱',
          title: '扫码入库',
          action: 'scanIn'
        },
        {
          id: 4,
          icon: '📤',
          title: '扫码出库',
          action: 'scanOut'
        }
      ],
      
      // 数据统计
      statistics: {
        todayProduction: 1560,
        yesterdayProduction: 1420,
        productionRate: '+9.8%',
        qualityPassRate: 98.5,
        equipmentUtilization: 85.2,
        pendingTasks: 12
      },
      
      // 当前时间
      currentTime: '',
      
      
      // 用户信息
      userInfo: {
        name: '张三',
        department: '生产部',
        avatar: ''
      },
      
      // 轮播图当前索引
      currentSwiperIndex: 0
    },
  
    onLoad() {
      // 页面加载时初始化数据
      this.initPage();
    },
  
    onShow() {
      // 页面显示时更新时间和天气
      this.updateCurrentTime();
      this.fetchWeather();
      
      // 更新用户信息
      this.loadUserInfo();
    },
  
    // 初始化页面
    initPage() {
      this.updateCurrentTime();
      this.fetchWeather();
      this.loadUserInfo();
      
      // 启动时间更新定时器
      this.startTimeTimer();
    },
  
    // 更新时间
    updateCurrentTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const weekDay = this.getWeekDay(now.getDay());
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      const timeStr = `${year}-${month}-${day} ${weekDay} ${hours}:${minutes}`;
      
      this.setData({
        currentTime: timeStr
      });
    },
  
    // 获取星期几
    getWeekDay(day) {
      const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      return weekDays[day];
    },
  
    // 启动时间定时器
    startTimeTimer() {
      setInterval(() => {
        this.updateCurrentTime();
      }, 60000); // 每分钟更新一次
    },
  
    // 获取天气信息（模拟）
    fetchWeather() {
      // 模拟API请求获取天气
      setTimeout(() => {
        this.setData({
          'weatherInfo.temperature': '24°C',
          'weatherInfo.weather': '晴',
          'weatherInfo.location': '深圳市'
        });
      }, 500);
    },
  
    // 加载用户信息
    loadUserInfo() {
      const userInfo = wx.getStorageSync('userInfo');
      
      if (userInfo) {
        this.setData({
          userInfo: {
            name: userInfo.nickName || '用户',
            department: userInfo.department || '生产部',
            avatar: userInfo.avatarUrl || ''
          }
        });
      }
    },
  
    // 轮播图变化
    onSwiperChange(e) {
      this.setData({
        currentSwiperIndex: e.detail.current
      });
    },
  
    // 轮播图点击
    onSwiperTap(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.data.swiperList[index];
      
      if (item.link) {
        // 如果有链接，跳转到对应页面
        wx.navigateTo({
          url: item.link
        });
      }
    },
  
    // 功能模块点击
    onModuleTap(e) {
      const moduleId = e.currentTarget.dataset.id;
      const module = this.data.functionModules.find(item => item.id === moduleId);
      
      if (!module) return;
      
      if (!module.enabled) {
        // 功能未开放
        wx.showToast({
          title: `${module.title}功能开发中`,
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 功能已开放，根据ID跳转
      switch (moduleId) {
        case 2: // 质量管理
          wx.switchTab({
            url: '/pages/work/work'
          });
          break;
        default:
          break;
      }
    },
  
    // 快捷操作点击
    onQuickActionTap(e) {
      const action = e.currentTarget.dataset.action;
      
      switch (action) {
        case 'quickReport':
          this.showQuickReport();
          break;
        case 'qualityException':
          this.reportQualityException();
          break;
        case 'scanIn':
          this.scanCode('in');
          break;
        case 'scanOut':
          this.scanCode('out');
          break;
        default:
          break;
      }
    },
  
    // 显示快速报工
    showQuickReport() {
      wx.showToast({
        title: '快速报工功能开发中',
        icon: 'none',
        duration: 2000
      });
    },
  
    // 报告质量异常
    reportQualityException() {
      wx.showToast({
        title: '质量异常报告功能开发中',
        icon: 'none',
        duration: 2000
      });
    },
  
    // 扫码
    scanCode(type) {
      wx.scanCode({
        onlyFromCamera: true,
        success: (res) => {
          console.log('扫码结果:', res.result);
          
          wx.showModal({
            title: type === 'in' ? '扫码入库' : '扫码出库',
            content: `扫码结果：${res.result}`,
            showCancel: false,
            confirmText: '确定'
          });
        },
        fail: (err) => {
          console.error('扫码失败:', err);
          wx.showToast({
            title: '扫码失败',
            icon: 'error'
          });
        }
      });
    },
  
    // 通知公告点击
    onNoticeTap(e) {
      const noticeId = e.currentTarget.dataset.id;
      const notice = this.data.noticeList.find(item => item.id === noticeId);
      
      if (!notice) return;
      
      // 显示通知详情
      wx.showModal({
        title: notice.title,
        content: notice.content,
        showCancel: false,
        confirmText: '我知道了'
      });
    },
  
    // 查看所有通知
    viewAllNotices() {
      wx.navigateTo({
        url: '/pages/notice/list/list'
      });
    },
  
    // 今日产量点击
    onTodayProductionTap() {
      wx.navigateTo({
        url: '/pages/production/detail/detail'
      });
    },
  
    // 质量合格率点击
    onQualityRateTap() {
      wx.navigateTo({
        url: '/pages/quality/report/report'
      });
    },
  
    // 设备利用率点击
    onEquipmentUtilizationTap() {
      wx.navigateTo({
        url: '/pages/equipment/status/status'
      });
    },
  
    // 待办任务点击
    onPendingTasksTap() {
      wx.switchTab({
        url: '/pages/work/work'
      });
    },
  
    // 用户信息点击
    onUserInfoTap() {
      wx.switchTab({
        url: '/pages/my/my'
      });
    },
  
    // 搜索功能
    onSearch() {
        console.log("121");
      wx.switchTab({
        url: '/pages/query/query'
      });
    },
  
  
    // 刷新数据
    onRefresh() {
      wx.showLoading({
        title: '刷新中...',
      });
      
      // 模拟数据刷新
      setTimeout(() => {
        this.setData({
          'statistics.todayProduction': 1560 + Math.floor(Math.random() * 100),
          'statistics.qualityPassRate': 98.5 + Math.random() * 0.5,
          'statistics.pendingTasks': 12 + Math.floor(Math.random() * 5)
        });
        
        wx.hideLoading();
        wx.showToast({
          title: '刷新成功',
          icon: 'success'
        });
      }, 1000);
    },
  
    // 分享功能
    onShareAppMessage() {
      return {
        title: '生产管理系统 - 让生产更智能',
        path: '/pages/home/home',
        imageUrl: '/images/share-logo.png'
      };
    },
  
    // 下拉刷新
    onPullDownRefresh() {
      this.onRefresh();
      wx.stopPullDownRefresh();
    },
  
    // 页面卸载
    onUnload() {
      // 清理定时器等资源
      if (this.timeTimer) {
        clearInterval(this.timeTimer);
      }
    }
  });