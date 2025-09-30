
const { Auth } = require('../dist')

const
remoteOrigin = 'http://localhost:5000'
workspace = 'ZGV2ZWxvcGVyOkRQSS0wQTlCLUU5M0IwNEE=',
appId = 'Gl9aZqlW5vRNUJJeOmcyTBZv',
appSecret = 'g2WDocFkoAzYdxsc7VbdYV7cSbUN1mv0yIul9WoVprWWexyB'

let event

describe('[AUTH]: Configurations -- [src/Auth.ts]', () => {
  test('Should throw: No configuration error', () => {
    expect( () => new Auth() ).toThrow(/^Undefined Credentials/)
  })

  test('Should throw configuration fields missing error', () => {
    expect( () => new Auth({ workspace: 'abcd' }) )
        .toThrow(/^Undefined Remote Origin/)
  })

  test('Should throw Error <Application Not Found>', async () => {
    try {
      const credentials = {
        remoteOrigin: 'https://example.com',
        workspace: 'abcd',
        appId: '1234',
        appSecret: '83buf...bh929'
      }
      
      auth = new Auth( credentials )
      await auth.getToken()
    }
    catch( error ){ expect( error.message ).toBe('Application Not Found') }
  })

  test('Should throw Error <Invalid Request Origin>', async () => {
    try {
      const credentials = {
        remoteOrigin: 'https://example.com',
        workspace,
        appId,
        appSecret
      }
      
      auth = new Auth( credentials )
      await auth.getToken()
    }
    catch( error ){ expect( error.message ).toBe('Invalid Request Origin') }
  })
})

describe('[AUTH]: Setup -- [src/Auth.ts]', () => {
  test('Return response with <token>', async () => {
    const credentials = {
      remoteOrigin,
      workspace,
      appId,
      appSecret
    }
    
    auth = new Auth( credentials )

    const token = await auth.getToken()
    expect( token ).toMatch(/\w+/)
  })

  test('Return response with new <token> value', async () => {
    const token = await auth.refreshToken()
    expect( token ).toMatch(/\w+/)
  })
})