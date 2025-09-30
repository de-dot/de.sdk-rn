
export type StreamDataListener = ( data: string ) => void

export default class Stream {
  private _STALED: boolean = false
  private _CLOSED: boolean = false
  private _fns: StreamDataListener[] = []
  private _exitFn = (() => {})
  private _errorFn = (( error: Error ) => {})
  private _downStream?: Stream
  private _upStream?: Stream

  private _upstream( stream: Stream ){
    this._upStream = stream
    return this
  }
  private _backpressure( data: any ){
    !this._CLOSED && this._fns.map( fn => fn( data ) )
  }

  sync( data: any ){
    !this._CLOSED && this._downStream?._backpressure( data )
  }

  on( _event: 'data', fn: StreamDataListener ){
    if( this._CLOSED ) throw new Error('Stream closed')

    this._fns.push( fn )
    return this
  }

  pipe( stream: Stream ){
    stream._upstream( this )
    this._downStream = stream
    return this
  }

  error( error: Error | string  ){
    // Throw error to self
    this._errorFn( typeof error == 'string' ? new Error( error ) :  error )
    // Throw error to downstream pipe
    this._downStream?.error( error )
    
    return this
  }

  close(){
    if( this._CLOSED ) return
    this._CLOSED = true

    this._fns = []
    this._exitFn()

    this._downStream?.close() // Close down streams
    // this._upStream?.close() // Close up streams: Recursive loop call effect
  }

  isActive(){ return !this._CLOSED }
  
  onerror( fn: ( error: Error ) => void ){
    this._errorFn = fn
    return this
  }
  onclose( fn: () => void ){ 
    this._exitFn = fn
    return this
  }
}