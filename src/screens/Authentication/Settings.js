import React from 'react'
import Store from '../../store'
import { Container, Header, Left, Button, Icon, Body, Title, Right, Card, CardItem, Text, Form, Item, Input } from 'native-base'
import strapi from '../../strapi'
import Content from '../../components/Content'

class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      serverUrl: null
    }
  }

  saveSettings () {
    console.log('Settings saved.')
  }

  render () {
    const { navigation } = this.props

    return (
      <Container>
        <Header>
          <Left>
            <Button icon transparent onPress={() => navigation.pop()}>
              <Icon type="FontAwesome" name="arrow-left" />
            </Button>
          </Left>
          <Body>
            <Title>Settings</Title>
          </Body>
          <Right />
        </Header>
        <Content padder>
          <Card>
            <CardItem header>
              <Text>Server</Text>
            </CardItem>
            <CardItem>
              <Form>
                <Item regular>
                  <Input placeholder="URL" autoCapitalize="none" textContentType="URL" onChangeText={serverUrl => this.setState({ serverUrl })} />
                </Item>
              </Form>
            </CardItem>
          </Card>

          <Button block style={{ marginTop: 8 }} onPress={this.saveSettings.bind(this)}>
            <Text>Save</Text>
          </Button>
        </Content>
      </Container>
    )
  }
}

export default Store.withStore(Settings)
