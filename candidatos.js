angular.module('ghr.candidatos', [])
  .component('ghrCandidatos', {
    templateUrl: '../bower_components/component-candidatos/candidatos.html',
    controller() {
      const vm = this;
      vm.master = {};
      vm.update = function (user) {
        vm.master = angular.copy(user);
      };
      vm.reset = function () {
        vm.user = angular.copy(vm.master);
      };
      vm.reset();
    }
  }).run($log => {
    $log.log('Ejecutando Componente Candidatos');
  });
