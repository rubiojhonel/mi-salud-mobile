import React from 'react'
import { Container, Header, Left, Button, Icon, Body, Title, Right, List, ListItem, Text, Picker, ActionSheet, Subtitle } from 'native-base'
import Content from '../components/Content'
import Store from '../store'
import strapi from '../strapi'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import config from '../config'
import { alert } from '../utils'

dayjs.extend(relativeTime)

class Assessments extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      sortBy: 'all'
    }
  }

  componentDidMount () {
    const { navigation } = this.props
    this.updateData()
    this.listeners = [
      navigation.addListener('didFocus', () => {
        this.updateData()
      })
    ]
  }

  componentWillUnmount () {
    this.listeners.forEach(listener => listener.remove())
  }

  async updateData () {
    const { store } = this.props
    const user = store.get('user')
    const team = store.get('team')

    // Surveys
    let surveys = undefined
    if (user.role.type === 'responder') {
      surveys = await strapi.get('surveys', {
        user: user.id
      })
    } else {
      surveys = await strapi.get('surveys', {
        schedule: team.schedules.map(s => s.id)
      })
    }

    store.set('surveys')(surveys)

    // Schedules
    const schedules = await strapi.get('schedules', {
      team: store.get('team').id
    })

    store.set('schedules')(schedules)

    // Screenings
    const screenings = await strapi.get('screenings', {
      team: store.get('team').id
    })

    store.set('screenings')(screenings)

    // Questions
    const questions = await strapi.get('questions', { enabled: true })

    store.set('questions')(questions)
  }

  async showActionSheet () {
    const { store, navigation } = this.props
    const user = store.get('user')
    const options = ['Refresh', 'Create Screening', 'Cancel'].filter(option => {
      switch (option) {
        case 'Create Screening':
          return user.role.type === 'leader'
        default:
          return true
      }
    })

    ActionSheet.show(
      {
        title: 'Actions',
        options,
        cancelButtonIndex: options.indexOf('Cancel')
      },
      tapped => {
        switch(options[tapped]) {
          case 'Refresh':
            this.updateData()
            break
          case 'Create Screening':
            navigation.navigate('createAssessment', { updateData: this.updateData })
            break
          default:
            console.log('Tapped index:', tapped)
            break
        }
      }
    )
  }

  async navigate (schedule) {
    const { store, navigation } = this.props
    const user = store.get('user')
    const currentTime = (new Date()).getTime()
    const startTime = (new Date(schedule.start)).getTime()
    const endTime = (new Date(schedule.end)).getTime()

    if (user.role.type === 'responder') {
      // If user is a responder

      if (currentTime < startTime) {
        return alert('This screening is not yet open.')
      }

      if (currentTime >= startTime && currentTime < endTime) {
        return navigation.navigate('questionnaire', { schedule })
      } else {
        return navigation.navigate('submissions', { schedule, user })
      }
    } else {
      // If user is a leader
      return navigation.navigate('summary', { schedule })
    }
  }

  render () {
    const { navigation, store } = this.props
    const { sortBy } = this.state
    const { deploymentTypes } = config
    const user = navigation.getParam('user')

    return (
      <Container>
        <Header>
          <Left>
            <Button transparent icon onPress={navigation.toggleDrawer.bind(this)}>
              <Icon type="FontAwesome5" name="bars" />
            </Button>
          </Left>
          <Body>
            <Title>Screenings</Title>
            { user && user.id ? (
              <Subtitle>{user.lastname}, {user.firstname}</Subtitle>
            ) : null }
          </Body>
          <Right>
            <Button transparent icon onPress={this.showActionSheet.bind(this)}>
              <Icon type="FontAwesome" name="ellipsis-v" />
            </Button>
          </Right>
        </Header>
        <Content>
          <List>
            <ListItem itemDivider style={{ paddingTop: 0, paddingBottom: 0 }}>
              <Text note>Sort by:</Text>
              <Picker
                mode="dropdown"
                selectedValue={sortBy}
                onValueChange={sortBy => this.setState({ sortBy })}
                style={{ height: 45 }}
              >
                <Picker.Item label="All deployments" value="all" />
                { Object.entries(deploymentTypes).map(([value, label], index) => (
                  <Picker.Item key={index} label={label} value={value} />
                )) }
              </Picker>
            </ListItem>
            { store.get('schedules') && store.get('schedules')
              .sort((a, b) => (new Date(b.created_at) - new Date(a.created_at)))
              .filter(schedule => sortBy === 'all' ? true : (schedule.type === sortBy))
              .filter(schedule => {
                const screenings = store.get('screenings')

                if (user && user.id) {
                  return screenings.find(screening => screening.schedule.id === schedule.id && screening.user.id === user.id)
                }
                
                return true
              })
              .map(schedule => (
              <ListItem key={schedule.id} onPress={this.navigate.bind(this, schedule)}>
                <Body>
                  <Text>{deploymentTypes[schedule.type]}</Text>
                  <Text note>Valid from {dayjs(schedule.start).format('ddd, MMM D')} - {dayjs(schedule.end).format('ddd, MMM D')}</Text>
                  <Text note>Posted {dayjs(schedule.created_at).fromNow()}</Text>
                </Body>
              </ListItem>
            )) }
          </List>
        </Content>
      </Container>
    )
  }
}

export default Store.withStore(Assessments)
