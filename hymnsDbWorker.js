const HYMNSDB_STATUS = {
  INIT: 1,
  LOADING: 2,
  PROCESSING: 3,
  READY: 4,
};
Object.freeze(HYMNSDB_STATUS);

let hymnsDbStatus = HYMNSDB_STATUS.INIT
let hymnsDbSearchStatus = HYMNSDB_STATUS.INIT

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

function getStatus() {
  return hymnsDbStatus;
}

async function loadHymnsDB() {}

export default HYMNSDB_STATUS