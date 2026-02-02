import type { AuthCredentials, AuthOptions, AuthRequestOptions } from '../types/auth'
import baseURL from '../baseUrl'

const ACCESS_TOKEN_EXPIRY = 3.75 // in 3 minutes 45 seconds

type AuthResponse = {
  error: boolean
  message: string
  token: string
}

export default class Auth {
  private version: number
  private options: AuthOptions
  protected creds: AuthCredentials
  private refreshTimer?: number
  private autorefresh?: boolean
  private onNewToken?: (token: string) => void
  private baseURL: string
  private isRotating: boolean = false
  public accessToken?: string

  constructor( creds: AuthCredentials, options?: AuthOptions ){
    if( !creds ) throw new Error('Undefined Credentials. Check https://doc.dedot.io/sdk/auth')
    if( !creds.context ) throw new Error('Undefined Context Reference. Check https://doc.dedot.io/sdk/auth')
    if( !creds.remoteOrigin ) throw new Error('Undefined Remote Origin. Check https://doc.dedot.io/sdk/auth')
    if( !creds.cid ) throw new Error('Undefined Connector ID. Check https://doc.dedot.io/sdk/auth')
    if( !creds.secret ) throw new Error('Undefined Connector Secret. Check https://doc.dedot.io/sdk/auth')

    this.creds = creds
    this.options = options || { env: 'dev' }
    this.version = this.options.version || 1

    const { API_SERVER_BASEURL } = baseURL( this.options.devHostname )
    this.baseURL = API_SERVER_BASEURL[ this.options.env || 'dev' ]

    this.autorefresh = this.options.autorefresh || false
    this.onNewToken = this.options.onNewToken
  }

  private async request<T>({ url, ...options }: AuthRequestOptions ): Promise<T> {
    const rawOptions: any = {
      method: 'GET',
      headers: {
        /**
         * Default User agent for SDK request calls
         * 
         * NOTE: Later replace by latest SDK version
         */
        'origin': this.creds.remoteOrigin,
        'de-user-agent': `De.remote/${this.version}.0`
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

    this.debug('Auth request', `${this.baseURL}/v${this.version}/${url.replace(/^\//, '')}`, options )
    const response = await fetch(`${this.baseURL}/v${this.version}/${url.replace(/^\//, '')}`, options )
    
    return await response.json() as T
  }

  private debug( ...args: any[] ){
    this.options?.env === 'dev' && console.debug('[Auth]', ...args )
  }
  private error( ...args: any[] ){
    console.error('[Auth]', ...args )
  }

  /**
   * Schedule next token rotation
   */
  private scheduleRotation(){
    if( !this.autorefresh ) return

    this.clearRotation()
    this.refreshTimer = setTimeout( () => this.rotateToken(), ACCESS_TOKEN_EXPIRY * 60 * 1000 )
  }

  /**
   * Clear rotation timer
   */
  private clearRotation(){
    if( !this.refreshTimer ) return

    clearTimeout( this.refreshTimer )
    this.refreshTimer = undefined
  }

  async getToken(): Promise<string>{
    const
    options: AuthRequestOptions = {
      url: '/access/token',
      method: 'POST',
      body: this.creds
    },
    { error, message, token } = await this.request<AuthResponse>( options )
    if( error ) throw new Error( message )

    this.accessToken = token
    this.scheduleRotation() // Schedule auto-refresh
    
    return token
  }

  async rotateToken(): Promise<string> {
    // Prevent concurrent rotation attempts
    if( this.isRotating ){
      this.debug('Token rotation already in progress, skipping')
      return this.accessToken!
    }

    if( !this.accessToken )
      throw new Error('No access token found')

    this.isRotating = true

    try {
      const
      options: AuthRequestOptions = {
        url: '/access/token/rotate',
        method: 'PATCH',
        body: { secret: this.creds.secret }
      },
      { error, message, token } = await this.request<AuthResponse>( options )
      if( error ) throw new Error( message )

      this.accessToken = token

      // Notify callback listener
      if( typeof this.onNewToken === 'function' )
        try { this.onNewToken( token ) }
        catch( callbackError ){ this.error('[Auth] Error in onNewToken callback:', callbackError) }

      // Schedule next rotation
      this.scheduleRotation()
      
      this.debug('Token rotated successfully')
      return token
    }
    catch( error: any ){
      this.debug('Refresh access token failed:', error.message)
      
      try {
        // Fallback: Get new token instead
        const newToken = await this.getToken()
        this.debug('Fallback to new token successful')
        
        // Notify callback listener about new token
        if( this.onNewToken )
          try { this.onNewToken( newToken ) }
          catch( callbackError ){ this.error('Error in onNewToken callback:', callbackError) }
        
        return newToken
      }
      catch( fallbackError: any ){
        this.error('Fallback to new token also failed:', fallbackError.message)
        throw fallbackError
      }
    }
    finally { this.isRotating = false }
  }

  /**
   * Stop auto-refresh and clean up resources
   */
  stopAutoRefresh(){
    this.debug('Stopping auto-refresh')
    
    this.clearRotation()
    this.autorefresh = false
  }

  /**
   * Start auto-refresh
   */
  startAutoRefresh(){
    this.debug('Starting auto-refresh')
    
    this.autorefresh = true
    this.scheduleRotation()
  }

  /**
   * Clean up all resources
   */
  destroy(){
    this.debug('Destroying Auth instance')
    this.stopAutoRefresh()

    this.accessToken = undefined
    this.onNewToken = undefined
  }
}