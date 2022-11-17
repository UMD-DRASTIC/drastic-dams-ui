<template>
  <ul class="sui-results-container search-section__search-results">
    <li
      v-for="result in results"
      :key="result.path.raw"
      class="search-section__search-result"
    >
      <div class="card wrap h-100 border-dark">
        <img class="card-img-top"
          v-if="result.thumbnail"
          :src="result.thumbnail"
          :alt="result.title.raw"
        />
        <div class="card-body overflow-scroll">
          <h5 v-if="result.title" class="card-title">{{ result.title[0] }}</h5>
          <p v-if="result.description" class="card-text">{{ result.description[0] }}</p>
          <p class="card-text">{{ result.path }}</p>
        </div>
        <a href="#" v-if="result.thumbnail" @click="$emit('view', result)"></a>
        <a href="#" v-if="!result.thumbnail" @click="$emit('pathfacet', result.path)"></a>
      </div>
    </li>
  </ul>
</template>

<script>

export default {
  props: {
    results: {
      type: Array,
      required: true
    }
  },
  emits: ['view']
};
</script>

<style>
img.card-img-top {
  height: 10rem;
  /* overflow-y: scroll; */
  object-position: top;
  object-fit: cover;
}

.wrap a {
  position: absolute;
  width:100%;
  height:100%;
  top:0px;
  left:0px;
}

.search-section__search-results {
  display: flex;
  flex-wrap: wrap;
}

.search-section__search-result {
  height: 20rem;
  width: 29%;
  margin: 2%;
  transition: transform .25s, background .25s;
  /*background: white;*/
}

.search-section__search-result:hover {
  transform: scale(1.2);
  position: relative;
  z-index: 1;
}

</style>
