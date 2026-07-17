
import type { HTTPRequestOptions } from '../types'

import Stream from './stream'

// ─── Requests types ───────────────────────────────────────────────────────────

export type Http = { request<T>( opts: HTTPRequestOptions ): Promise<T> }
export type Res<T = any> = { error: boolean, status?: string, message?: string, data: T }

export const qs = ( params?: Record<string, any> ): string => {
  if( !params ) return ''
  const q = new URLSearchParams(
    Object.fromEntries(
      Object.entries( params )
            .filter( ( [, v] ) => v != null )
            .map( ( [k, v] ) => [k, String( v )] )
    )
  ).toString()
  return q ? `?${q}` : ''
}

export default { Stream }
