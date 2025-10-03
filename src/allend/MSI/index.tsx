import type { MapOptions } from '../../types'

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { View, Text, StyleSheet, AppState, AppStateStatus, Platform } from 'react-native'
import { WebView } from 'react-native-webview'
import WIO from 'webview.io'
import Handles from './Handles'
import Controls from './Controls'
import Plugins, { type Plugin } from './Plugins'

export interface MSIInterface {
  controls: Controls
  handles: Handles
  plugins: Plugins
}

function getInjectedConsole(): string {
  return `
    (function() {
      // Forward console logs to React Native
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = function(...args) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: '__console',
          level: 'log',
          message: args.map(a => String(a)).join(' ')
        }));
        originalLog.apply(console, args);
      };

      console.error = function(...args) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: '__console',
          level: 'error',
          message: args.map(a => String(a)).join(' ')
        }));
        originalError.apply(console, args);
      };

      console.warn = function(...args) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: '__console',
          level: 'warn',
          message: args.map(a => String(a)).join(' ')
        }));
        originalWarn.apply(console, args);
      };
    })();
  `;
}

const WIO_PAIR_INJECTED_JAVASCRIPT = new WIO({ type: 'WEBVIEW' }).getInjectedJavaScript()
const REGISTERED_PLUGINS: Record<string, Plugin<any>> = {}

export interface MSIProps extends MapOptions {
  onReady?: () => void
  onError?: (error: Error) => void
  onLoaded?: (msi: MSIInterface) => void
}

export interface MSIRef extends MSIInterface {
  isReady: () => boolean
  retry: () => void
}

