const express = require('express');
const { pingDevice } = require('./devices');
require('./bot');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// App calls this every 10–20 sec
app.post('/ping', (req, res) => {
  const { deviceId, deviceName } = req.body;
  pingDevice(deviceId, deviceName);
  res.json({ ok: true });
});

app.get('/', (_, res) => {
  res.send('Server running ✅');
});

app.listen(PORT, () => {
  console.log('Server started');
});
