import fs from 'fs';

// API routes
import signup from './signup';

let routes: {[key: string]: Function} = {};

function addRoute(url: string, method: Function) {
  routes[url] = method;
}

addRoute('/api/signup', signup);

export {
  routes,
  addRoute,
}