(function() {
var <%= module.jsName %>;


try {
  <%= module.jsName %> = angular.module('<%= module.namespace %>');
} catch(e) {
  // ignore...
}

if(!<%= module.jsName %>) {
  <%= module.jsName %> = angular.module('<%= module.namespace %>', <%= JSON.stringify(module.dependencies) %>)
}

<%= module.jsName %>
<% if(module.type !== 'module') { %>
.<%= module.type %>('<%= module.name %>',
function(<%= module.inject %>) {
<%= module.src %>
})
<% } %>;

<%= module.jsName %>.$inject = <%= JSON.stringify(module.inject) %>;
})();
