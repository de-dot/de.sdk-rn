import type { AccessOptions } from '../types/access'
import type { HTTPRequestOptions } from '../types'
import { Platform } from 'react-native'

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
    this.baseURL = options?.env !== 'dev'
                        ? 'https://api.dedot.io'
                        : Platform.select({
                          android: 'http://10.0.2.2:24800',
                          ios: 'http://api.dedot.io:24800',
                          default: 'http://api.dedot.io:24800'
                        })
  }

  async request<Response>({ url, ...options }: HTTPRequestOptions ): Promise<Response> {
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

  setToken( token: string ): void { 
    this.accessToken = token 
  }
}