import { validate as indicativeValidate } from 'indicative/validator'
import { Alert } from 'react-native'
import axios from 'axios'

/**
 * Data validation.
 * @param {Object} data The object to validate.
 * @param {Object} rules Rules according to fields in the object to validate.
 * @param {Object} messages Custom error messages when fields are invalid.
 */
export async function validate (data, rules, messages) {
    try {
        return await indicativeValidate(data, rules, messages)
    } catch (fields) {
        alert(fields[0].message)
        return {
            invalid: true,
            fields
        }
    }
}

/**
 * Custom Alert
 * @param {*} data A string or an object that contains the alert params.
 */
export async function alert (data) {
    if (typeof data === 'object') {
        const { title, message, buttons, options } = data
        Alert.alert(title, message, buttons, options)
    } else {
        Alert.alert('Mi Salud', data)
    }
}

export function notify (to, title, body, data) {
    return axios.post('https://exp.host/--/api/v2/push/send', {
        to, title, body, data,
        sound: 'default',
        _displayInForeground: true
    })
}
