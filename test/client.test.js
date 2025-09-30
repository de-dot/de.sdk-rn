
const { Auth, DClient } = require('../dist')

const
remoteOrigin = 'http://localhost:5000'
workspace = 'ZGV2ZWxvcGVyOkRQSS0wQTlCLUU5M0IwNEE=',
appId = 'Gl9aZqlW5vRNUJJeOmcyTBZv',
appSecret = 'g2WDocFkoAzYdxsc7VbdYV7cSbUN1mv0yIul9WoVprWWexyB'

let
client,
accessToken

describe('[AUTH]: Setup -- [src/Auth.ts]', () => {
  test('Return response with <token>', async () => {
    const credentials = {
      remoteOrigin,
      workspace,
      appId,
      appSecret
    }
    
    const auth = new Auth( credentials )

    accessToken = await auth.getToken()
    expect( accessToken ).toMatch(/\w+/)
  })
})

describe('[DCLIENT/CLIENT]: Initialize -- [src/DClient/Client.ts]', () => {
  test('Should throw: Undefined <clientId>', () => {
    expect( () => new DClient.Client() ).toThrow(/^Undefined <clientId>/)
  })

  test('Should throw error: Undefined Access Configuration', () => {
    expect( () => new DClient.Client('1234') ).toThrow(/^Undefined Access Configuration/)
  })
  
  test('Should throw error: Undefined Workspace Reference', () => {
    expect( () => new DClient.Client('1234', {}) ).toThrow(/^Undefined Workspace Reference/)
  })
  
  test('Return DClient Client API Interface', () => {
    const access = {
      remoteOrigin,
      workspace,
      accessToken
    }
    
    client = new DClient.Client( '1234', access )
    expect( client ).toHaveProperty('fetchActiveOrders')
  })
})

describe('[DCLIENT/CLIENT]: Orders -- [src/DClient/Client.ts]', () => {
  test('Return list of active orders', async () => {
    const results = await client.fetchActiveOrders()
    expect( Array.isArray( results ) ).toBeTruthy()
  })

  test('Return client order history', async () => {
    const results = await client.fetchOrderHistory()
    expect( Array.isArray( results ) ).toBeTruthy()
  })
})

describe('[DCLIENT/CLIENT]: Nearby -- [src/DClient/Client.ts]', () => {
  test('Should throw Error <Undefined epicenter location>', async () => {
    expect.assertions(1)
    
    expect( async () => await client.nearby() )
        .rejects.toThrow('Undefined epicenter location')
  })

  test('Should throw Error <Invalid location coordinates>', async () => {
    try {
      const location = { lng: 4.4409 }
      await client.nearby( location )
    }
    catch( error ){
      expect( error.message ).toBe('Invalid location coordinates')
    }
  })

  test('Return nearby list if found any', async () => {
    const
    location = { lng: 4.4409, lat: 2.23001, heading: 20 },
    results = await client.nearby( location )

    console.log('Nearby:', results )

    expect( Array.isArray( results ) ).toBeTruthy()
  })
})