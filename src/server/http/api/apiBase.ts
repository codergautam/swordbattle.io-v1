import fs from 'fs';

// API routes
import signup from './signup';
import login from './login';
import recaptchaSite from './recaptchaSiteKey';

let routes: {[key: string]: {execute: Function, method: string}} = {};

function addRoute(url: string, method: Function, reqType: string = 'GET') {
  routes[url] = {
    execute: method,
    method: reqType,
  };
}

addRoute('/api/signup', signup, 'POST');
addRoute('/api/login', login, 'POST');
addRoute('/api/recaptchaSiteKey', recaptchaSite, 'GET');

export {
  routes,
  addRoute,
}