const SerialPort = require('serialport');
const util = require('util');
const EventEmitter = require('events').EventEmitter;

function EnttecOpenUsbDMX(deviceId, options) {
  const self = this;

  options = options || {};

  this.universe = Buffer.alloc(513);

  self.interval = 46;

  this.dev = new SerialPort(deviceId, {
    'baudRate': 250000,
    'dataBits': 8,
    'stopBits': 2,
    'parity': 'none',
  }, err => {
    if (err) {
      console.log(err);
      return;
    }
    self.start();
  });
}

EnttecOpenUsbDMX.prototype.sendUniverse = function () {
  const self = this;

  if (!this.dev.writable) {
    return;
  }

  // toggle break
  self.dev.set({brk: true, rts: false}, (err, r) => {
    setTimeout(() => {
      self.dev.set({brk: false, rts: false}, (err, r) => {
        setTimeout(() => {
          self.dev.write(Buffer.concat([Buffer([0]), self.universe.slice(1)]));
        }, 1);
      });
    }, 1);
  });
};

EnttecOpenUsbDMX.prototype.start = function () {
  this.intervalhandle = setInterval(this.sendUniverse.bind(this), this.interval);
};

EnttecOpenUsbDMX.prototype.stop = function () {
  clearInterval(this.intervalhandle);
};

EnttecOpenUsbDMX.prototype.close = function (cb) {
  this.stop();
  this.dev.close(cb);
};

EnttecOpenUsbDMX.prototype.update = function (u) {
  for (const c in u) {
    this.universe[c] = u[c];
  }

  this.emit('update', u);
};

EnttecOpenUsbDMX.prototype.updateAll = function (v) {
  for (let i = 1; i <= 512; i++) {
    this.universe[i] = v;
  }
};

EnttecOpenUsbDMX.prototype.get = function (c) {
  return this.universe[c];
};

util.inherits(EnttecOpenUsbDMX, EventEmitter);

module.exports = EnttecOpenUsbDMX;
