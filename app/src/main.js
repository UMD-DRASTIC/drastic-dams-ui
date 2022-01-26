import Vue, { createApp } from 'vue';
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

const config = new Configuration();
//const baseURL = config.value('baseURL');
const ldpURL = config.value('ldpURL');
const activityStreamWebSocketURL = config.value('activityStreamWebSocketURL');
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
          activityStreamWebSocketUrl: activityStreamWebSocketURL,
          ldpUrl: ldpURL,
          submissionsPath: '/submissions/'
        }
    }
]

const router = new VueRouter({
  routes
})

Vue.use(VueAxios, axios);
Vue.use(VueFeather);
Vue.component("CreateSubmission", CreateSubmission);
createApp(App).use(router).mount('#app')
