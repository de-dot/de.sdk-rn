/**
 * de.sdk-rn
 * React Native SDK for MSI (Map Service Interface)
 */

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native'
import { WebView } from 'react-native-webview'
import WIO from 'webview.io'
import Controls from './Controls'
import Handles from './Handles'
import Plugins, { type Plugin } from './Plugins'
import type { MapOptions } from '../../types'

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
const REQUIRED_FEATURES = ['geolocation']
const REGISTERED_PLUGINS: Record<string, Plugin<any>> = {}

export interface MSIProps extends MapOptions {
  onReady?: () => void
  onError?: (error: Error) => void
  onLoaded?: (msi: MSIInterface) => void
}

export interface MSIRef extends MSIInterface {
  isReady: () => boolean
}

// MSI Component
export default forwardRef<MSIRef, MSIProps>(( props, ref ) => {
  const webViewRef = useRef<WebView>(null)
  const wioRef = useRef<WIO | null>(null)
  const controlsRef = useRef<Controls | null>(null)
  const handlesRef = useRef<Handles | null>(null)
  const pluginsRef = useRef<Plugins | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Expose API via ref
  useImperativeHandle( ref, () => ({
    controls: controlsRef.current!,
    handles: handlesRef.current!,
    plugins: pluginsRef.current!,
    isReady: () => isConnected
  }))

  useEffect(() => {
    // Initialize WIO bridge
    console.log('Initializing WIO bridge from MSI component')
    wioRef.current = new WIO({
      type: 'WEBVIEW',
      debug: props.env === 'dev'
    })

    const baseURL = props.env === 'dev' 
      ? 'http://localhost:4800' 
      : 'https://msi.dedot.io'

    wioRef.current.initiate( webViewRef, baseURL )

    // Setup event listeners
    console.log('Setup event listeners from MSI component')
    wioRef.current
    .once('connect', () => {
      console.log('WIO connected from MSI component', wioRef.current)
      const wio = wioRef.current!

      // Bind with access token and origin
      console.log('Initiate binding with access token and origin from MSI component', props)
      wio.emit('bind', {
        ...props, 
        origin: 'react-native' 
      }, ( error: string | boolean ) => {
        console.log('WIO bind from MSI component', error)
        if( error ){
          const errorObj = new Error( typeof error === 'string' ? error : 'Connection failed' )
          setHasError( true )
          props.onError?.( errorObj )
          return
        }

        setIsConnected( true )
      })
    })
    .on('error', ( error: Error | string ) => {
      console.log('WIO error from MSI component', error)
      const errorObj = typeof error === 'object' ? error : new Error( error )
      setHasError( true )
      props.onError?.( errorObj )
    })
    .on('ready', () => {
      console.log('MSI ready', wioRef.current)
      props.onReady?.()

      // Initialize API
      if( wioRef.current && isConnected && !controlsRef.current ){
        const
        controls = new Controls( wioRef.current, props ),
        handles = new Handles( wioRef.current, controls, props ),
        plugins = new Plugins( wioRef.current, handles, controls, props )
        
        plugins.mount( REGISTERED_PLUGINS )

        controlsRef.current = controls
        handlesRef.current = handles
        pluginsRef.current = plugins

        console.log('MSI loaded', controls, handles, plugins)
        props.onLoaded?.({
          controls,
          handles,
          plugins
        })
      }
    })

    // Handle app state changes
    const subscription = AppState.addEventListener('change', ( nextAppState: AppStateStatus ) => {
      if( nextAppState === 'background' ){
        // Pause updates when app goes to background
        console.log('App backgrounded - pausing map updates')
      }
      else if( nextAppState === 'active' ){
        // Resume when app comes to foreground
        console.log('App active - resuming map updates')
      }
    })

    return () => {
      subscription.remove()
      wioRef.current?.disconnect()
    }
  }, [])

  const initialize = () => {
  }

  const handleMessage = ( event: any ) => {
    wioRef.current?.handleMessage( event )
  }

  const
  baseURL = props.env === 'dev' 
    ? 'http://localhost:4800' 
    : 'https://msi.dedot.io',
  mapUrl = `${baseURL}?token=${props.accessToken}&v=${props.version || 1}`

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: mapUrl }}
        style={styles.webview}
        onMessage={handleMessage}
        injectedJavaScript={`
          ${getInjectedConsole()}
          ${WIO_PAIR_INJECTED_JAVASCRIPT}
        `}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        geolocationEnabled={true}
        allowsInlineMediaPlayback={true}
        cacheEnabled={true}
        androidLayerType="hardware"
        allowsBackForwardNavigationGestures={false}
        bounces={false}
        scrollEnabled={false}
        mixedContentMode="always"
        originWhitelist={['*']}
        onLoadStart={() => console.log('WebView loading...')}
        onLoadEnd={() => {
          console.log('WebView loaded')
          // initialize()
          setTimeout(() => wioRef.current?.emit('ping'), 3000 )
        }}
        onError={( syntheticEvent ) => {
          const { nativeEvent } = syntheticEvent
          console.error('WebView error:', nativeEvent )
          setHasError( true )
          props.onError?.( new Error( nativeEvent.description || 'WebView error' ) )
        }}
      />
      
      {hasError && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            {/* Error UI can be added here */}
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
    margin: 20
  }
})

// =====================================================
// MSI CLASS
// =====================================================

export class MSIClass {
  private options: MapOptions
  public onReady?: () => void
  public onError?: (error: Error) => void
  public onLoaded?: (msi: MSIInterface) => void

  constructor( options: MapOptions ){
    this.options = options

    if( !this.options.accessToken )
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