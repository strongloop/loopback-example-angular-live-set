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
