// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: angular-live-set-example
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

(function() {
var module;


try {
  module = angular.module('<%= module.name %>');
} catch(e) {
  // ignore...
}

if(!module) {
  module = angular.module('<%= module.name %>', <%= JSON.stringify(module.dependencies) %>)
}

module
<% if(module.type !== 'module') { %>
.<%= module.type %>('<%= module.jsName %>', <%= module.jsName %>)
<% } %>;

<%= module.jsName %>.$inject = <%= JSON.stringify(module.inject) %>;

function <%= module.jsName %>(<%= module.inject %>) {

<%= module.src %>

}

})();
