angular.module('ghr.candidatos', []) //Creamos este modulo para la entidad candidatos
    .component('ghrCandidatos', { //Componente que contiene la url que indica su html
        templateUrl: '../bower_components/component-candidatos/candidatos.html',
        // El controlador de ghrCandidatos tiene las funciones de reset y de copiar a un objeto "master"
        controller(candidatoFactory, $log, $stateParams, $state) {
            const vm = this;

            vm.$onInit = function() {
                if ($stateParams.id == 0)
                    vm.candidato = {}
            }

            vm.updateOrCreate = function(candidato, formulario) {
                console.log(candidato);
                if (formulario.$valid) {
                    if ($stateParams.id != 0)
                        vm.candidato = candidatoFactory.update(candidato);
                    else {
                        vm.candidato = candidatoFactory.create(candidato);
                        $state.go($state.current, {
                            id: candidato.id
                        });
                    }
                }
            };
            vm.reset = function() {
                vm.candidato = angular.copy(vm.original);
            };
            vm.reset();

            if ($stateParams.id != 0)
                vm.original = angular.copy(vm.candidato = candidatoFactory.read($stateParams.id));

            vm.desplegable = function() {
                vm.estados = [{
                        id: 1,
                        name: 'En Proceso'
                    },
                    {
                        id: 2,
                        name: 'Descartado'
                    },
                    {
                        id: 3,
                        name: 'Incorporacion'
                    }
                ];
                vm.selectEstado = vm.estados[0];

                vm.setEstado = function(estado) {
                    vm.candidato.estado = estado;
                };
            };
            vm.desplegable();
        }
    })
    .constant('canBaseUrl', 'http://localhost:3003/api/')
    .constant('canEntidad', 'candidatos')
    .factory('candidatoFactory', function($filter, $http, canBaseUrl, canEntidad) {
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
        var apellido = ['Martín', 'Alonso', 'Tizón', 'Espinoza', 'Monzón', 'Minguez', 'Moreno', 'Ortiz', 'Fernández'];
        var perfil = ['Analista', 'Programador', 'Diseñador'];
        var provincia = ['Madrid', 'Cáceres', 'Barcelona', 'Valencia', 'Badajoz', 'Sevilla', 'Galicia', 'Zaragoza', 'Cuenca'];
        var posicion = ['Arriba', 'Abajo', 'Pal centro', 'Pa dentro'];
        var experiencia = ['días', 'meses', 'años'];
        var disp_viajar = ['S', 'N'];
        var disp_residencia = ['S', 'N'];
        var disp_incorporacion = ['Ahora no', 'Inmediata', 'A medio plazo'];
        var expect_contractual = ['Jefe', 'CEO', 'Administrativo', 'Programador', 'Diseñador', 'Becario'];
        var feedback_sourcing = ['HB', 'FS', 'GR', 'TD'];
        var feedback_tecnico = ['DI', 'TI', 'PO', 'LA'];
        var tec_seleccion = ['Ancceloti', 'Zidane', 'Simeone'];
        var referenciado = ['Don Juan', 'Mr. Apolo'];
        var estado = ['En proceso', 'Descartado', 'Incorporación'];

        /**
         * Devuelve un candidato con campos aleatorios
         * @return {object} candidato aletorio devuelto
         */
        function candidatoAleatorio(id) {
            var candidato = {
                id: id,
                nombre: nombre[linearGenerator(0, nombre.length)],
                apellido: apellido[linearGenerator(0, apellido.length)],
                perfil: perfil[linearGenerator(0, perfil.length)],
                provincia: provincia[linearGenerator(0, provincia.length)],
                posicion: posicion[linearGenerator(0, posicion.length)],
                experiencia: linearGenerator(0, 20) + ' ' + experiencia[linearGenerator(0, experiencia.length)],
                disp_viajar: disp_viajar[linearGenerator(0, disp_viajar.length)],
                disp_residencia: disp_residencia[linearGenerator(0, disp_residencia.length)],
                disp_incorporacion: disp_incorporacion[linearGenerator(0, disp_incorporacion.length)],
                expect_contractual: expect_contractual[linearGenerator(0, expect_contractual.length)],
                expect_economica: linearGenerator(0, 4000),
                fecha_entrevista: new Date(new Date().getTime() - linearGenerator(0, 999999999999)),
                feedback_sourcing: feedback_sourcing[linearGenerator(0, feedback_sourcing.length)],
                feedback_tecnico: feedback_tecnico[linearGenerator(0, feedback_tecnico.length)],
                tec_seleccion: tec_seleccion[linearGenerator(0, tec_seleccion.length)],
                referenciado: referenciado[linearGenerator(0, referenciado.length)],
                estado: estado[linearGenerator(0, estado.length)],
                fecha_contacto: new Date(new Date().getTime() - linearGenerator(0, 999999999999)),
                fecha_actualizado: new Date(new Date().getTime() - linearGenerator(0, 999999999999)),
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
            for (var i = 0; i < amount; i++)
                array.push(candidatoAleatorio(i + 1));
            return array;
        }

        /**
         * Devuelve la referencia de un candidato
         * @param       {[type]} id [description]
         * @constructor
         * @return      {[type]}    [description]
         */
        function _getReferenceById(id) {
            var candidato;
            for (var i = 0; i < arrayCandidatos.length || candidato === undefined; i++)
                if (arrayCandidatos[i].id == id)
                    candidato = arrayCandidatos[i];
            return candidato;
        }

        /**
         * Devuelve el índice en el arrayCandidatos de un candidato
         * @param       {[type]} id [description]
         * @constructor
         * @return      {[type]}    [description]
         */
        function _getIndexById(id) {
            return arrayCandidatos.indexOf(_getReferenceById(id));
        }

        /**
         * Devuelve el id máximo del array
         * @constructor
         * @return      {[type]} [description]
         */
        function _mockId() {
            var orderedById = $filter('orderBy')(arrayCandidatos, '-id');
            return orderedById[0].id + 1;
        }

        var arrayCandidatos = generadorCandidatos(400);

        var serviceUrl = canBaseUrl + canEntidad;
        return {
            // Devuelve una copia del arrayCandidatos
            getAll: function _getAll() {
                return $http({
                    method: 'GET',
                    url: serviceUrl
                }).then(function onSuccess(response) {
                    return response.data;
                });
            },
            // Crea un nuevo candidato
            create: function _create(candidato) {
                if (!candidato)
                    throw 'El objeto carece de id y no se puede crear: ' + JSON.stringify(candidato);
                else {
                    candidato.id = _mockId();
                    arrayCandidatos.push(candidato);
                    return candidato;
                }
                throw 'El objeto no se puede crear: ' + JSON.stringify(candidato);
            },
            // Devuelve una copia del candidato con la id pasada
            read: function _read(id) {
                return angular.copy(_getReferenceById(id));
            },
            // Actualiza un candidato
            update: function _update(candidato) {
                if (!candidato.id)
                    throw 'El objeto carece de id y no se puede actualizar: ' + JSON.stringify(candidato);
                if (candidato) {
                    var newCandidato = arrayCandidatos[_getIndexById(candidato.id)] = angular.copy(candidato);
                    return angular.copy(newCandidato);
                }
                throw 'El objeto no se puede actualizar: ' + JSON.stringify(candidato);
            },
            // Borra un candidato
            delete: function _delete(candidato) {
                if (!candidato.id || candidato.id)
                    throw canEntidad + ' inválida'
                oldCandidato = _getReferenceById(candidato.id);
                if (oldCandidato) {
                    var indice = _getIndexById(candidato.id);
                    if (indice > -1)
                        arrayCandidatos.splice(indice, 1);
                    else
                        throw 'El objeto no se puede borrar: ' + JSON.stringify(candidato);
                }
            }
        };
    })
    .component('ghrCandidatosList', { //Componente para el listado de los candidatos
        templateUrl: '../bower_components/component-candidatos/candidatos-list.html',
        //url con el html respectivo
        controller($filter, $uibModal, $log, $document, candidatoFactory, $state) { //Controlador cuyo contenido será el filtro y el modal
            const vm = this;
            vm.busqueda = "";
            // Lo igualamos con el factory
            candidatoFactory.getAll().then(function onSuccess(response) {
                vm.bolsaCandidatos = response;
                //Metemos todos los candidatos generados en esta nueva variable que será la que vayamos filtrando en la busqueda
                vm.candidatosFiltrados = vm.bolsaCandidatos;
                //Creamos esta variable para saber la cantidad de candidatos que nos ha creado y poder recorrer el array
                vm.elementosTotales = vm.bolsaCandidatos.length;
            });
            vm.actualizarArray = function() { //Funcion que actualiza la lista de los candidatos con el filtro introducido
                vm.candidatosFiltrados = candidatoFactory.getAll();
                for (var i = 0; i < vm.busqueda.length; i++)
                    vm.candidatosFiltrados = $filter('filter')(vm.candidatosFiltrados, vm.busqueda[i]);
                vm.elementosTotales = vm.candidatosFiltrados.length;
            }
            //Estas dos variables nos sirven para el paginado, una dice la pagina actual
            //y otra el tamaño maximo de candidatos por pantalla
            vm.paginaActual = 1;
            vm.totalPantalla = 10;

            vm.state = $state;

            // Ventana Modal
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
                    candidatoFactory.delete(candidatoFactory.read(vm.selected));
                    vm.actualizarArray();
                }, function() {
                    $log.info('modal-component dismissed at: ' + new Date()); //Comentario en consola para ver que todo ejecuta correctamente
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
