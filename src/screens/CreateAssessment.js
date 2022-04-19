import React from 'react'
import { TouchableOpacity, Platform } from 'react-native'
import { Container, Header, Left, Button, Icon, Body, Title, Right, Card, CardItem, Text, Form, Item, Label, Picker, Spinner, Input } from 'native-base'
import DateTimePicker from '@react-native-community/datetimepicker'
import Content from '../components/Content'
import Store from '../store'
import dayjs from 'dayjs'
import { validate, alert, notify } from '../utils'
import strapi from '../strapi'
import { date } from 'faker'

class CreateAssessment extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      type: 'pre',
      team: props.store.get('team').id,
      start: new Date(),
      end: new Date(),
      showStartDatePicker: false,
      showEndDatePicker: false
    }
  }

  async createAssessment () {
    const { store, navigation } = this.props
    const { type, team, start, end } = this.state
    const data = await validate(
      { type, team, start, end },
      {
        type: 'required|in:pre,during,post',
        team: 'required|number',
        start: 'required|date',
        end: 'required|date'
      },
      {
        'type.required': 'Please select a screening type.',
        'type.in': 'Unsupported screening type.',
        'team.required': 'It looks like your not yet in a team.',
        'start.required': 'Please provide a valid date.',
        'end.required': 'Please provide a due date.'
      }
    )

    if (!data.invalid) {
      this.setState({ loading: true })

      const schedule = await strapi.create('schedules', data)

      if (!schedule.error) {
        const { members } = store.get('team')
        const tokens = members.map(member => member.token).filter(token => !!token)

        if (tokens.length > 0) {
          notify(tokens, 'New Screening', 'Team leader has scheduled a new screening.', { id: schedule.id })
        }

        alert({
          title: 'Mi Salud',
          message: 'Schedule has been created.',
          buttons: [
            {
              text: 'OK',
              onPress: async () => {
                const schedules = [...store.get('schedules'), schedule]
                store.set('schedules')(schedules)
              }
            }
          ]
        })
        return navigation.pop()
      } else {
        alert('Error creating the schedule.')
      }

      this.setState({ loading: false })
    }
  }

  onChangeDate (event, selectedDate) {
    console.log({ event, selectedDate })
  }

  render () {
    const { store, navigation } = this.props
    const { loading, showStartDatePicker, showEndDatePicker } = this.state

    return (
      <Container>
        <Header>
          <Left>
            <Button transparent icon onPress={() => navigation.pop()}>
              <Icon type="FontAwesome5" name="arrow-left" />
            </Button>
          </Left>
          <Body>
            <Title>Screening</Title>
          </Body>
          <Right />
        </Header>
        <Content padder>
          <Card>
            <CardItem>
              <Form>
                <Item picker>
                  <Label style={{ width: 100 }}>Type</Label>
                  <Picker
                    mode="dropdown"
                    selectedValue={this.state.type}
                    onValueChange={type => this.setState({ type })}
                  >
                    <Picker.Item label="Pre-deployment" value="pre" />
                    <Picker.Item label="During deployment" value="during" />
                    <Picker.Item label="Post-deployment" value="post" />
                  </Picker>
                </Item>
                <Item picker style={{ marginTop: 24, marginLeft: 0 }}>
                  <Label style={{ width: 100 }}>Valid Date</Label>
                  <TouchableOpacity onPress={() => this.setState({ showStartDatePicker: true })}>
                    <Input
                      placeholder="MM/DD/YYYY"
                      value={dayjs(this.state.start).format('MM/DD/YYYY')}
                      editable={false}
                    />
                  </TouchableOpacity>
                  { showStartDatePicker ? (
                    <DateTimePicker
                      minimumDate={new Date()}
                      value={this.state.start}
                      mode="date"
                      display="calendar"
                      onChange={(event, start) => {
                        this.setState({
                          start,
                          showStartDatePicker: Platform.OS === 'ios'
                        })

                        if (start > this.state.end) {
                          this.setState({
                            end: start
                          })
                        }
                      }}
                    />
                  ) : null }
                </Item>
                <Item picker style={{ marginTop: 24, marginLeft: 0 }}>
                  <Label style={{ width: 100 }}>Due Date</Label>
                  <TouchableOpacity onPress={() => this.setState({ showEndDatePicker: true })}>
                    <Input
                      placeholder="MM/DD/YYYY"
                      value={dayjs(this.state.end).format('MM/DD/YYYY')}
                      editable={false}
                    />
                  </TouchableOpacity>
                  { showEndDatePicker ? (
                    <DateTimePicker
                      minimumDate={this.state.start}
                      value={this.state.end}
                      mode="date"
                      display="calendar"
                      onChange={(event, end) => {
                        end = new Date(end) 
                        end.setHours(end.getHours() + 23)
                        end.setMinutes(59)
                        end.setSeconds(59)
                        this.setState({
                          end,
                          showEndDatePicker: Platform.OS === 'ios'
                        })
                      }}
                    />
                  ) : null }
                </Item>
              </Form>
            </CardItem>
          </Card>

          <Button block style={{ marginTop: 8 }} onPress={this.createAssessment.bind(this)} disabled={loading}>
            { loading
            ? (<Spinner color="#8e1537" />)
            : (<Text>Create</Text>) }
          </Button>
        </Content>
      </Container>
    )
  }
}

export default Store.withStore(CreateAssessment)
