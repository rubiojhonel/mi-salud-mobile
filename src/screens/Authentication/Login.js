import React from 'react'
import Store, { initialState } from '../../store'
import { Container, Text, View, Thumbnail, Card, CardItem, Body, Form, Item, Input, Button, H1, Spinner, Icon } from 'native-base'
import { StyleSheet, Dimensions, StatusBar, AsyncStorage, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import strapi from '../../strapi'
import { validate, alert } from '../../utils'
import Constants from 'expo-constants'
import Content from '../../components/Content'
import * as Notifications from 'expo-notifications'

const layout = StyleSheet.create({
  linearGradient: {
    minHeight: Dimensions.get('screen').height - StatusBar.currentHeight,
    padding: 8
  },
  topPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomPanel: {
    flex: 1
  },
  logo: {
    width: 86,
    height: 86,
    borderRadius: 5
  }
})

class Login extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      identifier: undefined,
      password: undefined,
      token: undefined
    }
  }

  async registerPushNotification () {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      console.log({ finalStatus })

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== 'granted') {
        alert(`We can't be able to send you notifications.`)
        return
      }

      let pushToken = (await Notifications.getExpoPushTokenAsync()).data
      const { store } = this.props
      const user = store.get('user')

      store.set('pushToken')(pushToken)

      if (user && user.role.type === 'leader') {
        const existingUser = await strapi.get('profiles', { token: pushToken })

        if (existingUser && existingUser.length > 0 && existingUser[0].id !== user.profile.id) {
          await strapi.update('profiles', existingUser[0].id, { token: null })
        }

        await strapi.update('profiles', user.profile.id, { token: null })
      }

      if (user && user.role.type === 'responder') {
        await strapi.update('profiles', user.profile.id, { token: pushToken })
      }

      console.log({ pushToken })
    } else {
      alert('Push notification is not supported in emulators.')
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        sound: true,
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C'
      })
    }

    Notifications.addNotificationReceivedListener(this.handleNotification)

    return Promise.resolve()
  }

  handleNotification (notification) {
    console.log({ notification })

    if (notification.origin === 'received') {
      console.log('Notification received.')
    } else if (notification.origin === 'selected') {
      console.log('Notification tapped.')
    }
  }

  async UNSAFE_componentWillMount () {
    const { store, navigation } = this.props
    const user = store.get('user')
    const logout = navigation.getParam('logout')

    if (logout) {
      Object.keys(initialState).forEach(key => {
        store.set(key)(initialState[key])
      })
      await AsyncStorage.clear()
      strapi.token = undefined
      return alert(logout)
    }

    if (user && ['leader', 'responder'].includes(user.role.type)) {
      return navigation.navigate('team')
    }
  }

  async login () {
    const { identifier, password } = this.state
    const account = await validate(
      { identifier, password },
      {
        identifier: 'required',
        password: 'required'
      },
      {
        required: 'Please provide a {{ field }}.',
        'identifier.required': 'Please provide a username.'
      }
    )

    if (!account.invalid) {
      this.setState({ loading: true })

      const auth = await strapi.login(account.identifier, account.password)

      if (!auth.error) {
        if (auth.user.confirmed !== false && auth.user.blocked !== true) {
          const { store, navigation } = this.props

          if (!['leader', 'responder'].includes(auth.user.role.type)) {
            this.setState({ loading: false })
            return alert(`${auth.user.role.name} accounts are not allowed to use the app.`)
          }

          store.set('token')(auth.jwt)
          store.set('user')(auth.user)

          try {
            await this.registerPushNotification()
          } catch (error) {
            alert(`Unable to register push notification: ${error && error.message || ''}`)
          }

          if (auth.user.profile.isMemberOf) {
            const team = await strapi.get('teams', auth.user.profile.isMemberOf)
            store.set('team')(team)
          }

          return navigation.navigate('team')
        } else {
          if (!auth.user.confirmed) return alert('You\'re not yet verified.')
          if (auth.user.blocked) return alert('Your account has been blocked.')
        }
      } else {
        alert('Username or password is incorrect.')
      }
  
      this.setState({ loading: false })
    }
  }

  render () {
    const { navigation, store } = this.props
    const { loading } = this.state

    return (
      <Container>
        <Content style={{ backgroundColor: '#8e1537' }}>
          <LinearGradient colors={['#8e1537', '#b73b5e']} start={[0.0, 0.5]} end={[0.5, 1.0]} style={layout.linearGradient}>
            <View style={layout.topPanel}>
              <Thumbnail square source={require('../../../assets/icon.png')} style={layout.logo}></Thumbnail>
              <H1 style={{ color: '#f1f1f1', marginTop: 16 }}>Welcome to Mi Salud</H1>
            </View>

            <View style={layout.bottomPanel}>
              <Card>
                <CardItem>
                  <Text note>Please loging to continue.</Text>
                </CardItem>
                <CardItem bordered>
                  <Form>
                    <Item regular>
                      <Input placeholder="Username" autoCapitalize="none" onChangeText={identifier => this.setState({ identifier })} />
                    </Item>
                    <Item regular>
                      <Input placeholder="Password" autoCapitalize="none" onChangeText={password => this.setState({ password })} secureTextEntry />
                    </Item>
                  </Form>
                </CardItem>
                <CardItem>
                  <Body>
                    <Button block style={{ marginBottom: 8 }} onPress={this.login.bind(this)} disabled={loading}>
                      { loading
                        ? (<Spinner color="#8e1537" />)
                        : (<Text>Login</Text>) }
                    </Button>
                    <Button block bordered onPress={() => navigation.navigate('register')}>
                      <Text>Register</Text>
                    </Button>
                  </Body>
                </CardItem>
              </Card>
            </View>

            <Text style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', fontSize: 8 }}>Mi Salud Mobile v{Constants.manifest.version}</Text>
            {/* <Icon style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', marginTop: 20, marginBottom: 10 }} type="FontAwesome" name="cog" onPress={() => navigation.navigate('settings')} /> */}
          </LinearGradient>
        </Content>
      </Container>
    )
  }
}

export default Store.withStore(Login)
