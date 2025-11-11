import { Platform } from 'react-native'

export const ASI_SERVER_BASEURL = {
  dev: Platform.select({
    android: 'http://10.0.2.2:44000',
    ios: 'http://localhost:44000',
    default: 'http://localhost:44000'
  }),
  prod: 'https://api.dedot.io'
}
export const API_SERVER_BASEURL = {
  dev: Platform.select({
    android: 'http://10.0.2.2:24800',
    ios: 'http://localhost:24800',
    default: 'http://localhost:24800'
  }),
  prod: 'https://api.dedot.io'
}
export const IOT_SERVER_BASEURL = {
  dev: Platform.select({
    android: 'http://10.0.2.2:11011',
    ios: 'http://localhost:11011',
    default: 'http://localhost:11011'
  }),
  prod: 'https://iot.dedot.io'
}