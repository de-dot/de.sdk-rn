import type { AccessOptions } from '../../types/access'
import type { HTTPRequestOptions, RTLocation, OrderService, HTTPResponse, Entity  } from '../../types'
import Access from '../Access'

type OrderServiceResponse = HTTPResponse & {
  orders: OrderService[]
}
type NearbyResponse = HTTPResponse & {
  nearby: Entity[]
}

export default class Client extends Access {
  private clientId: string

  constructor( clientId: string, access: AccessOptions ){
    if( !clientId ) 
      throw new Error('Undefined <clientId>')

    // Instanciate access
    super( access )
    // ID/reference of the client on this session
    this.clientId = clientId
  }

  async fetchActiveOrders(){
    if( !this.accessToken )
      throw new Error('Authentication required')
      
    const
    options: HTTPRequestOptions = {
      url: `/client/${this.clientId}/orders/actives`,
      method: 'GET'
    },
    { error, message, orders } = await this.request<OrderServiceResponse>( options )
    if( error ) throw new Error( message )
    
    return orders
  }

  async fetchOrderHistory(){
    if( !this.accessToken )
      throw new Error('Authentication required')
    
    const
    options: HTTPRequestOptions = {
      url: `/client/${this.clientId}/orders/history`,
      method: 'GET'
    },
    { error, message, orders } = await this.request<OrderServiceResponse>( options )
    if( error ) throw new Error( message )
    
    return orders
  }

  async nearby( location: RTLocation ){
    if( !this.accessToken )
      throw new Error('Authentication required')

    if( !location )
      throw new Error('Undefined epicenter location')

    if( !location.lng || !location.lat )
      throw new Error('Invalid location coordinates')

    const
    options: HTTPRequestOptions = {
      url: `/client/${this.clientId}/nearby`,
      method: 'POST',
      body: location
    },
    { error, message, nearby } = await this.request<NearbyResponse>( options )
    if( error ) throw new Error( message )
    
    return nearby
  }
}