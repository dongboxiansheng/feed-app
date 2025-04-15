import axios from 'axios';
import { Toast } from 'vant';

// 创建 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '',
  timeout: 15000
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 可以在这里添加 token 等认证信息
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    
    // 这里可以根据后端的响应结构进行调整
    if (res.code !== 0) {
      Toast.fail(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    
    return res.data;
  },
  error => {
    console.error('Response error:', error);
    Toast.fail(error.message || '网络错误');
    return Promise.reject(error);
  }
);

export default service; 