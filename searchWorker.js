function postMessageToPort(message, port) {
  port.postMessage(message);
}
 
onconnect = function (e) {
  var port = e.ports[0];

  setInterval()

  port.onmessage = function (e) {
    var workerResult = "Result: " + e.data[0] * e.data[1];
    port.postMessage(workerResult);
  };
};