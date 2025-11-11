import type { AccessOptions } from '../types/access'
import type { HTTPRequestOptions } from '../types'
import { API_SERVER_BASEURL, ASI_SERVER_BASEURL } from '../baseUrl'

type AccessType = 'API' | 'ASI'

const USER_ACCOUNT_SERVICE = 'De.API'

export default class AccessManager {
  private atype: AccessType
  private version: number
  private platform: AccessOptions['platform']
  private baseURL: string
  protected accessToken?: string
  protected remoteOrigin?: string

  constructor( options: AccessOptions, atype: AccessType ){
    if( !options ) throw new Error('Undefined Access Configuration')
    if( !options.context ) throw new Error('Undefined Context Reference. Check https://doc.dedot.io/sdk/auth')
    if( !options.accessToken ) throw new Error('Undefined Access Token. Check https://doc.dedot.io/sdk/auth')
    
    this.atype = atype
    this.version = options.version || 1
    this.platform = options.platform || 'proxy'
    this.accessToken = options.accessToken
    this.remoteOrigin = options.remoteOrigin
    this.baseURL = this.atype === 'ASI'
              ? ASI_SERVER_BASEURL[ options.env || 'dev' ] 
              : API_SERVER_BASEURL[ options.env || 'dev' ]
  }

  async request<Response>({ url, ...options }: HTTPRequestOptions ): Promise<Response> {
    const rawOptions: any = {
      method: 'GET',
      headers: {
        /**
         * Default User agent for SDK request calls
         * 
         * NOTE: Later replace by latest SDK version
         */
        origin: this.remoteOrigin,
        'de-user-agent': `De.${this.platform}/${this.version}.0`
      }
    }

    if( this.atype === 'ASI' )
      rawOptions.headers['de-auth-service'] = USER_ACCOUNT_SERVICE

    if( this.accessToken )
      rawOptions.headers.authorization = `Bearer ${this.accessToken}`

    if( options.body ){
      rawOptions.headers['content-type'] = 'application/json'
      if( typeof options.body === 'object' )
        options.body = JSON.stringify( options.body )
    }

    if( typeof options.headers == 'object' )
      options.headers = {
        ...options.headers,
        ...rawOptions.headers
      }

    options = { ...rawOptions, ...options }
    
    // React Native has built-in fetch
    return await ( await fetch(`${this.baseURL}/v${this.version}/${url.replace(/^\//, '')}`, options ) ).json() as Response
  }

  setToken( token: string ): void { this.accessToken = token }
}