<template>
  <div style='display: inline'>
  <button id="show-modal" @click="showModal = true">Create Submission</button>
  <transition name="modal" v-if="showModal" @close="showModal = false">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              Create Submission
            </slot>
          </div>

          <div class="modal-body">
            <div v-if="isError">error</div>
            <div v-else-if="isLoading">loading</div>
            <div v-else>
              <input v-model="containerName" :placeholder="'enter submission name..'">
            </div>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              <button class="modal-default-button" @click="showModal = false">
                CANCEL
              </button>
              <button class="modal-default-button" @click="create(containerName); showModal = false;">
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
  </div>
</template>

<script>
/* eslint-disable no-console */
/* eslint-disable no-alert */

export default {
  name: 'CreateSubmission',
  data: function() {
    return {
      showModal: false,
      containerName: '',
      isLoading: false,
      isError: false
    }
  },
  methods: {
    async create (name) {
      try {
        this.isLoading = true;
        let head = {
          'Content-Type': 'application/ld+json',
          'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
          'Slug': name
        };
        let myurl = 'http://localhost:9090/submissions/';
        await this.$http({
          method: 'post',
          url: myurl,
          headers: head
        });
      } catch(err) {
        console.log(err);
        this.isError = true;
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 80vmin;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}
</style>
