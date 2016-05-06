// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: angular-live-set-example
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = function(Color) {
  Color.upvote = function(id, cb) {
    Color.findById(id, function(err, color) {
      if(err) return cb(err);
      color.votes += 1;
      color.save(cb);
    });
  };

  Color.remoteMethod('upvote', {
    isStatic: true,
    accepts: {arg: 'id', type: 'number'}
  });
};
