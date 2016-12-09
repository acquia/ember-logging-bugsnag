# ember-logging-bugsnag

This addon provides a logging consumer for the [ember-logging-service](https://github.com/acquia/ember-logging-service/) addon.
The consumer handles sending any error events to the [Bugsnag](https://bugsnag.com/) service.

## Configuration

First you must install the ember-logging-service addon and follow instructions
to add application and user context callbacks.  Additionally, the ember-logging-service
addon must be configured with `enableErrors = true`.

There are two parts to configuring the Bugsnaglogging consumer.  Setting up the
credentials and setting up the application-specific information to send to
Bugsnag.

# Configuring credentials
Configuring the ember-logging-bugsnag addon is done from the `config/environment.js` file.

You must set `enabled = true` for each environment you wish to monitor (both in the
ember-logging-service and in the ember-logging-bugsnag modules).

```
ENV['ember-logging-service'] = {
  enabled: true,
  errorsEnabled: true,
  .....
}

ENV['ember-logging-bugsnag'] = {
  enabled: true,
  key: your-bugsnag-key-goes-here
  url: the-url-to-bugsnag-notifier-goes-here
}
```

The key can be found in your Bugsnag dashboard in the "Projects" section of you
"Settings".  

The url is the notification URL that is reported for the [API](https://docs.bugsnag.com/api/error-reporting/#api-overview).
This defaults to https://notify.bugsnag.com/js.

# Configuring application-specific information
Bugsnag requires information regarding the context of the error and the current
application user at the time of the error.  This is typically information that 
you would set in the application and user context callbacks in the ember-logging-service.
Because that contextual data is set up by your application, ember-logging-bugsnag
passes the event context to your custom callback to determine what values map
to the values expected by Bugsnag.

When you install the ember-logging-bugsnag addon, an application instance initializer
is created for you at `app/instance-initializers/register-bugsnag-logging.js`.

This file sets up a sample callback to the logging consumer and defines the values
that need to be populated in order for error reporting with Bugsnag.  You can
fill in the values directly here or utilize the event context passed to the
function to dynamically determine what to send.  This callback is executed each
time an error is sent to Bugsnag.

# Sending non-standard errors
By default, ember-logging-service and ember-logging-bugsnag work together to
send all unhandled Ember and RSVP errors to Bugsnag.  If you'd like to add additional
errors, just use the logger service provided by ember-logging-service to trigger
them.  By default, ember-logging-bugsnag listens to all events of the "error"
level with the tag of "error".

```
import Ember from 'ember';

export default Ember.Component.extend({
  logger: Ember.inject.service(),

  sendCustomError(errorName, errorData) {
    let logger = this.get('logger');
    logger.error(logger.get('tags.error'), errorName, errorData);
  }
});
```
# Developing for ember-logging-bugsnag

This README outlines the details of collaborating on this Ember addon.

## Installation

* `git clone <repository-url>` this repository
* `cd ember-logging-bugsnag`
* `npm install`
* `bower install`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
