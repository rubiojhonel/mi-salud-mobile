import React from 'react'
import { Container, Header, Body, Title, Subtitle, Content, List, ListItem, Text, Button } from 'native-base'
import { StyleSheet } from 'react-native'
import Store from '../store'
import { NavigationActions, StackActions } from 'react-navigation'

const layout = StyleSheet.create({
  logoutBtn: {
    borderRadius: 0
  }
})

class Drawer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      screens: [
        {
          label: 'Team',
          route: 'team',
          access: ['leader', 'responder', 'without-a-team']
        },
        {
          label: 'Screenings',
          route: 'assessments',
          access: ['leader', 'responder']
        }
      ]
    }
  }

  async logout () {
    const { navigation } = this.props
    return navigation.navigate('login', {
      logout: 'You have just been logged out.'
    })
  }

  navigate (routeName) {
    const { navigation } = this.props
    navigation.closeDrawer()
    return navigation.navigate(routeName)
  }

  render () {
    const { store } = this.props
    const { screens } = this.state

    return (
      <Container>
        <Header span>
          <Body>
            <Title>Mi Salud</Title>
            <Subtitle>Welcome, { store.get('user').profile.firstname }!</Subtitle>
            <Text note style={{ marginLeft: -3 }}>{ store.get('user').role.name }</Text>
          </Body>
        </Header>
        <Content>
          <List>
            <ListItem itemDivider>
              <Text note>Menu</Text>
            </ListItem>
            { screens.filter(screen => {
              const user = store.get('user')
              if (!user.profile.isMemberOf && !screen.access.includes('without-a-team')) {
                return false
              }
              return screen.access.includes(user.role.type)
            }).map((screen, index) => (
              <ListItem key={index} onPress={this.navigate.bind(this, screen.route)}>
                <Text>{ screen.label }</Text>
              </ListItem>
            ))}
            <ListItem itemDivider>
              <Text note>Account</Text>
            </ListItem>
            <ListItem onPress={this.logout.bind(this)}>
              <Text>Logout</Text>
            </ListItem>
          </List>
        </Content>
        {/* <Button block style={layout.logoutBtn} onPress={this.logout.bind(this)}>
          <Text>Logout</Text>
        </Button> */}
      </Container>
    )
  }
}

export default Store.withStore(Drawer)
