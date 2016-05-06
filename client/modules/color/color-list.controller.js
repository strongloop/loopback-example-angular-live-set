// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: angular-live-set-example
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * @inject $scope
 * @inject LiveSet
 * @inject createChangeStream
 * @inject Color
 * @dep ls.LiveSet
 * @dep ls.ChangeStream
 * @dep lbServices
 */

var src = new EventSource('/api/colors/change-stream?_format=event-source');
var changes = createChangeStream(src);
var set;

Color.find().$promise.then(function(results) {
  set = new LiveSet(results, changes);
  $scope.colors = set.toLiveArray();
});

$scope.Color = Color;
$scope.newColor = 'red';

$scope.createColor = function() {
  Color.create({val: $scope.newColor, votes: 0});
  $scope.newColor = '';
}

$scope.upvote = function(id) {
  Color.upvote({id: id});
}
