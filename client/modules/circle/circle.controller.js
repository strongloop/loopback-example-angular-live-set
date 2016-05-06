// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: angular-live-set-example
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * @inject $scope
 * @inject Circle
 * @inject LiveSet
 * @inject createChangeStream
 * @dep ls.LiveSet
 * @dep ls.ChangeStream
 * @dep lbServices
 */

var src = new EventSource('/api/circles/change-stream?_format=event-source');
var changes = createChangeStream(src);
var set;

$scope.drawing = false;
var stage = $scope.stage = {h: 600, w: 800};

Circle.find().$promise.then(function(circles) {
  set = new LiveSet(circles, changes);
  $scope.circles = set.toLiveArray();
});

$scope.draw = function(e) {
  if($scope.drawing) {
    Circle.create({
      x: e.offsetX,
      y: e.offsetY,
      r: Math.floor(10 * Math.random())
    });
  }
}
