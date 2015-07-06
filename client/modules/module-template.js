(function() {
var <%= module.jsName %> = angular
.module('<%= module.namespace %>')
.<%= module.type %>('<%= module.name %>',
function(<%= module.inject %>) {

<%= module.src %>

}
);

<%= module.jsName %>.$inject = <%= JSON.stringify(module.inject) %>;
})();
