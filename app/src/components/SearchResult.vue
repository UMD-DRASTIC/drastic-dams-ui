<template>
  <div class="search-result">
    <span class="search-result__heading">{{ result.title }}</span>
    <div class="search-result__body">
      <!-- <img
        class="search-result__image"
        :src="imageSrc(result.id.raw)"
        :alt="result.title.raw"
      /> -->
      <div class="search-result__data">
        <div v-if="result.level">Type: {{ result.level }}</div>
        <div v-if="result.path">Path: {{ result.path }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    result: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.search-result {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  align-items: center;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-result__heading {
  text-align: center;
  margin: 0;
}

.search-result__body {
  display: flex;
  justify-content: flex-start;
  align-self: flex-start;
}

.search-result__data {
  padding-top: 50px;
  text-align: left;
}

.search-result__flavor {
  margin: 0;
}

.search-result__image {
  flex: none;
  width: 256px;
  height: 387px;
}
</style>
