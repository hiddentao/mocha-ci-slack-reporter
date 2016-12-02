# mocha-ci-slack-reporter

Slack reporter for Mocha when running in CI environments.

Although this can be used in non-CI environments too, it is suited for CI
environment in that it is able to report build number, build URL, etc alongside
standard test pass/failed information.

It posts a single notification to your Slack channel with a summary of the test
results.

## Installation

```shell
$ npm install mocha-ci-slack-reporter
```

## Usage

### Command-line

Run mocha with `mocha-junit-reporter`:

```shell
$ mocha test --reporter mocha-ci-slack-reporter
```
This will output a results file at `./test-results.xml`.
You may optionally declare an alternate location for results XML file by setting
the environment variable `MOCHA_FILE` or specifying `mochaFile` in `reporterOptions`:

```shell
$ MOCHA_FILE=./path_to_your/file.xml mocha test --reporter mocha-junit-reporter
```
or
```shell
$ mocha test --reporter mocha-junit-reporter --reporter-options mochaFile=./path_to_your/file.xml
```
or
```javascript
var mocha = new Mocha({
    reporter: 'mocha-junit-reporter',
    reporterOptions: {
        mochaFile: './path_to_your/file.xml'
    }
});
```

### Append properties to testsuite

You can also properties to the report under `testsuite`. This is useful if you want your CI environment to add extra build props to the report for analytics purposes

```
<testsuites>
  <testsuite>
    <properties>
      <property name="BUILD_ID" value="4291"/>
    </properties>
    <testcase/>
    <testcase/>
    <testcase/>
  </testsuite>
</testsuites>
```

To do so pass them in via env variable:
```shell
PROPERTIES=BUILD_ID:4291 mocha test --reporter mocha-junit-reporter
```
or
```javascript
var mocha = new Mocha({
    reporter: 'mocha-junit-reporter',
    reporterOptions: {
        properties: {
            BUILD_ID: 4291
        }
    }
})
```

### Results Report

Results XML filename can contain `[hash]`, e.g. `./path_to_your/test-results.[hash].xml`. `[hash]` is replaced by MD5 hash of test results XML. This enables support of parallel execution of multiple `mocha-junit-reporter`'s writing test results in separate files.

In order to display full suite title (including parents) just specify `useFullSuiteTitle` option
```javascript
var mocha = new Mocha({
    reporter: 'mocha-junit-reporter',
    reporterOptions: {
        useFullSuiteTitle: true,
        suiteTitleSeparedBy: '.' // suites separator, default is space (' ')
    }
});
```

## License

MIT - see [LICENSE.md](LICENSE.md)
