<template>
  <div class="sui-layout-header">
    <div class="sui-layout-header__inner">
      <form @submit.prevent="$emit('submit', $event.target.value)">
        <div class="search">
          <input
            type="text"
            placeholder="Search for people, places, organizations, programs, events, or other keywords.."
            class="sui-search-box__text-input search-input"
            :value="value"
            @input="$emit('input', $event.target.value)"/>
          <button type="submit" class="search-icon"><b-icon icon="search" font-scale="2"></b-icon></button>

        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      required: true,
      type: String
    }
  }
};
</script>

<style>
.search {
    width: 100%;
    margin-bottom: auto;
    margin-top: 20px;
    height: 37px;
    background-color: #fff;
    /* padding: 10px; */
    border-radius: 5px
}

.search-input {
    border: 0;
    color: white;
    caret-color: transparent;
    line-height: 37px;
    transition: width 0.4s linear;
    /* padding: 0 10px;*/
    width: 100%;
    caret-color: #536bf6;
    font-size: 22px;
    font-weight: 300;
    color: black;
    transition: width 0.4s linear
}

.search-icon {
    height: 37px;
    width: 37px;
    float: right;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    background-color: #536bf6;
    font-size: 10px;
    bottom: 37px;
    position: relative;
    border-radius: 5px
}

.search-icon:hover {
    color: #fff !important
}
</style>
