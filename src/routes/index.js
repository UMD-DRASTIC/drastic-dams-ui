import Dashboard from '../components/dashboard'
import Description from '../components/description'
import Submissions from '../components/submissions'

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
        component: Submissions
    }//,
    // {
    //     path: '/destruction',
    //     name: 'Destruction',
    //     component: Destruction
    // },
    // {
    //     path: '/reports',
    //     name: 'Reports',
    //     component: Reports
    // }
]
export default routes
