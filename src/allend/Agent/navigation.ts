import type {
	AgentLocationValidation,
	AgentNearbyValidation
} from '@de./types'
import { qs, type Http, type Res } from '../../utils'

// ─── Agent Navigation ─────────────────────────────────────────────────────────

export default class AgentNavigation {
	constructor( private http: Http ){}

	async location( body: AgentLocationValidation['body'] ): Promise<AgentLocationValidation['response']> {
		const { error, message, data } = await this.http.request<Res<AgentLocationValidation['response']>>({
			url: '/agent/navigation/location',
			method: 'POST',
			body
		})
		if( error ) throw new Error( message )
		return data
	}

	async nearby( body: AgentNearbyValidation['body'], querystring?: AgentNearbyValidation['querystring'] ): Promise<AgentNearbyValidation['response']> {
		const { error, message, data } = await this.http.request<Res<AgentNearbyValidation['response']>>({
			url: `/agent/navigation/nearby${qs( querystring )}`,
			method: 'POST',
			body
		})
		if( error ) throw new Error( message )
		return data
	}
}
