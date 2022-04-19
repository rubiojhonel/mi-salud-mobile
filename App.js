import React from 'react'
import { Root, StyleProvider, Container, Header, Body, Title, Content, Text, Card, CardItem, Button } from 'native-base'
import * as Font from 'expo-font'
import { FontAwesome } from '@expo/vector-icons'
import AppLoading from 'expo-app-loading'
import { setCustomText, setCustomTextInput } from 'react-native-global-props'
import Store from './src/store'
import getTheme from './native-base-theme/components'
import customTheme from './native-base-theme/variables/commonColor'
import Router from './src/router'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isReady: false
    }
  }

  async componentDidMount () {
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      'Metropolis': require('./assets/fonts/Metropolis-Regular.otf'),
      'Metropolis Bold': require('./assets/fonts/Metropolis-Bold.otf'),
      'Metropolis Thin': require('./assets/fonts/Metropolis-Thin.otf'),
      ...FontAwesome.font
    })

    setCustomText({ style: { fontFamily: 'Metropolis' } })
    setCustomTextInput({ style: { fontFamily: 'Metropolis' } })

    this.setState({ isReady: true })
  }

  // getRouteName (navState) {
  //   if (!navState) {
  //     return null
  //   }

  //   const route = navState.routes[navState.index]

  //   if (route.routes) {
  //     return this.getRouteName(route)
  //   }

  //   return route.routeName
  // }

  // onViewChange (previous, current, action) {
  //   const currentRoute = this.getRouteName(current)
  //   const previousRoute = this.getRouteName(previous)

  //   if (previousRoute !== currentRoute) {
  //     console.log('CURRENT ROUTE:', currentRoute)
  //   }
  // }

  render () {
    if (!this.state.isReady) {
      return (<AppLoading />)
    }

    return (
        <Root>
          <Store.Container>
            <StyleProvider style={getTheme(customTheme)}>
              <Router /* onNavigationStateChange={this.onViewChange.bind(this)} */ />
            </StyleProvider>
          </Store.Container>
        </Root>
    )
  }
}
