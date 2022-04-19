import { createConnectedStore } from 'undux'
import { AsyncStorage } from 'react-native'

// Clear Storage - FOR DEBUGGING PURPOSE ONLY
// AsyncStorage.clear()

// Initial app state
export let initialState = {
  pushToken: undefined,
  token: undefined,
  user: undefined,
  team: undefined,
  schedules: undefined,
  surveys: undefined,
  questions: undefined,
  screenings: undefined
}

Object.keys(initialState).forEach(async key => {
  // Restore persisted app states
  initialState[key] = JSON.parse(await AsyncStorage.getItem(key))
})

// Store Effects
const effects = async (store) => {
  // Persist app state to AsyncStorage
  store.onAll().subscribe(async ({ key, previousValue, value }) => {
    console.log(`Persisting ${key} state.`)
    await AsyncStorage.setItem(key, JSON.stringify(value))
  })

  return store
}

const Store = createConnectedStore(initialState, effects)

export default Store
