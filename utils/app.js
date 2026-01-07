/**
 * 具体的API调用封装
 * 使用统一的配置和请求方法
 */

const config = require('../config/config.js');
const {
    http
} = require('../config/request.js');

// 打印当前环境配置
config.API.printConfig();

// API调用类
class ApiService {
    constructor() {
        this.baseUrl = config.API.BASE_URL + config.API.API_PREFIX;
        this.endpoints = config.API_ENDPOINTS;
    }


    // 检查登录状态
    checkLogin = () => {
        const userInfo = wx.getStorageSync('userInfo');
        return !!userInfo;
    };

    // 跳转到登录页
    goToLogin = (message = '请先登录') => {
        wx.showModal({
            title: '提示',
            content: message,
            confirmText: '去登录',
            cancelText: '取消',
            success: (res) => {
                if (res.confirm) {
                    console.log('来临');
                    // 跳转到登录页
                    wx.switchTab({
                        url: '/pages/my/my'
                    });
                }
            }
        });
    };


    /**
     * 获取完整URL
     * @param {string} endpoint - 接口路径
     * @returns {string} 完整URL
     */
    getUrl(endpoint) {
        // 如果已经是完整URL，直接返回
        if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
            return endpoint;
        }

        // 确保endpoint以斜杠开头
        if (!endpoint.startsWith('/')) {
            endpoint = '/' + endpoint;
        }

