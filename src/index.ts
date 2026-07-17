import Utils from './utils'
import MSI, { type MSIInterface, type MSIProps, type MSIRef } from './allend/MSI'
import IoTClient, { type IoTClientOptions } from './allend/IoTClient'
import Agent, { type AgentConfig } from './allend/Agent'
import { type AgentRealtimeContext } from './allend/Agent/realtime'
import Order from './allend/DClient/Order'
import Event from './allend/DClient/Event'
import Client from './allend/DClient/Client'
import Auth from './backend/Auth'

const DClient = { Client, Order, Event }

export {
  Auth,
  MSI,
  type MSIInterface,
  type MSIProps,
  type MSIRef,
  Agent,
  type AgentConfig,
  type AgentRealtimeContext,
  Utils,
  DClient,
  IoTClient,
  type IoTClientOptions
}

// Shared contract types — same source of truth as de.arch and @de./sdk
export type { RallyEvent, RallyEventType, OrderTrackingEvent } from '@de./types'
