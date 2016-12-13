import QUnit from 'qunit';
import BugsnagLoggingConsumer from 'ember-logging-bugsnag/services/bugsnag-logging-consumer';

QUnit.module('Unit | Services | bugsnag-logging-consumer');

QUnit.test('it has publically accessible methods', function(assert) {
  assert.expect(1);

  let service = BugsnagLoggingConsumer.create();
  assert.ok(service.loggerCallback, 'The logger callback is accessible.');
});

QUnit.test('it generates the appropriate payload for bugsnag', function(assert) {
  assert.expect(16);

  let service = BugsnagLoggingConsumer.create({ currentEnvironment: 'unit-testing-environment' });
  let apiKey = 'my-api-key';
  let apiUrl = 'my-bugsnag-url';

  let contextCallback = (context) => {
    return {
      url: context.application.url,
      projectRoot: context.application.urlHash,
      appVersion: context.application.version,
      file: context.application.route,
      userId: context.user.id,
      userAgent: context.user.userAgent,
      language: context.user.language,
      metaData: {
        appstuff: {
          clientId: context.application.clientId,
          siteId: context.application.siteId
        }
      }
    };
  };
  service.set('apiKey', apiKey);
  service.set('apiUrl', apiUrl);
  service.set('applicationContextCallback', contextCallback);

  let event = {
    level: 'error',
    name: 'Event name error',
    type: 'error',
    metadata: {
      error: {
        name: 'Testing error',
        message: 'Testing error message',
        stack: 'Testing error stack'
      }
    }
  };
  let context = {
    user: {
      id: 'user-id',
      userAgent: 'user-agent',
      language: 'user-language'
    },
    application: {
      url: 'application-url',
      urlHash: 'application-url-hash',
      environment: 'unit-testing-environment',
      version: 'application-version',
      route: 'application-route',
      clientId: 'application-client-id',
      siteId: 'application-site-id'
    }
  };

  // Mock out out the final payload send so that we can capture the generated
  // payload.
  let sendPayloadMock = (url) => {
    let [base, query] = url.split('?');
    assert.equal(base, 'my-bugsnag-url');

    let params = query.split('&');
    let paramMap = {};
    let decodeParam = (value) => {
      value = value.replace(/\+/g, '%20');
      value = decodeURIComponent(value);
      return value;
    };
    params.forEach((queryParam) => {
      let [paramName, paramValue] = queryParam.split('=');
      paramMap[decodeParam(paramName)] = decodeParam(paramValue);
    });
    assert.equal(paramMap.apiKey, 'my-api-key', 'Api key is passed in payload.');
    assert.equal(paramMap.projectRoot, 'application-url-hash', 'Project root is passed in payload.');
    assert.equal(paramMap.context, 'Testing error', 'Error name is sent as payload context.');
    assert.equal(paramMap.userId, 'user-id', 'User id is sent in payload.');
    assert.equal(paramMap.releaseStage, 'unit-testing-environment', 'Current environment is sent in payload.');
    assert.equal(paramMap.appVersion, 'application-version', 'Application version is sent in payload.');
    assert.equal(paramMap.url, 'application-url', 'Application url is sent in payload.');
    assert.equal(paramMap.severity, 'error', 'Severity is sent with payload.');
    assert.equal(paramMap.name, 'Testing error', 'Error name is sent with payload.');
    assert.equal(paramMap.message, 'Testing error message', 'Error message is sent with payload.');
    assert.equal(paramMap.stacktrace, 'Testing error stack', 'Error stack trace is sent with payload.');
    assert.equal(paramMap.userAgent, 'user-agent', 'User agent is sent with payload.');
    assert.equal(paramMap.language, 'user-language', 'Language is sent with payload.');
    assert.deepEqual(paramMap['metaData[appstuff][clientId]'], 'application-client-id', 'App-specific metadata client id is sent with payload.');
    assert.deepEqual(paramMap['metaData[appstuff][siteId]'], 'application-site-id', 'App-specific metadata site id is sent with payload.');
  };
  service.set('_sendPayload', sendPayloadMock);
  service.loggerCallback(event, context);
});
