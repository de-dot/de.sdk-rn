import type { GPSLocation , Message, Peer, OrderStage } from '../../types'
import type { SocketAuthCredentials } from '../../types/auth'
import type { AccessOptions } from '../../types/access'
import io, { Socket } from 'socket.io-client'
import Access from '../Access'

export default class Event extends Access {
  private nsp?: Socket
  private iosHost: string

  constructor( access: AccessOptions ){
    super( access )
    
    // Socket server host
    this.iosHost = access.env == 'prod' ?
                        'https://api.dedot.io' // Production server
                        : 'http://api.dedot.io:24800' // Development & staging server
  }

  connect( clientId: string ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Connect to main clients namespace
      const auth: SocketAuthCredentials = {
        utype: 'client',
        id: clientId,
        remoteOrigin: this.remoteOrigin as string,
        accessToken: this.accessToken as string
      }
      
      this.nsp = io( this.iosHost, { auth } )
      this.nsp.on('connect', resolve )
      this.nsp.on('connect_error', reject )
    } )
  }
  disconnect(){
    this.nsp?.disconnect()
    return true
  }
  join( jrtoken: string ): Promise<boolean> {
    return new Promise( ( resolve, reject ) => {
      this.nsp?.emit('JOIN', jrtoken, ( errmess?: string ) => {
        errmess ? reject( new Error( errmess ) ) : resolve( true )
      } )
    } )
  }

  onLeft( fn: ( peer: Peer ) => void ){
    this.nsp?.on('LEFT', fn )
    return this
  }
  onConnected( fn: ( peer: Peer ) => void ){
    this.nsp?.on('CONNECTED', fn )
    return this
  }
  onDisconnected( fn: ( peer: Peer ) => void ){
    this.nsp?.on('DISCONNECTED', fn )
    return this
  }

  onRoute( fn: ( data: any ) => void ){
    this.nsp?.on('ROUTE-CHANGE', fn )
    return this
  }
  onStage( fn: ( data: OrderStage ) => void ){
    this.nsp?.on('STAGE-CHANGE', fn )
    return this
  }
  onLocation( fn: ( location: GPSLocation  ) => void ){
    this.nsp?.on('LOCATION-CHANGE', fn )
    return this
  }
  onMessage( fn: ( payload: Message ) => void ){
    this.nsp?.on('MESSAGE', fn )
    return this
  }
}