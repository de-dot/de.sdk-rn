import type { AccessOptions } from '../../types/access'
import type {
	AgentInfoValidation,
	AgentAvailabilityValidation,
	AgentUpdateValidation
} from '@de./types'
import AccessManager from '../Access'
import { type Res } from '../../utils'
import AgentRides from './rides'
import AgentDelivery from './delivery'
import AgentShipping from './shipping'
import AgentNavigation from './navigation'
import AgentConsolidation from './consolidation'
import AgentReallocation from './reallocation'
import AgentDispatch from './dispatch'
import AgentOrigin from './origin'
import AgentRealtime from './realtime'

export type AgentConfig = {
	context: string
	accessToken: string
	env?: 'dev' | 'prod'
	platform?: 'web' | 'mobile' | 'server' | 'proxy'
	remoteOrigin?: string
	devHostname?: string
}

// ─────────────────────────────────────────────────────────────────────────────
//
// Agent: Agent Operation Interfaces — de.arch AUX/agent routes.
// Covers profile, availability, orders (ride/delivery/shipping),
// navigation, consolidation, reallocation, dispatch, origin — plus the
// realtime socket channel (order rooms + proactive-consolidation responses).
//
// ─────────────────────────────────────────────────────────────────────────────

export default class Agent extends AccessManager {
	readonly rides:         AgentRides
	readonly delivery:      AgentDelivery
	readonly shipping:      AgentShipping
	readonly navigation:    AgentNavigation
	readonly consolidation: AgentConsolidation
	readonly reallocation:  AgentReallocation
	readonly dispatch:      AgentDispatch
	readonly origin:        AgentOrigin
	readonly realtime:      AgentRealtime

	constructor( config: AgentConfig ){
		if( !config.context )     throw new Error('Undefined context. See https://doc.dedot.io/sdk/aux')
		if( !config.accessToken ) throw new Error('Undefined accessToken. See https://doc.dedot.io/sdk/auth')

		const access: AccessOptions = {
			context:      config.context,
			accessToken:  config.accessToken,
			env:          config.env      || 'dev',
			platform:     config.platform || 'mobile',
			remoteOrigin: config.remoteOrigin,
			devHostname:  config.devHostname
		}
		super( access, 'API' )

		this.rides         = new AgentRides( this )
		this.delivery      = new AgentDelivery( this )
		this.shipping      = new AgentShipping( this )
		this.navigation    = new AgentNavigation( this )
		this.consolidation = new AgentConsolidation( this )
		this.reallocation  = new AgentReallocation( this )
		this.dispatch      = new AgentDispatch( this )
		this.origin        = new AgentOrigin( this )
		this.realtime      = new AgentRealtime( access )
	}

	// ── Agent profile ─────────────────────────────────────────────────────────

	async info(): Promise<AgentInfoValidation['response']> {
		const { error, message, data } = await this.request<Res<AgentInfoValidation['response']>>({
			url: '/agent',
			method: 'GET'
		})
		if( error ) throw new Error( message )
		return data
	}

	async update( body: AgentUpdateValidation['body'] ): Promise<AgentUpdateValidation['response']> {
		const { error, message, data } = await this.request<Res<AgentUpdateValidation['response']>>({
			url: '/agent',
			method: 'PATCH',
			body
		})
		if( error ) throw new Error( message )
		return data
	}

	async availability( status: AgentAvailabilityValidation['params']['availability'] ): Promise<AgentAvailabilityValidation['response']> {
		const { error, message, data } = await this.request<Res<AgentAvailabilityValidation['response']>>({
			url: `/agent/${status}`,
			method: 'GET'
		})
		if( error ) throw new Error( message )
		return data
	}
}
