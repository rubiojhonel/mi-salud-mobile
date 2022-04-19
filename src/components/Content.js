import React from 'react'
import { KeyboardAvoidingView, StyleSheet, Platform } from 'react-native'
import Constants from 'expo-constants'
import { Content as NativebaseContent, View } from 'native-base'

const layout = StyleSheet.create({
  kaView: {
    flex: 1,
    backgroundColor: '#ffffff'
  }
})

// class Content extends React.Component {
//   constructor (props) {
//     super(props)
//   }

//   render () {
//     return !__DEV__ ? (
//       <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={Constants.statusBarHeight} style={layout.kaView}>
//         <NativebaseContent padder={this.props.padder}>
//           {this.props.children}
//         </NativebaseContent>
//       </KeyboardAvoidingView>
//     ) : (
//       <NativebaseContent padder={this.props.padder}>
//         {this.props.children}
//       </NativebaseContent>
//     )
//   }
// }

const Content = (props) => {
  return !__DEV__ ? (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Constants.statusBarHeight} style={layout.kaView}>
      <NativebaseContent padder={props.padder}>
        {props.children}
      </NativebaseContent>
    </KeyboardAvoidingView>
  ) : (
    <NativebaseContent padder={props.padder}>
      {props.children}
    </NativebaseContent>
  )
}

export default Content
