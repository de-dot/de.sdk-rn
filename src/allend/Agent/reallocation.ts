import type { AgentReallocationRespondValidation } from '@de./types'
import { type Http, type Res } from '../../utils'

// ─── Agent Reallocation ───────────────────────────────────────────────────────

export default class AgentReallocation {
	constructor( private http: Http ){}

	async respond( body: AgentReallocationRespondValidation['body'] ): Promise<AgentReallocationRespondValidation['response']> {
		const { error, message, data } = await this.http.request<Res<AgentReallocationRespondValidation['response']>>({
			url: '/agent/reallocation/respond',
			method: 'POST',
			body
		})
		if( error ) throw new Error( message )
		return data
	}
}
