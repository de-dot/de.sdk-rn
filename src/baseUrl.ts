import { Platform } from 'react-native'

export const baseURL = ( hostname?: string ) => {
  return {
    ASI_SERVER_BASEURL: {
      dev: Platform.select({
        android: `http://${hostname || '10.0.2.2'}:44000`,
        ios: `http://${hostname || 'localhost'}:44000`,
        default: `http://${hostname || 'localhost'}:44000`
      }),
      prod: 'https://api.dedot.io'
    },
    API_SERVER_BASEURL: {
      dev: Platform.select({
        android: `http://${hostname || '10.0.2.2'}:24800`,
        ios: `http://${hostname || 'localhost'}:24800`,
        default: `http://${hostname || 'localhost'}:24800`
      }),
      prod: 'https://api.dedot.io'
    },
    IOT_SERVER_BASEURL: {
      dev: Platform.select({
        android: `http://${hostname || '10.0.2.2'}:11011`,
        ios: `http://${hostname || 'localhost'}:11011`,
        default: `http://${hostname || 'localhost'}:11011`
      }),
      prod: 'https://iot.dedot.io'
    }
  }
}

export default baseURL