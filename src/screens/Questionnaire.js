import React from 'react'
import { Container, Header, Left, Button, Icon, Body, Title, Right, Card, CardItem, Text, List, ListItem, Radio, Spinner, View, ActionSheet } from 'native-base'
import Content from '../components/Content'
import Store from '../store'
import strapi from '../strapi'
import { alert } from '../utils'
import { StyleSheet } from 'react-native'

const layout = StyleSheet.create({
  questionView: {
    flex: 1,
    padding: 10
  },
  actionView: {
    justifyContent: 'flex-end',
    padding: 10
  }
})

class Questionnaire extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      surveys: [],
      currentQuestion: 0
    }
  }

  componentDidMount () {
    this.updateData()
  }

  async updateData () {
    const { store } = this.props
    const screenings = store.get('screenings')
    const questions = await strapi.get('questions', { enabled: true })
    store.set('questions')(questions)
    console.log('NUMBER_OF_SCREENINGS:', screenings.length)
  }

  async setAnswer (index, question, choice) {
    const { store, navigation } = this.props
    const { surveys } = this.state
    const user = store.get('user')
    const schedule = navigation.getParam('schedule')

    surveys[index] = {
      user: user,
      schedule: schedule,
      question: question,
      answer: choice
    }

    this.setState({ surveys: surveys })
  }

  async submitSurveys () {
    const { store, navigation } = this.props
    const { surveys } = this.state
    const questions = store.get('questions')
    const user = store.get('user')
    const team = store.get('team')
    const schedule = navigation.getParam('schedule')

    if (surveys.length === questions.length) {
      this.setState({ loading: true })

      const answers = surveys.map(s => s.answer.id)
      const screening = await strapi.create('screenings', {
        user: user.profile.id,
        schedule: schedule.id,
        answers,
        team: team.id
      })

      if (!screening.error) {
        return navigation.navigate('advice', { surveys, schedule })
      } else {
        return alert('There might be an error in submitting your answers. This may be due to network issues.')
      }
    } else alert(`You must answer all ${questions.length} questions.`)
  }

  async showActionSheet () {
    const { navigation, store } = this.props
    const options = ['Previous Submissions', 'Cancel']
    const schedule = navigation.getParam('schedule')
    const user = store.get('user')

    ActionSheet.show(
      {
        title: 'Actions',
        options,
        cancelButtonIndex: options.indexOf('Cancel')
      },
      tapped => {
        switch(options[tapped]) {
          case 'Previous Submissions':
            navigation.navigate('submissions', { schedule, user })
            break
          default:
            console.log('Tapped index:', tapped)
            break
        }
      }
    )
  }

  render () {
    const { store, navigation } = this.props
    const { surveys, loading, currentQuestion } = this.state

    // console.log('CURRENT_QUESTION:', currentQuestion)
    // console.log('QUESTIONS:', store.get('questions'))

    return (
      <Container>
        <Header>
          <Left>
            <Button transparent icon onPress={() => navigation.pop()}>
              <Icon type="FontAwesome5" name="arrow-left" />
            </Button>
          </Left>
          <Body>
            <Title>Questionnaire</Title>
          </Body>
          <Right>
            <Button transparent icon onPress={this.showActionSheet.bind(this)}>
              <Icon type="FontAwesome" name="ellipsis-v" />
            </Button>
          </Right>
        </Header>
        { store.get('questions') ? (
          <View style={{ flex: 1 }}>
            <View style={layout.questionView}>
              { currentQuestion < store.get('questions').length ? (
                store.get('questions') && store.get('questions').sort((a, b) => a.id - b.id).map((question, index) => {
                  const screeningType = navigation.getParam('schedule').type

                  // Modify question and choices if question is about exposure.
                  if (question.category === 'exposure') {
                    question.text = screeningType === 'pre'
                    ? 'Have you experienced disturbing conditions in your previous deployment?'
                    : 'Have you experienced disturbing conditions in the field?'

                    question.choices = question.choices.map((choice, index) => {
                      let newChoices = screeningType === 'pre'
                      ? [
                        'I have not experienced disturbing conditions in my previous deployment.',
                        'I have experienced disturbing conditions in my previous deployment but I am not upset by it.',
                        'I have experienced disturbing conditions in my previous deployment and I am upset by it.'
                      ]
                      : [
                        'I have not experienced disturbing conditions in the field.',
                        'I have experienced disturbing conditions in the field but I am not upset by it.',
                        'I have experienced disturbing conditions in the field and I am upset by it.'
                      ]
                      choice.text = newChoices[index]
                      return choice
                    })
                  }

                  // Modify question and choices if question is about family
                  if (question.category === 'family') {
                    question.text = 'How much do you know about your family\'s safety and well-being?'
                    question.choices = question.choices.map((choice, index) => {
                      let newChoices = [
                        'I know that my family is safe and out of the danger zone.',
                        'I know that my family is within the danger zone but I was informed that they are fine.',
                        'I know that my family is within the danger zone and I was informed that they were harmed/I have no information about them.'
                      ]
                      choice.text = newChoices[index]
                      return choice
                    })
                  }

                  return (
                    (currentQuestion === index ? (
                      <Card key={question.id}>
                        <CardItem header bordered>
                          <Text>#{question.id}: {question.text}</Text>
                        </CardItem>
                        <List>
                          { question.choices && question.choices.sort((a, b) => a.severity - b.severity).map(choice => (
                            <ListItem key={choice.id} onPress={this.setAnswer.bind(this, index, question, choice)}>
                              <Left>
                                <Text>{choice.text}</Text>
                              </Left>
                              <Right>
                                <Radio
                                  color="#8e1537"
                                  selectedColor="#8e1537"
                                  selected={!!surveys.find(s => s && s.answer.id === choice.id)}
                                  onPress={this.setAnswer.bind(this, index, question, choice)}
                                />
                              </Right>
                            </ListItem>
                          )) }
                        </List>
                      </Card>
                    ) : null)
                  )
                })
              ) : (
                <Card>
                  <CardItem header bordered>
                    <Text>Almost done!</Text>
                  </CardItem>
                  <CardItem>
                    <Body>
                      <Text>Thank you for answering the screening. Submit it by tapping the button below.</Text>
                    </Body>
                  </CardItem>
                </Card>
              )}
            </View>
            <View style={layout.actionView}>
              { currentQuestion < store.get('questions').length ? (
                <View>
                  { !surveys[currentQuestion] ? (
                    <Text note>*Note: Please select an answer to proceed.</Text>
                  ) : null }
                  <Button block onPress={() => this.setState({ currentQuestion: currentQuestion + 1 })} disabled={!surveys[currentQuestion]}>
                    <Text>Next</Text>
                  </Button>
                </View>
              ) : (
                <Button block style={{ marginTop: 8 }} onPress={this.submitSurveys.bind(this)} disabled={loading}>
                  { loading
                  ? (<Spinner color="#8e1537" />)
                  : (<Text>Submit</Text>) }
                </Button>
              ) }
            </View>
          </View>
        ): null }
      </Container>
    )
  }
}

export default Store.withStore(Questionnaire)
