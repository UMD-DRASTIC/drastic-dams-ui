<template>
  <div class="sui-sorting">
    <div class="sui-sorting__label">Sort by</div>
    <select
      name="sortBy"
      :value="value"
      @input="$emit('input', $event.target.value)"
    >
      <option value="">Relevance</option>
      <option value="title">Title</option>
      <option value="level">Level</option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      required: true
    }
  }
};
</script>
