import React from 'react'
import { Container, Header, Left, Button, Icon, Card, CardItem, Text, Body, Title, Right, Subtitle, View, Row, Col } from 'native-base'
import Content from '../components/Content'
import Store from '../store'
import config from '../config'
import { StyleSheet } from 'react-native'

const layout = StyleSheet.create({
  adviceView: {
    padding: 10,
    flex: 1
  },
  actionView: {
    padding: 10,
    justifyContent: 'flex-end',
    flexDirection: 'row'
  }
})

class Advice extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      currentAdviceIndex: 0,
      advice: []
    }
  }

  componentDidMount () {
    this.setState({ advice: this.generateAdvice() })
  }

  generateAdvice () {
    const { navigation } = this.props
    const surveys = navigation.getParam('surveys').sort((a, b) => b.answer.severity - a.answer.severity)
    const schedule = navigation.getParam('schedule')
    const deploymentType = schedule.type
    const { advice } = config
    let generatedAdvice = [
      {
        severity: 0,
        category: 'intro',
        title: 'Responder',
        advice: deploymentType === 'post' ? advice[0].post : advice[0].preAndDuring
      }
    ]

    if (surveys.map(s => s.answer.severity).includes(1)) {
      generatedAdvice[0] = {
        severity: 1,
        category: 'intro',
        title: 'Responder',
        advice: deploymentType === 'post' ? advice[1].post : advice[1].preAndDuring
      }
    }

    if (surveys.map(s => s.answer.severity).includes(2)) {
      generatedAdvice[0] = {
        severity: 2,
        category: 'intro',
        title: 'Responder',
        advice: deploymentType === 'post' ? advice[2].post : advice[2].preAndDuring
      }
    }

    surveys.forEach(survey => {
      const { question, answer } = survey
      const existingSev0 = generatedAdvice.findIndex(advice => advice.severity === 0 && advice.category !== 'intro')

      if (existingSev0 < 0) {
        generatedAdvice.push({
          severity: answer.severity,
          category: question.category,
          title: question.category.charAt(0).toUpperCase() + question.category.slice(1),
          advice: answer.severity === 0
            ? advice[0].general
            : (advice[answer.severity][question.category][deploymentType] || advice[answer.severity][question.category])
        })
      } else {
        generatedAdvice[existingSev0].title += ` ${question.category}`
      }
    })

    const existingSev0 = generatedAdvice.findIndex(advice => advice.severity === 0 && advice.category !== 'intro')

    if (existingSev0 >= 0) {
      let title = generatedAdvice[existingSev0].title
      let titles = title.split(' ')

      if (titles.length > 1) {
        generatedAdvice[existingSev0].title = titles.length === 2 ? titles.join(' and ') : titles.map((w, i, t) => i === t.length - 1 ? `and ${w}` : w).join(', ')
      }

      generatedAdvice[existingSev0].category = 'intro'
    }

    return generatedAdvice
  }

  paginate (direction) {
    let { currentAdviceIndex } = this.state
    this.setState({
      currentAdviceIndex: direction === 'next'
        ? ++currentAdviceIndex
        : --currentAdviceIndex
    })
  }

  render () {
    const { store, navigation } = this.props
    const surveys = navigation.getParam('surveys')
    const schedule = navigation.getParam('schedule')
    const { deploymentTypes, severityColors, categoryIcons } = config
    const { currentAdviceIndex, advice } = this.state
    let currentAdvice = advice[currentAdviceIndex]

    return (
      <Container>
        <Header>
          <Left>
            <Button transparent icon onPress={() => {
              if (navigation.getParam('fromSubmissions')) {
                navigation.pop()
              } else {
                navigation.popToTop()
              }
            }}>
              <Icon type="FontAwesome5" name="arrow-left" />
            </Button>
          </Left>
          <Body>
            <Title>Advice</Title>
            <Subtitle>{deploymentTypes[schedule.type]}</Subtitle>
          </Body>
          <Right />
        </Header>
        <View style={layout.adviceView}>
          { currentAdvice ? (
            <View>
              <View style={{ alignItems: 'center' }}>
                <Icon
                  style={{
                    backgroundColor: severityColors[currentAdvice.severity] || 'rgba(0, 0, 0, 0.1)',
                    color: '#ffffff',
                    fontSize: 50,
                    padding: 8,
                    borderRadius: 50,
                    marginTop: 25,
                    marginBottom: 25
                  }}
                  type={categoryIcons[currentAdvice.category] && categoryIcons[currentAdvice.category].type || 'FontAwesome5'}
                  name={categoryIcons[currentAdvice.category] && categoryIcons[currentAdvice.category].name || 'exclamation-circle'}
                />
              </View>
              <Card>
                <CardItem header bordered>
                  <Text>{currentAdvice.title}</Text>
                </CardItem>
                <CardItem>
                  <Text>{currentAdvice.advice.split('\n').map(l => l.trim()).join('\n')}</Text>
                </CardItem>
              </Card>
            </View>
          ) : null }
        </View>
        <View style={layout.actionView}>
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            { currentAdviceIndex > 0 ? (
              <Button icon rounded style={{ height: 55 }} onPress={this.paginate.bind(this, 'previous')}>
                <Icon type="FontAwesome5" name="chevron-circle-left" />
              </Button>
            ) : null }
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            { currentAdviceIndex < (advice.length - 1) ? (
              <Button icon rounded style={{ height: 55 }} onPress={this.paginate.bind(this, 'next')}>
                <Icon type="FontAwesome5" name="chevron-circle-right" />
              </Button>
            ) : null }
          </View>
        </View>
      </Container>
    )
  }
}

export default Store.withStore(Advice)
