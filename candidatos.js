angular.module('ghr.candidatos', []) //Creamos este modulo para la entidad candidatos
    .component('ghrCandidatos', { //Componente que contiene la url que indica su html
        templateUrl: '../bower_components/component-candidatos/candidatos.html',
        controller() { //El controlador de ghrCandidatos tiene las funciones de reset y de copiar a un objeto "master"
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
    .component('ghrCandidatosList', { //Componente para el listado de los candidatos
        templateUrl: '../bower_components/component-candidatos/candidatos-list.html', //url con el html respectivo
        controller($filter, $uibModal, $log, $document) { //Controlador cuyo contenido será el filtro y el modal
            const vm = this;
            vm.busqueda = "";
            //Hacemos la llamada a la funcion para generar candidatos aleatorios y los recogemos en un array
            vm.bolsaCandidatos = generadorCandidatos(400);
            //Metemos todos los candidatos generados en esta nueva variable que será la que vayamos filtrando en la busqueda
            vm.candidatosFiltrados = vm.bolsaCandidatos;
            //Creamos esta variable para saber la cantidad de candidatos que nos ha creado y poder recorrer el array
            vm.elementosTotales = vm.bolsaCandidatos.length;
            vm.actualizarArray = function() { //Funcion que actualiza la lista de los candidatos con el filtro introducido
                vm.candidatosFiltrados = vm.bolsaCandidatos;
                for (var i = 0; i < vm.busqueda.length; i++)
                    vm.candidatosFiltrados = $filter('filter')(vm.candidatosFiltrados, vm.busqueda[i]);
                vm.elementosTotales = vm.candidatosFiltrados.length;
            }
            //Estas dos variables nos sirven para el paginado, una dice la pagina actual
            //y otra el tamaño maximo de candidatos por pantalla
            vm.paginaActual = 1;
            vm.totalPantalla = 10;

            // Modal
            vm.open = function(id) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    component: 'modalComponent',
                    resolve: {
                        seleccionado: function() {
                            return id; //Del candidato seleccionado en ese momento, devolvemos su id correspondiente
                        }
                    }
                });

                //En esta funcion pasamos por parametro el candidato seleccionado en cuestion
                //Aqui lo que haremos será recorrer el array de candidatos y al encontrar el candidato en concreto que coincida
                //con la id que le pasamos lo borramos con el metodo splice y despues llamamos a la funcion actualizarArray
                //para que nos actualice la lista y nos elimine de la lista el candidato borrado
                modalInstance.result.then(function(objetoSeleccionado) {
                    vm.selected = objetoSeleccionado;
                    var candidatoAEliminar;
                    for (var i = 0; i < vm.bolsaCandidatos.length; i++)
                        if (vm.bolsaCandidatos[i].id === objetoSeleccionado)
                            candidatoAEliminar = vm.bolsaCandidatos[i];
                    vm.bolsaCandidatos.splice(vm.bolsaCandidatos.indexOf(candidatoAEliminar), 1);
                    vm.actualizarArray();
                }, function() {
                    $log.info('modal-component dismissed at: ' + new Date());//Comentario en consola para ver que todo ejecuta correctamente
                });
            };
        }
    })
    //El componente del modal, la ventana de confirmacion que nos va a aparecer al intentar borrar un candidato
    //Contiene su url, el resolve, que será un one way binding que almacene el candidato
    //Y tanto close como dismiss pasará directamente los métodos al componente
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
            vm.ok = function(seleccionado) { //Este metodo nos sirve para marcar el candidato que se ha seleccionado
                vm.close({
                    $value: seleccionado
                });
            };
            vm.cancel = function() { //Este metodo cancela la operacion
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
