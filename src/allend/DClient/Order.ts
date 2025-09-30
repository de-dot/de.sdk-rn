import type { HTTPRequestOptions, HTTPResponse } from '../../types'
import type { AccessOptions } from '../../types/access'
import type { 
  Package, PackageOptions, 
  Waypoint, WaypointOptions,
  OrderService, OrderServiceOptions, OrderOperator, OrderStage
} from '../../types'
import Access from '../Access'

type IntentTokenResponse = HTTPResponse & {
  token: string
}
type JRTokenResponse = HTTPResponse & {
  jrtoken: string
}

type WaypointResponse = HTTPResponse & {
  waypoint: Waypoint
}
type WaypointsResponse = HTTPResponse & {
  waypoints: Waypoint[]
}

type PackageResponse = HTTPResponse & {
  package: Package
}
type PackagesResponse = HTTPResponse & {
  packages: Package[]
}

type OrderServiceResponse = HTTPResponse & {
  service: OrderService
}
type OrderOperators = {
  [index: string]: OrderOperator
}
type OrderOperatorsResponse = HTTPResponse & {
  operators: OrderOperators
}
type OrderStageResponse = HTTPResponse & {
  stage: OrderStage
}
type CurrentRouteResponse = HTTPResponse & {
  route: any
}

export default class Order extends Access {
  private intentToken: string // Active order's intent token

  constructor( access: AccessOptions ){
    super( access )
    
    this.intentToken = ''
  }

  /**
   * Order intent 
   */

  async intent( clientId: string ): Promise<string> {
    if( !clientId )
      throw new Error('<clientId> argument required')
    
    const
    options: HTTPRequestOptions = {
      url: '/order/intent',
      method: 'POST',
      body: { clientId }
    },
    { error, message, token } = await this.request<IntentTokenResponse>( options )
    if( error ) throw new Error( message )
    
    this.intentToken = token
    return token
  }

  async unintent( token: string ): Promise<boolean> {
    if( !token )
      throw new Error('Undefined intent token')

    const
    options: HTTPRequestOptions = {
      url: '/order/intent',
      method: 'DELETE',
      headers: { 'x-intent-token': token }
    },
    { error, message } = await this.request<HTTPResponse>( options )
    if( error ) throw new Error( message )
    
    this.intentToken = ''
    return true
  }

  /**
   * Order waypoints 
   */
  
  async addWaypoint( list: Waypoint | Waypoint[], token?: string ): Promise<Waypoint[]> {
    if( !list )
      throw new Error('Expect <list> argument to be [Waypoint or Waypoint<array>]')

    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: '/order/waypoints/add',
      method: 'PUT',
      headers: { 'x-intent-token': token },
      body: !Array.isArray( list ) ? [ list ] : list
    },
    { error, message, waypoints } = await this.request<WaypointsResponse>( options )
    if( error ) throw new Error( message )
    