// MSI Component
export default forwardRef<MSIRef, MSIProps>(( props, ref ) => {
  const webViewRef = useRef<WebView>(null)
  const wioRef = useRef<WIO | null>(null)
  const controlsRef = useRef<Controls | null>(null)
  const handlesRef = useRef<Handles | null>(null)
  const pluginsRef = useRef<Plugins | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const isInitializedRef = useRef(false)

  // Base URL for MSI
  const BaseURL = props.env !== 'dev'
            ? 'https://msi.dedot.io'
            : Platform.select({
                android: 'http://10.0.2.2:4800',
                ios: 'http://localhost:4800',
                default: 'http://localhost:4800'
              })

  // Expose API via ref
  useImperativeHandle( ref, () => ({
    controls: controlsRef.current!,
    handles: handlesRef.current!,
    plugins: pluginsRef.current!,
    isReady: () => isConnected && isReady,
    retry: () => {
      setHasError(false)
      setConnectionAttempts(0)
      initializeConnection()
    }
  }))

  const initializeAPI = () => {
    if( isInitializedRef.current || !wioRef.current || !isConnected || !isReady ) return

    console.debug('[MSI] Initializing API components')
    
    const
    controls = new Controls( wioRef.current, props ),
    handles = new Handles( wioRef.current, controls, props ),
    plugins = new Plugins( wioRef.current, handles, controls, props )
    
    plugins.mount( REGISTERED_PLUGINS )

    controlsRef.current = controls
    handlesRef.current = handles
    pluginsRef.current = plugins
    isInitializedRef.current = true

    console.debug('[MSI] API initialized successfully')
    props.onLoaded?.({
      controls,
      handles,
      plugins
    })
  }

  const performBinding = async () => {
    if( !wioRef.current ) return

    console.debug('[MSI] Performing bind with access token')
    
    try {
      // Use emitAsync for better error handling
      const { getAccessToken, ...config } = props
      await wioRef.current.emitAsync('bind', { 
        ...config,
        origin: 'react-native',
        accessToken: getAccessToken?.() || ''
      }, 10000) // 10 second timeout for binding

      console.debug('[MSI] Bind successful')
      setIsConnected(true)
      setHasError(false)
    }
    catch( error ) {
      console.error('[MSI] Bind failed:', error)
      const errorObj = error instanceof Error ? error : new Error(String(error))
      setHasError(true)
      props.onError?.(errorObj)
    }
  }

  const initializeConnection = () => {
    if( !wioRef.current || !webViewRef.current ) return

    console.debug('[MSI] Initiating WIO connection to', BaseURL)
    wioRef.current.initiate( webViewRef, BaseURL )
  }

  useEffect(() => {
    // Initialize WIO bridge
    console.debug('[MSI] Creating WIO instance')
    wioRef.current = new WIO({
      type: 'WEBVIEW',
      debug: props.env === 'dev',
      connectionTimeout: 15000, // 15 seconds for initial connection
      connectionPingInterval: 2000,
      maxConnectionAttempts: 5,
      autoReconnect: true,
      heartbeatInterval: 30000
    })

    // Setup event listeners
    console.debug('[MSI] Setting up WIO event listeners')
    
    wioRef.current
    // Handle successful connection
    .on('connect', async () => {
      console.debug('[MSI] WIO bridge connected')
      setConnectionAttempts(0)
      
      // Perform binding after connection
      await performBinding()
    })
    // Handle connection timeout
    .on('connect_timeout', ({ attempts }) => {
      console.error('[MSI] Connection timeout after', attempts, 'attempts')
      setConnectionAttempts(attempts)
      setHasError(true)
      props.onError?.(new Error(`Failed to connect after ${attempts} attempts`))
    })
    // Handle reconnection attempts
    .on('reconnecting', ({ attempt, delay }) => {
      console.debug(`[MSI] Reconnecting (attempt ${attempt}, delay ${delay}ms)`)
      setIsConnected(false)
      setIsReady(false)
    })
    // Handle reconnection failure
    .on('reconnection_failed', ({ attempts }) => {
      console.error('[MSI] Reconnection failed after', attempts, 'attempts')
      setHasError(true)
      props.onError?.(new Error(`Reconnection failed after ${attempts} attempts`))
    })
    // Handle disconnection
    .on('disconnect', ({ reason }) => {
      console.debug('[MSI] Disconnected:', reason)
      setIsConnected(false)
      setIsReady(false)
    })
    // Handle WebView ready event
    .on('ready', () => {
      console.debug('[MSI] WebView content ready')
      setIsReady(true)
      props.onReady?.()
    })
    // Handle errors
    .on('error', ( error: any ) => {
      console.error('[MSI] WIO error:', error)
      const errorObj = typeof error === 'object' && error.error 
        ? new Error(error.error) 
        : typeof error === 'string'
          ? new Error(error)
          : error instanceof Error 
            ? error 
            : new Error('Unknown error')
      
      // Don't set hasError for rate limiting or non-critical errors
      if( error.type !== 'RATE_LIMIT_EXCEEDED' ){
        setHasError(true)
      }
      
      props.onError?.(errorObj)
    })

    // Handle app state changes
    const subscription = AppState.addEventListener('change', ( nextAppState: AppStateStatus ) => {
      if( nextAppState === 'background' ){
        console.debug('[MSI] App backgrounded - pausing map updates')
        // Optionally emit event to WebView to pause rendering
        wioRef.current?.emit('app:background')
      }
      else if( nextAppState === 'active' ){
        console.debug('[MSI] App active - resuming map updates')
        wioRef.current?.emit('app:foreground')
        
        // Check if we need to reconnect
        if( !wioRef.current?.isConnected() ){
          console.debug('[MSI] Reconnecting after app resumed')
          initializeConnection()
        }
      }
    })

    return () => {
      console.debug('[MSI] Cleaning up')
      subscription.remove()
      wioRef.current?.disconnect()
      isInitializedRef.current = false
    }
  }, [])

  // Initialize API when both connection and ready state are achieved
  useEffect( () => initializeAPI(), [isConnected, isReady] )

  const handleMessage = ( event: any ) => {
    // Handle console logs separately
    try {
      const data = JSON.parse(event.nativeEvent.data)
      if( data.type === '__console' ){
        const prefix = '[WebView]'
        switch( data.level ){
          case 'log': console.debug( prefix, data.message ); break
          case 'error': console.error( prefix, data.message ); break
          case 'warn': console.warn( prefix, data.message ); break
        }

        return
      }
    }
    catch(e){
      // Not JSON or not console log, pass to WIO
    }
    
    wioRef.current?.handleMessage( event )
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: `${BaseURL}?token=${props.getAccessToken?.() || ''}&v=${props.version || 1}` }}
        style={styles.webview}
        injectedJavaScript={`
          ${getInjectedConsole()}
          ${WIO_PAIR_INJECTED_JAVASCRIPT}
        `}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        geolocationEnabled={true}
        allowsInlineMediaPlayback={true}
        cacheEnabled={props.env !== 'dev'}
        incognito={props.env === 'dev'}
        androidLayerType="hardware"
        allowsBackForwardNavigationGestures={false}
        bounces={false}
        scrollEnabled={props.env === 'dev'}
        mixedContentMode="always"
        originWhitelist={['*']}
        onMessage={handleMessage}
        onLoadStart={() => console.debug('[MSI] WebView loading...')}
        onLoadEnd={() => {
          console.debug('[MSI] WebView loaded, initiating connection')
          initializeConnection()
        }}
        onError={( syntheticEvent ) => {
          const { nativeEvent } = syntheticEvent
          console.error('[MSI] WebView error:', nativeEvent )

          setHasError( true )
          props.onError?.( new Error( nativeEvent.description || 'WebView error' ) )
        }}
      />
      
      {hasError && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            {/* Add error UI with retry button */}
            <Text style={styles.errorText}>
              {connectionAttempts > 0 
                ? `Connection failed after ${connectionAttempts} attempts`
                : 'An error occurred'}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0'
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    margin: 20,
    minWidth: 200
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center'
  }
})

export class MSIClass {
  private options: MapOptions
  public onReady?: () => void
  public onError?: (error: Error) => void
  public onLoaded?: (msi: MSIInterface) => void

  constructor( options: MapOptions ){
    this.options = options

    if( !this.options.getAccessToken?.() )
      throw new Error('Invalid Access Token')
  }

  plugin<T>( name: string, fn: Plugin<T> ){
    REGISTERED_PLUGINS[name] = fn
  }

  once( event: string, handler: Function ){
    if( event === 'ready' ) this.onReady = handler as any
    else if( event === 'error' ) this.onError = handler as any
    return this
  }

  on( event: string, handler: Function ){
    return this.once( event, handler )
  }

  getOptions(): MapOptions {
    return this.options
  }

  load(): Promise<MSIInterface> {
    return new Promise(( resolve, reject ) => {
      this.onLoaded = resolve
      this.onError = reject
    })
  }

  isReady(): boolean {
    return false
  }
}