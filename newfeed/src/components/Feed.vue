<template>
  <div class="feed-container">
    <van-pull-refresh
      v-model="refreshing"
      @refresh="onRefresh"
      :head-height="80"
      :pull-distance="120"
      :disabled="!canRefresh"
      success-text="刷新成功"
      pulling-text="继续上拉刷新"
      loosing-text="松开立即刷新"
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
                    <span class="user-name">{{ displayUsers[i-1].name }}</span>
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

const route = useRoute();
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

// 优质用户数据
const recommendedUsers = ref([
  {
    id: 1,
    name: '阿萌',
    avatar: 'https://picsum.photos/50/50',
    description: '不装无害，只做自己喜欢的',
    isFollowed: false
  },
  {
    id: 2,
    name: '青空千绘',
    avatar: 'https://picsum.photos/51/51',
    description: '关注我，领取抽奖礼物！',
    isFollowed: false
  },
  {
    id: 3,
    name: '大漠无情',
    avatar: 'https://picsum.photos/52/52',
    description: '原创游戏手绘视频，每天更新',
    isFollowed: false
  },
  {
    id: 4,
    name: '小兔几',
    avatar: 'https://picsum.photos/53/53',
    description: '分享游戏攻略和有趣的事',
    isFollowed: false
  },
  {
    id: 5,
    name: '星空漫步',
    avatar: 'https://picsum.photos/54/54',
    description: '专注游戏测评十年',
    isFollowed: false
  },
  {
    id: 6,
    name: '游戏达人',
    avatar: 'https://picsum.photos/55/55',
    description: '深度解析游戏机制',
    isFollowed: false
  },
  {
    id: 7,
    name: '云中漫步',
    avatar: 'https://picsum.photos/56/56',
    description: '分享独特的游戏视角',
    isFollowed: false
  },
  {
    id: 8,
    name: '电竞小王子',
    avatar: 'https://picsum.photos/57/57',
    description: '专业的电竞解说',
    isFollowed: false
  },
  {
    id: 9,
    name: '游戏解说员',
    avatar: 'https://picsum.photos/58/58',
    description: '带你玩转各类游戏',
    isFollowed: false
  }
]);

// 计算当前显示的3个用户
const displayUsers = computed(() => {
  const startIndex = currentPage.value * 3;
  return [
    recommendedUsers.value[startIndex % 9],
    recommendedUsers.value[(startIndex + 1) % 9],
    recommendedUsers.value[(startIndex + 2) % 9]
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

// 添加不同类型的模拟数据生成器
const generateGameData = (count = 10) => {
  return Array(count).fill(null).map((_, index) => ({
    id: Mock.Random.guid(),
    title: Mock.Random.ctitle(5, 20),
    type: Mock.Random.pick(['image', 'video']),
    media: Mock.Random.pick([
      'https://picsum.photos/300/400',
      'https://picsum.photos/300/500',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ]),
    thumbnail: 'https://picsum.photos/300/400',
    duration: Mock.Random.pick(['00:15', '00:30', '01:00']),
    tags: ['游戏', '攻略', '电竞'],
    author: {
      name: Mock.Random.cname(),
      avatar: 'https://picsum.photos/40/40',
      loaded: true
    },
    likes: Mock.Random.integer(0, 9999),
    isLiked: Mock.Random.boolean(),
    isPlaying: false,
    loading: false,
    mediaLoaded: false,
    loadError: false
  }));
};

const generateAnimeData = (count = 10) => {
  return Array(count).fill(null).map((_, index) => ({
    id: Mock.Random.guid(),
    title: Mock.Random.ctitle(5, 20),
    type: Mock.Random.pick(['image', 'video']),
    media: Mock.Random.pick([
      'https://picsum.photos/300/400',
      'https://picsum.photos/300/500',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    ]),
    thumbnail: 'https://picsum.photos/300/400',
    duration: Mock.Random.pick(['00:15', '00:30', '01:00']),
    tags: ['动漫', '二次元', 'ACG'],
    author: {
      name: Mock.Random.cname(),
      avatar: 'https://picsum.photos/40/40',
      loaded: true
    },
    likes: Mock.Random.integer(0, 9999),
    isLiked: Mock.Random.boolean(),
    isPlaying: false,
    loading: false,
    mediaLoaded: false,
    loadError: false
  }));
};

const generateFoodData = (count = 10) => {
  return Array(count).fill(null).map((_, index) => ({
    id: Mock.Random.guid(),
    title: Mock.Random.ctitle(5, 20),
    type: Mock.Random.pick(['image', 'video']),
    media: Mock.Random.pick([
      'https://picsum.photos/300/400',
      'https://picsum.photos/300/500',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    ]),
    thumbnail: 'https://picsum.photos/300/400',
    duration: Mock.Random.pick(['00:15', '00:30', '01:00']),
    tags: ['美食', '生活', '烹饪'],
    author: {
      name: Mock.Random.cname(),
      avatar: 'https://picsum.photos/40/40',
      loaded: true
    },
    likes: Mock.Random.integer(0, 9999),
    isLiked: Mock.Random.boolean(),
    isPlaying: false,
    loading: false,
    mediaLoaded: false,
    loadError: false
  }));
};

// 根据类型生成对应的数据
const generateMockData = (count = 10) => {
  const type = route.query.type || 'general';
  switch (type) {
    case 'game':
      return generateGameData(count);
    case 'anime':
      return generateAnimeData(count);
    case 'food':
      return generateFoodData(count);
    default:
      return generateGameData(count);
  }
};

// 点赞功能
const toggleLike = (item) => {
  item.isLiked = !item.isLiked;
  item.likes += item.isLiked ? 1 : -1;
  Toast({
    message: item.isLiked ? '点赞成功' : '已取消点赞',
    position: 'bottom'
  });
};

// 修改加载更多数据的逻辑
const loadMore = async () => {
  if (loading.value || finished.value || refreshing.value) return;
  loading.value = true;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newItems = generateMockData(10);
    
    if (page.value >= 5) {
      finished.value = true;
      loading.value = false;
      return;
    }
    
    items.value.push(...newItems);
    page.value++;
  } catch (error) {
    Toast('加载失败');
  } finally {
    loading.value = false;
  }
};

// 修改滚动监听逻辑
const handleScroll = () => {
  if (loading.value || finished.value || refreshing.value) return;
  
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const clientHeight = window.innerHeight || document.documentElement.clientHeight;
  
  // 当距离底部100px时开始加载
  if (scrollHeight - scrollTop - clientHeight <= 100) {
    loadMore();
  }
  
  // 只有在顶部时才允许下拉刷新
  canRefresh.value = scrollTop <= 0;
};

// 修改 Intersection Observer 的配置
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
      threshold: 0.1,
      rootMargin: '100px'
    }
  );

  if (loadingRef.value) {
    observer.observe(loadingRef.value);
  }
};

