/* eslint-disable no-use-before-define */
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

export default function initWebsocket(url: string | URL, existingWebsocket: any, timeoutMsSupplied: number | undefined, numberOfRetriesSupplied: number) {
    const timeoutMs = timeoutMsSupplied || 1500;
    const numberOfRetries = numberOfRetriesSupplied || 0;

    let hasReturned = false;
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!hasReturned) {
                console.info(`opening websocket timed out: ${url}`);
                // eslint-disable-next-line no-use-before-define
                rejectInternal('The connection to the server timed out.');
            }
        }, timeoutMs);
        if (!existingWebsocket || existingWebsocket.readyState !== existingWebsocket.OPEN) {
            if (existingWebsocket) {
                existingWebsocket.close();
            }
            const websocket = new WebSocket(url);
            websocket.onopen = function () {
                if (hasReturned) {
                    websocket.close();
                } else {
                    console.info(`websocket to opened! url: ${url}`);
                    resolve(websocket);
                }
            };
            websocket.onclose = function () {
                console.info(`websocket closed! url: ${url}`);
                rejectInternal('The connection to the server was closed unexpectedly');
            };
            websocket.onerror = function () {
                console.info(`websocket error! url: ${url}`);
                rejectInternal('An unexpected error occurred while connecting to the server');
            };
        } else {
            resolve(existingWebsocket);
        }

        function rejectInternal(reason: string) {
            if (numberOfRetries <= 0) {
                reject(reason);
            } else if (!hasReturned) {
                hasReturned = true;
                console.info(`retrying connection to websocket! url: ${url}, remaining retries: ${numberOfRetries - 1}`);
                initWebsocket(url, null, timeoutMs, numberOfRetries - 1).then(resolve, reject);
            }
        }
    });
    promise.then(
        () => {
            hasReturned = true;
        },
        () => {
            hasReturned = true;
        }
    );
    return promise;
}
