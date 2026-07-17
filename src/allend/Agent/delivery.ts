import type {
	AgentDeliveryListValidation,
	AgentDeliveryGetValidation,
	AgentDeliveryAcceptValidation,
	AgentDeliveryUpdateStatusValidation,
	AgentDeliveryReportIssueValidation
} from '@de./types'
import { qs, type Http, type Res } from '../../utils'

// ─── Agent Delivery Orders ────────────────────────────────────────────────────

export default class AgentDelivery {
	constructor( private http: Http ){}

	async list( querystring?: AgentDeliveryListValidation['querystring'] ): Promise<AgentDeliveryListValidation['response']> {
		const { error, message, data } = await this.http.request<Res<AgentDeliveryListValidation['response']>>({
			url: `/agent/delivery/orders${qs( querystring )}`,
			method: 'GET'
		})
		if( error ) throw new Error( message )
		return data
	}

	async get( reference: string ): Promise<AgentDeliveryGetValidation['response']> {
		const { error, message, data } = await this.http.request<Res<AgentDeliveryGetValidation['response']>>({
			url: `/agent/delivery/orders/${reference}`,
			method: 'GET'
		})
		if( error ) throw new Error( message )
		return data
	}

	async accept( reference: string ): Promise<AgentDeliveryAcceptValidation['response']> {
		const { error, message, data } = await this.http.request<Res<AgentDeliveryAcceptValidation['response']>>({
			url: `/agent/delivery/orders/${reference}/accept`,
			method: 'POST'
		})
		if( error ) throw new Error( message )
		return data
	}

	async updateStatus( reference: string, body: AgentDeliveryUpdateStatusValidation['body'] ): Promise<AgentDeliveryUpdateStatusValidation['response']> {
		const { error, message, data } = await this.http.request<Res<AgentDeliveryUpdateStatusValidation['response']>>({
			url: `/agent/delivery/orders/${reference}/status`,
			method: 'PATCH',
			body
		})
		if( error ) throw new Error( message )
		return data
	}

	async reportIssue( reference: string, body: AgentDeliveryReportIssueValidation['body'] ): Promise<AgentDeliveryReportIssueValidation['response']> {
		const { error, message, data } = await this.http.request<Res<AgentDeliveryReportIssueValidation['response']>>({
			url: `/agent/delivery/orders/${reference}/issue`,
			method: 'POST',
			body
		})
		if( error ) throw new Error( message )
		return data
	}
}
