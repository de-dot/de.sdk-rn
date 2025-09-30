import MSI from './MSI'
import Utils from '../utils'

import Order from './DClient/Order'
import Event from './DClient/Event'
import Client from './DClient/Client'

const DClient = { Client, Order, Event }

export default {
  MSI,
  Utils,
  DClient
}