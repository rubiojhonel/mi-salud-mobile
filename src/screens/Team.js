import React from 'react'
import { Container, Header, Left, Button, Icon, Body, Title, Subtitle, Right, Card, CardItem, Text, View, H1, List, ListItem, Form, Item, Input, Spinner, ActionSheet } from 'native-base'
import Store from '../store'
import { StyleSheet, Clipboard } from 'react-native'
import strapi from '../strapi'
import { validate, alert, notify } from '../utils'
import Content from '../components/Content'
import { NavigationActions } from 'react-navigation'

const layout = StyleSheet.create({
  teamCodeView: {
    backgroundColor: 'rgba(142, 21, 55, 0.1)',
    width: '100%',
    padding: 8,
    borderRadius: 2,
    marginTop: 8
  },
  teamCode: {
    textAlign: 'center'
  },
  spacer: {
    margin: 10
  },
  formSpacer: {
    marginTop: 8
  }
})

class Team extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      teamCode: undefined
    }
  }

  componentDidMount () {
    this.updateData()
  }

  async updateData () {
    const { store, navigation } = this.props

    // Cache USER Data
    const user = await strapi.currentUser(store.get('token'))
  
    if (user.error) return navigation.navigate('login', {
      logout: 'Session expired. Please login again.'
    })

    store.set('user')(user)

    // Cache TEAM Data
    if (user.profile.isMemberOf) {
      const team = await strapi.get('teams', user.profile.isMemberOf)
      store.set('team')(!team.error ? team : undefined)
    } else store.set('team')(undefined)
  }

  async joinTeam () {
    const input = await validate(
      { teamCode: this.state.teamCode },
      { teamCode: 'required|min:6|max:6' },
      {
        'teamCode.required': 'Please provide a team code.',
        'teamCode.min': 'Team code should be 6 characters.',
        'teamCode.max': 'Team code should be 6 characters.'
      }
    )

    if (!input.invalid) {
      this.setState({ loading: true })

      const { teamCode } = input
      const { store } = this.props
      const team = await strapi.get(`teams/code/${teamCode}`)

      if (!team.error) {
        const profile = await strapi.update('profiles', store.get('user').profile.id, {
          isMemberOf: team.id,
          isLeaderOf: !team.leader ? team.id : null
        })

        const role = (await strapi.get('users-permissions/roles')).roles.find(role => {
          const roleType = !team.leader ? 'leader' : 'responder'
          return role.type === roleType
        })

        const user = await strapi.update('users', store.get('user').id, {
          role: role.id
        })

        if (!team.leader) {
          team.leader = profile
        }

        team.members.push(profile)

        store.set('team')(team)
        store.set('user')(user)

        /* return */ alert('Welcome to the team!')
      } else /* return */ alert('Team code does not exist.')
      this.setState({ loading: false })
    }
  }

  async leaveTeam () {
    const { store } = this.props
    const user = store.get('user')

    if (user.role.type !== 'leader') {
      alert({
        title: store.get('team').name,
        message: 'Are you sure you want to leave?',
        buttons: [
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              const profile = await strapi.update('profiles', user.profile.id, {
                isMemberOf: null
              })
        
              if (!profile.error) {
                user.profile = profile
                store.set('user')(user)
                store.set('team')(undefined)
              } else alert('An error occured.')
            }
          },
          {
            text: 'Stay',
            style: 'cancel'
          }
        ]
      })
    } else alert('You cannot leave your own team.')
  }

  async showActionSheet () {
    const { store } = this.props
    const user = store.get('user')
    const options = ['Refresh', 'Leave Team', 'Cancel'].filter(option => {
      switch(option) {
        case 'Leave Team':
          return user.role.type === 'responder'
        default:
          return true
      }
    })

    ActionSheet.show(
      {
        title: 'Actions',
        options,
        cancelButtonIndex: options.indexOf('Cancel'),
        destructiveButtonIndex: options.indexOf('Leave Team')
      },
      tapped => {
        switch(options[tapped]) {
          case 'Refresh':
            this.updateData()
            break
          case 'Leave Team':
            this.leaveTeam()
            break
          default:
            console.log('Tapped index:', tapped)
            break
        }
      }
    )
  }

  copyToClipboard (team) {
    const { name, agency, code } = team
    Clipboard.setString(`${code}`)
    alert('Team code has been copied.')
  }

  navigate (member) {
    const { navigation, store } = this.props
    const team = store.get('team')
    const user = store.get('user')

    if (user.role.type !== 'leader') {
      return null
    } else {
      return member.isLeaderOf !== team.id ? navigation.navigate('memberScreenings', { user: member }) : null
    }
  }

  removeMember (member) {
    alert({
      title: 'Mi Salud',
      message: 'Are you sure you want to remove this member?',
      buttons: [
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            const profile = await strapi.update('profiles', member.id, {
              isMemberOf: null
            })
            
            if (!profile.error) {
              alert('Member has been removed.')
              this.updateData()
            }
          }
        },
        {
          text: 'No',
          onPress: () => null
        }
      ]
    })
  }

  render () {
    const { navigation, store } = this.props
    const { loading } = this.state
    const user = store.get('user')
    const team = store.get('team')

    if (!user.profile.isMemberOf && !team) {
      // If user is not member of a team
      return (
        <Container>
          <Header>
            <Left>
              <Button transparent icon onPress={navigation.toggleDrawer.bind(this)}>
                <Icon type="FontAwesome5" name="bars" />
              </Button>
            </Left>
            <Body>
              <Title>Welcome</Title>
            </Body>
            <Right />
          </Header>
          <Content padder>
            <Card>
              <CardItem header>
                <Text>Be part of a team!</Text>
              </CardItem>
              <CardItem bordered>
                <Body>
                  <Text note>Provide the code of the team you wish to join:</Text>
                  <Form style={layout.formSpacer}>
                    <Item regular>
                      <Input placeholder="Team Code" autoCapitalize="none" onChangeText={teamCode => this.setState({ teamCode })} />
                    </Item>
                  </Form>
                </Body>
              </CardItem>
              <CardItem>
                <Body>
                  <Button block disabled={loading} onPress={this.joinTeam.bind(this)} disabled={loading}>
                    { loading
                      ? (<Spinner color="#8e1537" />)
                      : (<Text>Join</Text>) }
                  </Button>
                </Body>
              </CardItem>
            </Card>
          </Content>
        </Container>
      )
    } else {
      // If user is already a member of a team
      return (
        <Container>
          <Header>
            <Left>
              <Button transparent icon onPress={navigation.toggleDrawer.bind(this)}>
                <Icon type="FontAwesome5" name="bars" />
              </Button>
            </Left>
            <Body>
              <Title>{team.name}</Title>
              <Subtitle>{team.agency.name}</Subtitle>
            </Body>
            <Right>
              <Button transparent icon onPress={this.showActionSheet.bind(this)}>
                <Icon type="FontAwesome" name="ellipsis-v" />
              </Button>
            </Right>
          </Header>
          <Content>
            {/* Team Code */}
            { user.role.type === 'leader' ? (
              <View style={layout.spacer}>
                <Card>
                  <CardItem header>
                    <Text>Team Code</Text>
                  </CardItem>
                  <CardItem>
                    <Body>
                      <Text note>Tap the team code below to copy and give this to your teammates:</Text>
                      <View style={layout.teamCodeView}>
                        <H1 style={layout.teamCode} onPress={this.copyToClipboard.bind(this, team)}>{team.code}</H1>
                      </View>
                    </Body>
                  </CardItem>
                </Card>
              </View>
            ) : null }
  
            {/* Team Members */}
            <List>
              <ListItem itemDivider>
                <Text>Members ({team.members.filter(member => member.isLeaderOf !== team.id).length})</Text>
              </ListItem>
              { team.members.filter(member => member.isLeaderOf !== team.id).map((member, index) => (
                <ListItem key={index} onPress={this.navigate.bind(this, member)}>
                  <Body>
                    <Text>{member.lastname}, {member.firstname}</Text>
                    <Text note>{member.isLeaderOf === team.id ? 'Leader' : 'Responder'}</Text>
                  </Body>
                  { user.role.type === 'leader' ? (
                    <Right>
                      <Button danger icon onPress={this.removeMember.bind(this, member)}>
                        <Icon type="FontAwesome" name="close" />
                      </Button>
                    </Right>
                  ) : (
                    <Right />
                  ) }
                </ListItem>
              ))}
            </List>
          </Content>
        </Container>
      )
    }
  }
}

export default Store.withStore(Team)
