import Vue from 'vue'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueRouter from 'vue-router'
import VueFeather from 'vue-feather';
import CreateSubmission from './components/CreateSubmission.vue'
import App from './App.vue'
import Dashboard from './components/dashboard'
import Description from './components/description'
import Submissions from './components/submissions'

const ldpUrl = 'http://localhost:9090'
const activityStreamWebSocketUrl = 'ws://localhost:9090/notifier'
const routes = [
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        path: '/description',
        name: 'Description',
        component: Description
    },
    {
        path: '/submissions',
        name: 'Submissions',
        component: Submissions,
        props: {
          activityStreamWebSocketUrl: activityStreamWebSocketUrl,
          ldpUrl: ldpUrl,
          submissionsPath: '/submissions/'
        }
    }
]

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
