<template>
  <div class="feed-container">
    <van-pull-refresh
      v-model="refreshing"
      @refresh="onRefresh"
      :head-height="80"
      :pull-distance="120"
      :disabled="!canRefresh"
      success-text="刷新成功"
      pulling-text="下拉即可刷新"
      loosing-text="释放立即刷新"
      loading-text="加载中..."
    >
      <div class="waterfall-container">
        <div class="waterfall-column">
          <template v-for="(item, index) in leftItems" :key="item?.id">
            <!-- 骨架屏 -->
            <div v-if="!item || item.loading" class="feed-item skeleton">
              <div class="skeleton-media"></div>
              <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-tags">
                  <div class="skeleton-tag"></div>
                  <div class="skeleton-tag"></div>
                </div>
                <div class="skeleton-user">
                  <div class="skeleton-avatar"></div>
                  <div class="skeleton-info"></div>
                </div>
              </div>
            </div>
            <!-- 优质用户推荐 -->
            <div v-else-if="index === 1" class="feed-item recommended-users">
              <div class="section-header">
                <h3 class="section-title">优质用户推荐</h3>
                <div class="section-dots">
                  <span v-for="i in 3" :key="i" 
                        class="dot" 
                        :class="{ 'active': currentPage === i - 1 }">
                  </span>
                </div>
              </div>
              <div class="user-list">
                <div v-for="i in 3" :key="i" class="recommended-user">
                  <div class="user-avatar-wrap">
                    <img :src="displayUsers[i-1].avatar" class="user-avatar" />
                    <van-button size="mini" class="follow-btn" 
                              :class="{ 'followed': displayUsers[i-1].isFollowed }" 
                              @click="toggleFollow(displayUsers[i-1])">
                      +
                    </van-button>
                  </div>
                  <div class="user-info-wrap">
                    <div class="user-name">{{ displayUsers[i-1].name }}</div>
                    <span class="user-desc">{{ displayUsers[i-1].description }}</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- 内容卡片 -->
            <div v-else class="feed-item">
              <div class="feed-content">
                <div class="media-wrapper">
                  <template v-if="item.type === 'image'">
                    <div v-if="!item.mediaLoaded || item.loadError" class="skeleton-media"></div>
                    <img v-show="item.mediaLoaded && !item.loadError"
                         :src="item.media"
                         class="media" 
                         @load="onImageLoad(item)"
                         @error="onImageError(item)" />
                  </template>
                  <template v-else-if="item.type === 'video'">
                    <div v-if="!item.mediaLoaded || item.loadError" class="skeleton-media"></div>
                    <div v-show="item.mediaLoaded && !item.loadError"
                         class="video-container"
                         @click="toggleVideo(item)">
                      <img v-if="!item.isPlaying" 
                           :src="item.thumbnail" 
                           class="video-thumbnail"
                           @load="onThumbnailLoad(item)"
                           @error="onThumbnailError(item)" />
                      <video
                        :ref="el => { if (el) videoRefs[item.id] = el }"
                        class="media"
                        :class="{ 'playing': item.isPlaying }"
                        playsinline
                        webkit-playsinline
                        x5-playsinline
                        preload="metadata"
                        :poster="item.thumbnail"
                        @loadedmetadata="onVideoMetadataLoaded(item)"
                        @error="onVideoError(item)"
                        @play="onVideoPlay(item)"
                        @pause="onVideoPause(item)"
                        @ended="onVideoEnded(item)"
                      >
                        <source :src="item.media" type="video/mp4">
                      </video>
                      <div v-show="!item.isPlaying" class="video-overlay">
                        <van-icon name="play-circle-o" class="play-icon" />
                      </div>
                      <span class="video-duration">{{ item.duration }}</span>
                    </div>
                  </template>
                </div>
                <div class="content-info">
                  <h3 class="title">{{ item.title }}</h3>
                  <div class="tags" v-if="item.tags && item.tags.length">
                    <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
                  </div>
                  <div class="user-interaction">
                    <div class="user-info">
                      <template v-if="!item.author.loaded">
                        <div class="skeleton-avatar"></div>
                        <div class="skeleton-info" style="width: 60px"></div>
                      </template>
                      <template v-else>
                        <img :src="item.author.avatar" 
                             class="avatar"
                             @load="onAuthorImageLoad(item)"
                             @error="onAuthorImageError(item)" />
                        <span class="username">{{ item.author.name }}</span>
                      </template>
                    </div>
                    <div class="likes">
                      <van-icon name="thumb-circle-o" :class="{ 'liked': item.isLiked }" />
                      <span class="like-count">{{ item.likes }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div class="waterfall-column">
          <template v-for="item in rightItems" :key="item?.id">
            <!-- 骨架屏 -->
            <div v-if="!item || item.loading" class="feed-item skeleton">
              <div class="skeleton-media"></div>
              <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-tags">
                  <div class="skeleton-tag"></div>
                  <div class="skeleton-tag"></div>
                </div>
                <div class="skeleton-user">
                  <div class="skeleton-avatar"></div>
                  <div class="skeleton-info"></div>
                </div>
              </div>
            </div>
            <!-- 内容卡片 -->
            <div v-else class="feed-item">
              <div class="feed-content">
                <div class="media-wrapper">
                  <template v-if="item.type === 'image'">
                    <div v-if="!item.mediaLoaded || item.loadError" class="skeleton-media"></div>
                    <img v-show="item.mediaLoaded && !item.loadError"
                         :src="item.media"
                         class="media" 
                         @load="onImageLoad(item)"
                         @error="onImageError(item)" />
                  </template>
                  <template v-else-if="item.type === 'video'">
                    <div v-if="!item.mediaLoaded || item.loadError" class="skeleton-media"></div>
                    <div v-show="item.mediaLoaded && !item.loadError"
                         class="video-container"
                         @click="toggleVideo(item)">
                      <img v-if="!item.isPlaying" 
                           :src="item.thumbnail" 
                           class="video-thumbnail"
                           @load="onThumbnailLoad(item)"
                           @error="onThumbnailError(item)" />
                      <video
                        :ref="el => { if (el) videoRefs[item.id] = el }"
                        class="media"
                        :class="{ 'playing': item.isPlaying }"
                        playsinline
                        webkit-playsinline
                        x5-playsinline
                        preload="metadata"
                        :poster="item.thumbnail"
                        @loadedmetadata="onVideoMetadataLoaded(item)"
                        @error="onVideoError(item)"
                        @play="onVideoPlay(item)"
                        @pause="onVideoPause(item)"
                        @ended="onVideoEnded(item)"
                      >
                        <source :src="item.media" type="video/mp4">
                      </video>
                      <div v-show="!item.isPlaying" class="video-overlay">
                        <van-icon name="play-circle-o" class="play-icon" />
                      </div>
                      <span class="video-duration">{{ item.duration }}</span>
                    </div>
                  </template>
                </div>
                <div class="content-info">
                  <h3 class="title">{{ item.title }}</h3>
                  <div class="tags" v-if="item.tags && item.tags.length">
                    <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
                  </div>
                  <div class="user-interaction">
                    <div class="user-info">
                      <template v-if="!item.author.loaded">
                        <div class="skeleton-avatar"></div>
                        <div class="skeleton-info" style="width: 60px"></div>
                      </template>
                      <template v-else>
                        <img :src="item.author.avatar" 
                             class="avatar"
                             @load="onAuthorImageLoad(item)"
                             @error="onAuthorImageError(item)" />
                        <span class="username">{{ item.author.name }}</span>
                      </template>
                    </div>
                    <div class="likes">
                      <van-icon name="thumb-circle-o" :class="{ 'liked': item.isLiked }" />
                      <span class="like-count">{{ item.likes }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="loading-more" ref="loadingRef">
        <van-loading v-if="loading" size="24px" vertical>加载中...</van-loading>
        <div v-else-if="finished" class="loading-finished">没有更多了</div>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onUnmounted, watch } from 'vue';
import { Toast } from 'vant';
import axios from 'axios';
import Mock from 'mockjs';
import { useRoute } from 'vue-router';
import { getFeedList } from '../api/feed';

const route = useRoute();
const feedType = computed(() => route.query.type || 'default');
const userId = computed(() => route.query.userId || '');

const items = ref([]);
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const page = ref(1);
const loadingRef = ref(null);
const currentPage = ref(0);
let timer = null;
const canRefresh = ref(false);
const scrollTop = ref(0);

// 添加触摸相关的变量
const touchStartY = ref(0);
const touchEndY = ref(0);
const touchStartTime = ref(0);

// 静态的推荐用户数据
const recommendedUsers = ref([
  {
    id: 1,
    name: '阿萌',
    avatar: 'https://picsum.photos/50/50',
    description: '不装无害，只做自己喜欢的',
    isFollowed: false,
    loaded: true
  },
  {
    id: 2,
    name: '青空千绘',
    avatar: 'https://picsum.photos/51/51',
    description: '关注我，领取抽奖礼物！',
    isFollowed: false,
    loaded: true
  },
  {
    id: 3,
    name: '大漠无情',
    avatar: 'https://picsum.photos/52/52',
    description: '原创游戏手绘视频，每天更新',
    isFollowed: false,
    loaded: true
  },
  {
    id: 4,
    name: '小兔几',
    avatar: 'https://picsum.photos/53/53',
    description: '分享游戏攻略和有趣的事',
    isFollowed: false,
    loaded: true
  },
  {
    id: 5,
    name: '星空漫步',
    avatar: 'https://picsum.photos/54/54',
    description: '专注游戏测评十年',
    isFollowed: false,
    loaded: true
  },
  {
    id: 6,
    name: '游戏达人',
    avatar: 'https://picsum.photos/55/55',
    description: '深度解析游戏机制',
    isFollowed: false,
    loaded: true
  }
]);

// 计算当前显示的3个用户
const displayUsers = computed(() => {
  const startIndex = currentPage.value * 3;
  return [
    recommendedUsers.value[startIndex % 6],
    recommendedUsers.value[(startIndex + 1) % 6],
    recommendedUsers.value[(startIndex + 2) % 6]
  ];
});

// 自动轮播
const startAutoPlay = () => {
  timer = setInterval(() => {
    currentPage.value = (currentPage.value + 1) % 3;
  }, 3000);
};

// 关注/取消关注
const toggleFollow = (user) => {
  user.isFollowed = !user.isFollowed;
  Toast({
    message: user.isFollowed ? '关注成功' : '已取消关注',
    position: 'bottom'
  });
};

// 分成两列
const leftItems = computed(() => items.value.filter((_, index) => index % 2 === 0));
const rightItems = computed(() => items.value.filter((_, index) => index % 2 === 1));

// 视频引用集合
const videoRefs = ref({});

// 根据参数获取不同的数据
const getFeedData = async (pageNum, pageSize) => {
  try {
    const response = await getFeedList({
      page: pageNum,
      pageSize: pageSize,
      type: feedType.value,
      userId: userId.value
    });
    
    return response.data;
  } catch (error) {
    console.error('Get feed data error:', error);
    Toast('获取数据失败');
    return [];
  }
};

// 修改 loadMore 函数
const loadMore = async () => {
  if (loading.value || finished.value || refreshing.value) return;
  loading.value = true;
  
  try {
    const newData = await getFeedData(page.value, 10);
    
    // 将 API 返回的数据与默认数据合并
    const newItems = newData.map(item => ({
      ...item,
      type: item.type || Mock.Random.pick(['video', 'image']),
      media: item.media || Mock.Random.pick([
        'https://picsum.photos/300/400',
        'https://picsum.photos/300/500',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
      ]),
      thumbnail: item.thumbnail || 'https://picsum.photos/300/400',
      duration: item.duration || Mock.Random.pick(['00:15', '00:30', '01:00']),
      tags: item.tags || [Mock.Random.pick(['游戏', '动漫', '美食', '生活']), Mock.Random.pick(['攻略', '二次元', '烹饪', '日常'])],
      author: item.author || {
        name: Mock.Random.cname(),
        avatar: 'https://picsum.photos/40/40',
        loaded: true
      },
      likes: item.likes || Mock.Random.integer(0, 9999),
      isLiked: item.isLiked || Mock.Random.boolean(),
      isPlaying: false,
      loading: false,
      mediaLoaded: false,
      loadError: false
    }));
    
    if (page.value >= 5 || newItems.length === 0) {
      finished.value = true;
      Toast('没有更多内容了');
    } else {
      items.value.push(...newItems);
      page.value++;
    }
  } catch (error) {
    console.error('Load more error:', error);
    Toast('加载失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 修改 onRefresh 函数
const onRefresh = async () => {
  try {
    refreshing.value = true;
    finished.value = false;
    page.value = 1;
    
    const newData = await getFeedData(1, 10);
    
    // 将 API 返回的数据与默认数据合并
    const newItems = newData.map(item => ({
      ...item,
      type: item.type || Mock.Random.pick(['video', 'image']),
      media: item.media || Mock.Random.pick([
        'https://picsum.photos/300/400',
        'https://picsum.photos/300/500',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
      ]),
      thumbnail: item.thumbnail || 'https://picsum.photos/300/400',
      duration: item.duration || Mock.Random.pick(['00:15', '00:30', '01:00']),
      tags: item.tags || [Mock.Random.pick(['游戏', '动漫', '美食', '生活']), Mock.Random.pick(['攻略', '二次元', '烹饪', '日常'])],
      author: item.author || {
        name: Mock.Random.cname(),
        avatar: 'https://picsum.photos/40/40',
        loaded: true
      },
      likes: item.likes || Mock.Random.integer(0, 9999),
      isLiked: item.isLiked || Mock.Random.boolean(),
      isPlaying: false,
      loading: false,
      mediaLoaded: false,
      loadError: false
    }));
    
    items.value = newItems;
    Toast('刷新成功');
  } catch (error) {
    console.error('Refresh error:', error);
    Toast('刷新失败');
    items.value = [];
  } finally {
    refreshing.value = false;
  }
};

// 图片加载成功处理
const onImageLoad = (item) => {
  if (!item) return;
  item.mediaLoaded = true;
  item.loadError = false;
  item.loading = false;
  nextTick(() => {
    window.dispatchEvent(new Event('resize'));
  });
};

// 图片加载失败处理
const onImageError = (item) => {
  if (!item) return;
  item.loadError = true;
  item.mediaLoaded = false;
  item.loading = false;
};

// 视频缩略图加载成功处理
const onThumbnailLoad = (item) => {
  if (!item) return;
  item.mediaLoaded = true;
  item.loadError = false;
  item.loading = false;
};

// 视频缩略图加载失败处理
const onThumbnailError = (item) => {
  if (!item) return;
  item.loadError = true;
  item.mediaLoaded = false;
  item.loading = false;
};

// 视频元数据加载成功处理
const onVideoMetadataLoaded = (item) => {
  if (!item) return;
  item.mediaLoaded = true;
  item.loadError = false;
  item.loading = false;
};

// 视频加载失败处理
const onVideoError = (item) => {
  if (!item) return;
  item.loadError = true;
  item.mediaLoaded = false;
  item.loading = false;
};

// 修改作者头像加载处理方法
const onAuthorImageLoad = (item) => {
  if (!item || !item.author) return;
  item.author.loaded = true;
};

// 修改作者头像加载失败处理方法
const onAuthorImageError = (item) => {
  if (!item || !item.author) return;
  item.author.loaded = false;
};

let observer;

// 组件挂载时添加滚动监听
onMounted(() => {
  loadMore();
  setupIntersectionObserver();
  startAutoPlay();
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
});

// 组件卸载时移除滚动监听
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchmove', handleTouchMove);
  window.removeEventListener('touchend', handleTouchEnd);
  if (observer) {
    observer.disconnect();
  }
});

// 视频播放控制
const toggleVideo = (item) => {
  if (!item || !videoRefs.value[item.id]) return;
  
  const video = videoRefs.value[item.id];
  if (item.isPlaying) {
    video.pause();
  } else {
    // 暂停其他正在播放的视频
    Object.entries(videoRefs.value).forEach(([id, v]) => {
      if (id !== item.id && !v.paused) {
        v.pause();
      }
    });
    video.play();
  }
};

// 视频播放事件处理
const onVideoPlay = (item) => {
  if (!item) return;
  item.isPlaying = true;
  item.mediaLoaded = true;
};

const onVideoPause = (item) => {
  if (!item) return;
  item.isPlaying = false;
};

const onVideoEnded = (item) => {
  if (!item) return;
  item.isPlaying = false;
};

// 监听路由参数变化
watch(
  () => route.query,
  async (newQuery) => {
    console.log('Route query changed:', newQuery);
    refreshing.value = true;
    finished.value = false;
    page.value = 1;
    items.value = [];
    await onRefresh();
  },
  { immediate: true }
);

// 滚动监听
const handleScroll = () => {
  if (loading.value || finished.value || refreshing.value) return;
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = window.innerHeight || document.documentElement.clientHeight;
  
  // 更新是否在顶部的状态
  canRefresh.value = scrollTop <= 0;
  
  // 当距离底部小于阈值时触发加载更多
  if (scrollHeight - scrollTop - clientHeight <= 50 && !loading.value) {
    loadMore();
  }
};

// 添加触摸事件处理
const handleTouchStart = (e) => {
  // 只在页面滚动到顶部时记录触摸起始位置
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop <= 0) {
    touchStartY.value = e.touches[0].clientY;
    touchStartTime.value = Date.now();
  }
};

const handleTouchMove = (e) => {
  if (touchStartY.value > 0) {
    touchEndY.value = e.touches[0].clientY;
  }
};

const handleTouchEnd = () => {
  if (touchStartY.value > 0 && touchEndY.value > 0) {
    const touchDuration = Date.now() - touchStartTime.value;
    const touchDistance = touchEndY.value - touchStartY.value;
    
    // 只有在页面顶部且是向上滑动时才触发刷新
    if (touchDistance < -50 && touchDuration < 300 && canRefresh.value) {
      onRefresh();
    }
    
    // 重置触摸状态
    touchStartY.value = 0;
    touchEndY.value = 0;
    touchStartTime.value = 0;
  }
};

// 修改 Intersection Observer 配置
const setupIntersectionObserver = () => {
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !loading.value && !finished.value && !refreshing.value) {
        loadMore();
      }
    },
    { 
      threshold: 0,
      rootMargin: '50px'
    }
  );

  if (loadingRef.value) {
    observer.observe(loadingRef.value);
  }
};
</script>

