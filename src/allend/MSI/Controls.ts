import type {
  RTLocation,
  Coordinates,
  MapLayerStyle,
  Caption,
  MapOptions,
  SearchPlace,
  EntitySpecs,
  ActivePosition,
  UserLocationOptions,
  DragPickContentType,
  DragPickContent,
  MapWaypoint,
  Journey,
  RouteOptions,
  ActiveDirection
} from '../../types'
import WIO from 'webview.io'

const 
FUNCTION_EVENT_TIMEOUT = 12000,
FUNCTION_EVENT_TIMEOUT_MESSAGE = 'Event timeout'

export default class Controls {
  private options: MapOptions
  private chn: WIO

  constructor( chn: WIO, options: MapOptions ){
    this.chn = chn
    this.options = options
  }

  /**
   * Refresh access token to remove server
   * 
   * @param token - Latest access token
   */
  refreshToken( token: string ){
    if( !token ) return
    this.options.accessToken = token
  }

  /**
   * Update map style
   * 
   * @param style - Map style ID
   */
  setMapStyle( style: MapLayerStyle ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Set style
      this.chn.emit('set:map:style', style, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    })
  }

  /**
   * @return - User's current GPS location
   */
  getCurrentLocation(): Promise<RTLocation | null> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Get current location
      this.chn.emit('get:current:location', ( error: string | boolean, location: RTLocation ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve( location )
      } )
    } )
  }
  /**
   * Pin user's current location on the current active map
   * 
   * @return - User's current GPS location coordinates or `null` when it failed
   */
  pinCurrentLocation(): Promise<Coordinates | null> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Pin user's current location on the map
      this.chn.emit('pin:current:location', ( error: string | boolean, location: Coordinates | null ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve( location )
      } )
    } )
  }

  /**
   * Set live location tracking options
   * 
   * @param options - User location tracking options
   */
  setLiveLocationOptions( options: UserLocationOptions ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Set live location options
      this.chn.emit('set:live:options', options, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Start tracking user's live location
   */
  trackLiveLocation(): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Start live location tracking
      this.chn.emit('track:live:location', ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Stop tracking user's live location
   */
  untrackLiveLocation(): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Stop live location tracking
      this.chn.emit('untrack:live:location', ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }

  /**
   * Enable drag pick functionality
   * 
   * @param location - (Optional) Initial location for drag pick
   */
  enableDragPickLocation( location: Coordinates ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Enable drag pick
      this.chn.emit('enable:dragpick:location', location, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Disable drag pick functionality
   */
  disableDragPickLocation(): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Disable drag pick
      this.chn.emit('disable:dragpick:location', ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Set drag pick content
   * 
   * @param type - Content type for drag pick
   * @param content - Content data for drag pick
   */
  setDragPickContent( type: DragPickContentType, content: DragPickContent ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Set drag pick content
      this.chn.emit('set:dragpick:content', { type, content }, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }

  /**
   * Get a location coordinates of placed that matched this name
   * 
   * @param name - Place name to resolve
   * @return - Array list of coordinates
   */
  resolvePlace( name: string ): Promise<Coordinates | null> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Get location coordinates from place name
      this.chn.emit('resolve:place', name, ( error: string | boolean, data: any ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve( data )
      } )
    } )
  }
  /**
   * Get a location details of placed that matched this coordinates
   * 
   * @param coords - Coordinates
   * @return - Array list of geocoding data
   */
  resolveCoordinates( coords: Coordinates | string ): Promise<Coordinates | null> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Get location place from coordinates
      this.chn.emit('resolve:coordinates', coords, ( error: string | boolean, data: any ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve( data )
      } )
    } )
  }

  /**
   * Search a location or places
   * 
   * @param input - Place in string
   * @return - Autocompletion list matched places
   */
  searchQuery( input: string ): Promise<string[]> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Launch search query
      this.chn.emit('search:query', input, ( error: string | boolean, data: any ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve( data )
      } )
    } )
  }
  /**
   * Select a suggested place by the search
   * 
   * @param index - Index of place in suggested list
   * @return - More details of selected place
   */
  searchSelect( index: number ): Promise<SearchPlace | null> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Get place's details
      this.chn.emit('search:select', index, ( error: string | boolean, data: SearchPlace | null ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve( data )
      } )
    } )
  }

  /**
   * Show nearby entities around coordinates
   * 
   * @param list - Array of entity specifications
   */
  showNearby( list: EntitySpecs[] ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Show nearby entities
      this.chn.emit('show:nearby', list, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Remove all displaying nearby entities
   */
  removeNearby(): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Remove nearby entities
      this.chn.emit('remove:nearby', ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Add a new nearby entity
   * 
   * @param entity - Entity specification
   */
  addNearbyEntity( entity: EntitySpecs ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Add nearby entity
      this.chn.emit('add:nearby:entity', entity, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Update a nearby entity position
   * 
   * @param activePosition - Entity ID and new position
   */
  moveNearbyEntity( activePosition: ActivePosition ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Move nearby entity
      this.chn.emit('move:nearby:entity', activePosition, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Remove a nearby entity
   * 
   * @param id - Entity ID to remove
   */
  removeNearbyEntity( id: string ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Remove nearby entity
      this.chn.emit('remove:nearby:entity', id, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }

  /**
   * Set complete route with journey specifications
   * 
   * @param journey - Journey specifications including route ID, origin, destination, waypoints, and options
   */
  setRoute( journey: Journey ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Set route
      this.chn.emit('set:route', journey, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Set route origin
   * 
   * @param routeId - Route identifier
   * @param point - Waypoint specification for origin
   */
  setRouteOrigin( routeId: string, point: MapWaypoint ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Set route origin
      this.chn.emit('set:route:origin', { routeId, point }, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Remove route origin
   * 
   * @param routeId - Route identifier
   */
  removeRouteOrigin( routeId: string ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Remove route origin
      this.chn.emit('remove:route:origin', { routeId }, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Set route destination
   * 
   * @param routeId - Route identifier
   * @param point - Waypoint specification for destination
   */
  setRouteDestination( routeId: string, point: MapWaypoint ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Set route destination
      this.chn.emit('set:route:destination', { routeId, point }, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Remove route destination
   * 
   * @param routeId - Route identifier
   */
  removeRouteDestination( routeId: string ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Remove route destination
      this.chn.emit('remove:route:destination', { routeId }, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Add a route waypoint
   * 
   * @param routeId - Route identifier
   * @param point - Waypoint specification
   */
  addRouteWaypoint( routeId: string, point: MapWaypoint ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Add route waypoint
      this.chn.emit('add:route:waypoint', { routeId, point }, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Update a route waypoint
   * 
   * @param routeId - Route identifier
   * @param point - Waypoint specification with index
   */
  updateRouteWaypoint( routeId: string, point: MapWaypoint ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Update route waypoint
      this.chn.emit('update:route:waypoint', { routeId, point }, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Remove a route waypoint
   * 
   * @param routeId - Route identifier
   * @param index - Waypoint index to remove
   */
  removeRouteWaypoint( routeId: string, index: number ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Remove route waypoint
      this.chn.emit('remove:route:waypoint', { routeId, index }, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }

  /**
   * Set waypoint caption
   * 
   * @param routeId - Route identifier
   * @param id - Waypoint identifier (string or number)
   * @param caption - Caption information to set
   */
  setWaypointCaption( routeId: string, id: string | number, caption: Caption ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Set waypoint caption
      this.chn.emit('set:waypoint:caption', { routeId, id, caption }, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Update waypoint caption
   * 
   * @param routeId - Route identifier
   * @param id - Waypoint identifier (string or number)
   * @param caption - Caption information to update
   */
  updateWaypointCaption( routeId: string, id: string | number, caption: Caption ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Update waypoint caption
      this.chn.emit('update:waypoint:caption', { routeId, id, caption }, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Remove waypoint caption
   * 
   * @param routeId - Route identifier
   * @param id - Waypoint identifier (string or number)
   */
  removeWaypointCaption( routeId: string, id: string | number ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Remove waypoint caption
      this.chn.emit('remove:waypoint:caption', { routeId, id }, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }

  /**
   * Mount navigation route
   * 
   * @param routeId - Route identifier for navigation
   */
  mountNavigation( routeId: string | number ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Mount navigation
      this.chn.emit('mount:navigation', routeId, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Unmount navigation route
   */
  unmountNavigation(): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Unmount navigation
      this.chn.emit('unmount:navigation', ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Load navigation direction
   */
  loadNavigation(): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Load navigation
      this.chn.emit('load:navigation', ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Set initial navigation position
   * 
   * @param position - Initial GPS location for navigation
   */
  setInitialNavigationPosition( position: RTLocation ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Set initial navigation position
      this.chn.emit('initial:navigation:position', position, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Navigate to new position
   * 
   * @param position - Current GPS location for navigation update
   */
  navigate( position: RTLocation ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Navigate
      this.chn.emit('navigate:navigation:direction', position, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Upsert navigation direction data
   * 
   * @param routeId - Route identifier for navigation
   * @param direction - Direction data
   * @param position - (Optional) Current GPS position
   * @params options - Route options
   */
  casting( routeId: string | number, direction: any, position?: RTLocation, options?: RouteOptions ): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Casting navigation direction
      this.chn.emit('casting:navigation:direction', { routeId, direction, position, options }, ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
  /**
   * Dismiss navigation
   */
  dismissNavigation(): Promise<void> {
    return new Promise( ( resolve, reject ) => {
      // Set timeout
      const timeout = setTimeout( () => reject( FUNCTION_EVENT_TIMEOUT_MESSAGE ), FUNCTION_EVENT_TIMEOUT )
      // Dismiss navigation
      this.chn.emit('dismiss:navigation', ( error: string | boolean ) => {
        if( error ) return reject( error )

        clearTimeout( timeout )
        resolve()
      } )
    } )
  }
}