import { createDrawerNavigator } from 'react-navigation-drawer'
import { createStackNavigator } from 'react-navigation-stack'
import Drawer from '../components/Drawer'
import Team from './Team'
import Assessments from './Assessments'
import CreateAssessment from './CreateAssessment'
import Questionnaire from './Questionnaire'
import Advice from './Advice'
import Summary from './Summary'
import MemberScreenings from './MemberScreenings'
import Submissions from './Submissions'

const AppNavigation = createDrawerNavigator(
  {
    team: createStackNavigator(
      {
        team: Team,
        memberScreenings: MemberScreenings,
        summary: Summary
      },
      {
        initialRouteName: 'team',
        defaultNavigationOptions: { header: null },
        navigationOptions: ({ navigation }) => ({
          drawerLockMode: (navigation.state.index > 0) ? 'locked-closed' : 'unlocked'
        })
      }
    ),
    assessments: createStackNavigator(
      {
        assessments: Assessments,
        createAssessment: CreateAssessment,
        questionnaire: Questionnaire,
        advice: Advice,
        summary: Summary,
        submissions: Submissions
      },
      {
        initialRouteName: 'assessments',
        defaultNavigationOptions: { header: null },
        navigationOptions: ({ navigation }) => ({
          drawerLockMode: (navigation.state.index > 0) ? 'locked-closed' : 'unlocked'
        })
      }
    )
  },
  {
    initialRouteName: 'team',
    contentComponent: Drawer
  }
)

export default AppNavigation
