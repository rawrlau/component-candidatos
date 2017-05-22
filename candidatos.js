angular.module('ghr.candidatos', [])
    .component('ghrCandidatos', {
        templateUrl: '../bower_components/component-candidatos/candidatos.html',
        controller() {
            const vm = this;
            vm.master = {};
            vm.update = function(user) {
                vm.master = angular.copy(user);
            };
            vm.reset = function() {
                vm.user = angular.copy(vm.master);
            };
            vm.reset();
        }
    })
    .component('ghrCandidatosList', {
        templateUrl: '../bower_components/component-candidatos/candidatos-list.html',
        controller($filter, $uibModal, $log, $document) {
            const vm = this;
            vm.busqueda = "";
            vm.bolsaCandidatos = generadorCandidatos(400);
            vm.candidatosFiltrados = vm.bolsaCandidatos;
            vm.totalItems = vm.bolsaCandidatos.length;
            vm.actualizarArray = function() {
                vm.candidatosFiltrados = vm.bolsaCandidatos;
                for (var i = 0; i < vm.busqueda.length; i++)
                    vm.candidatosFiltrados = $filter('filter')(vm.candidatosFiltrados, vm.busqueda[i]);
                vm.totalItems = vm.candidatosFiltrados.length;
            }
            vm.currentPage = 1;
            vm.maxSize = 10;

            // Modal
            vm.open = function(id) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    component: 'modalComponent',
                    resolve: {
                        seleccionado: function() {
                            return id;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    vm.selected = selectedItem;
                    var candidatoAEliminar;
                    for (var i = 0; i < vm.bolsaCandidatos.length; i++)
                        if (vm.bolsaCandidatos[i].id === selectedItem)
                            candidatoAEliminar = vm.bolsaCandidatos[i];
                    vm.bolsaCandidatos.splice(vm.bolsaCandidatos.indexOf(candidatoAEliminar), 1);
                    vm.actualizarArray();
                }, function() {
                    $log.info('modal-component dismissed at: ' + new Date());
                });
            };
        }
    })
    .component('modalComponent', {
        templateUrl: '../bower_components/component-candidatos/myModalContent.html',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&'
        },
        controller: function() {
            const vm = this;
            vm.$onInit = function() {
                vm.selected = vm.resolve.seleccionado;
            };
            vm.ok = function(seleccionado) {
                vm.close({
                    $value: seleccionado
                });
            };
            vm.cancel = function() {
                vm.dismiss({
                    $value: 'cancel'
                });
            };
        }
    })
    .run($log => {
        $log.log('Ejecutando Componente Candidatos');
    });


/**
 * Genera un número aleatorio entre 0 y "max"
 * con una distribucion linear
 * @param  {int} max    número máximo +1 del rango
 * @return {int}        número aleatorio devuelto
 */
function linearGenerator(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// Arrays
var nombre = ['Hector', 'Adrián', 'Dani', 'Miguel', 'Alex', 'Rodrigo', 'Marta', 'Alejandro', 'Alvaro', 'Luis'];
var provincia = ['Madrid', 'Cáceres', 'Barcelona', 'Valencia', 'Badajoz', 'Sevilla', 'Galicia', 'Zaragoza', 'Mordor'];
var perfil = ['Analista', 'Programador', 'Diseñador'];
var expect_contractual = ['Jefe', 'CEO', 'Administrativo', 'Programador', 'Diseñador', 'Becario'];
var feedback_sourcing = ['HB', 'FS', 'GR', 'TD'];
var tec_seleccion = ['Poco', 'Medio', 'Alto'];

/**
 * Devuelve un candidato con campos aleatorios
 * @return {object} candidato aletorio devuelto
 */
function candidatoAleatorio(id) {
    var candidato = {
        id: id,
        nombre: nombre[linearGenerator(0, nombre.length)],
        provincia: provincia[linearGenerator(0, provincia.length)],
        perfil: perfil[linearGenerator(0, perfil.length)],
        expect_contractual: expect_contractual[linearGenerator(0, expect_contractual.length)],
        expect_economica: linearGenerator(0, 4000),
        feedback_sourcing: feedback_sourcing[linearGenerator(0, feedback_sourcing.length)],
        tec_seleccion: tec_seleccion[linearGenerator(0, tec_seleccion.length)]
    };
    return candidato;
}

/**
 * Genera una cantidad de candidatos pasada por parámetro
 * @param  {[type]} amount [description]
 * @return {[type]}        [description]
 */
function generadorCandidatos(amount) {
    var array = [];
    for (var i = 0; i < amount; i++) {
        array.push(candidatoAleatorio(i));
    }
    return array;
}
