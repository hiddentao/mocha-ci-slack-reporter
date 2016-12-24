const test = require('./_base').create(module)

test.passing = function *() {
  const { runner, suite, Test } = this.createMocha()

  suite.addTest(new Test('pass', function (done) {
    done()
  }))

  const failures = yield this.executeTests(runner)

  this.expect(failures).to.equal(0)

  console.log(this.requests)
}
