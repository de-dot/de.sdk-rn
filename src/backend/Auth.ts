import type { AuthCredentials, AuthOptions, AuthRequestOptions } from '../types/auth'
import { Platform } from 'react-native'

const ACCESS_TOKEN_EXPIRY = 3.75 // in 3 minutes 45 seconds

type AuthResponse = {
  error: boolean
  message: string
  token: string
}

export default class Auth {
  private version: number
  protected creds: AuthCredentials
  private expiryTime?: any
  private autorefresh?: boolean
  private baseURL: string
  public accessToken?: string

  constructor( creds: AuthCredentials, options?: AuthOptions ){
    if( !creds ) throw new Error('Undefined Credentials. Check https://doc.dedot.io/sdk/auth')
    if( !creds.workspace ) throw new Error('Undefined Workspace Reference. Check https://doc.dedot.io/sdk/auth')
    if( !creds.remoteOrigin ) throw new Error('Undefined Remote Origin. Check https://doc.dedot.io/sdk/auth')
    if( !creds.cid ) throw new Error('Undefined Connector ID. Check https://doc.dedot.io/sdk/auth')
    if( !creds.secret ) throw new Error('Undefined Connector Secret. Check https://doc.dedot.io/sdk/auth')

    this.creds = creds
    this.version = options?.version || 1
    this.baseURL = options?.env === 'prod'
                                ? 'https://api.dedot.io'
                                : Platform.select({
                                  android: 'http://10.0.2.2:24800',
                                  ios: 'http://api.dedot.io:24800',
                                  default: 'http://api.dedot.io:24800'
                                })
    this.autorefresh = options?.autorefresh || false
  }

  private async request<T>({ url, ...options }: AuthRequestOptions ): Promise<T>{
    const rawOptions: any = {
      method: 'GET',
      headers: {
        /**
         * Default User agent for SDK request calls
         * 
         * NOTE: Later replace by latest SDK version
         */
        'origin': this.creds.remoteOrigin,
        'x-user-agent': `De.remote/${this.version}.0`
      }
    }

    if( this.accessToken )
      rawOptions.headers.authorization = `Bearer ${this.accessToken}`

    if( options.body ){
      rawOptions.headers['content-type'] = 'application/json'
      if( typeof options.body === 'object' )
        options.body = JSON.stringify( options.body )
    }

    options = { ...rawOptions, ...options }

    console.log('Auth request', `${this.baseURL}/v${this.version}/${url.replace(/^\//, '')}`, options )
    const response = await fetch(`${this.baseURL}/v${this.version}/${url.replace(/^\//, '')}`, options )
    
    return await response.json() as T
  }

  async getToken(): Promise<string>{
    const
    { workspace, cid, secret } = this.creds,
    options: AuthRequestOptions = {
      url: '/access/token',
      method: 'POST',
      body: this.creds
    },
    { error, message, token } = await this.request<AuthResponse>( options )
    if( error ) throw new Error( message )

    // Set auto-refresh token every 4 mins
    if( this.autorefresh ){
      clearTimeout( this.expiryTime )
      this.expiryTime = setTimeout( () => this.rotateToken(), ACCESS_TOKEN_EXPIRY * 60 * 1000 )
    }
    
    this.accessToken = token
    return token
  }

  async rotateToken(){
    if( !this.accessToken )
      throw new Error('No access token found')

    try {
      const
      options: AuthRequestOptions = {
        url: '/access/token/rotate',
        method: 'PATCH',
        body: { secret: this.creds.secret }
      },
      { error, message, token } = await this.request<AuthResponse>( options )
      if( error ) throw new Error( message )

      // Set auto-refresh token every 4 mins
      if( this.autorefresh ){
        clearTimeout( this.expiryTime )
        this.expiryTime = setTimeout( () => this.rotateToken(), ACCESS_TOKEN_EXPIRY * 60 * 1000 )
      }
      
      this.accessToken = token
      return token
    }
    catch( error: any ){
      console.error(`Refresh access token failed: ${error.message}`)
      return await this.getToken() // Get new token instead
    }
  }
}