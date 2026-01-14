const devices = {};

function registerDevice(id, name) {
  devices[id] = {
    id,
    name,
    online: true,
    pendingLink: null,
    screenshotRunning: false,
    interval: 0
  };
}

function setOffline(id) {
  if (devices[id]) devices[id].online = false;
}

function heartbeat(id) {
  if (devices[id]) devices[id].online = true;
}

module.exports = {
  devices,
  registerDevice,
  setOffline,
  heartbeat
};
