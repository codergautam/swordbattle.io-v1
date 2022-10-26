import Packet from "../../../../shared/Packet";

/**
 * inits a websocket by a given url, returned promise resolves with initialized websocket, rejects after failure/timeout.
 *
 * @param url the websocket url to init
 * @param existingWebsocket if passed and this passed websocket is already open, this existingWebsocket is resolved, no additional websocket is opened
 * @param timeoutMs the timeout in milliseconds for opening the websocket
 * @param numberOfRetries the number of times initializing the socket should be retried, if not specified or 0, no retries are made
 *        and a failure/timeout causes rejection of the returned promise
 * @return {Promise}
 */
 function initWebsocket(url: string | URL, existingWebsocket: any, timeoutMs: number | undefined, numberOfRetries: number) {
  timeoutMs = timeoutMs ? timeoutMs : 1500;
  numberOfRetries = numberOfRetries ? numberOfRetries : 0;
  var hasReturned = false;
  var promise = new Promise((resolve, reject) => {
      setTimeout(function () {
          if(!hasReturned) {
              console.info('opening websocket timed out: ' + url);
              rejectInternal("The connection to the server timed out.");
          }
      }, timeoutMs);
      if (!existingWebsocket || existingWebsocket.readyState != existingWebsocket.OPEN) {
          if (existingWebsocket) {
              existingWebsocket.close();
          }
          var websocket = new WebSocket(url);
          websocket.onopen = function () {
              if(hasReturned) {
                  websocket.close();
              } else {
                  console.info('websocket to opened! url: ' + url);
                  resolve(websocket);
              }
          };
          websocket.onclose = function () {
              console.info('websocket closed! url: ' + url);
              rejectInternal("The connection to the server was closed unexpectedly");
          };
          websocket.onerror = function () {
              console.info('websocket error! url: ' + url);
              rejectInternal("An unexpected error occurred while connecting to the server");
          };
      } else {
          resolve(existingWebsocket);
      }

      function rejectInternal(reason: string) {
          if(numberOfRetries <= 0) {
              reject(reason);
          } else if(!hasReturned) {
              hasReturned = true;
              console.info('retrying connection to websocket! url: ' + url + ', remaining retries: ' + (numberOfRetries-1));
              initWebsocket(url, null, timeoutMs, numberOfRetries-1).then(resolve, reject);
          }
      }
  });
  promise.then(function () {hasReturned = true;}, function () {hasReturned = true;});
  return promise;
};

export default class Ws extends Phaser.Events.EventEmitter {
  serverUrl: string;
  ws: WebSocket;
  connected: boolean;
  constructor(serverUrl: string) {
    super();
    this.serverUrl = serverUrl;
    this.connected = false;

    initWebsocket(this.serverUrl, null, 5000, 2).then((ws: any) => {
      this.ws = ws;
      this.connected = true;
      this.emit('connected');

      this.ws.onmessage = (event: any) => {
        try {
            console.log(Packet.fromBinary(event.data))
        } catch (e) {
          console.error('error while parsing packet', e);
        }
      }

      this.ws.onerror = () => {
        this.emit('connectionLost', "There was an error in your connection to the server.");
      }
        this.ws.onclose = () => {
        this.emit('connectionLost', "The connection to the server was closed unexpectedly.");
      }

    }).catch((err: string) => {
      this.emit('connect_error', err);
    });
  }
}