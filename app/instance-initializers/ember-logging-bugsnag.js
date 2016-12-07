import ENV from '../config/environment';
import registerBugsnagConsumer from 'ember-logging-bugsnag/instance-initializers/register-bugsnag-consumer';

export function initialize(instance) {
  registerBugsnagConsumer(instance, ENV);
}

export default {
  name: 'ember-logging-bugsnag',
  after: 'ember-logging-service',
  initialize
};
