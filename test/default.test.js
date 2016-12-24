const test = require('./_base').create(module)

test.twoPass = function *() {
  const { runner, suite, Test } = this.createMocha()

  suite.addTest(new Test('yeee1', function (done) {
    done()
  }))

  suite.addTest(new Test('yeee2', function (done) {
    done()
  }))

  const failures = yield this.executeTests(runner)

  this.expect(failures).to.equal(0)

  this.expect(this.requests).to.equal(
    [
      {
        'method': 'POST',
        'url': 'http://localhost:18765',
        'body': {
          'json': {
            'username': 'test-reporter',
            'channel': '#test-channel',
            'text': 'PASSED: undefined (<https://hiddentao.com|View logs>)',
            'icon_emoji': ':ok_hand:'
          }
        }
      }
    ]
  )
}

test.onePassTwoFail = function *() {
  const { runner, suite, Test } = this.createMocha()

  suite.addTest(new Test('nooo1', function (done) {
    done(new Error('failed 123!'))
  }))

  suite.addTest(new Test('yeee1', function (done) {
    done()
  }))

  suite.addTest(new Test('nooo2', function (done) {
    done(new Error('failed 456!'))
  }))

  const failures = yield this.executeTests(runner)

  this.expect(failures).to.equal(2)

  this.expect(this.requests).to.equal(
    [
      {
        'method': 'POST',
        'url': 'http://localhost:18765',
        'body': {
          'json': {
            'attachments': [
              {
                'attachment_type': '',
                'fallback': 'Failed: #internal-mocha-ci-slack-reporter > nooo1\nError: failed 123!',
                'fields': [
                  {
                    'short': false,
                    'title': 'Error: failed 123!'
                  }
                ],
                'text': 'Failed: #internal-mocha-ci-slack-reporter > nooo1'
              },
              {
                'attachment_type': '',
                'fallback': 'Failed: #internal-mocha-ci-slack-reporter > nooo2\nError: failed 456!',
                'fields': [
                  {
                    'short': false,
                    'title': 'Error: failed 456!'
                  }
                ],
                'text': 'Failed: #internal-mocha-ci-slack-reporter > nooo2'
              }
            ],
            'username': 'test-reporter',
            'channel': '#test-channel',
            'text': 'FAILED: undefined (<https://hiddentao.com|View logs>)',
            'icon_emoji': ':boom:'
          }
        }
      }
    ]
  )
}

test.customOptions = {
  beforeEach: function* () {
    this.mocha = this.createMocha({
      reporterOptions: {
        testTitle: 'FLAG!!',
        url: 'http://blabla.com',
        username: 'reporter0',
        channel: '#channel5',
        logsUrl: 'https://logs.com',
        failEmoji: ':mega1:',
        passEmoji: ':mega2:'
      }
    })
  },

  pass: function *() {
    const { runner, suite, Test } = this.mocha

    suite.addTest(new Test('yeee1', function (done) {
      done()
    }))

    const failures = yield this.executeTests(runner)

    this.expect(failures).to.equal(0)

    this.expect(this.requests).to.equal(
      [
        {
          'method': 'POST',
          'url': 'http://blabla.com',
          'body': {
            'json': {
              'username': 'reporter0',
              'channel': '#channel5',
              'text': 'PASSED: FLAG!! (<https://logs.com|View logs>)',
              'icon_emoji': ':mega2:'
            }
          }
        }
      ]
    )
  },

  fail: function *() {
    const { runner, suite, Test } = this.mocha

    suite.addTest(new Test('nooo1', function (done) {
      done(new Error('fail 987'))
    }))

    const failures = yield this.executeTests(runner)

    this.expect(failures).to.equal(1)

    this.expect(this.requests).to.equal(
      [
        {
          'method': 'POST',
          'url': 'http://blabla.com',
          'body': {
            'json': {
              'attachments': [
                {
                  'attachment_type': '',
                  'fallback': 'Failed: #internal-mocha-ci-slack-reporter > nooo1\nError: fail 987',
                  'fields': [
                    {
                      'short': false,
                      'title': 'Error: fail 987'
                    }
                  ],
                  'text': 'Failed: #internal-mocha-ci-slack-reporter > nooo1'
                }
              ],
              'username': 'reporter0',
              'channel': '#channel5',
              'text': 'FAILED: FLAG!! (<https://logs.com|View logs>)',
              'icon_emoji': ':mega1:'
            }
          }
        }
      ]
    )
  }
}
