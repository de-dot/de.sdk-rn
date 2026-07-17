import type {
	AgentDispatchRespondValidation,
	AgentDispatchRateValidation
} from '@de./types'
import { type Http, type Res } from '../../utils'

// ─── Agent Dispatch ───────────────────────────────────────────────────────────

export default class AgentDispatch {
	constructor( private http: Http ){}

	async respond( body: AgentDispatchRespondValidation['body'] ): Promise<AgentDispatchRespondValidation['response']> {
		const { error, message, data } = await this.http.request<Res<AgentDispatchRespondValidation['response']>>({
			url: '/agent/dispatch/respond',
			method: 'POST',
			body
		})
		if( error ) throw new Error( message )
		return data
	}

	async rate( body: AgentDispatchRateValidation['body'] ): Promise<AgentDispatchRateValidation['response']> {
		const { error, message, data } = await this.http.request<Res<AgentDispatchRateValidation['response']>>({
			url: '/agent/dispatch/rate',
			method: 'POST',
			body
		})
		if( error ) throw new Error( message )
		return data
	}
}
