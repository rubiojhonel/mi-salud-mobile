import { createStackNavigator } from 'react-navigation-stack'
import Login from './Login'
import Register from './Register'
import Settings from './Settings'


const router = createStackNavigator(
  {
    login: Login,
    register: Register,
    settings: Settings
  },
  {
    initialRouteName: 'login',
    defaultNavigationOptions: { header: null }
  }
)

export default router
