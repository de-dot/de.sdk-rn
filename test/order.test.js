
const { Auth, DClient } = require('../dist')

const
clientId = '1234567890',
remoteOrigin = 'http://localhost:5000'
workspace = 'ZGV2ZWxvcGVyOkRQSS0wQTlCLUU5M0IwNEE=',
appId = 'Gl9aZqlW5vRNUJJeOmcyTBZv',
appSecret = 'g2WDocFkoAzYdxsc7VbdYV7cSbUN1mv0yIul9WoVprWWexyB'

let
order,
intentToken,
PTC // Package Tracking Code

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

describe('[DCLIENT/ORDER]: Initialize DClient -- [src/DClient/Order.ts]', () => {
  test('Should throw error: Undefined Access Configuration', () => {
    expect( () => new DClient.Order() ).toThrow(/^Undefined Access Configuration/)
  })
  
  test('Should throw error: Undefined Workspace Reference', () => {
    expect( () => new DClient.Order({}) ).toThrow(/^Undefined Workspace Reference/)
  })

  test('Return DClient Order API Interface', () => {
    const access = {
      remoteOrigin,
      workspace,
      accessToken
    }
    
    order = new DClient.Order( access )
    expect( order ).toHaveProperty('intent')
  })
})

describe('[DCLIENT/ORDER]: Initiation Cycle -- [src/DClient/Order.ts]', () => {
  test('Should throw Error <<clientId> argument required>', async () => {
    try { await order.intent() }
    catch( error ){
      expect( error.message ).toBe('<clientId> argument required')
    }
  })

  test('Create order intent successfully', async () => {
    intentToken = await order.intent( clientId )
    expect( intentToken ).toMatch(/\w+/)
  })

  test('Should throw Error <Undefined intent token>', async () => {
    try { await order.unintent() }
    catch( error ){
      expect( error.message ).toBe('Undefined intent token')
    }
  })

  test('Should throw Error <Invalid Request>', async () => {
    try { await order.unintent('abcd1234') }
    catch( error ){
      expect( error.message ).toBe('Invalid Request')
    }
  })

  test('Revoke order intent successfully', async () => {
    const done = await order.unintent( intentToken )
    expect( done ).toBeTruthy()
  })

  test('New order intent', async () => {
    intentToken = await order.intent( clientId )
    expect( intentToken ).toMatch(/\w+/)
  })
})

describe('[DCLIENT/ORDER]: Waypoints -- [src/DClient/Order.ts]', () => {

  test('Should throw Error <Expect <list> argument to be [Waypoint or Waypoint<array>]>', async () => {
    try { await order.addWaypoint() }
    catch( error ){
      expect( error.message ).toBe('Expect <list> argument to be [Waypoint or Waypoint<array>]')
    }
  })
  
  test('Should throw request body validation error', async () => {
    try {
      const waypoints = {
        "type": "pickup",
        "address": "Legon university, Accra - Ghana"
      }

      await order.addWaypoint( waypoints )
    }
    catch( error ){
      expect( error.message ).toBe('body/0 must have required property \'no\'')
    }
  })
  
  test('Add waypoints to order successfully', async () => {
    const 
    waypoints = [
      {
        "no": 1,
        "type": "pickup",
        "description": "",
        "coordinates": [1.2233, 5.4433],
        "address": "Legon university, Accra - Ghana",
        "contact": {
          "type": "restaurant",
          "reference": "{{$guid}}",
          "phone": "+2330245558888",
          "email": "info@delice.com"
        }
      },
      {
        "no": 2,
        "type": "dropoff",
        "description": "",
        "coordinates": [1.2230, 5.4405],
        "address": "Madina market, Accra - Ghana",
        "contact": {
          "type": "client",
          "reference": "{{$guid}}",
          "phone": "+2330200007777",
          "email": "aurphal2012@gmail.com"
        }
      }
    ],
    response = await order.addWaypoint( waypoints )
    
    expect( Array.isArray( response ) ).toBeTruthy()
  })

  describe('--------------- GET & FETCH', () => {
    test('Should throw Error: Expected waypoint number', async () => {
      try { await order.getWaypoint() }
      catch( error ){
        expect( error.message ).toBe('Expected waypoint number')
      }
    })

    test('Should throw Error: Waypoint Not Found', async () => {
      try { await order.getWaypoint( 3 ) }
      catch( error ){
        expect( error.message ).toBe('Waypoint Not Found')
      }
    })

    test('Retreive order waypoint details successfully', async () => {
      const
      response = await order.getWaypoint( 1 ),
      exp = expect( response )
      
      exp.toHaveProperty('no')
      exp.toHaveProperty('type')
      exp.toHaveProperty('coordinates')
      exp.toHaveProperty('address')
      exp.toHaveProperty('contact')
    })

    test('Fetch order waypoints successfully', async () => {
      const response = await order.fetchWaypoints()
      expect( Array.isArray( response ) ).toBeTruthy()
    })
  })

  describe('--------------- UPDATE', () => {
    test('Should throw Error: Waypoint Not Found', async () => {
      try {
        const 
        updates = {
          "coordinates": [1.3233, 5.4533],
          "address": "Airport Hill, 124th",
          "contact.type": "pharmacy",
          "contact.email": "quick@pharma.com"
        }
        
        await order.updateWaypoint( 3, updates )
      }
      catch( error ){
        expect( error.message ).toBe('Waypoint Not Found')
      }
    })

    test('Update order waypoint successfully', async () => {
      const
      updates = {
        "coordinates": [1.3233, 5.4533],
        "address": "Airport Hill, 124th",
        "contact.type": "pharmacy",
        "contact.email": "quick@pharma.com"
      },
      response = await order.updateWaypoint( 1, updates )
      
      expect( Array.isArray( response ) ).toBeTruthy()
    })
  })

  describe('--------------- DELETE', () => {
    test('Should throw Error: Expected waypoint number', async () => {
      try { await order.deleteWaypoint() }
      catch( error ){
        expect( error.message ).toBe('Expected waypoint number')
      }
    })

    test('Should throw Error: Waypoint Not Found', async () => {
      try { await order.deleteWaypoint( 3 ) }
      catch( error ){
        expect( error.message ).toBe('Waypoint Not Found')
      }
    })

    test('Remove order waypoint successfully', async () => {
      const response = await order.deleteWaypoint( 2 )
      expect( Array.isArray( response ) ).toBeTruthy()
    })
  })
})

