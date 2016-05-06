// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: angular-live-set-example
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * @inject $scope
 * @inject createChangeStream
 * @dep nvd3ChartDirectives
 */

// prevent nv from printing logs
nv.dev = false;

$scope.paused = false;

var src = new EventSource('/api/process/memory');
var changes = createChangeStream(src);

var heapTotal = {
  key: 'Heap Total',
  src: 'heapTotal',
  values: []
};

var heapUsed = {
  key: 'Heap Used',
  src: 'heapUsed',
  values: []
};

var rss = {
  key: 'RSS',
  src: 'rss',
  values: []
};

var MAX = 16;
var data = $scope.data = [heapTotal, heapUsed, rss];

changes.on('data', function(update) {
  data.forEach(function(points) {
    if($scope.paused) return;
    points.values.push([
      update.time,
      update.usage[points.src]
    ]);

    while(points.values.length > MAX && points.values.length > 1) {
      points.values.shift();
    }

    points.values = angular.copy(points.values);
  });

  $scope.$apply();
});
