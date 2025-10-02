export type HTTPRequestOptions = {
  url: string
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  headers?: { [index: string]: string }
  body?: any
}
export type HTTPResponse = {
  error: boolean
  message?: string
}

export type LngLat = [number, number]
export type Coordinates = {
  lng: number
  lat: number
}
export type PickedLocation = {
  point: {
    x: number,
    y: number
  }
  coordinates: Coordinates
}
export type RTLocation = Coordinates & {
  heading?: number
}
export type ActivePosition = {
  id: string
  position: RTLocation
  caption?: Caption
}

/**
 * Configuration options for AnimatedPolyline
 */
export type AnimatedRouteNativePathType = 'dot' | 'solid'
export type AnimatedRouteNativeMethods = 'dot:flow'
                                          | 'dot:fade'
                                          | 'dot:pulse'
                                          | 'dot:directional'
                                          | 'solid:flow'
                                          | 'solid:fade'
                                          | 'solid:pulse'
                                          | 'solid:directional'
export interface AnimatedRouteRules {
  styles?: any;
  speed?: number; // pixels per frame
  fadeLength?: number; // length of fade effect in pixels
}
export interface AnimatedRoute {
  key: number | null
  currentOffset: number
  rules: Required<AnimatedRouteRules>
  startTime?: number;
  polyline?: any
  engine: any
  path: Coordinates[]

  /**
   * Create the polyline
   */
  create( pathType?: AnimatedRouteNativePathType ): void;

  /**
   * Animation methods
   */
  apply: Record<string, () => void>;

  /**
   * Stop the current animation
   */
  stop(): void;

  /**
   * Remove the polyline from the map and stop animation
   */
  remove(): void;
}
export type AnimatedRouteOptions = AnimatedRouteNativeMethods | {
  handler?: new (engine: Engine, path: Coordinates[], rules?: AnimatedRouteRules) => AnimatedRoute
  method?: string
  rules?: AnimatedRouteRules
}

export type Journey = {
  routeId: string | number
  origin?: MapWaypoint
  destination?: MapWaypoint
  waypoints?: MapWaypoint[]
  options?: RouteOptions
}
export type ActiveDirection = {
  routeId: string | number
  profile: string
  origin?: Coordinates
  destination?: Coordinates
  waypoints: Coordinates[]
  route: any
}
export type RouteOptions = {
  id?: string | number
  mode?: 'default' | 'navigation'
  profile?: 'driving-traffic' | 'driving' | 'cycling' | 'biking' | 'walking' | 'transit'
  unit?: 'metric' | 'imperial',
  preference?: 'TRAFFIC_AWARE' | 'TRAFFIC_UNAWARE'
  pointless?: boolean
  styles?: any
  animation?: AnimatedRouteOptions
}

export type SearchPlace = {
  name: string
  location: Coordinates,
  address: string
}

export type Waypoint = {
  no: number
  type: 'pickup' | 'dropoff'
  description: string
  coordinates: Coordinates
  address?: string
  contact: {
    type: string
    reference: string
    phone?: string
    email?: string
  }
}
export type WaypointIndex = 'origin' | 'destination' | number
export type WaypointOptions = {
  no?: number
  type?: 'pickup' | 'dropoff'
  description?: string
  coordinates?: Coordinates
  address?: string
  'contact.type'?: string
  'contact.reference'?: string
  'contact.phone'?: string
  'contact.email'?: string
}

export type Package = {
  waypointNo: number
  careLevel: number
  category: string
  weight: number
  note?: string
}
export type PackageOptions = {
  waypointNo?: number
  careLevel?: number
  category?: string
  weight?: number
  note?: string
}

export type PaymentMode = 'cash' | 'card' | 'momo' | 'wigo'
export type OrderService = {
  fees: {
    total: {
      amount: number
      currency: string
    },
    tax: number
    discount: number
  }
  payment: {
    mode: PaymentMode
    paid: boolean
  }
  xpress: string
}
export type OrderServiceOptions = {
  'fees.total.amount'?: number
  'fees.total.currency'?: string
  'fees.tax'?: string
  'fees.discount'?: string
  'payment.mode'?: PaymentMode
  'payment.option'?: string
  'payment.paid'?: boolean
  xpress?: string
}
export type OrderOperator = {}
export type OrderStage = {
  current: string
  status: string
}

export type Message = {
  type: 'text' | 'location' | 'media'
  sender: string
  content: string
  timestamp: string
}
export type Caption = {
	duration?: number
	unit?: string
	label?: string
}
export type Peer = {
  utype: string
  id: string
}

export type MapOptions = {
  element: string
  version?: number
  env?: 'dev' | 'prod'
  getAccessToken?: () => string
}
export type MapLayerStyle = 'streets' | 'outdoors' | 'light' | 'dark' | 'satellite'
export type MapWaypoint = {
  index?: number
  coords: Coordinates
  caption?: Caption
}

export type Entity = {
  id: string
  status: 'ACTIVE' | 'BUSY'
  grade: '1H' | '2H' | '3H'
  currentLocation: RTLocation
  static?: boolean
  type: 'moto' | 'car' | 'bike' | 'truck' | 'plane' | 'ship' | 'restaurant' | 'hotel' | 'store' | 'office' | 'warehouse'
}
export type EntitySpecs = {
  id: string
  status: 'ACTIVE' | 'BUSY'
  grade: '1H' | '2H' | '3H'
  currentLocation: RTLocation
  static?: boolean
  type: 'moto' | 'car' | 'bike' | 'truck' | 'plane' | 'ship' | 'restaurant' | 'hotel' | 'store' | 'office' | 'warehouse'
}

export interface UserLocationOptions {
  // Base point styling options
  borderRadius?: number
  borderColor?: string
  borderOpacity?: number
  dotColor?: string
  showInnerDot?: boolean
  noRing?: boolean
  
  // User location specific options
  showDirectionArrow?: boolean
  arrowColor?: string
  arrowSize?: number
  pulseAnimation?: boolean
  accuracyCircle?: boolean
  accuracyColor?: string
  accuracyOpacity?: number
  
  // Callbacks
  onLocationUpdate?: ( location: RTLocation ) => void
  onLocationError?: ( error: GeolocationPositionError ) => void
}
export type DragPickOptions = {
  snapToRoad?: boolean
  pinPoints?: boolean
  pointOptions?: CustomPointOptions
}
export type DragPickContentType = 'duration' | 'distance' | 'preloader'
export type DragPickContent = {
  time?: number
  unit?: 'min' | 'sec' | 'hr' | 'km' | 'mi' | 'm'
  distance?: number
  preloader?: boolean
}
export type DragPickEvent = 'dragstart' | 'dragend' | 'zoom_changed' | 'idle'
export interface DragPickInterface {
  enable( origin?: Coordinates ): void
  disable(): void
  content( type: DragPickContentType, content: DragPickContent ): void
}