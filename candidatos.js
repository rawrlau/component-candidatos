angular.module('ghr.candidatos', ['toastr'])
    .component('ghrCandidatos', { // Componente de formulario candidatos
        templateUrl: '../bower_components/component-candidatos/candidatos.html',
        controller(toastr, candidatoFactory, $log, $stateParams, $state) {
            const vm = this;

            /**
             * Al iniciar, si el parámetro id es cero crea un candidato vacío
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
                    // Update
                    if ($stateParams.id != 0) {
                        var candidatoModificado = {}
                        for (var i = 0; i < formulario.$$controls.length; i++) {
                            var input = formulario.$$controls[i];
                            if (input.$dirty)
                                candidatoModificado[input.$name] = input.$modelValue;
                        }
                        if (formulario.$dirty) {
                            candidatoFactory.update(candidato.id, candidatoModificado).then(
                                function onSuccess(response) {
                                    vm.candidato = vm.formatearFecha(response);
                                    console.log(candidatoModificado);
                                    toastr.success('El candidato se ha actualizado correctamente.');
                                },
                                function onFailure() {
                                    toastr.error('No se ha podido realizar la operacion, por favor compruebe su conexion a internet e intentelo más tarde.');
                                }
                            );
                        } else
                            toastr.info('No hay nada que modificar', 'Info');
                    }
                    // Create
                    else {
                        candidatoFactory.create(candidato).then(
                            function onSuccess(response) {
                                delete vm.candidato.id;
                                $state.go($state.current, {
                                    id: response.id
                                });
                                toastr.success('Candidato creado correctamente');
                            },
                            function onFailure() {
                                toastr.error('No se ha podido realizar la operacion, por favor compruebe su conexion a internet e intentelo más tarde.');
                            }
                        );
                    }
                }
            };

            // Descatar cambios
            vm.reset = function() {
                vm.candidato = angular.copy(vm.original);
            };
            vm.reset();

            // Ver candidato
            if ($stateParams.id != 0) {
                candidatoFactory.read($stateParams.id).then(
                    function onSuccess(response) {
                        vm.original = angular.copy(vm.candidato = vm.formatearFecha(response));
                    },
                    function onFailure() {
                        toastr.error('No se ha podido realizar la operacion, por favor compruebe su conexion a internet e intentelo más tarde.');
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

                vm.setViajar = function(disp_viajar, formulario) {
                    vm.candidato.disp_viajar = disp_viajar;
                    formulario.$dirty = true;
                };
                vm.setResidencia = function(disp_residencia, formulario) {
                    vm.candidato.disp_residencia = disp_residencia;
                    formulario.$dirty = true;
                };
                vm.setEstado = function(estado, formulario) {
                    vm.candidato.estado = estado;
                    formulario.$dirty = true;
                };
            };
            vm.desplegar();
        }
    })
    .constant('canBaseUrl', 'http://localhost:3003/api/')
    .constant('canEntidad', 'candidatos')
    .factory('candidatoFactory', function($filter, $http, canBaseUrl, canEntidad, toastr) {

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

        var serviceUrl = canBaseUrl + canEntidad;
        return {
            // Devuelve un array con todos los candidatos
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
            // Lee un candidato
            read: function _read(id) {
                return $http({
                    method: 'GET',
                    url: serviceUrl + '/' + id
                }).then(function onSuccess(response) {
                    return response.data;
                });
            },
            // Actualiza un candidato
            update: function _update(id, candidatoModificado) {
                return $http({
                    method: 'PATCH',
                    url: serviceUrl + '/' + id,
                    data: candidatoModificado
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
    .config(function(toastrConfig) { // Configura los toastr
        angular.extend(toastrConfig, {
            closeButton: true,
            extendedTimeOut: 2000,
            tapToDismiss: true,
        });
    })
    .component('ghrCandidatosList', { // Componente para el listado de los candidatos
        templateUrl: '../bower_components/component-candidatos/candidatos-list.html',
        controller($filter, $uibModal, $log, $document, candidatoFactory, $state, toastr) {
            const vm = this;
            vm.busqueda = "";

            // Actualiza el array de candidatos
            candidatoFactory.getAll().then(
                function onSuccess(response) {
                    vm.bolsaCandidatos = response;
                    vm.candidatosFiltrados = vm.bolsaCandidatos;
                    vm.elementosTotales = vm.bolsaCandidatos.length;
                }
            );
            // Funcion que actualiza la lista de los candidatos con el filtro introducido
            vm.actualizarArray = function() {
                vm.candidatosFiltrados = vm.bolsaCandidatos;
                for (var i = 0; i < vm.busqueda.length; i++)
                    vm.candidatosFiltrados = $filter('filter')(vm.candidatosFiltrados, vm.busqueda[i]);
                vm.elementosTotales = vm.candidatosFiltrados.length;
            }

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
                            return id;
                        }
                    }
                });

                modalInstance.result.then(function(id) {
                    candidatoFactory.delete(id).then(
                        function onSuccess() {
                            candidatoFactory.getAll().then(function(response) {
                                vm.bolsaCandidatos = response;
                                vm.actualizarArray();
                                toastr.success('Candidato borrado correctamente');
                            });
                        },
                        function onFailure() {
                            toastr.error('No se ha podido realizar la operacion, por favor compruebe su conexion a internet e intentelo más tarde.');
                        }
                    );
                }, function() {
                    $log.info('modal-component dismissed at: ' + new Date());
                });
            };
        }
    })
    .component('modalComponent', { // El componente del modal
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