<style scoped>
.feed-container {
  padding: 3.2vw;
  min-height: 100vh;
  padding-bottom: calc(env(safe-area-inset-bottom) + 4.267vw);
}

.waterfall-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3.2vw;
  width: 100%;
}

.feed-item {
  margin-bottom: 3.2vw;
  break-inside: avoid;
  background: #fff;
  border-radius: 2.133vw;
  overflow: hidden;
  box-shadow: 0 0.533vw 3.2vw rgba(0, 0, 0, 0.1);
  animation: fade-in 0.3s ease-out;
}

/* 优质用户推荐样式调整 */
.recommended-users {
  padding: 3.2vw;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -3.2vw -3.2vw 4.267vw;
  padding: 3.2vw;
  background-color: #fbead8;
  border-radius: 2.133vw 2.133vw 0 0;
}

.section-title {
  font-size: 4vw;
  color: #333;
  font-weight: 500;
  margin: 0;
}

.section-dots {
  display: flex;
  gap: 1.067vw;
}

.dot {
  width: 1.067vw;
  height: 1.067vw;
  border-radius: 0.533vw;
  background-color: rgba(255, 102, 0, 0.2);
  transition: all 0.3s;
}

.dot.active {
  width: 3.2vw;
  background-color: #ff6600;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 3.2vw;
  padding-bottom: 3.2vw;
}

