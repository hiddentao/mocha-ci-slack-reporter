'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _got = require('got');

var _got2 = _interopRequireDefault(_got);

var _mocha = require('mocha');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = require('debug')('mocha-ci-slack-reporter');
var Base = _mocha.reporters.Base;

var Reporter = function (_Base) {
  (0, _inherits3.default)(Reporter, _Base);

  function Reporter(runner, options) {
    (0, _classCallCheck3.default)(this, Reporter);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Reporter.__proto__ || Object.getPrototypeOf(Reporter)).call(this, runner));

    ['suite', 'suite end', 'pass', 'fail', 'end'].forEach(function (e) {
      runner.on(e, _this['' + e.replace(' ', '_')].bind(_this));
    });

    _this.passed = [];
    _this.failed = [];
    _this.suites = [];

    _this.options = options.reporterOptions;

    debug('Options', _this.options);
    return _this;
  }

  (0, _createClass3.default)(Reporter, [{
    key: 'suite',
    value: function suite(_suite) {
      debug('Start suite: ', _suite.title);

      this.suites.push(_suite.title);
    }

    // eslint-disable-next-line

  }, {
    key: 'suite_end',
    value: function suite_end() {
      debug('Suite end');

      this.suites.pop();
    }
  }, {
    key: 'pass',
    value: function pass(test) {
      debug('Test passed: ', test.title);

      this.passed.push({
        suite: this._buildSuiteName(),
        title: test.title,
        duration: test.duration
      });
    }
  }, {
    key: 'fail',
    value: function fail(test) {
      debug('Test failed: ', test.title);

      this.failed.push({
        suite: this._buildSuiteName(),
        title: test.title,
        duration: test.duration,
        error: test.err
      });
    }
  }, {
    key: 'end',
    value: function end() {
      debug('Tests ended');

      var failed = !!this.failed.length;

      // should we report passed tests
      if (!failed && this.options.failuresOnly) {
        debug('No failures and failuresOnly is set, so not going to report');

        return;
      }

      var message = {
        username: this.options.username,
        channel: this.options.channel
      };

      if (failed) {
        debug('Reporting failure');

        message.text = 'FAILED: ' + this.options.testTitle;
        message.icon_emoji = this.options.failEmoji || ':boom:';
        message.attachments = [];

        this.failed.forEach(function (f) {
          message.attachments.push({
            attachment_type: '',
            text: 'Failed: ' + f.title,
            fallback: 'Failed: ' + f.title + '\n' + f.error,
            fields: [{
              title: '' + f.error,
              short: false
            }]
          });
        });
      } else {
        debug('Reporting success');

        message.text = 'PASSED: ' + this.options.testTitle;
        message.icon_emoji = this.options.passEmoji || ':ok_hand:';
      }

      if (this.options.logsUrl) {
        message.text += ' (<' + this.options.logsUrl + '|View logs>)';
      }

      debug('Reporting', message);

      var request = require('sync-request');
      request('POST', this.options.url, {
        json: message
      });
    }
  }, {
    key: '_buildSuiteName',
    value: function _buildSuiteName() {
      return this.suites.join(' - ');
    }
  }]);
  return Reporter;
}(Base);

module.exports = Reporter;