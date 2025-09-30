
const { Auth, DClient } = require('../dist')

const
clientId = '1234567890',
remoteOrigin = 'http://localhost:5000'
workspace = 'ZGV2ZWxvcGVyOkRQSS0wQTlCLUU5M0IwNEE=',
appId = 'Gl9aZqlW5vRNUJJeOmcyTBZv',
appSecret = 'g2WDocFkoAzYdxsc7VbdYV7cSbUN1mv0yIul9WoVprWWexyB'

let 
event,
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

describe('[DCLIENT/ORDER]: Initialize DClient -- [src/DClient/Event.ts]', () => {
  test('Should throw error: Undefined Access Configuration', () => {
    expect( () => new DClient.Event() ).toThrow(/^Undefined Access Configuration/)
  })
  
  test('Should throw error: Undefined Workspace Reference', () => {
    expect( () => new DClient.Event({}) ).toThrow(/^Undefined Workspace Reference/)
  })

  test('Should throw error: Invalid Access Token', async () => {
    const access = {
      remoteOrigin,
      workspace,
      accessToken: 'zyxw4321'
    }
    
    event = new DClient.Event( access )
    expect( event ).toHaveProperty('connect')

    try { await event.connect( clientId ) }
    catch( error ){ expect( error.message ).toBe('Invalid Access Token') }
  })

  test('Return DClient Event API Interface', () => {
    const access = {
      remoteOrigin,
      workspace,
      accessToken
    }
    
    event = new DClient.Event( access )
    expect( event ).toHaveProperty('connect')
  })
})

describe('[DCLIENT/EVENT]: Initialize DClient Event -- [src/DClient/Event.ts]', () => {
  test('Connect to Event socket server successfully', async () => {
    try { await event.connect( clientId ) }
    catch( error ){
      expect( error.message ).toBe('<clientId> argument required')
    }
  })
  
  test('Should throw error: Invalid Join Request Token', async () => {
    try { await event.join('1234abcd') }
    catch( error ){ expect( error.message ).toBe('Invalid Join Request Token') }
  })

  test('Join a socket connection successfully', async () => {
    const jrtoken = 'rpTYDEds5EhMz1gNv4ibXLh9JVSAR9ezydiLyVYYiHeWTdn6vqmzVaNqMEj4YmKmjcF5BUL5aztS1yneFG47nFoE9itmdbeXDLd4UDqRAFXkdqpZ49zUhik66izpoxFYDjngM1Tq82esqt85tovwRDR34QQ6v87hQmzQrtzKGTUTcTZ1G13rJ5gRiKoRtiVBf5iDTprUwaXF78vkacZ8W4mMuQzL22$3oJLhGZhQLbHxhHZ9xtoPCJ2GufVmj2sDm1d'
    expect( event.join( jrtoken ) ).resolves.toBeTruthy()
  })

  test('Disconnect from Event socket server successfully', async () => {
    expect( event.disconnect() ).toBeTruthy()
  })
})
