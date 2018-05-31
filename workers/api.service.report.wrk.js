'use strict'

const { WrkApi } = require('bfx-wrk-api')

class WrkReportServiceApi extends WrkApi {
  constructor (conf, ctx) {
    super(conf, ctx)

    this.loadConf('service.report', 'report')

    this.init()
    this.start()

    // console.log('---conf---', this.conf[this.group])
  }

  getApiConf () {
    return {
      path: 'service.report'
    }
  }

  getPluginCtx (type) {
    const ctx = super.getPluginCtx(type)

    switch (type) {
      case 'api_bfx':
        // ctx.foo = 'bar'
        break
    }

    return ctx
  }

  init () {
    super.init()
  }
}

module.exports = WrkReportServiceApi
