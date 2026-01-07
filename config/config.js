/**
 * 生产管理系统 - 配置文件
 * 统一管理API接口、环境配置等
 */

// 环境配置
const ENV = {
    DEV: 'development',    // 开发环境
    TEST: 'test',          // 测试环境
    PROD: 'production'     // 生产环境
  }
  
  // 当前环境（可通过编译条件切换）
  const CURRENT_ENV = ENV.DEV; // 默认开发环境
  
  // 各环境API配置
  const API_CONFIG = {
    // 开发环境
    [ENV.DEV]: {
      BASE_URL: 'http://localhost:8080',
      API_PREFIX: '/wechat',
      TIMEOUT: 15000, // 15秒
      DEBUG: true
    },
    
    // 测试环境
    [ENV.TEST]: {
      BASE_URL: 'http://test-api.example.com',
      API_PREFIX: '/wechat',
      TIMEOUT: 20000, // 20秒
      DEBUG: true
    },
    
    // 生产环境
    [ENV.PROD]: {
      BASE_URL: 'https://api.example.com',
      API_PREFIX: '/wechat',
      TIMEOUT: 30000, // 30秒
      DEBUG: false
    }
  }
  
  // 当前环境的配置
  const currentConfig = API_CONFIG[CURRENT_ENV];
  
  // 完整的API URL生成器
  const API = {
    // 基础配置
    BASE_URL: currentConfig.BASE_URL,
    API_PREFIX: currentConfig.API_PREFIX,
    TIMEOUT: currentConfig.TIMEOUT,
    DEBUG: currentConfig.DEBUG,
    
    // 完整的URL生成
    getFullUrl: function(path) {
      // 如果path已经是完整URL，直接返回
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      
      // 确保path以斜杠开头
      if (!path.startsWith('/')) {
        path = '/' + path;
      }
      
      // 返回完整URL
      return this.BASE_URL + this.API_PREFIX + path;
    },
    
    // 打印当前环境信息
    printConfig: function() {
      if (this.DEBUG) {
        console.log('=== API 配置信息 ===');
        console.log('当前环境:', CURRENT_ENV);
        console.log('基础URL:', this.BASE_URL);
        console.log('API前缀:', this.API_PREFIX);
        console.log('超时时间:', this.TIMEOUT, 'ms');
        console.log('调试模式:', this.DEBUG);
        console.log('==================');
      }
    }
  };
  
  // 具体的API接口定义
  API.ENDPOINTS = {
    // 工作相关
    WORK: {
      LIST: '/work/getPage',              // 获取工作列表
      DETAILLIST: '/jjgxxqbgl/getPage',          // 获取工作详情
      CREATE: '/work/saveOne',          // 创建工序详情表
      UPDATE: '/work/updateWorkOne',          // 更新工序表
      DELETE: '/work/deleteWorkOne',          // 删除工序表
      JJGXJCJGBLIST: '/work/getJjgxjcjgbList',         
      SAVEJJGXJCJGB: '/work/saveJjgxjcjgb'   // 更新检查结果表
    },
    
    // 产品相关
    PRODUCT: {
      LIST: '/product/getPage',           // 获取产品列表
      DETAIL: '/product/detail',       // 获取产品详情
      SEARCH: '/product/search',       // 搜索产品
      SAVE: '/product/saveOne',       // 保存工序检查表
      CATEGORIES: '/product/categories' // 产品分类
    },
    
    // 质量相关
    QUALITY: {
      LIST: '/quality/list',           // 质量检验列表
      DETAIL: '/quality/detail',       // 质量检验详情
      REPORT: '/quality/report',       // 质量报告
      EXCEPTION: '/quality/exception'  // 质量异常
    },
    
    // 用户相关
    USER: {
      LOGIN: '/user/login',            // 用户登录
      LOGOUT: '/user/logout',          // 用户登出
      INFO: '/user/info',              // 用户信息
      CHECK_USER: '/getUserOneByPhoneOrNo',              // 用户信息
      UPDATE: '/updateUser',          // 更新用户信息
      UPLOAD_AVATAR: '/user/upload-avatar' // 上传头像
    },
    
    // 文件上传
    UPLOAD: {
      FILE: '/upload/file',            // 文件上传
      IMAGE: '/upload/image'           // 图片上传
    }
  };
  
  // 导出配置
  module.exports = {
    ENV,
    CURRENT_ENV,
    API,
    API_CONFIG,
    API_ENDPOINTS: API.ENDPOINTS
  };