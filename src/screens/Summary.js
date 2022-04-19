import React from 'react'
import { Container, Header, Left, Button, Icon, Body, Title, Right, Card, CardItem, Text, Row, Col } from 'native-base'
import Content from '../components/Content'
import Store from '../store'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import strapi from '../strapi'
import { StyleSheet } from 'react-native'
import config from '../config'
import { alert } from '../utils'

dayjs.extend(relativeTime)

const layout = StyleSheet.create({
  icon: {
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    margin: 4,
    borderRadius: 4
  }
})

class Summary extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showMore: props.store.get('team').members.map(m => false)
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
    const questions = await strapi.get('questions', { enabled: true })
    store.set('questions')(questions)
  }

  render () {
    const { store, navigation } = this.props
    const team = store.get('team')
    const screenings = store.get('screenings')
    const questions = store.get('questions')
    const schedule = navigation.getParam('schedule')
    const { severityColors, categoryIcons, summary } = config
    const question = id => questions.find(q => q.id === id)
    const { showMore } = this.state

    console.log({ screenings })

    return !questions ? null : (
      <Container>
        <Header>
          <Left>
            <Button transparent icon onPress={() => navigation.pop()}>
              <Icon type="FontAwesome5" name="arrow-left" />
            </Button>
          </Left>
          <Body>
            <Title>Summary</Title>
          </Body>
          <Right />
        </Header>
        <Content padder>
          { team && team.members.filter(member => {
            if (navigation.getParam('leader')) {
              const user = navigation.getParam('user')
              return member.isLeaderOf !== team.id && member.id === user.id
            } else {
              return member.isLeaderOf !== team.id
            }
          }).map((member, memberIndex) => (
            <Card key={member.id}>
              <CardItem bordered>
                <Body>
                  <Text>{member.lastname}, {member.firstname}</Text>
                  { screenings.filter(s => s.user.id === member.id && s.schedule.id === schedule.id).length > 0 ? (
                    <Text note>Submitted screenings: {screenings.filter(s => s.user.id === member.id).length}</Text>
                  ) : (
                    <Text note>hasn't yet submitted a screening.</Text>
                  ) }
                </Body>
              </CardItem>
              { screenings
                .sort((a, b) => (new Date(b.created_at) - new Date(a.created_at)))
                .filter(s => s.user.id === member.id && s.schedule.id === schedule.id)
                .slice(0, !showMore[memberIndex] ? 1 : screenings.filter(s => s.user.id === member.id).length)
                .map((screening, i) => (
                  <CardItem key={screening.id} bordered>
                    <Body>
                      { i === 0 && screenings.filter(s => s.user.id === member.id).length > 1 ? (
                        <Text note>Most recent:</Text>
                      ) : null }
                      <Text note>Submitted on {dayjs(screening.created_at).format('ddd, MMM D - h:mm A')}</Text>
                      <Row>
                        { screening.answers.sort((a, b) => b.severity - a.severity).map(answer => (
                          <Col
                            key={answer.id}
                            style={[{ backgroundColor: severityColors[answer.severity] || 'rgba(0, 0, 0, 0.1)' }, layout.icon]}
                            onPress={() => {
                              alert({
                                title: question(answer.question).category === 'exposure' ? 'Impact of exposure' : question(answer.question).category.charAt(0).toUpperCase() + question(answer.question).category.slice(1),
                                message: answer.severity === 0
                                  ? summary[0].general
                                  : (summary[answer.severity][question(answer.question).category][screening.schedule.type] || summary[answer.severity][question(answer.question).category])
                              })
                            }}
                          >
                            <Icon type={categoryIcons[question(answer.question).category].type} name={categoryIcons[question(answer.question).category].name} />
                          </Col>
                        )) }
                      </Row>
                    </Body>
                  </CardItem>
                ))
              }
              { screenings.filter(s => s.user.id === member.id && s.schedule.id === schedule.id).length > 1 ? (
                <CardItem>
                  <Button small bordered iconRight onPress={() => {
                    let newShowMore = [...showMore]
                    newShowMore[memberIndex] = !newShowMore[memberIndex]
                    this.setState({ showMore: newShowMore })
                  }}>
                    <Text>Show {showMore[memberIndex] ? 'Less' : `More (${screenings.filter(s => s.user.id === member.id).length - 1})`}</Text>
                    <Icon type="FontAwesome5" name={showMore[memberIndex] ? 'caret-up' : 'caret-down'} />
                  </Button>
                </CardItem>
              ) : null }
            </Card>
          )) }
        </Content>
      </Container>
    )
  }
}

export default Store.withStore(Summary)
