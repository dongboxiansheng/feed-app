import request from '../utils/request'

// Mock API 基础 URL - 这是一个已经配置好的 MockAPI 地址
const BASE_URL = 'https://64c8b9a8a1fe0128fbd5f5b1.mockapi.io/api/v1'

// 获取 Feed 列表
export function getFeedList(params) {
  return request({
    url: '/feeds',
    method: 'get',
    params: {
      page: params.page,
      limit: params.pageSize
    }
  })
}

// 获取推荐用户列表
export function getRecommendUsers() {
  return request({
    url: `${BASE_URL}/users`,
    method: 'get'
  })
}

// 点赞/取消点赞
export function toggleLike(feedId, isLike) {
  return request({
    url: `${BASE_URL}/feeds/${feedId}`,
    method: 'put',
    data: {
      isLiked: isLike
    }
  })
}

// 关注/取消关注用户
export function toggleFollow(userId, isFollow) {
  return request({
    url: `${BASE_URL}/users/${userId}`,
    method: 'put',
    data: {
      isFollowed: isFollow
    }
  })
} 