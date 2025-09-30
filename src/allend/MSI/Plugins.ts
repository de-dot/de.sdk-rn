import type { MapOptions } from '../../types'

import WIO from 'webview.io'
import Handles from './Handles'
import Controls from './Controls'
import Utils from '../../utils'

export type PluginHook = {
  handles: Handles,
  controls: Controls,
  map: MapOptions,
  utils: typeof Utils
}
export type Plugin<PluginAPI, PluginOptions = {}> = ( hooks: PluginHook, options?: PluginOptions ) => PluginAPI

export default class Plugins {
  private chn: WIO
  private handles: Handles
  private controls: Controls
  private options: MapOptions
  private ACTIVE_PLUGINS: Record<string, Plugin<any>>  = {}

  constructor( chn: WIO, handles: Handles, controls: Controls, options: MapOptions ){
    this.chn = chn
    this.options = options
    this.handles = handles
    this.controls = controls
  }

  mount( list: Record<string, Plugin<any>> ){
    Object.entries( list ).forEach( ([name, plugin]) => {
      // TODO: Allow api level permission settings

      // TODO: Put validation checks in place

      this.ACTIVE_PLUGINS[ name ] = plugin
    } )
  }

  use<API, Options>( name: string, options?: Record<string, Options> ){
    if( !(name in this.ACTIVE_PLUGINS) )
      throw new Error(`Undefined <${name}> plugin`)

    const plugin: Plugin<API> = this.ACTIVE_PLUGINS[ name ]
    return plugin({
      handles: this.handles,
      controls: this.controls,
      map: this.options,
      utils: Utils
    }, options )
  }
}