        return this.baseUrl + endpoint;
    }

    // ========== 工作相关API ==========

    /**
     * 获取工作列表
     * @param {Object} params - 查询参数
     * @returns {Promise}
     */
    getWorkList(params = {}) {
        const url = this.getUrl(this.endpoints.WORK.LIST);
        return http.post(url, params, {
            showLoading: true,
            loadingText: '加载工作列表...'
        });
    }

    /**
     * 获取工作详情
     * @param {string|number} id - 工作ID
     * @returns {Promise}
     */
    getWorkDetailList(params = {}) {
        const url = this.getUrl(this.endpoints.WORK.DETAILLIST);
        return http.post(url, params, {
            showLoading: true,
            loadingText: '加载工作列表...'
        });
    }

    getJjgxjcjgbList(params = {}) {
        const url = this.getUrl(this.endpoints.WORK.JJGXJCJGBLIST);
        return http.post(url, params, {
            showLoading: true,
            loadingText: '加载工作列表...'
        });
    }

    updateCheckRecord(data) {
        const url = this.getUrl(this.endpoints.WORK.SAVEJJGXJCJGB);
        return http.put(url, data, {
            showLoading: true,
            loadingText: '更新中...'
        });
    }

    /**
     * 创建工作记录
     * @param {Object} data - 工作数据
     * @returns {Promise}
     */
    createWork(data) {
        const url = this.getUrl(this.endpoints.WORK.CREATE);
        return http.post(url, data, {
            showLoading: true,
            loadingText: '创建中...'
        });
    }

    /**
     * 更新工作记录
     * @param {string|number} id - 工作ID
     * @param {Object} data - 更新数据
     * @returns {Promise}
     */
    updateWork(data) {
        const url = this.getUrl(this.endpoints.WORK.UPDATE);
        return http.put(url, data, {
            showLoading: true,
            loadingText: '更新中...'
        });
    }

    /**
     * 删除工作记录
     * @param {string|number} id - 工作ID
     * @returns {Promise}
     */
    deleteWork(params) {
        const url = this.getUrl(this.endpoints.WORK.DELETE);
        return http.put(url, params, {
            showLoading: true,
            loadingText: '删除中...'
        });
    }

    /**
     * 搜索工作记录
     * @param {Object} params - 搜索参数
     * @returns {Promise}
     */
    searchWork(params) {
        const url = this.getUrl(this.endpoints.WORK.SEARCH);
        return http.get(url, params, {
            showLoading: true,
            loadingText: '搜索中...'
        });
    }

    // ========== 产品相关API ==========

    /**
     * 获取产品列表
     * @param {Object} params - 查询参数
     * @returns {Promise}
     */
    getProductList(params = {}) {
        const url = this.getUrl(this.endpoints.PRODUCT.LIST);
        return http.post(url, params, {
            showLoading: true,
            loadingText: '加载产品列表...'
        });
    }

    /**
     * 获取产品详情
     * @param {string} productId - 产品ID
     * @returns {Promise}
     */
    getProductDetail(productId) {
        const url = this.getUrl(this.endpoints.PRODUCT.DETAIL);
        return http.get(url, {
            productId
        }, {
            showLoading: true,
            loadingText: '加载产品详情...'
        });
    }

    /**
     * 搜索产品
     * @param {Object} params - 搜索参数
     * @returns {Promise}
     */
    searchProduct(params) {
        const url = this.getUrl(this.endpoints.PRODUCT.SEARCH);
        return http.get(url, params, {
            showLoading: true,
            loadingText: '搜索产品...'
        });
    }

    /**
     * 更新用户信息
     * @param {Object} userData - 用户数据
     * @returns {Promise}
     */
    saveProduct(params) {
        const url = this.getUrl(this.endpoints.PRODUCT.SAVE);
        return http.put(url, params, {
            showLoading: true,
            loadingText: '添加工序检查表...'
        });
    }

    // ========== 用户相关API ==========

    /**
     * 用户登录
     * @param {Object} credentials - 登录凭证
     * @returns {Promise}
     */
    checkUser(credentials) {
        const url = this.getUrl(this.endpoints.USER.CHECK_USER);
        return http.post(url, credentials, {
            showLoading: true,
            loadingText: '登录中...'
        });
    }

    /**
     * 用户登录
     * @param {Object} credentials - 登录凭证
     * @returns {Promise}
     */
    login(credentials) {
        const url = this.getUrl(this.endpoints.USER.LOGIN);
        return http.post(url, credentials, {
            showLoading: true,
            loadingText: '登录中...'
        });
    }

    /**
     * 获取用户信息
     * @returns {Promise}
     */
    getUserInfo() {
        const url = this.getUrl(this.endpoints.USER.INFO);
        return http.get(url, {}, {
            showLoading: true,
            loadingText: '获取用户信息...'
        });
    }

    /**
     * 更新用户信息
     * @param {Object} userData - 用户数据
     * @returns {Promise}
     */
    updateUserInfo(userData) {
        const url = this.getUrl(this.endpoints.USER.UPDATE);
        return http.put(url, userData, {
            showLoading: true,
            loadingText: '更新用户信息...'
        });
    }

    // ========== 文件上传 ==========

    /**
     * 上传文件
     * @param {string} filePath - 文件路径
     * @param {Object} formData - 附加表单数据
     * @returns {Promise}
     */
    uploadFile(filePath, formData = {}) {
        const url = this.getUrl(this.endpoints.UPLOAD.FILE);
        return http.upload(url, filePath, formData, {
            showLoading: true,
            loadingText: '上传文件中...'
        });
    }

    /**
     * 上传图片
     * @param {string} filePath - 图片路径
     * @param {Object} formData - 附加表单数据
     * @returns {Promise}
     */
    uploadImage(filePath, formData = {}) {
        const url = this.getUrl(this.endpoints.UPLOAD.IMAGE);
        return http.upload(url, filePath, formData, {
            showLoading: true,
            loadingText: '上传图片中...'
        });
    }

    handleApiError(error) {
        let errorMessage = '验证失败';

        switch (error.type) {
            case 'empty':
                errorMessage = '服务器返回空响应，请稍后重试';
                break;
            case 'parse':
                errorMessage = '服务器响应格式错误';
                break;
            case 'business':
                errorMessage = error.message || '业务错误';
                break;
            case 'http':
                errorMessage = `网络错误: ${error.code}`;
                break;
            case 'network':
                errorMessage = '网络连接失败，请检查网络设置';
                break;
            default:
                errorMessage = error.message || '未知错误';
        }

        wx.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 3000
        });

        // 如果是调试模式，显示详细错误信息
        if (error.originalError) {
            console.error('原始错误:', error.originalError);
        }
    }
}


// 创建单例实例
const apiService = new ApiService();

// 导出实例和类
module.exports = {
    api: apiService,
    ApiService
};