    return waypoints
  }

  async getWaypoint( no: number, token?: string ): Promise<Waypoint> {
    
    if( !no ) throw new Error('Expected waypoint number')
    
    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: `/order/waypoints/${no}`,
      method: 'GET',
      headers: { 'x-intent-token': token }
    },
    { error, message, waypoint } = await this.request<WaypointResponse>( options )
    if( error ) throw new Error( message )
    
    return waypoint
  }

  async fetchWaypoints( token?: string ): Promise<Waypoint[]> {

    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: `/order/waypoints`,
      method: 'GET',
      headers: { 'x-intent-token': token }
    },
    { error, message, waypoints } = await this.request<WaypointsResponse>( options )
    if( error ) throw new Error( message )
    
    return waypoints
  }

  async updateWaypoint( no: number, updates: WaypointOptions, token?: string ): Promise<Waypoint[]> {
    
    if( !no ) throw new Error('Expected waypoint number')

    if( !updates )
      throw new Error('Expect <updates: WaypointOptions> to be object')

    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: `/order/waypoints/${no}`,
      method: 'PATCH',
      headers: { 'x-intent-token': token },
      body: updates
    },
    { error, message, waypoints } = await this.request<WaypointsResponse>( options )
    if( error ) throw new Error( message )
    
    return waypoints
  }

  async deleteWaypoint( no: number, token?: string ): Promise<Waypoint[]> {
    
    if( !no ) throw new Error('Expected waypoint number')
    
    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: `/order/waypoints/${no}`,
      method: 'DELETE',
      headers: { 'x-intent-token': token }
    },
    { error, message, waypoints } = await this.request<WaypointsResponse>( options )
    if( error ) throw new Error( message )
    
    return waypoints
  }

  /**
   * Order packages 
   */

  async addPackage( list: Package | Package[], token?: string ): Promise<Package[]> {
    if( !list )
      throw new Error('Expect <list> argument to be [Package or Package<array>]')

    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: '/order/packages/add',
      method: 'PUT',
      headers: { 'x-intent-token': token },
      body: !Array.isArray( list ) ? [ list ] : list
    },
    { error, message, packages } = await this.request<PackagesResponse>( options )
    if( error ) throw new Error( message )
    
    return packages
  }

  async getPackage( PTC: string, token?: string ): Promise<Package> {
    if( !PTC )
      throw new Error('Expected <PTC> Package Tracking Code')
    
    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: `/order/packages/${PTC}`,
      method: 'GET',
      headers: { 'x-intent-token': token }
    },
    response = await this.request<PackageResponse>( options )
    if( response.error )
      throw new Error( response.message )
    
    return response.package
  }

  async fetchPackages( token?: string ): Promise<Package[]> {
    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: `/order/packages`,
      method: 'GET',
      headers: { 'x-intent-token': token }
    },
    { error, message, packages } = await this.request<PackagesResponse>( options )
    if( error ) throw new Error( message )
    
    return packages
  }

  async updatePackage( PTC: number, updates: PackageOptions, token?: string ): Promise<Package[]> {
    if( !PTC )
      throw new Error('Expected Package Tracking Code')

    if( !updates )
      throw new Error('Expect <updates: PackageOptions> to be object')

    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: `/order/packages/${PTC}`,
      method: 'PATCH',
      headers: { 'x-intent-token': token },
      body: updates
    },
    { error, message, packages } = await this.request<PackagesResponse>( options )
    if( error ) throw new Error( message )
    
    return packages
  }

  async deletePackage( PTC: number, token?: string ): Promise<Package[]> {
    if( !PTC )
      throw new Error('Expected Package Tracking Code')
    
    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: `/order/packages/${PTC}`,
      method: 'DELETE',
      headers: { 'x-intent-token': token }
    },
    { error, message, packages } = await this.request<PackagesResponse>( options )
    if( error ) throw new Error( message )
    
    return packages
  }

  /**
   * Order service 
   */
  
  async initiate( payload: OrderService, token?: string ): Promise<string> {
    if( !payload )
      throw new Error('Expect <payload> argument to be [OrderService]')

    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: '/order/service',
      method: 'POST',
      headers: { 'x-intent-token': token },
      body: payload
    },
    { error, message, jrtoken } = await this.request<JRTokenResponse>( options )
    if( error ) throw new Error( message )
    
    return jrtoken
  }

  async getService( token?: string ): Promise<OrderService>{
    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: `/order/service`,
      method: 'GET',
      headers: { 'x-intent-token': token }
    },
    { error, message, service } = await this.request<OrderServiceResponse>( options )
    if( error ) throw new Error( message )
    
    return service
  }

  async updateService( updates: OrderServiceOptions, token?: string ): Promise<OrderService> {
    if( !updates )
      throw new Error('Expect <updates: OrderServiceOptions> to be object')

    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: `/order/service`,
      method: 'PATCH',
      headers: { 'x-intent-token': token },
      body: updates
    },
    { error, message, service } = await this.request<OrderServiceResponse>( options )
    if( error ) throw new Error( message )
    
    return service
  }

  async rateService( rating: number, token?: string ): Promise<boolean> {
    if( !rating )
      throw new Error('Expect <rating> to be number betwee 0 to 5')

    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: `/order/service/rating`,
      method: 'POST',
      headers: { 'x-intent-token': token },
      body: { rating }
    },
    { error, message } = await this.request<HTTPResponse>( options )
    if( error ) throw new Error( message )
    
    return true
  }

  /**
   * Order operators 
   */

  async getOperator( type: string, token?: string ): Promise<OrderOperator>{
    if( !['LSP', 'partner', 'warehouse', 'agent'].includes( type ) )
      throw new Error('Unknown order operator')
    
    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: `/order/operators?type=${type}`,
      method: 'GET',
      headers: { 'x-intent-token': token }
    },
    { error, message, operators } = await this.request<OrderOperatorsResponse>( options )
    if( error ) throw new Error( message )
    
    return operators[ type ]
  }

  async getOperators( token?: string ): Promise<OrderOperators>{
    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: '/order/operators',
      method: 'GET',
      headers: { 'x-intent-token': token }
    },
    { error, message, operators } = await this.request<OrderOperatorsResponse>( options )
    if( error ) throw new Error( message )
    
    return operators
  }

  /**
   * Order monitoring 
   */

  async getCurrentStage( token?: string ): Promise<OrderStage>{
    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: '/order/stage',
      method: 'GET',
      headers: { 'x-intent-token': token }
    },
    { error, message, stage } = await this.request<OrderStageResponse>( options )
    if( error ) throw new Error( message )
    
    return stage
  }

  async getCurrentRoute( token?: string ): Promise<any>{
    token = token || this.intentToken
    if( !token ) throw new Error('Expected intent order token')

    const
    options: HTTPRequestOptions = {
      url: '/order/route',
      method: 'GET',
      headers: { 'x-intent-token': token }
    },
    { error, message, route } = await this.request<CurrentRouteResponse>( options )
    if( error ) throw new Error( message )
    
    return route
  }
}