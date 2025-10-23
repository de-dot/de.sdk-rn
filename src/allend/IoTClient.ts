
import { io, Socket } from 'socket.io-client'

export type IoTClientOptions = {
  channel: string
  accessToken: string
  dev?: boolean
}

export class Record {
  constructor( private socket: Socket ){}
  
  get( id: string ){
    return new Promise( ( resolve, reject ) => {
      this.socket.emit('@record:get', id, ( error: string, response: any ) => error ? reject( error ) : resolve( response ) )
    } )
  }

  delete( id: string ){
    return new Promise( ( resolve, reject ) => {
      this.socket.emit('@record:del', id, ( error: string, response: any ) => error ? reject( error ) : resolve( response ) )
    } )
  }

  fetch( params: { limit?: number, page?: number }){
    return new Promise( ( resolve, reject ) => {
      this.socket.emit('@record:fetch', params, ( error: string, response: any ) => error ? reject( error ) : resolve( response ) )
    } )
  }

  find( query: string ){
    return new Promise( ( resolve, reject ) => {
      this.socket.emit('@record:find', query, ( error: string, response: any ) => error ? reject( error ) : resolve( response ) )
    } )
  }
}

export default class IoTClient {
  private static instance: IoTClient
  private options: IoTClientOptions

  constructor( options: IoTClientOptions ){
    if( !options.accessToken )
      throw new Error('Undefined Access Token')

    this.options = options
  }

  static getInstance( options: IoTClientOptions ){
    if( !IoTClient.instance )
      IoTClient.instance = new IoTClient( options )
    
    return IoTClient.instance
  }

  connect(){
    const
    baseURL = this.options.dev ? 'http://localhost:11011' : 'https://iot.dedot.io',
    socket = io(`${baseURL}/${this.options.channel}`, { auth: { accessToken: this.options.accessToken } })

    return {
      socket,
      api: {
        records: new Record( socket )
      }
    }
  }
}