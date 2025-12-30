/**
 * 统一的网络请求封装
 * 基于wx.request，提供统一的拦截器、错误处理等
 */

const config = require('./config.js');

// 请求队列（用于防止重复请求）
const requestQueue = new Map();

// 生成请求唯一标识
function generateRequestKey(method, url, data) {
    return `${method}:${url}:${JSON.stringify(data || {})}`;
}

// 请求拦截器
const requestInterceptor = {
    before: function (options) {
        // 添加请求时间戳
        options.timestamp = Date.now();

        // 添加请求ID（用于追踪）
        options.requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // 如果是GET请求，添加时间戳防止缓存
        if (options.method.toUpperCase() === 'GET') {
            if (!options.data) options.data = {};
            options.data._t = Date.now();
        }

        // 添加公共请求头
        const headers = options.header || {};

        // Content-Type
        if (!headers['Content-Type']) {
            if (options.method.toUpperCase() === 'POST' || options.method.toUpperCase() === 'PUT') {
                headers['Content-Type'] = 'application/json';
            } else {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }

        // 添加认证token
        try {
            const token = wx.getStorageSync('token');
            if (token) {
                headers['Authorization'] = 'Bearer ' + token;
            }
        } catch (e) {
            console.error('获取token失败:', e);
        }

        // 添加自定义头部
        headers['X-Request-ID'] = options.requestId;
        headers['X-Client-Type'] = 'wechat-miniprogram';
        headers['X-Client-Version'] = '1.0.0';

        options.header = headers;

        // 设置超时时间
        if (!options.timeout) {
            options.timeout = config.API.TIMEOUT;
        }

        // 调试日志
        if (config.API.DEBUG) {
            console.log(`[请求开始] ID: ${options.requestId}`);
            console.log(`URL: ${options.url}`);
            console.log(`Method: ${options.method}`);
            if (options.data) {
                console.log(`Data:`, options.data);
            }
        }

        // 显示加载提示
        if (options.showLoading !== false) {
            wx.showLoading({
                title: options.loadingText || '加载中...',
                mask: options.loadingMask !== false
            });
        }

        return options;
    },

    after: function (response, options) {
        // 隐藏加载提示
        if (options.showLoading !== false) {
            wx.hideLoading();
        }

        // 调试日志
        if (config.API.DEBUG) {
            const duration = Date.now() - options.timestamp;
            console.log(`[请求结束] ID: ${options.requestId}, 耗时: ${duration}ms`);
            console.log(`响应:`, response);
        }

        return response;
    }
};

// 响应拦截器
const responseInterceptor = {
    success: function (res, options) {
        // 处理HTTP状态码
        if (res.statusCode === 200) {
            // 处理空响应的情况
            if (res.data === "" || res.data === null || res.data === undefined) {
                return Promise.reject({
                    type: 'empty',
                    code: -3,
                    message: '服务器返回空响应',
                    data: null
                });
            }

            // 尝试解析JSON
            let responseData;
            try {
                // 如果已经是对象，直接使用；如果是字符串，尝试解析
                if (typeof res.data === 'string') {
                    // 检查是否是空字符串
                    if (res.data.trim() === '') {
                        return Promise.reject({
                            type: 'empty',
                            code: -3,
                            message: '服务器返回空响应',
                            data: null
                        });
                    }
                    responseData = JSON.parse(res.data);
                } else {
                    responseData = res.data;
                }
            } catch (e) {
                // JSON解析失败
                console.error('JSON解析失败:', e, '原始数据:', res.data);
                return Promise.reject({
                    type: 'parse',
                    code: -4,
                    message: '响应数据格式错误',
                    originalData: res.data,
                    error: e
                });
            }

            // 业务状态码处理
            // 假设后端返回格式为 { code: 0, message: 'success', data: {} }
            if (responseData) {
                // 请求成功
                return Promise.resolve(responseData);
            } else {
                // 业务逻辑错误
                return Promise.reject({
                    type: 'business',
                    code: responseData.code || -1,
                    message: responseData.message || '业务错误',
                    data: responseData.data
                });
            }
        } else {
            // HTTP错误
            return Promise.reject({
                type: 'http',
                code: res.statusCode,
                message: `HTTP错误: ${res.statusCode}`,
                data: res.data
            });
        }
    },

    error: function (err, options) {
        // 隐藏加载提示
        if (options.showLoading !== false) {
            wx.hideLoading();
        }

        // 错误处理
        let errorMessage = '网络请求失败';

        if (err.errMsg) {
            if (err.errMsg.includes('timeout')) {
                errorMessage = '请求超时，请检查网络连接';
            } else if (err.errMsg.includes('fail')) {
                errorMessage = '网络连接失败，请检查网络设置';
            }
        }

        // 调试日志
        if (config.API.DEBUG) {
            console.error(`[请求错误] ID: ${options.requestId}`, err);
        }

        return Promise.reject({
            type: 'network',
            code: -1,
            message: errorMessage,
            originalError: err
        });
    }
};

// 统一的请求方法
function request(options) {
    // 默认配置
    const defaultOptions = {
        method: 'GET',
        dataType: 'json',
        responseType: 'text',
        showLoading: true,
        loadingText: '加载中...',
        loadingMask: true,
        enableCache: false
    };

    // 合并配置
    const finalOptions = Object.assign({}, defaultOptions, options);

    // 生成请求key（用于防止重复请求）
    const requestKey = generateRequestKey(
        finalOptions.method,
        finalOptions.url,
        finalOptions.data
    );

    // 检查是否已有相同的请求在进行中
    if (requestQueue.has(requestKey)) {
        if (config.API.DEBUG) {
            console.warn(`重复请求被取消: ${requestKey}`);
        }
        return Promise.reject({
            type: 'duplicate',
            code: -2,
            message: '重复请求，已取消'
        });
    }

    // 添加到请求队列
    requestQueue.set(requestKey, true);

    // 请求拦截器
    const interceptedOptions = requestInterceptor.before(finalOptions);

    // 执行请求
    return new Promise((resolve, reject) => {
        wx.request({
            ...interceptedOptions,

            success: (res) => {
                // 从请求队列中移除
                requestQueue.delete(requestKey);

                // 响应拦截器 - 成功处理
                requestInterceptor.after(res, interceptedOptions);
                responseInterceptor.success(res, interceptedOptions)
                    .then(resolve)
                    .catch(reject);
            },

            fail: (err) => {
                // 从请求队列中移除
                requestQueue.delete(requestKey);

                // 响应拦截器 - 错误处理
                responseInterceptor.error(err, interceptedOptions)
                    .then(resolve) // 这里不会执行
                    .catch(reject);
            },

            complete: () => {
                // 请求完成，不进行特殊处理
            }
        });
    });
}

// 快捷方法
const http = {
    // GET请求
    get: function (url, data = {}, options = {}) {
        return request({
            ...options,
            method: 'GET',
            url: url,
            data: data
        });
    },

    // POST请求
    post: function (url, data = {}, options = {}) {
        return request({
            ...options,
            method: 'POST',
            url: url,
            data: data
        });
    },

    // PUT请求
    put: function (url, data = {}, options = {}) {
        return request({
            ...options,
            method: 'PUT',
            url: url,
            data: data
        });
    },

    // DELETE请求
    delete: function (url, data = {}, options = {}) {
        return request({
            ...options,
            method: 'DELETE',
            url: url,
            data: data
        });
    },

    // 上传文件
    upload: function (url, filePath, formData = {}, options = {}) {
        return new Promise((resolve, reject) => {
            // 显示加载提示
            if (options.showLoading !== false) {
                wx.showLoading({
                    title: options.loadingText || '上传中...',
                    mask: options.loadingMask !== false
                });
            }

            wx.uploadFile({
                url: url,
                filePath: filePath,
                name: options.name || 'file',
                formData: formData,
                header: options.header || {},

                success: (res) => {
                    // 隐藏加载提示
                    if (options.showLoading !== false) {
                        wx.hideLoading();
                    }

                    // 解析返回数据（uploadFile返回的是字符串）
                    let data = {};
                    try {
                        data = JSON.parse(res.data);
                    } catch (e) {
                        console.error('解析上传返回数据失败:', e);
                    }

                    if (res.statusCode === 200) {
                        resolve(data.data || {});
                    } else {
                        reject({
                            type: 'upload',
                            code: res.statusCode,
                            message: '文件上传失败',
                            data: data
                        });
                    }
                },

                fail: (err) => {
                    // 隐藏加载提示
                    if (options.showLoading !== false) {
                        wx.hideLoading();
                    }

                    reject({
                        type: 'network',
                        code: -1,
                        message: '上传失败，请检查网络连接',
                        originalError: err
                    });
                }
            });
        });
    },

    // 取消请求
    cancel: function (requestKey) {
        // 目前wx.request不支持取消，这里只是从队列中移除
        requestQueue.delete(requestKey);
    },

    // 清空请求队列
    clearQueue: function () {
        requestQueue.clear();
    }
};

// 导出
module.exports = {
    request,
    http,
    requestInterceptor,
    responseInterceptor,
    requestQueue
};