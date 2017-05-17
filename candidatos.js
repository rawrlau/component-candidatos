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
  })
  .component('ghrCandidatosList', {
    templateUrl: '../bower_components/component-candidatos/candidatos-list.html',
    controller(){
      const vm = this;
      vm.candidatosGenerados = muchosCandidatos(10);
    }
  })
  .run($log => {
    $log.log('Ejecutando Componente Candidatos');
  });

  // Arrays
  var nombre = ['Hector', 'Adrián', 'Dani', 'Miguel', 'Alex', 'Rodrigo', 'Marta', 'Alejandro', 'Álvaro', 'Luis'];
  var provincia = ['Madrid', 'Barcelona', 'Malaga', 'Sevilla', 'Lugo'];
  var perfil = ['Programador', 'Disenador', 'Analista', 'Jefe de proyecto'];
  var expect_economica = [600, 800, 1200, 1400, 1600, 1800, 2000];
  var expect_contractual = ['Jefe', 'Becario', 'CEO', 'Administrativo'];
  var feedback_sourcing = ['Mal', 'Regular', 'Bien', 'Muy bien', 'Estupendo'];
  var tec_seleccion = ['Yo', 'Tu', 'El', 'Ella', 'Nosotros', 'Vosotros', 'Ellos', 'Ellas'];

  function generadorNumeroAleatorio (max) {
    var numeroRandom = Math.floor(Math.random() * max); //Generamos numero aleatorio
    return numeroRandom; //Devolvemos numero
  }

  //Funcion para generar de manera aleatoria, a traves de los arrays de arriba, un candidato
  function generarCandidato() {
    var candidato = {
      nombre : nombre[generadorNumeroAleatorio(nombre.length)],
      provincia : provincia[generadorNumeroAleatorio(provincia.length)],
      perfil : perfil[generadorNumeroAleatorio(perfil.length)],
      expect_economica : generadorNumeroAleatorio(6000),
      expect_contractual : expect_contractual[generadorNumeroAleatorio(expect_contractual.length)],
      feedback_sourcing : feedback_sourcing[generadorNumeroAleatorio(feedback_sourcing.length)],
      tec_seleccion : tec_seleccion[generadorNumeroAleatorio(tec_seleccion.length)]
    };

    return candidato;
  }


  function muchosCandidatos(x) {
    var arrayCandidatos = [];
    for (var i = 0; i < x; i++) {
      arrayCandidatos.push(generarCandidato());
    }
    return arrayCandidatos;
  }
