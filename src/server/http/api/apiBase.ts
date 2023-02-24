import fs from 'fs';

// API routes
import signup from './signup';
import login from './login';
import recaptchaSite from './recaptchaSiteKey';
import loginWithSecret from './loginWithSecret';
import changeName from './changeName';
import leaderboard from './leaderboard';
import profile from './profile';

let routes: {[key: string]: {execute: Function, method: string}} = {};

function addRoute(url: string, method: Function, reqType: string = 'GET') {
  routes[url] = {
    execute: method,
    method: reqType,
  };
}

addRoute('/api/signup', signup, 'POST');
addRoute('/api/login', login, 'POST');
addRoute('/api/getData', loginWithSecret, 'POST')
addRoute('/api/changeName', changeName, 'POST')
addRoute('/api/recaptchaSiteKey', recaptchaSite, 'GET');
addRoute('/leaderboard', leaderboard, 'GET');
addRoute('/user/:username', profile, 'GET');

export {
  routes,
  addRoute,
}