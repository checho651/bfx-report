'use strict'

const path = require('path')
const { assert } = require('chai')
const request = require('supertest')

const {
  startEnviroment,
  stopEnviroment
} = require('./helpers/helpers.boot')
const { rmDB } = require('./helpers/helpers.core')
const { createMockRESTv2SrvWithAllData } = require('./helpers/helpers.mock-rest-v2')

const { app } = require('../app')
const agent = request.agent(app)

let auth = {
  apiKey: 'fake',
  apiSecret: 'fake'
}
let mockRESTv2Srv = null

const basePath = '/api'
const dbDirPath = path.join(__dirname, '..', 'db')

describe('API', () => {
  before(async function () {
    this.timeout(20000)

    mockRESTv2Srv = createMockRESTv2SrvWithAllData()

    await rmDB(dbDirPath)
    await startEnviroment(false, true)
  })

  after(async function () {
    this.timeout(5000)

    try {
      await mockRESTv2Srv.close()
    } catch (err) { }

    await stopEnviroment()
    await rmDB(dbDirPath)
  })

  it('it should be successfully performed by the isSyncModeConfig method', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/get-data`)
      .type('json')
      .send({
        method: 'isSyncModeConfig',
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.propertyVal(res.body, 'id', 5)
    assert.isNotOk(res.body.result)
  })

  it('it should be successfully auth', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/check-auth`)
      .type('json')
      .send({
        auth,
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.propertyVal(res.body, 'result', true)
    assert.propertyVal(res.body, 'id', 5)
  })

  it('it should be successfully auth, with auth token', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/check-auth`)
      .type('json')
      .send({
        auth: {
          authToken: 'fake'
        },
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.propertyVal(res.body, 'result', true)
    assert.propertyVal(res.body, 'id', 5)
  })

  it('it should not be successfully auth', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/check-auth`)
      .type('json')
      .send({
        auth: {
          apiKey: '',
          apiSecret: ''
        }
      })
      .expect('Content-Type', /json/)
      .expect(401)

    assert.isObject(res.body)
    assert.isObject(res.body.error)
    assert.propertyVal(res.body.error, 'code', 401)
    assert.propertyVal(res.body.error, 'message', 'Unauthorized')
    assert.propertyVal(res.body, 'id', null)
  })

  it('it should be successfully check, csv is stored locally', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/check-stored-locally`)
      .type('json')
      .send({
        auth,
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.isString(res.body.result)
    assert.propertyVal(res.body, 'id', 5)
  })

  it('it should be successfully performed by the getEmail method', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/get-data`)
      .type('json')
      .send({
        auth,
        method: 'getEmail',
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.propertyVal(res.body, 'id', 5)
    assert.isOk(res.body.result === 'fake@email.fake')
  })

  it('it should be successfully performed by the getSymbols method', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/get-data`)
      .type('json')
      .send({
        auth,
        method: 'getSymbols',
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.propertyVal(res.body, 'id', 5)
    assert.isObject(res.body.result)
    assert.isArray(res.body.result.pairs)
    assert.isArray(res.body.result.currencies)
    assert.lengthOf(res.body.result.pairs, 11)

    res.body.result.pairs.forEach(item => {
      assert.isString(item)
    })
    res.body.result.currencies.forEach(item => {
      assert.isObject(item)
      assert.isString(item.id)
      assert.isString(item.name)
    })
  })

  it('it should be successfully performed by the getFundingOfferHistory method', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/get-data`)
      .type('json')
      .send({
        auth,
        method: 'getFundingOfferHistory',
        params: {
          symbol: 'fUSD',
          start: 0,
          end: (new Date()).getTime,
          limit: 1
        },
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.propertyVal(res.body, 'id', 5)
    assert.isArray(res.body.result)

    if (res.body.result.length > 0) {
      let resItem = res.body.result[0]

      assert.isObject(resItem)
      assert.containsAllKeys(resItem, [
        'id',
        'symbol',
        'mtsCreate',
        'mtsUpdate',
        'amount',
        'amountOrig',
        'type',
        'flags',
        'status',
        'rate',
        'period',
        'notify',
        'hidden',
        'renew',
        'rateReal',
        'amountExecuted'
      ])
    }
  })

  it('it should be successfully performed by the getFundingLoanHistory method', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/get-data`)
      .type('json')
      .send({
        auth,
        method: 'getFundingLoanHistory',
        params: {
          symbol: 'fUSD',
          start: 0,
          end: (new Date()).getTime,
          limit: 1
        },
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.propertyVal(res.body, 'id', 5)
    assert.isArray(res.body.result)

    if (res.body.result.length > 0) {
      let resItem = res.body.result[0]

      assert.isObject(resItem)
      assert.containsAllKeys(resItem, [
        'id',
        'symbol',
        'side',
        'mtsCreate',
        'mtsUpdate',
        'amount',
        'flags',
        'status',
        'rate',
        'period',
        'mtsOpening',
        'mtsLastPayout',
        'notify',
        'hidden',
        'renew',
        'rateReal',
        'noClose'
      ])
    }
  })

  it('it should be successfully performed by the getFundingCreditHistory method', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/get-data`)
      .type('json')
      .send({
        auth,
        method: 'getFundingCreditHistory',
        params: {
          symbol: 'fUSD',
          start: 0,
          end: (new Date()).getTime,
          limit: 1
        },
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.propertyVal(res.body, 'id', 5)
    assert.isArray(res.body.result)

    if (res.body.result.length > 0) {
      let resItem = res.body.result[0]

      assert.isObject(resItem)
      assert.containsAllKeys(resItem, [
        'id',
        'symbol',
        'side',
        'mtsCreate',
        'mtsUpdate',
        'amount',
        'flags',
        'status',
        'rate',
        'period',
        'mtsOpening',
        'mtsLastPayout',
        'notify',
        'hidden',
        'renew',
        'rateReal',
        'noClose',
        'positionPair'
      ])
    }
  })

  it('it should be successfully performed by the getLedgers method', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/get-data`)
      .type('json')
      .send({
        auth,
        method: 'getLedgers',
        params: {
          symbol: 'BTC',
          start: 0,
          end: (new Date()).getTime,
          limit: 1
        },
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.propertyVal(res.body, 'id', 5)
    assert.isArray(res.body.result)

    if (res.body.result.length > 0) {
      let resItem = res.body.result[0]

      assert.isObject(resItem)
      assert.containsAllKeys(resItem, [
        'id',
        'currency',
        'mts',
        'amount',
        'balance',
        'description',
        'wallet'
      ])
    }
  })

  it('it should be successfully performed by the getLedgers method, without params', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/get-data`)
      .type('json')
      .send({
        auth,
        method: 'getLedgers',
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.propertyVal(res.body, 'id', 5)
    assert.isArray(res.body.result)

    if (res.body.result.length > 0) {
      let resItem = res.body.result[0]

      assert.isObject(resItem)
      assert.containsAllKeys(resItem, [
        'id',
        'currency',
        'mts',
        'amount',
        'balance',
        'description',
        'wallet'
      ])
    }
  })

  it('it should be successfully performed by the getTrades method', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/get-data`)
      .type('json')
      .send({
        auth,
        method: 'getTrades',
        params: {
          symbol: 'tBTCUSD',
          start: 0,
          end: (new Date()).getTime,
          limit: 1
        },
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.propertyVal(res.body, 'id', 5)
    assert.isArray(res.body.result)

    if (res.body.result.length > 0) {
      let resItem = res.body.result[0]

      assert.isObject(resItem)
      assert.containsAllKeys(resItem, [
        'id',
        'symbol',
        'mtsCreate',
        'orderID',
        'execAmount',
        'execPrice',
        'orderType',
        'orderPrice',
        'maker',
        'fee',
        'feeCurrency'
      ])
    }
  })

  it('it should be successfully performed by the getOrders method', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/get-data`)
      .type('json')
      .send({
        auth,
        method: 'getOrders',
        params: {
          symbol: 'tBTCUSD',
          start: 0,
          end: (new Date()).getTime,
          limit: 1
        },
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.propertyVal(res.body, 'id', 5)
    assert.isArray(res.body.result)

    if (res.body.result.length > 0) {
      let resItem = res.body.result[0]

      assert.isObject(resItem)
      assert.containsAllKeys(resItem, [
        'id',
        'gid',
        'cid',
        'symbol',
        'mtsCreate',
        'mtsUpdate',
        'amount',
        'amountOrig',
        'type',
        'typePrev',
        'flags',
        'status',
        'price',
        'priceAvg',
        'priceTrailing',
        'priceAuxLimit',
        'notify',
        'placedId',
        'amountExecuted'
      ])
    }
  })

  it('it should be successfully performed by the getMovements method', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/get-data`)
      .type('json')
      .send({
        auth,
        method: 'getMovements',
        params: {
          symbol: 'BTC',
          start: 0,
          end: (new Date()).getTime,
          limit: 1
        },
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.propertyVal(res.body, 'id', 5)
    assert.isArray(res.body.result)

    if (res.body.result.length > 0) {
      let resItem = res.body.result[0]

      assert.isObject(resItem)
      assert.containsAllKeys(resItem, [
        'id',
        'currency',
        'currencyName',
        'mtsStarted',
        'mtsUpdated',
        'status',
        'amount',
        'fees',
        'destinationAddress',
        'transactionId'
      ])
    }
  })

  it('it should be successfully performed by the getMovements method, without params', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/get-data`)
      .type('json')
      .send({
        auth,
        method: 'getMovements',
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(200)

    assert.isObject(res.body)
    assert.propertyVal(res.body, 'id', 5)
    assert.isArray(res.body.result)

    if (res.body.result.length > 0) {
      let resItem = res.body.result[0]

      assert.isObject(resItem)
      assert.containsAllKeys(resItem, [
        'id',
        'currency',
        'currencyName',
        'mtsStarted',
        'mtsUpdated',
        'status',
        'amount',
        'fees',
        'destinationAddress',
        'transactionId'
      ])
    }
  })

  it('it should not be successfully performed by the getMovements method', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/get-data`)
      .type('json')
      .send({
        auth,
        method: 'getMovements',
        params: 'isNotObject',
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(500)

    assert.isObject(res.body)
    assert.isObject(res.body.error)
    assert.propertyVal(res.body.error, 'code', 500)
    assert.propertyVal(res.body.error, 'message', 'Internal Server Error')
    assert.propertyVal(res.body, 'id', 5)
  })

  it('it should not be successfully performed by a fake method', async function () {
    this.timeout(5000)

    const res = await agent
      .post(`${basePath}/get-data`)
      .type('json')
      .send({
        auth,
        method: 'fake',
        id: 5
      })
      .expect('Content-Type', /json/)
      .expect(500)

    assert.isObject(res.body)
    assert.isObject(res.body.error)
    assert.propertyVal(res.body.error, 'code', 500)
    assert.propertyVal(res.body.error, 'message', 'Internal Server Error')
    assert.propertyVal(res.body, 'id', 5)
  })
})