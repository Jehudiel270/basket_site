<template>
  <div class="shell">
    <NuxtPage />
    <Transition name="toast"><div v-if="notice" class="toast">{{ notice }}</div></Transition>
  </div>
</template>
<script setup lang="ts">
const { notice } = useCourtlink()
</script>
<style scoped>
.toast{position:fixed;right:22px;bottom:22px;z-index:50;background:#f97316;color:white;padding:13px 17px;border-radius:10px;box-shadow:0 12px 30px #0008;font-weight:700;font-size:14px}.toast-enter-active,.toast-leave-active{transition:.2s}.toast-enter-from,.toast-leave-to{opacity:0;transform:translateY(8px)}
</style>
