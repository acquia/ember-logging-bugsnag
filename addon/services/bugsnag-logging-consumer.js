import Ember from 'ember';

export default Ember.Service.extend({

  /**
   * A callback that is used to generate the bugsnag specific context
   * from an event.  This will include the required data for bugsnag payloads.
   *
   * The callback will receive the event context as a paramter and should return
   * an object with the following keys:
   *   urlHash             The current url hash
   *   url                 The application url
   *   environment         The current application environment
   *   applicationVersion  The version number for this application
   *   userId              An ID for the current user
   *   route               The current application route
   * Additionally the following optional information will be included in the
   * bugsnag report if passed
   *   userAgent           The current user agent string
   *   language            The user's language settings
   *   metadata            An object of application-specific metadata
   *
   * @property applicationContextCallback
   * @type {Function}
   * @public
   */
  applicationContextCallback: null,

  /**
   * The BugSnag API key from configuration
   * @property apiKey
   * @type {String}
   * @public
   */
  apiKey: null,

  /**
   * The BugSnag API url from configuration
   * @property apiUrl
   * @type {String}
   * @public
   */
  apiUrl: null,

  /**
   * Bugsnag callback function for logger
   * @method  loggerCallback
   * @public
   * @param  {Object} event   logger event object
   * @param  {Object} context Application and user context
   */
  loggerCallback(event, context) {
    let callback = this.get('applicationContextCallback');
    let apiKey = this.get('apiKey');
    let apiUrl = this.get('apiUrl');
    if (Ember.isEmpty(apiKey) || Ember.isEmpty(apiUrl)) {
      return;
    }
    if (Ember.typeOf(callback) !== 'function') {
      return;
    }
    let appContext = callback(context);
    let required = ['urlHash', 'url', 'userId', 'environment', 'applicationVersion', 'route'];
    required.forEach((prop) => {
      Ember.assert(`Application context callback for bugsnag must include ${prop}.`, appContext.hasOwnProperty(prop));
    });
    let payload = {
      notifierVersion: '1.0',
      apiKey: apiKey,
      projectRoot: appContext.urlHash,
      context: event.metadata.error ? event.metadata.error.name : event.name,
      userId: appContext.userId,
      releaseStage: appContext.environment,
      appVersion: appContext.applicationVersion,
      url: appContext.url,
      severity: event.level,
      name: event.metadata.error ? event.metadata.error.name : event.name,
      message: event.metadata.error ? event.metadata.error.message : event.type,
      stacktrace: event.metadata.error ? event.metadata.error.stack : '',
      file: appContext.route,
      lineNumber: '0',
      payloadVersion: '2'
    };
    if (appContext.hasOwnProperty('userAgent')) {
      payload.userAgent = appContext.userAgent;
    }
    if (appContext.hasOwnProperty('language')) {
      payload.language = appContext.language;
    }
    if (appContext.hasOwnProperty('metadata')) {
      payload.metadata = appContext.metadata;
    }
    this._sendPayload(this._generateBugsnagUrl(payload, apiUrl));
  },

  /**
   * Helper function to send the payload to bugsnag.  This could have been
   * folded into the callback above, but is split out to be overridden for
   * unit testing purposes.
   * @method  _sendPayload
   * @private
   * @param  {String} apiUrl  The generated api url.
   */
  _sendPayload(bugsnagUrl) {
    let img = new Image();
    img.src = bugsnagUrl;
  },

  /**
   * Generate a bugsnag compatible error reporting url.
   * @method _generateBugsnagUrl
   * @private
   * @param  {Mixed}  payload   string or object representation of the bugsnag payload
   * @param  {String} basePath  api endpoint url
   * @param  {Date}   timestamp date object appended to the resulting url
   * @return {String}           generated bugsnag error reporting url
   */
  _generateBugsnagUrl(payload, basePath, timestamp = Date.now()) {
    payload = typeof payload === 'object' ? Ember.$.param(payload) : payload;
    return `${basePath}?${payload}&ct=img&cb=${timestamp}`;
  }
});
