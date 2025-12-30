// 引入API服务
const {
    api
} = require('../../utils/app');

Page({
    data: {
        showLoginModal: false,
        showEditModal: false,
        editAvatarUrl: '',
        // 用户信息
        userInfo: {
            avatarUrl: '', // 微信头像URL
            nickName: '', // 微信昵称
            phoneNumber: '', // 手机号
            userId: '', // 用户ID
            department: '', // 部门
            employeeNo: '', // 工号
        },

        // 其他统计信息
        statistics: {
            totalTasks: '0', // 总任务数
            completedTasks: '0', // 已完成任务
            pendingTasks: '0', // 待完成任务
            workDays: '0' // 累计工作天数
        },

        // 功能菜单
        menuItems: [{
                id: 1,
                icon: '📋',
                title: '我的任务',
                subTitle: '查看和跟进工作任务',
                url: ''
            },
            {
                id: 2,
                icon: '⭐',
                title: '我的收藏',
                subTitle: '收藏的产品和工序',
                url: ''
            },
            // {
            //     id: 3,
            //     icon: '📊',
            //     title: '工作统计',
            //     subTitle: '查看工作数据报表',
            //     url: ''
            // },
            // {
            //     id: 4,
            //     icon: '⚙️',
            //     title: '设置',
            //     subTitle: '应用设置和偏好',
            //     url: ''
            // }
        ],

        // 版本信息
        appVersion: '1.0.0',
        lastLoginTime: ''
    },
    // 表单输入事件（通用方法）
    onFormInput(e) {
        const {
            field
        } = e.currentTarget.dataset;
        const {
            value
        } = e.detail;

        // 根据字段名更新对应的数据
        this.setData({
            [field]: value.trim() // 去除空格
        });
    },
    onLoad() {
        // 页面加载时尝试获取用户信息
        this.loadUserInfo();
        // 获取最后登录时间
        this.getLastLoginTime();
    },

    onShow() {
        // 页面显示时刷新用户信息
        this.loadUserInfo();
    },

    // 加载用户信息
    loadUserInfo() {
        // 先从缓存中读取用户信息
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            this.setData({
                'userInfo': userInfo
            });
        } else {
            // 如果没有缓存，则使用默认信息
            this.setDefaultUserInfo();
        }
    },

    // 设置默认用户信息
    setDefaultUserInfo() {
        this.setData({
            'userInfo': {
                avatarUrl: '/images/touxiang.png',
                nickName: '未登录',
                phoneNumber: '未绑定',
                userId: '',
                department: '',
                employeeNo: ''
            }
        });
    },
    toEdit() {
        this.setData({
            showEditModal: true
        });
    },
    closeEditModal() {
        this.setData({
            showEditModal: false,
            phoneOrNo: ''
        });
    },
    choosePhoto(event) {
        console.log(event.detail.avatarUrl)
        this.setData({
            editAvatarUrl: event.detail.avatarUrl, // 微信头像URL
        })
    },
    updateUser() {

        // 获取输入的值
        var editName = this.data.editName;
        if (!editName) {
            editName = this.data.userInfo.nickName
        }
        var editPhone = this.data.editPhone;
        if (!editPhone) {
            editPhone = this.data.userInfo.phoneNumber
        }
        const editAvatarUrl = this.data.editAvatarUrl;
        console.log('用户输入的值:', editName, editPhone, editAvatarUrl);
        if (!editName || !editPhone || !editAvatarUrl) {
            wx.showToast({
                title: '输入的值不能为空',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        if (editName.length > 20) {
            wx.showToast({
                title: '昵称长度不能大于20个字',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        // 判断是否为手机号
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(editPhone.trim())) {
            wx.showToast({
                title: '输入的手机号格式不正确',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        // 构造符合WxyhEntity结构的对象
        const wxyhEntity = {
            phone: editPhone,
            nickname: editName,
            avatar: this.data.editAvatarUrl,
            id: this.data.userInfo.userId
        };
        // 校验用户是否存在
        api.updateUserInfo(wxyhEntity).then(responseData => {
            // 处理成功响应
            this.setData({
                'userInfo': {
                    avatarUrl: responseData.avatar,
                    nickName: responseData.nickname,
                    phoneNumber: responseData.phone,
                    userId: responseData.id,
                    department: '',
                    employeeNo: responseData.employeeNo
                },
                editAvatarUrl: responseData.avatar,
            });
            // 更新本地存储
            wx.setStorageSync('userInfo', {
                ...this.data.userInfo
            });
            console.log(wx.getStorageSync('userInfo'));
            this.closeEditModal();
        }).catch(error => {
            wx.hideLoading();
            // 根据错误类型显示不同的提示
            api.handleApiError(error);
        });
    },
    toLogin() {
        this.setData({
            showLoginModal: true
        });
    },
    closeLoginModal() {
        this.setData({
            showLoginModal: false,
            phoneOrNo: ''
        });
    },
    checkUser() {
        // 获取输入的值
        const phoneOrNo = this.data.phoneOrNo;
        console.log('用户输入的值:', phoneOrNo);
        // 验证输入是否为空
        if (!phoneOrNo) {
            wx.showToast({
                title: '请输入手机号或工号',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        // 构造符合WxyhEntity结构的对象
        const wxyhEntity = {
            phone: phoneOrNo,
            employeeNo: phoneOrNo
        };
        // 校验用户是否存在
        api.checkUser(wxyhEntity).then(responseData => {
            // 处理成功响应
            this.setData({
                'userInfo': {
                    avatarUrl: responseData.avatarUrl,
                    nickName: responseData.nickname,
                    phoneNumber: responseData.phone ? responseData.phone : '未绑定',
                    userId: responseData.id,
                    department: '',
                    employeeNo: responseData.employeeNo
                },
                editAvatarUrl: responseData.avatarUrl,
            });
            // 更新本地存储
            wx.setStorageSync('userInfo', {
                ...this.data.userInfo
            });
            console.log(wx.getStorageSync('userInfo'));
            this.closeLoginModal();
        }).catch(error => {
            wx.hideLoading();
            if (error.type === 'empty') {
                wx.showToast({
                    title: '当前手机号/工号下的用户不存在!',
                    icon: 'none',
                    duration: 3000
                });
            } else {
                // 根据错误类型显示不同的提示
                api.handleApiError(error);
            }
        });
    },

    // 获取最后登录时间
    getLastLoginTime() {
        const lastLogin = wx.getStorageSync('lastLoginTime');
        const now = new Date();

        if (!lastLogin) {
            // 第一次登录
            const timeStr = this.formatDateTime(now);
            wx.setStorageSync('lastLoginTime', timeStr);
            this.setData({
                lastLoginTime: timeStr
            });
        } else {
            this.setData({
                lastLoginTime: lastLogin
            });

            // 更新最后登录时间
            wx.setStorageSync('lastLoginTime', this.formatDateTime(now));
        }
    },

    // 格式化日期时间
    formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    },


    // 菜单项点击事件
    onMenuItemClick(e) {
        const itemId = e.currentTarget.dataset.id;
        const item = this.data.menuItems.find(item => item.id === itemId);

        if (!item) return;

        switch (itemId) {
            case 1:
                // 我的工作
                wx.navigateTo({
                    url: '/pages/worK/worK',
                });
                break;
            case 2:
                // 我的收藏
                wx.navigateTo({
                    url: '/pages/query/query',
                });
                break;
                // case 3:
                //     // 工作统计
                //     wx.navigateTo({
                //         url: '/pages/my/statistics/statistics',
                //     });
                //     break;
                // case 4:
                //     // 设置
                //     wx.navigateTo({
                //         url: '/pages/my/settings/settings',
                //     });
                //     break;
            default:
                break;
        }
    },

    // 退出登录
    logout() {
        wx.showModal({
            title: '确认退出',
            content: '确定要退出登录吗？',
            confirmText: '退出',
            confirmColor: '#ff4444',
            success: (res) => {
                if (res.confirm) {
                    this.performLogout();
                }
            }
        });
    },

    // 执行退出登录
    performLogout() {
        wx.showLoading({
            title: '正在退出...',
            mask: true
        });
        // 模拟退出过程
        setTimeout(() => {
            // 清除用户信息缓存
            wx.removeStorageSync('userInfo');
            // 重置用户信息
            this.setDefaultUserInfo();
            wx.hideLoading();
            wx.showToast({
                title: '已退出登录',
                icon: 'success',
                duration: 1500
            });
            // 返回到首页或重新登录
            setTimeout(() => {
                wx.switchTab({
                    url: '/pages/index/index',
                });
            }, 1500);
        }, 1000);
    },

    // 关于我们
    aboutUs() {
        wx.showModal({
            title: '关于我们',
            content: `生产管理系统 v${this.data.appVersion}\n\n© 2025 生产管理系统\n致力于提升生产效率与质量`,
            showCancel: false,
            confirmText: '知道了'
        });
    },

    // 检查更新
    checkUpdate() {
        const updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate((res) => {
            // 请求完新版本信息的回调
            if (res.hasUpdate) {
                updateManager.onUpdateReady(() => {
                    wx.showModal({
                        title: '更新提示',
                        content: '新版本已经准备好，是否重启应用？',
                        success: (res) => {
                            if (res.confirm) {
                                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                updateManager.applyUpdate();
                            }
                        }
                    });
                });

                updateManager.onUpdateFailed(() => {
                    // 新版本下载失败
                    wx.showToast({
                        title: '更新失败',
                        icon: 'error'
                    });
                });
            } else {
                wx.showToast({
                    title: '已是最新版本',
                    icon: 'success'
                });
            }
        });
    },

    // 分享功能
    onShareAppMessage() {
        return {
            title: '生产管理系统',
            path: '/pages/work/work',
            imageUrl: '/images/share-logo.png'
        };
    },

    // 分享到朋友圈
    onShareTimeline() {
        return {
            title: '生产管理系统',
            query: '',
            imageUrl: '/images/swiper/chejian.jpg'
        };
    },

    // 联系客服
    contactCustomerService() {
        wx.makePhoneCall({
            phoneNumber: '18915755120',
        });
    }
});