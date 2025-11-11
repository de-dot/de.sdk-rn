import type { HTTPRequestOptions, HTTPResponse } from '../../types'
import type { AccessOptions } from '../../types/access'
import AccessManager from '../Access'

type SigninBody = {
  type?: 'CUSTOMER' | 'VENDOR' | 'ADMIN',
  phone: string,
  device?: string, // JSON string
  country?: string // ISO 3166-1 alpha-2
}
type SigninResponse = HTTPResponse & {
  token: string
}

export default class DAuth extends AccessManager {
  constructor( access: AccessOptions ){
    super( access, 'ASI' )
  }

  /**
   * Signin
   */
  async signin( body: SigninBody ): Promise<SigninResponse> {
    if( !body.phone )
      throw new Error('<phone> argument required')
    
    const
    options: HTTPRequestOptions = {
      url: '/auth/signin',
      method: 'POST',
      body
    },
    response = await this.request<SigninResponse>( options )
    if( response.error ) throw new Error( response.message )
    
    return response
  }

}