import Ember from 'ember';

export default function registerBugsnagConsumer(instance, config) {
  let loggingService, consumerService, levels, tags;

  let addonOptions = config['ember-logging-bugsnag'];
  // Must be enabled in configuration for the current environment.
  if (!addonOptions.enabled) {
    return;
  }
  // Must be configured with the bugsnag key and url.
  if (Ember.isEmpty(addonOptions.key) || Ember.isEmpty(addonOptions.url)) {
    return;
  }

  // Set up the consumer service.
  consumerService = instance.lookup('service:bugsnagLoggingConsumer');
  consumerService.set('apiKey', addonOptions.key);
  consumerService.set('apiUrl', addonOptions.url);

  // Register the consumer service with the logger.
  loggingService = instance.lookup('service:logger');
  levels = addonOptions.levels || loggingService.levels.error;
  tags = addonOptions.tags || 'error';
  loggingService.registerConsumer('ember-logging-bugsnag', [consumerService.get('loggerCallback'), consumerService], levels, tags);
}
