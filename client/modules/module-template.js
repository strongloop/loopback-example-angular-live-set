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