.recommended-user {
  display: flex;
  align-items: flex-start;
  gap: 3.2vw;
  padding: 0 0 4.267vw;
}

.user-avatar-wrap {
  position: relative;
  width: 12.8vw;
}

.user-avatar {
  width: 12.8vw;
  height: 12.8vw;
  border-radius: 50%;
  object-fit: cover;
}

.follow-btn {
  position: absolute;
  bottom: -2.133vw;
  left: 1.5vw;
  height: 4.8vw;
  min-width: 9.6vw;
  padding: 0;
  border-radius: 2.4vw;
  background: #ff6600;
  color: #fff;
  font-size: 4.267vw;
  font-weight: normal;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 0.533vw 1.067vw rgba(255, 102, 0, 0.2);
}

.follow-btn.followed {
  background: #ddd;
}

.user-info-wrap {
  flex: 1;
  gap: 1.067vw;
  padding-top: 1.6vw;
}

.user-name {
  font-size: 4vw;
  color: #333;
  font-weight: 500;
  margin-bottom: 1.067vw;
}

.user-desc {
  font-size: 3.467vw;
  color: #999;
  line-height: 1.3;
}

.feed-content {
  position: relative;
}

.media-wrapper {
  position: relative;
  width: 100%;
}

.media {
  width: 100%;
  border-radius: 4px 4px 0 0;
  display: block;
  background-color: #f5f5f5;
}

