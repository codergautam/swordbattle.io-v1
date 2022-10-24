export default function getServerUrl() {
  // if localhost, use localhost
  if (window.location.hostname === 'localhost') {
    var currentPort = window.location.port;
    return 'ws://localhost:'+currentPort;
  } else {
    // if not localhost, use the current hostname
    return 'wss://'+window.location.hostname;
  }

}