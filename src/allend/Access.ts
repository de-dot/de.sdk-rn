import type { AccessOptions } from '../types/access'
import type { HTTPRequestOptions } from '../types'

export default class Access {
  private version: number
  private baseURL: string
  protected accessToken?: string
  protected remoteOrigin?: string

  constructor( options: AccessOptions ){
    if( !options ) throw new Error('Undefined Access Configuration')
    if( !options.workspace ) throw new Error('Undefined Workspace Reference')
    if( !options.accessToken ) throw new Error('Undefined Access Token')
    
    this.version = options.version || 1
    this.accessToken = options.accessToken
    this.remoteOrigin = options.remoteOrigin
    this.baseURL = options.env === 'prod' 
      ? 'https://api.dedot.com' 
      : 'http://api.dedot.io:24800'
  }

  async request<Response>( options: HTTPRequestOptions ): Promise<Response> {
    const rawOptions: any = {
      method: 'GET',
      headers: {
        origin: this.remoteOrigin,
        'x-user-agent': `De.remote/${this.version}.0`
      }
    }

    if( this.accessToken )
      rawOptions.headers.authorization = `Bearer ${this.accessToken}`

    if( options.body ){
      rawOptions.headers['content-type'] = 'application/json'
      options.body = JSON.stringify( options.body )
    }

    if( typeof options.headers == 'object' )
      options.headers = {
        ...options.headers,
        ...rawOptions.headers
      }

    options = { ...rawOptions, ...options }

    if( !options.url ) throw new Error('Undefined request <url>')
    const url = `${this.baseURL}/v${this.version}/${options.url.replace(/^\//, '')}`

    // React Native has built-in fetch
    return await ( await fetch( url, options ) ).json() as Response
  }

  setToken( token: string ): void { 
    this.accessToken = token 
  }
}