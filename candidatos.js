angular.module('ghr.candidatos', ['toastr', 'ghr.contactos'])
    .component('ghrCandidatos', { // Componente de formulario candidatos
        templateUrl: '../bower_components/component-candidatos/candidatos.html',
        controller(toastr, candidatoFactory, $log, $stateParams, $state, requisitosFactory, caracteristicasFactory) {
            const vm = this;
            vm.mode = $stateParams.mode;

            /**
             * Cambia al modo entre view y edit
             * @return {[type]} [description]
             */
            vm.changeMode = function() {
                var modo;
                if ($stateParams.mode == 'view') modo = 'edit'
                else modo = 'view'
                $state.go($state.current, {
                    mode: modo
                });
                vm.mode = $stateParams.mode;
            }

            /**
             * Al iniciar, si el parámetro id es cero crea un candidato vacío
             * @return {[type]} [description]
             */
            vm.$onInit = function() {
                if ($stateParams.id == 0)
                    vm.candidato = {}
            }

            /**
             * Crea una copia del canditao en un nuevo objeto para
             * ser recuperado en caso de descartar cambios
             * @return {[type]} [description]
             */
            vm.setOriginal = function(data) {
                vm.original = angular.copy(vm.candidato = vm.formatearFecha(data));
            }

            /**
             * Descartar cambios
             * @return {[type]} [description]
             */
            vm.reset = function() {
                vm.candidato = angular.copy(vm.original);
            };
            vm.reset();

            /**
             * Actualiza o crea un nuevo candidato
             * @param  {[type]} candidato  [description]
             * @param  {[type]} formulario [description]
             * @return {[type]}            [description]
             */
            vm.updateOrCreate = function(candidato, formulario, formContacto, formRequisitos, nombreRequisito, nivelRequisito) {
                if (formulario.$valid) {
                    // Update
                    if ($stateParams.id != 0) {
                        var candidatoModificado = {}
                        for (var i = 0; i < formulario.$$controls.length; i++) {
                            var input = formulario.$$controls[i];
                            if (input.$dirty)
                                candidatoModificado[input.$name] = input.$modelValue;
                        }
                        if (formulario.$dirty || formRequisitos.$dirty) {
                            candidatoFactory.update(candidato.id, candidatoModificado).then(
                                function onSuccess(response) {
                                    vm.setOriginal(response);
                                    toastr.success('El candidato se ha actualizado correctamente.');
                                },
                                function onFailure() {
                                    toastr.error('No se ha podido realizar la operacion, por favor compruebe su conexion a internet e intentelo más tarde.');
                                }
                            );
                        //  if (formRequisitos.$dirty){
                            nombreRequisito = formRequisitos.nombre.$viewValue;
                            nivelRequisito = formRequisitos.nivel.$viewValue;
                            vm.crearRequisito = function (nombreRequisito, nivelRequisito, candidato) {
                              caracteristicasFactory.getAll().then(function onSuccess(response) {
                                vm.objetoRequisito = {
                                  caracteristicaId: sacarCaracteristicaId(),
                                  nivel: nivelRequisito,
                                  listaDeRequisitoId: candidato.listaDeRequisitoId
                                };
                                function sacarCaracteristicaId() {
                                  for (var i = 0; i < response.length; i++) {
                                    if (response[i].nombre == nombreRequisito) {
                                      return response[i].id;
                                    }
                                  }
                                }
                                console.log(vm.objetoRequisito);
                               requisitosFactory.create(candidato.listaDeRequisitoId, vm.objetoRequisito);
                                toastr.success('El requisito se ha creado correctamente.');
                                $state.go($state.current, {
                                  mode: 'view'
                                });
                              });
                            };
                            vm.crearRequisito(nombreRequisito, nivelRequisito, candidato);
                          // } else
                          // toastr.error('No se ha podido realizar la operacion, por favor compruebe su conexion a internet e intentelo más tarde.');
                        }
                        if (!formulario.$dirty && !formRequisitos.$dirty){
                          $state.go($state.current, {
                              id: $stateParams.id,
                              mode: 'view'
                          });
                          toastr.info('No se ha modificado nada', 'Info');
                        }
                    }
                    // Create
                    else {
                        candidatoFactory.create(candidato).then(
                            function onSuccess(response) {
                                delete vm.candidato.id;
                                $state.go($state.current, {
                                    id: response.id,
                                    mode: 'view'
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

            // Ver candidato
            if ($stateParams.id != 0) {
                candidatoFactory.read($stateParams.id).then(
                    function onSuccess(response) {
                        vm.setOriginal(response);
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
                        disp_viajar: 'I',
                        disp_residencia: 'I',
                        estado: 'En Proceso'
                    },
                    {
                        disp_viajar: 'S',
                        disp_residencia: 'S',
                        estado: 'Descartado'
                    },
                    {
                        disp_viajar: 'N',
                        disp_residencia: 'N',
                        estado: 'Incorporación'
                    }
                ];
                vm.selectEstado = vm.opcionesDesplegable[0];
            };
            vm.desplegar();

            vm.formatearDesplegable = function(opcion) {
                if (opcion == 'I')
                    return 'Indeterminado';
                else if (opcion == 'S')
                    return 'Sí';
                else if (opcion == 'N')
                    return 'No';
            }

            /**
             * Setea el atributo $disty del formulario y
             * del input pasado por parámetro a true
             * @param  {[type]} formulario [description]
             * @param  {[type]} input      [description]
             * @return {[type]}            [description]
             */
            vm.setDirty = function(formulario, input) {
                input.$dirty = true;
                formulario.$dirty = true;
            }
        }
    })
    .constant('canBaseUrl', 'http://localhost:3003/api/')
    .constant('canEntidad', 'candidatos')
    .factory('candidatoFactory', function($q, $filter, $http, canBaseUrl, canEntidad, toastr) {

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
            getAll: function _getAll(includeRequisitos) {
                return $http({
                    method: 'GET',
                    url: serviceUrl
                }).then(function onSuccess(response) {
                    if (!includeRequisitos) {
                        return response.data;
                    } else {
                        var promises = []
                        angular.forEach(response.data, function(elem) {
                            var candidato = elem;
                            console.log('candidato', candidato);
                            var peticionRequisitos = $http({
                                method: 'GET',
                                url: [
                                    canBaseUrl,
                                    'listaDeRequisitos/',
                                    candidato.listaDeRequisitoId,
                                    '/requisitos'
                                ].join(''),
                                params: {
                                    filter: {
                                        "include": "caracteristica"
                                    }
                                }
                            }).then(function onSuccess(requisitosCandidato) {
                                candidato.listaDeRequisito = requisitosCandidato.data;
                                return candidato;
                            }, function onFailure(reason) {
                                return candidato;
                            })
                            promises.push(peticionRequisitos)
                        });
                        return $q.all(promises);
                    }
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
            read: function _read(id, includeRequisitos) {
                return $http({
                    method: 'GET',
                    url: serviceUrl + '/' + id
                }).then(function onSuccess(response) {
                    if (!includeRequisitos) {
                        return response.data;
                    } else {
                        return $http({
                            method: 'GET',
                            url: [canBaseUrl, 'listaDeRequisitos/', response.data.listaDeRequisitoId, '/requisitos'].join(''),
                            params: {
                                filter: {
                                    "include": "caracteristica"
                                }
                            }
                        }).then(function onSuccess(responseRequisitos) {
                                response.data.listaDeRequisito = responseRequisitos.data;
                                return response.data;
                            },
                            function onFailure(reason) {
                                return response.data;
                            }
                        )
                    }

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
