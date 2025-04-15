<template>
  <div class="app-container">
    <router-view></router-view>
  </div>
</template>

<script setup>
// 主应用逻辑将由子组件处理
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.app-container {
  width: 100%;
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
}

:root {
  --van-primary-color: #1989fa;
}

/* 移动端点击高亮优化 */
* {
  -webkit-tap-highlight-color: transparent;
}

/* 视频播放器样式优化 */
video::-webkit-media-controls-fullscreen-button {
  display: none;
}

/* 下拉刷新文字颜色 */
.van-pull-refresh {
  --van-pull-refresh-head-text-color: #969799;
}
</style> 