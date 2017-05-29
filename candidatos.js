angular.module('ghr.candidatos', []) //Creamos este modulo para la entidad candidatos
    .component('ghrCandidatos', { //Componente que contiene la url que indica su html
        templateUrl: '../bower_components/component-candidatos/candidatos.html',
        // El controlador de ghrCandidatos tiene las funciones de reset y de copiar a un objeto "master"
        controller(candidatoFactory, $log, $stateParams, $state) {
            const vm = this;

            /**
             * Al iniciar
             * @return {[type]} [description]
             */
            vm.$onInit = function() {
                if ($stateParams.id == 0)
                    vm.candidato = {}
            }

            /**
             * Actualiza o crea un nuevo candidato
             * @param  {[type]} candidato  [description]
             * @param  {[type]} formulario [description]
             * @return {[type]}            [description]
             */
            vm.updateOrCreate = function(candidato, formulario) {
                if (formulario.$valid) {
                    if ($stateParams.id != 0) {
                        for (var campo in formulario.$$controls) {
                            if (campo.$dirty)
                                candidato[campo.$name] = campo.$modelValue;
                        }
                        candidatoFactory.update(candidato.id, candidato).then(
                            function(response) {
                                vm.candidato = vm.formatearFecha(response);
                            }
                        );
                    } else {
                        candidatoFactory.create(candidato).then(
                            function(response) {
                                delete vm.candidato.id;
                                $state.go($state.current, {
                                    id: response.id
                                });
                            }
                        );
                    }
                }
            };
            vm.reset = function() {
                vm.candidato = angular.copy(vm.original);
            };
            vm.reset();

            if ($stateParams.id != 0) {
                candidatoFactory.read($stateParams.id).then(
                    function(response) {
                        vm.original = angular.copy(vm.candidato = vm.formatearFecha(response));
                    }
                );
            }

            /**
             * Formatea la fecha recivida del servidor
             * @param  {[type]} response [description]
             * @return {[type]}          [description]
             */
            vm.formatearFecha = function formatearFecha(response) {
                response.fecha_entrevista = new Date(response.fecha_entrevista);
                response.fecha_contacto = new Date(response.fecha_contacto);
                response.fecha_actualizado = new Date(response.fecha_actualizado);
                return response;
            }

            /**
             * Inicializa las ociones de los desplegables
             * @return {[type]} [description]
             */
            vm.desplegar = function() {
                vm.opcionesDesplegable = [{
                        disp_viajar: 'Indeterminado',
                        disp_residencia: 'Indeterminado',
                        estado: 'En Proceso'
                    },
                    {
                        disp_viajar: 'Sí',
                        disp_residencia: 'Sí',
                        estado: 'Descartado'
                    },
                    {
                        disp_viajar: 'No',
                        disp_residencia: 'No',
                        estado: 'Incorporación'
                    }
                ];
                vm.selectEstado = vm.opcionesDesplegable[0];

                vm.setViajar = function(disp_viajar) {
                    vm.candidato.disp_viajar = disp_viajar;
                };
                vm.setResidencia = function(disp_residencia) {
                    vm.candidato.disp_residencia = disp_residencia;
                };
                vm.setEstado = function(estado) {
                    vm.candidato.estado = estado;
                };
            };
            vm.desplegar();
        }
    })
    .constant('canBaseUrl', 'http://localhost:3003/api/')
    .constant('canEntidad', 'candidatos')
    .factory('candidatoFactory', function($filter, $http, canBaseUrl, canEntidad) {

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
                return $http({
                    method: 'POST',
                    url: serviceUrl,
                    data: candidato
                }).then(function onSuccess(response) {
                    return response.data;
                });
            },
            // Devuelve una copia del candidato con la id pasada
            read: function _read(id) {
                return $http({
                    method: 'GET',
                    url: serviceUrl + '/' + id
                }).then(function onSuccess(response) {
                    return response.data;
                });
            },
            // Actualiza un candidato
            update: function _update(id, candidato) {
                return $http({
                    method: 'PATCH',
                    url: serviceUrl + '/' + id,
                    data: candidato
                }).then(function onSuccess(response) {
                    return response.data;
                });
            },
            // Borra un candidato
            delete: function _delete(id) {
                return $http({
                    method: 'DELETE',
                    url: serviceUrl + '/' + id
                }).then(function onSuccess(response) {
                    return response.data;
                });
            }
        };
    })
    .component('ghrCandidatosList', { //Componente para el listado de los candidatos
        templateUrl: '../bower_components/component-candidatos/candidatos-list.html',
        controller($filter, $uibModal, $log, $document, candidatoFactory, $state) { //Controlador cuyo contenido será el filtro y el modal
            const vm = this;
            vm.busqueda = "";

            candidatoFactory.getAll().then(
                function onSuccess(response) {
                    vm.bolsaCandidatos = response;
                    vm.candidatosFiltrados = vm.bolsaCandidatos;
                    vm.elementosTotales = vm.bolsaCandidatos.length;
                }
            );
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

                modalInstance.result.then(function(id) {
                    candidatoFactory.delete(id).then(function() {
                        candidatoFactory.getAll().then(function(response) {
                            vm.bolsaCandidatos = response;
                            vm.actualizarArray();
                        });
                    });
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
