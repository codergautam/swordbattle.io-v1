export default function getServerUrl() {
  // if localhost, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') { // IPv6 in browsers isn't properly supported yet, but IPv4 is. So add IPv4 loopback hostname detection
    const currentPort = window.location.port;
    return `ws://${window.location.hostname}:${currentPort}`;
  }
  // if not localhost, use the current hostname
  return `wss://${window.location.hostname}`;
}