// 修改刷新逻辑
const onRefresh = async () => {
  try {
    refreshing.value = true;
    finished.value = false;
    page.value = 1;
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newItems = generateMockData(10);
    items.value = newItems;
    Toast('刷新成功');
  } catch (error) {
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
});

// 组件卸载时移除滚动监听
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  window.removeEventListener('scroll', handleScroll);
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
  async () => {
    refreshing.value = true;
    finished.value = false;
    page.value = 1;
    items.value = [];
    await onRefresh();
  }
);
</script>

<style scoped>
.feed-container {
  padding: 12px;
  min-height: 100vh;
  padding-bottom: calc(env(safe-area-inset-bottom) + 16px);
}

.waterfall-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
}

.feed-item {
  margin-bottom: 12px;
  break-inside: avoid;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 优质用户推荐样式调整 */
.recommended-users {
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -12px -12px 16px;
  padding: 12px;
  background-color: #fbead8;
  border-radius: 8px 8px 0 0;
}

.section-title {
  font-size: 15px;
  color: #333;
  font-weight: 500;
  margin: 0;
}

.section-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background-color: rgba(255, 102, 0, 0.2);
  transition: all 0.3s;
}

.dot.active {
  width: 12px;
  background-color: #ff6600;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 12px;
}

.recommended-user {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 0 0 16px;
}

.user-avatar-wrap {
  position: relative;
  width: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.follow-btn {
  position: absolute;
  bottom: -8px;
  height: 18px;
  min-width: 36px;
  padding: 0;
  border-radius: 9px;
  background: #ff6600;
  color: #fff;
  font-size: 16px;
  font-weight: normal;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(255, 102, 0, 0.2);
}

.follow-btn.followed {
  background: #ddd;
}

.user-info-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 6px;
}

.user-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.user-desc {
  font-size: 13px;
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
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}

.play-icon {
  font-size: 20px;
  color: #fff;
  opacity: 0.9;
}

.video-duration {
  position: absolute;
  right: 8px;
  bottom: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
  z-index: 1;
}

.content-info {
  padding: 8px;
}

.title {
  margin: 4px 0;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags {
  margin: 4px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  font-size: 12px;
  color: #999;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.user-interaction {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.username {
  font-size: 12px;
  color: #666;
}

.likes {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #999;
}

.likes .van-icon {
  font-size: 14px;
}

.like-count {
  font-size: 11px;
}

.likes .liked {
  color: #ff2c2c;
}

.loading-more {
  text-align: center;
  padding: 16px 0;
  background: transparent;
}

.loading-finished {
  color: #969799;
  font-size: 14px;
  padding: 16px 0;
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
  transform: none;
}

:deep(.van-pull-refresh__text) {
  font-size: 14px;
  color: #666;
}

:deep(.van-pull-refresh__loading) {
  margin: 8px 0;
}

@media screen and (max-width: 320px) {
  .feed-container {
    padding: 8px;
  }
  
  .waterfall-container {
    gap: 8px;
  }
  
  .feed-item {
    margin-bottom: 8px;
  }
  
  .title {
    font-size: 13px;
  }
  
  .tag {
    font-size: 11px;
  }
  
  .username {
    font-size: 11px;
  }
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
  height: 16px;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
  margin-bottom: 8px;
  border-radius: 4px;
}

.skeleton-tags {
  display: flex;
  gap: 8px;
  margin: 8px 0;
}

.skeleton-tag {
  width: 60px;
  height: 20px;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
  border-radius: 4px;
}

.skeleton-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.skeleton-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

.skeleton-info {
  height: 12px;
  width: 100%;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
  border-radius: 4px;
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