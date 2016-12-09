import { test, module } from 'qunit';
import registerBugsnagConsumer from 'ember-logging-bugsnag/instance-initializers/register-bugsnag-consumer';
import BugsnagLoggingConsumer from 'ember-logging-bugsnag/services/bugsnag-logging-consumer';
import Ember from 'ember';

module('Unit | Instance Initializers | register-bugsnag-consumer');

test('it configures the logging consumer', function(assert) {
  assert.expect(7);

  let environmentMock = {
    environment: 'unit-testing',
    'ember-logging-bugsnag': {
      enabled: true,
      key: 'my-api-key',
      url: 'my-api-url'
    }
  };
  let loggerMock = Ember.Service.create({
    registerConsumer(id, callback, levels, tags) {
      assert.equal(id, 'ember-logging-bugsnag', 'Consumer is given a unique ID.');
      assert.ok(Ember.isArray(callback), 'A callback array is provided.');
      assert.equal(levels, 'error', 'The default level is provided.');
      assert.deepEqual(tags, 'error', 'The default tags are provided.');
    },
    levels: {
      error: 'error'
    }
  });
  let consumer = BugsnagLoggingConsumer.create();
  let instanceMock = {
    lookup(factoryName) {
      if (factoryName === 'service:bugsnagLoggingConsumer') {
        return consumer;        
      }
      if (factoryName === 'service:logger') {
        return loggerMock;
      }
    }
  };

  registerBugsnagConsumer(instanceMock, environmentMock);
  assert.equal(consumer.get('apiKey'), 'my-api-key', 'The api key is stored on the consumer.');
  assert.equal(consumer.get('apiUrl'), 'my-api-url', 'The api url is stored on the consumer.');
  assert.equal(consumer.get('currentEnvironment'), 'unit-testing', 'The current environment is stored on the consumer.');
});