describe('[DCLIENT/ORDER]: Packages -- [src/DClient/Order.ts]', () => {

  test('Should throw Error <Expect <list> argument to be [Package or Package<array>]>', async () => {
    try { await order.addPackage() }
    catch( error ){
      expect( error.message ).toBe('Expect <list> argument to be [Package or Package<array>]')
    }
  })
  
  test('Should throw request body validation error', async () => {
    try {
      const packages = {
        "careLevel": 3
      }

      await order.addPackage( packages )
    }
    catch( error ){
      expect( error.message ).toBe('body/0 must have required property \'waypointNo\'')
    }
  })
  
  test('Add packages to order successfully', async () => {
    const 
    packages = [
      {
        "waypointNo": 1,
        "careLevel": 3,
        "category": "FD",
        "weight": 0.25,
        "note": "Wrap well"
      }
    ],
    response = await order.addPackage( packages )
    
    expect( Array.isArray( response ) ).toBeTruthy()
    PTC = response[0].PTC
  })

  describe('--------------- GET & FETCH', () => {
    test('Should throw Error: Expected Package Tracking Code', async () => {
      try { await order.getPackage() }
      catch( error ){
        expect( error.message ).toBe('Expected <PTC> Package Tracking Code')
      }
    })

    test('Should throw Error: Package Not Found', async () => {
      try { await order.getPackage('FD-1234abcd') }
      catch( error ){
        expect( error.message ).toBe('Package Not Found')
      }
    })

    test('Retreive order package details successfully', async () => {
      const 
      response = await order.getPackage( PTC ),
      exp = expect( response )
      
      exp.toHaveProperty('PTC')
      exp.toHaveProperty('waypointNo')
      exp.toHaveProperty('careLevel')
      exp.toHaveProperty('category')
    })

    test('Fetch order packages successfully', async () => {
      const response = await order.fetchPackages()
      expect( Array.isArray( response ) ).toBeTruthy()
    })
  })

  describe('--------------- UPDATE', () => {
    test('Should throw Error: Package Not Found', async () => {
      try {
        const 
        updates = {
          "category": 'GR',
          "careLevel": 4
        }
        
        await order.updatePackage('GD-1234acbd', updates )
      }
      catch( error ){
        expect( error.message ).toBe('Package Not Found')
      }
    })

    test('Update order package successfully', async () => {
      const
      updates = {
        "category": 'GR',
        "careLevel": 4
      },
      response = await order.updatePackage( PTC, updates )
      
      expect( Array.isArray( response ) ).toBeTruthy()
      PTC = response[0].PTC // Update PTC
    })
  })

  describe('--------------- DELETE', () => {
    test('Should throw Error: Expected Package Tracking Code', async () => {
      try { await order.deletePackage() }
      catch( error ){
        expect( error.message ).toBe('Expected Package Tracking Code')
      }
    })

    test('Should throw Error: Package Not Found', async () => {
      try { await order.deletePackage('GD-1234acbd') }
      catch( error ){
        expect( error.message ).toBe('Package Not Found')
      }
    })

    test('Remove order package successfully', async () => {
      const response = await order.deletePackage( PTC )
      expect( Array.isArray( response ) ).toBeTruthy()
    })
  })
})

