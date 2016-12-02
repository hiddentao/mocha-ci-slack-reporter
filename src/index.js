import shell from 'shelljs'
const debug = require('debug')('mocha-ci-slack-reporter')
import { reporters } from 'mocha'
const { Base } = reporters

class Reporter extends Base {
  constructor (runner, options) {
    super(runner)

    ;['suite', 'suite end', 'pass', 'fail', 'end'].forEach(e => {
      runner.on(e, this[`${e.replace(' ', '_')}`].bind(this))
    })

    this.passed = []
    this.failed = []
    this.suites = []

    this.options = options.reporterOptions

    debug('Options', this.options)
  }

  suite (suite) {
    debug('Start suite: ', suite.title)

    this.suites.push(suite.title)
  }

  // eslint-disable-next-line
  suite_end () {
    debug('Suite end')

    this.suites.pop()
  }

  pass (test) {
    debug('Test passed: ', test.title)

    this.passed.push({
      suite: this._buildSuiteName(),
      title: test.title,
      duration: test.duration
    })
  }

  fail (test) {
    debug('Test failed: ', test.title)

    this.failed.push({
      suite: this._buildSuiteName(),
      title: test.title,
      duration: test.duration,
      error: test.err
    })
  }

  end () {
    debug('Tests ended')

    const failed = !!this.failed.length

    // should we report passed tests
    if (!failed && this.options.failuresOnly) {
      debug('No failures and failuresOnly is set, so not going to report')

      return
    }

    const message = {
      username: this.options.username,
      channel: this.options.channel
    }

    if (failed) {
      debug('Reporting failure')

      message.text = `FAILED: ${this.options.testTitle}`
      message.icon_emoji = this.options.failEmoji || ':boom:'
      message.attachments = []

      this.failed.forEach(f => {
        message.attachments.push({
          attachment_type: '',
          text: `Failed: ${f.title}`,
          fallback: `Failed: ${f.title}\n${f.error}`,
          fields: [
            {
              title: '' + f.error,
              short: false
            }
          ]
        })
      })
    } else {
      debug('Reporting success')

      message.text = `PASSED: ${this.options.testTitle}`
      message.icon_emoji = this.options.passEmoji || ':ok_hand:'
    }

    if (this.options.logsUrl) {
      message.text += ` (<${this.options.logsUrl}|View logs>)`
    }

    debug('Reporting', message)

    // TODO: investigate why using node's HTTP request module doesn't work at this point
    shell.exec(`curl -s -d "payload=${escape(JSON.stringify(message))}" "${this.options.url}"`, {
      silent: true,
      async: true
    }, (code, stdout, stderr) => {
      if (0 !== code) {
        console.error(stdout, stderr)
      }
    })
  }

  _buildSuiteName () {
    return this.suites.join(' - ')
  }
}

module.exports = Reporter
