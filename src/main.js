import Vue from 'vue'
//import Vuex from 'vuex'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueRouter from 'vue-router'
import VueFeather from 'vue-feather';
import routes from './routes'
import CreateSubmission from './components/CreateSubmission.vue'

//import './dashboard.css'

import App from './App.vue'

// Vue.use(Vuex)
//
// const store = new Vuex.Store({
//   state: {
//     treeStore: []
//   },
//   mutations: {
//     updateTreeStore(state, newTree) {
//       state.treeStore = newTree
//     }
//   },
//   actions: {
//     updateTree(context, tree) {
//       context.commit('updateTreeStore', tree)
//     }
//   },
//   getters: {
//     tree(state) {
//       return state.treeStore
//     }
//   }
// })

Vue.use(VueRouter)
const router = new VueRouter({
  routes
})

Vue.config.productionTip = false
Vue.use(VueAxios, axios);
Vue.use(VueFeather);
Vue.component("CreateSubmission", CreateSubmission);
new Vue({
//  store: store,
  render: h => h(App),
  router
}).$mount('#app')
