import Vue from 'vue';
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueRouter from 'vue-router'
import Configuration from './ConfigProvider';
import CreateSubmission from './components/CreateSubmission.vue'
import App from './App.vue'
import Dashboard from './components/dashboard'
import Description from './components/description'
import Access from './components/access'
import Submissions from './components/submissions'
import Topics from './components/topics'
import remainingHeight from './assets/js/remaining_height'
Vue.directive(remainingHeight)

require('dotenv').config()
const config = new Configuration(process.env);
//const baseURL = config.value('baseURL');
const ldpURL = config.value('ldpURL');
console.log(ldpURL);
const asWebSocketURL = config.value('asWebSocketURL');
console.log(asWebSocketURL);
const ldpUsername = config.value('ldpUsername');
console.log(ldpUsername);
const ldpPassword = config.value('ldpPassword');
console.log(ldpPassword);

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
        path: '/access',
        name: 'Access',
        component: Access
    },
    {
        path: '/submissions',
        name: 'Submissions',
        component: Submissions,
        props: {
          asWebSocketURL: asWebSocketURL,
          ldpURL: ldpURL,
          submissionsPath: '/submissions/',
          ldpUsername: ldpUsername,
          ldpPassword: ldpPassword,
        }
    },
    {
        path: '/topics',
        name: 'Topics',
        component: Topics
    }
]

const router = new VueRouter({
  routes
})

/* import the fontawesome stuff */
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBoxArchive, faPerson, faUsers, faMapLocationDot, faTag, faFolder, faLayerGroup, faFile, faSearch, faBoxesStacked, faPeopleCarryBox, faTrashCan, faChartPie, faBookmark, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
library.add(faBoxArchive, faPerson, faUsers, faMapLocationDot, faTag, faFolder, faLayerGroup, faFile, faSearch, faBoxesStacked, faPeopleCarryBox, faTrashCan, faChartPie, faBookmark, faRightFromBracket)
Vue.component('font-awesome-icon', FontAwesomeIcon)

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// Import Bootstrap
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

Vue.use(VueAxios, axios);
Vue.use(VueRouter)
Vue.component("CreateSubmission", CreateSubmission);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
