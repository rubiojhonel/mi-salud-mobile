import Store from './store'
import { createSwitchNavigator, createAppContainer } from 'react-navigation'
import Authentication from './screens/Authentication'
import Screens from './screens'

const rootNavigation = createSwitchNavigator(
  {
    authentication: Authentication,
    home: Screens
  },
  {
    initialRouteName: 'authentication'
  }
)

export default Store.withStore(createAppContainer(rootNavigation))
