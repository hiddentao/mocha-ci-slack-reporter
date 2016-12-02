import Slack from 'node-slack'
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
    this.slack = new Slack(this.options.url)
  }

  suite (suite) {
    this.suites.push(suite.title)
  }

  // eslint-disable-next-line
  suite_end () {
    this.suites.pop()
  }

  pass (test) {
    this.passed.push({
      suite: this._buildSuiteName(),
      title: test.title,
      duration: test.duration
    })
  }

  fail (test) {
    this.failed.push({
      suite: this._buildSuiteName(),
      title: test.title,
      duration: test.duration,
      error: test.err
    })
  }

  end () {
    const failed = !!this.failed.length

    // should we report passed tests
    if (!failed && this.options.failuresOnly) {
      return
    }

    const message = {
      username: this.options.username,
      channel: this.options.channel
    }

    if (failed) {
      message.text = `FAILED: ${this.options.testTitle} ${this.options.viewMore ? `(${this.options.viewMore})` : ''}`
      message.icon_emoji = this.options.failEmoji || ':boom:'
      message.attachments = []

      this.failed.forEach(f => {
        message.attachments.push({
          attachment_type: '',
          text: `Failed: ${failed.title}`,
          fallback: `Failed: ${failed.title}`,
          fields: [
            {
              title: '' + failed.error,
              short: false
            }
          ]
        })
      })
    } else {
      message.text = `PASSED: ${this.options.testTitle} ${this.options.viewMore ? `(${this.options.viewMore})` : ''}`
      message.icon_emoji = this.options.passEmoji || ':ok_hand:'
    }

    this.slack.send(message)
  }

  _buildSuiteName () {
    return this.suites.join(' - ')
  }
}

module.export = Reporter