describe('[DCLIENT/ORDER]: Initiate Service -- [src/DClient/Order.ts]', () => {

  test('Should throw Error: Expect <payload> argument to be [OrderService]', async () => {
    try { await order.initiate() }
    catch( error ){
      expect( error.message ).toBe('Expect <payload> argument to be [OrderService]')
    }
  })
  
  test('Should throw request body validation error', async () => {
    try {
      const service = {
        "xpress": "standard"
      }

      await order.initiate( service )
    }
    catch( error ){
      expect( error.message ).toBe('body must have required property \'fees\'')
    }
  })
  
  test('Initiate order service successfully', async () => {
    const 
    service = {
      "fees": {
        "total": {
          "amount": 12,
          "currency": "GHS"
        },
        "tax": 0.015,
        "discount": 0.2
      },
      "payment": {
        "mode": "cash",
        "paid": false
      },
      "xpress": "standard"
    },
    response = await order.initiate( service )

    expect( response ).toMatch(/\w+/)
  })

  describe('--------------- GET', () => {
    test('Should throw Error: Invalid Request', async () => {
      try { await order.getService('1234abcd') }
      catch( error ){
        expect( error.message ).toBe('Invalid Request')
      }
    })

    test('Retreive order service details successfully', async () => {
      const
      response = await order.getService(),
      exp = expect( response )
      
      exp.toHaveProperty('fees')
      exp.toHaveProperty('payment')
    })
  })

  describe('--------------- UPDATE', () => {
    test('Should throw body validation schema error', async () => {
      try {
        const updates = {
          "fees.total.amount": 'AB',
          "payment.method": 123,
        }
        
        await order.updateService( updates )
      }
      catch( error ){
        expect( error.message ).toBe('body/fees.total.amount must be number')
      }
    })

    test('Update order service successfully', async () => {
      const
      updates = {
        "fees.total.amount": 30,
        "payment.method": "MOMO",
        "payment.paid": true,
        "xpress": "vip"
      },
      response = await order.updateService( updates ),
      exp = expect( response )
      
      exp.toHaveProperty('fees')
      exp.toHaveProperty('payment')
      exp.toHaveProperty('xpress')
    })
  })

  describe('--------------- RATING', () => {
    test('Should throw error: Expect <rating> to be number betwee 0 to 5', async () => {
      try { await order.rateService() }
      catch( error ){
        expect( error.message ).toBe('Expect <rating> to be number betwee 0 to 5')
      }
    })

    test('Should throw error: No agent assigned to the order', async () => {
      try { await order.rateService( 4.5 ) }
      catch( error ){
        expect( error.message ).toBe('No agent assigned to the order')
      }
    })

    // TODO: Order must be assigned to an agent for this test to succeeed
    // test('Rate order service successfully', async () => {
    //   const response = await order.rateService( 4.5 )
    //   expect( response ).toBeTruthy()
    // })
  })
})

describe('[DCLIENT/ORDER]: Operators -- [src/DClient/Order.ts]', () => {
  test('Should throw Error: Unknown order operator', async () => {
    try { await order.getOperator('any') }
    catch( error ){
      expect( error.message ).toBe('Unknown order operator')
    }
  })

  test('Get LSP operator on the order', async () => {
    const
    response = await order.getOperator('LSP'),
    exp = expect( response )
    
    exp.toHaveProperty('icode')
    exp.toHaveProperty('name')
    exp.toHaveProperty('emails')
  })

  test('Get all operators on the order', async () => {
    const
    response = await order.getOperators(),
    exp = expect( response )

    console.log( response )
    
    exp.toHaveProperty('LSP')
  })
})

describe('[DCLIENT/ORDER]: Monitoring -- [src/DClient/Order.ts]', () => {
  test('Get order\'s current stage', async () => {
    const
    response = await order.getCurrentStage(),
    exp = expect( response )
    
    exp.toHaveProperty('current')
    exp.toHaveProperty('status')
  })

  test('Get order\'s current route', async () => {
    const
    response = await order.getCurrentRoute(),
    exp = expect( response )
    
    exp.toHaveProperty('itineary')
    exp.toHaveProperty('waypoints')
  })
})