import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import Ember from 'ember';
import fetch from 'fetch';
import config from 'ember-get-config';

const { get, isEmpty, RSVP } = Ember;
const { resolve, reject } = RSVP;

export default BaseAuthenticator.extend({

  serverTokenEndpoint: config['ember-simple-token'].serverTokenEndpoint || '/token',

  tokenAttributeName: 'token',

  identificationAttributeName: config['ember-simple-token'].identificationAttributeName || 'email',

  authenticate(credentials) {
    return fetch(this.serverTokenEndpoint, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    }).then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      } else {
        reject(new Error(response.statusText));
      }
    });
  },

  restore(data) {
    const { tokenAttributeName, identificationAttributeName } = this.getProperties('tokenAttributeName', 'identificationAttributeName');
    const tokenAttribute = get(data, tokenAttributeName);
    const identificationAttribute = get(data, identificationAttributeName);
    return new RSVP.Promise((resolve, reject) => {
      if (!isEmpty(tokenAttribute) && !isEmpty(identificationAttribute)) {
        resolve(data);
      } else {
        reject();
      }
    });
  },

  invalidate() {
    return resolve();
  }

});
