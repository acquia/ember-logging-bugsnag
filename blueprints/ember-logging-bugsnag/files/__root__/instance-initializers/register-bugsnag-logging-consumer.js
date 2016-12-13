/**
 * Provide application-specific information to Bugsnag.
 */
export default {
  name: 'register-bugsnag-logging-consumer',
  after: 'ember-logging-bugsnag',
  initialize(applicationInstance) {
    // Set up a callback that pulls the relevant Bugsnag application/user data
    // from the application-specific provided context.
    let consumer = applicationInstance.lookup('service:bugsnagLoggingConsumer');
    /**
     * This callback is called automatically when sending an event to Bugsnag
     * to determine the context of the event.  Provide the following information
     * either directly or from the logger event context.
     * @param  {Object} context Any application or user context from the event.
     * @return {Object}         Bugsnag context:
     *                          - url: The url to track with the error
     *                          - projectRoot: The project root to track
     *                          - appVersion: The application version
     *                          - file: The file to track (current route)
     *                          - userId: The current user id
     *                          - userAgent: The user agent string
     *                          - language: The user language setting
     *                          - metaData: Any custom metadata to track
     */
    let contextCallback = (context) => {
      return {
        url: '',
        projectRoot: '',
        appVersion: '',
        file: '',
        userId: '',
        userAgent: navigator ? navigator.userAgent : '',
        language: navigator ? navigator.language || navigator.userLanguage : '',
        metaData: {}
      };
    };

    consumer.set('applicationContextCallback', contextCallback);
  }
};
