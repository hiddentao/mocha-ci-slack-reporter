require('co-mocha')

import path from 'path'
import Mocha from 'mocha'
import Code from 'code'
import mockery from 'mockery'

const { Suite, Runner } = Mocha

const PORT = 18765

export const create = (_module, options = {}) => {
  const testMethods = {}

  const testStructure = {
    beforeEach: function *() {
      this.slackUrl = 'http://localhost:' + PORT
      this.requests = []

      this.expect = Code.expect.bind(Code)

      mockery.enable({ warnOnUnregistered: false })
      mockery.registerMock('sync-request', (method, url, body) => {
        this.requests.push({ method, url, body })
      })

      this.createMocha = (options) => {
        options = Object.assign({
          execute: false,
          reporterOptions: {
            url: this.slackUrl,
            username: 'test-reporter',
            channel: '#test-channel',
            logsUrl: 'https://hiddentao.com'
          }
        }, options)

        const mocha = new Mocha({
          reporter: require('../')
        })
        const suite = new Suite('#internal-mocha-ci-slack-reporter', 'root')
        const runner = new Runner(suite)

        return {
          reporter: new mocha._reporter(runner, options),
          runner,
          suite,
          mocha,
          Test: Mocha.Test
        }
      }

      this.executeTests = (runner) => new Promise((resolve) => runner.run(resolve))
    },

    afterEach: function *() {
      mockery.deregisterMock('sync-request')
      mockery.disable()
    },

    tests: testMethods
  }

  _module.exports[path.basename(_module.filename)] = testStructure

  return testMethods
}
