import axios from 'axios';
import { Toast } from 'vant';

// 创建 axios 实例
const service = axios.create({
  baseURL: 'https://67fe52e058f18d7209edb9e5.mockapi.io',  // 直接填入你的 MockAPI 地址
  timeout: 15000
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    console.log('Request URL:', config.baseURL + config.url);
    console.log('Request Method:', config.method);
    console.log('Request Params:', config.params);
    return config;
  },
  error => {
    console.log(error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    console.log('Response:', response.data);
    return response;
  },
  error => {
    console.log('Error:', error.response || error);
    Toast(error.message || '请求失败');
    return Promise.reject(error);
  }
);

export default service; 