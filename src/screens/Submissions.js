import React from 'react'
import { Container, Header, Left, Button, Icon, Body, Title, Right, List, ListItem, Text, Subtitle } from 'native-base'
import Content from '../components/Content'
import config from '../config'
import Store from '../store'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

class Submissions extends React.Component {
  navigate (screening) {
    const { store, navigation } = this.props
    const user = navigation.getParam('user')
    const schedule = navigation.getParam('schedule')
    const questions = store.get('questions')

    let surveys = screening.answers.map(answer => {
      return {
        user,
        schedule,
        question: questions.find(q => q.id === answer.question),
        answer
      }
    })

    return navigation.navigate('advice', { surveys, schedule, fromSubmissions: true })
  }

  render () {
    const { store, navigation } = this.props
    const screenings = store.get('screenings')
    const user = navigation.getParam('user')
    const schedule = navigation.getParam('schedule')
    const { deploymentTypes } = config
    
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent icon onPress={() => navigation.pop()}>
              <Icon type="FontAwesome5" name="arrow-left" />
            </Button>
          </Left>
          <Body>
            <Title>Submissions</Title>
            <Subtitle>{deploymentTypes[schedule.type]}</Subtitle>
          </Body>
          <Right />
        </Header>
        <Content padder>
          <List>
            { screenings.filter(s => s.user.id === user.profile.id && s.schedule.id === schedule.id).map((screening, index) => (
              <ListItem key={screening.id} onPress={this.navigate.bind(this, screening)}>
                <Body>
                  <Text>{index + 1}. {dayjs(screening.created_at).format('dddd, MMMM D - h:mm A')}</Text>
                </Body>
                <Right>
                  <Icon type="FontAwesome5" name="caret-right" />
                </Right>
              </ListItem>
            )) }
          </List>
        </Content>
      </Container>
    )
  }
}

export default Store.withStore(Submissions)
