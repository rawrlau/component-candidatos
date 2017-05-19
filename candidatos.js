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
        controller($filter) {
            const vm = this;
            vm.busqueda = "";
            vm.bolsaCandidatos = generadorCandidatos(400);
            vm.candidatosFiltrados = vm.bolsaCandidatos;
            vm.totalItems = vm.bolsaCandidatos.length;
            vm.actualizarArray = function() {
                vm.candidatosFiltrados = $filter('filter')(vm.bolsaCandidatos, vm.busqueda);
                vm.totalItems = vm.candidatosFiltrados.length;
            }
            vm.currentPage = 1;
            vm.setPage = function(pageNo) {
                vm.currentPage = pageNo;
            };
            vm.maxSize = 10;
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
function candidatoAleatorio() {
    var candidato = {
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
        array.push(candidatoAleatorio());
    }
    return array;
}
