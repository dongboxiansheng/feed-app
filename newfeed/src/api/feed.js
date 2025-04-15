import request from '@/utils/request';

// 获取Feed列表，支持分页
export const getFeedList = ({ page = 1, pageSize = 10 }) => {
  return request({
    url: '/api/feed/list',
    method: 'get',
    params: {
      page,
      pageSize
    }
  });
};

// 获取推荐用户列表
export const getRecommendedUsers = () => {
  return request({
    url: '/api/users/recommended',
    method: 'get'
  });
};

// 关注/取消关注用户
export const toggleUserFollow = (userId) => {
  return request({
    url: `/api/users/${userId}/follow`,
    method: 'post'
  });
};

// 点赞/取消点赞动态
export const toggleLike = (feedId) => {
  return request({
    url: `/api/feed/${feedId}/like`,
    method: 'post'
  });
}; 