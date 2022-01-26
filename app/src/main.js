import Vue from 'vue';
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueRouter from 'vue-router'
import VueFeather from 'vue-feather';
import Configuration from './ConfigProvider';
import CreateSubmission from './components/CreateSubmission.vue'
import App from './App.vue'
import Dashboard from './components/dashboard'
import Description from './components/description'
import Submissions from './components/submissions'

require('dotenv').config()
console.log(process.env)

const config = new Configuration(process.env);
//const baseURL = config.value('baseURL');
const ldpURL = config.value('ldpURL');
const asWebSocketURL = config.value('asWebSocketURL');

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
          asWebSocketURL: asWebSocketURL,
          ldpURL: ldpURL,
          submissionsPath: '/submissions/'
        }
    }
]

const router = new VueRouter({
  routes
})

Vue.use(VueAxios, axios);
Vue.use(VueFeather);
Vue.use(VueRouter)
Vue.component("CreateSubmission", CreateSubmission);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