.video-container {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.video-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 2.133vw;
  right: 2.133vw;
  width: 8.533vw;
  height: 8.533vw;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}

.play-icon {
  font-size: 5.333vw;
  color: #fff;
  opacity: 0.9;
}

.video-duration {
  position: absolute;
  right: 2.133vw;
  bottom: 2.133vw;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 0.533vw 1.6vw;
  border-radius: 0.533vw;
  font-size: 3.2vw;
  z-index: 1;
}

.content-info {
  padding: 2.133vw;
}

.title {
  margin: 1.067vw 0;
  font-size: 3.733vw;
  line-height: 1.4;
  color: #333;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags {
  margin: 1.067vw 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1.067vw;
}

.tag {
  font-size: 3.2vw;
  color: #999;
  padding: 0.533vw 1.6vw;
  border-radius: 1.067vw;
  background-color: #f5f5f5;
}

.user-interaction {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2.133vw;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.6vw;
}

.avatar {
  width: 6.4vw;
  height: 6.4vw;
  border-radius: 50%;
}

.username {
  font-size: 3.2vw;
  color: #666;
}

.likes {
  display: flex;
  align-items: center;
  gap: 0.533vw;
  color: #999;
}

.likes .van-icon {
  font-size: 3.733vw;
}

.like-count {
  font-size: 2.933vw;
}

