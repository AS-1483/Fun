const devices = new Map();

/*
 device = {
   id,
   name,
   lastPing
 }
*/

function pingDevice(id, name) {
  devices.set(id, {
    id,
    name,
    lastPing: Date.now()
  });
}

function getDevices() {
  const now = Date.now();
  return [...devices.values()].map(d => ({
    ...d,
    online: now - d.lastPing < 30000
  }));
}

module.exports = { pingDevice, getDevices };
