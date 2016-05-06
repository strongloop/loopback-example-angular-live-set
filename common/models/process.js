// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: angular-live-set-example
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var PassThrough = require('stream').PassThrough;

module.exports = function(Process) {
  var usage;

  Process.watchMemory = function (cb) {
    var changes = new PassThrough({objectMode: true});

    setInterval(function() {
      changes.write({
        usage: process.memoryUsage(),
        time: Date.now()
      });
    }, 250);

    cb(null, changes);
  }

  Process.remoteMethod('watchMemory', {
    returns: {arg: 'changes', type: 'ReadableStream', json: true},
    http: {path: '/memory'}
  });

  var leak;

  // warning for demo purposes only
  setInterval(function() {
    leak = [];
    var count = Math.floor(Math.random() * 655360);
    while(leak < 100) {
      leak.push(new Array(count ).join(','));
    }
  }, 50)
};