.likes .liked {
  color: #ff2c2c;
}

.loading-more {
  text-align: center;
  padding: 4.267vw 0;
  background: transparent;
}

.loading-finished {
  color: #969799;
  font-size: 3.733vw;
  padding: 4.267vw 0;
  text-align: center;
}

/* 视频播放器样式优化 */
video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

video.playing {
  object-fit: contain;
  background: #000;
}

.video-overlay:hover {
  background: rgba(0, 0, 0, 0.6);
}

.video-overlay:hover .play-icon {
  transform: scale(1.1);
  opacity: 1;
}

/* 图片加载占位 */
img[lazy="loading"] {
  background-color: #f5f5f5;
  min-height: 200px;
}

/* 下拉刷新样式优化 */
:deep(.van-pull-refresh__track) {
  min-height: 100vh;
}

:deep(.van-pull-refresh__head) {
  transform: translateY(-100%);
  position: relative;
  left: 0;
  width: 100%;
  text-align: center;
}

:deep(.van-pull-refresh__text) {
  font-size: 3.733vw;
  color: #666;
  line-height: 10.667vw;
}

:deep(.van-pull-refresh__loading) {
  margin: 8px 0;
}

:deep(.van-loading__text) {
  color: #666;
  font-size: 3.733vw;
}

/* 添加加载动画 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feed-item {
  animation: fade-in 0.3s ease-out;
}

@media screen and (min-width: 768px) {
  /* 在平板或桌面设备上使用更合适的尺寸 */
  .feed-container {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .waterfall-container {
    gap: 24px;
  }
  
  .feed-item {
    margin-bottom: 24px;
    border-radius: 16px;
  }
  
  /* 其他桌面端样式... */
}

/* 骨架屏样式 */
.skeleton {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-media {
  width: 100%;
  aspect-ratio: 16/9;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
  border-radius: 8px 8px 0 0;
  display: block;
}

.skeleton-content {
  padding: 12px;
}

.skeleton-title {
  height: 4.267vw;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
  margin-bottom: 8px;
  border-radius: 1.067vw;
}

.skeleton-tags {
  display: flex;
  gap: 2.133vw;
  margin: 2.133vw 0;
}

.skeleton-tag {
  width: 16vw;
  height: 5.333vw;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
  border-radius: 1.067vw;
}

.skeleton-user {
  display: flex;
  align-items: center;
  gap: 2.133vw;
  margin-top: 3.2vw;
}

.skeleton-avatar {
  width: 6.4vw;
  height: 6.4vw;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

.skeleton-info {
  height: 3.2vw;
  width: 100%;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
  border-radius: 1.067vw;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.video-container {
  cursor: pointer;
}

.video-overlay {
  pointer-events: none;
}
</style> 