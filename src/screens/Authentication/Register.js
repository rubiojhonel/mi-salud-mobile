import React from 'react'
import Store from '../../store'
import { Container, Header, Left, Button, Icon, Body, Title, Right, Card, CardItem, Form, Item, Input, Text, Radio, Label, View, Spinner } from 'native-base'
import { validate, alert } from '../../utils'
import strapi from '../../strapi'
import Content from '../../components/Content'

class Registration extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      email: undefined,
      username: undefined,
      password: undefined,
      password_confirmation: undefined,
      lastname: undefined,
      firstname: undefined,
      middlename: undefined,
      sex: undefined,
      birthdate: '//',
      contactNumber: undefined
    }
  }

  // setBirthdate (value, index) {
  //   let { birthdate } = this.state
  //   let update = birthdate.split('/')
  //   update[index] = value
  //   this.setState({ birthdate: update.join('/') })
  // }

  async register () {
    delete this.state.loading

    const user = await validate(
      this.state,
      {
        email: 'required|email',
        username: 'required',
        password: 'required|confirmed',
        lastname: 'required',
        firstname: 'required',
        sex: 'required',
        birthdate: 'required|date',
        contactNumber: 'required'
      },
      {
        required: 'Please provided a {{ field }}.',
        'email.required': 'Please provide an email.',
        'email.email': 'Invalid email.',
        'password.confirmed': 'Passwords doesn\'t match.',
        'birthdate.date': 'This is not a valid birthdate.',
        'contactNumber.required': 'Please provide a contact number.'
      }
    )

    if (!user.invalid) {
      this.setState({ loading: true })

      const { email, username, password, lastname, firstname, middlename, sex, birthdate, contactNumber } = this.state

      // Register Account
      const account = await strapi.register({
        email, username, password,
        confirmed: true,
        blocked: false
      })

      if (!account.error) {
        // Pre-login account
        const auth = await strapi.login(username, password)

        // Create Profile
        let profile = await strapi.create('profiles', {
          account: auth.user.id,
          lastname, firstname, middlename, sex, birthdate, contactNumber
        })

        if (!profile.error) {
          alert('Done. Please login to continue.')
          strapi.token = undefined
          return this.props.navigation.pop()
        } else {
          this.setState({ loading: false })
          return alert('Error creating profile. Please submit a screenshot of this to the system administrator.')
        }
      } else {
        this.setState({ loading: false })
        return alert(account.message[0].messages[0].message)
      }
    }
  }

  render () {
    const { navigation } = this.props
    const { sex, loading } = this.state
    return (
      <Container>
        <Header>
          <Left>
            <Button icon transparent onPress={() => navigation.pop()}>
              <Icon type="FontAwesome" name="arrow-left" />
            </Button>
          </Left>
          <Body>
            <Title>Register</Title>
          </Body>
          <Right />
        </Header>
        <Content padder>
          {/* <Card>
            <CardItem header>
              <Text>Team</Text>
            </CardItem>
            <CardItem>
              <Form>
                <Item regular>
                  <Input placeholder="Team Code" autoCapitalize="none" />
                </Item>
              </Form>
            </CardItem>
          </Card> */}

          <Card>
            <CardItem header>
              <Text>Account</Text>
            </CardItem>
            <CardItem>
              <Form>
                <Item regular>
                  <Input placeholder="Email" autoCapitalize="none" onChangeText={email => this.setState({ email })} />
                </Item>
                <Item regular>
                  <Input placeholder="Username" autoCapitalize="none" onChangeText={username => this.setState({ username })} />
                </Item>
                <Item regular>
                  <Input placeholder="Password" autoCapitalize="none" onChangeText={password => this.setState({ password })} secureTextEntry />
                </Item>
                <Item regular>
                  <Input placeholder="Repeat password" autoCapitalize="none" onChangeText={password_confirmation => this.setState({ password_confirmation })} secureTextEntry />
                </Item>
              </Form>
            </CardItem>
          </Card>

          <Card>
            <CardItem header>
              <Text>Profile</Text>
            </CardItem>
            <CardItem>
              <Form>
                <Item regular>
                  <Input placeholder="Lastname" onChangeText={lastname => this.setState({ lastname })} />
                </Item>
                <Item regular>
                  <Input placeholder="Firstname" onChangeText={firstname => this.setState({ firstname })} />
                </Item>
                <Item regular>
                  <Input placeholder="Middlename (optional)" onChangeText={middlename => this.setState({ middlename })} />
                </Item>
                <Item regular style={{ height: 50, paddingHorizontal: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Label style={{ color: 'grey' }}>Sex:</Label>
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Radio color="#8e1537" selectedColor="#8e1537" selected={sex === 'male'} onPress={() => this.setState({ sex: 'male' })} />
                    <Text style={{ marginLeft: 8, marginTop: 1 }}>Male</Text>
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Radio color="#8e1537" selectedColor="#8e1537" selected={sex === 'female'} onPress={() => this.setState({ sex: 'female' })} />
                    <Text style={{ marginLeft: 8, marginTop: 1 }}>Female</Text>
                  </View>
                </Item>
                {/* <Item regular style={{ paddingHorizontal: 8 }}>
                  <View style={{ flex: 2 }}>
                    <Label style={{ color: 'grey' }}>Birthdate:</Label>
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Input placeholder="MM" maxLength={2} keyboardType="number-pad" onChangeText={mm => this.setBirthdate(mm, 0)} />
                    <Text>/</Text>
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 12 }}>
                    <Input placeholder="DD" maxLength={2} keyboardType="number-pad" onChangeText={dd => this.setBirthdate(dd, 1)} />
                    <Text>/</Text>
                  </View>
                  <View style={{ flex: 2, paddingLeft: 12 }}>
                    <Input placeholder="YYYY" maxLength={4} keyboardType="number-pad" onChangeText={yyyy => this.setBirthdate(yyyy, 2)} />
                  </View>
                </Item> */}
                <Item regular>
                  <Input placeholder="Birthdate (MM/DD/YYYY)" onChangeText={birthdate => this.setState({ birthdate })} />
                </Item>
                <Item regular>
                  <Input placeholder="Contact number" keyboardType="number-pad" onChangeText={contactNumber => this.setState({ contactNumber })} />
                </Item>
              </Form>
            </CardItem>
          </Card>

          <Button block style={{ marginTop: 8 }} onPress={this.register.bind(this)} disabled={loading}>
            { loading
            ? (<Spinner color="#8e1537" />)
            : (<Text>Register</Text>) }
          </Button>
        </Content>
      </Container>
    )
  }
}

export default Store.withStore(Registration)
