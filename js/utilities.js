// SET BANCO
db = openDatabase('listaCompras', '1.0', 'Base de teste', 5 * 1024 * 1024);

db.transaction(function(t) {

    t.executeSql('CREATE TABLE IF NOT EXISTS list (id INTEGER PRIMARY KEY ASC, titulo TEXT, qtd INTEGER )');
    t.executeSql('CREATE TABLE IF NOT EXISTS list_itens (id INTEGER PRIMARY KEY ASC, list_id INTEGER, item TEXT, done TEXT  )');

  
});


// SET ANGULAR
angular
    .module('listaCompras', ['ngRoute', 'angular-websql'])
    .config(function($routeProvider) {

        // $locationProvider.html5Mode(true);
        $routeProvider
            .when('/', {
                templateUrl : 'views/login.html',
                controller  : 'CtrlLogin',
            })
            .when('/listas', {
                templateUrl : 'views/listas.html',
                controller  : 'CtrlLista',
            })
            .when('/nova-lista', {
                templateUrl : 'views/nova-lista.html',
                controller  : 'CtrlLista',
            })
            .when('/lista-detalhe/:lista_id', {
                templateUrl : 'views/detalhe-lista.html',
                controller  : 'CtrlLista',
            })
            .when('/editar-lista/:lista_id', {
                templateUrl : 'views/editar-lista.html',
                controller  : 'CtrlLista',
            })
            .when('/esqueci-senha', {
                templateUrl : 'views/esqueci-senha.html',
                controller  : 'CtrlLogin',
            })
            .otherwise ({ redirectTo: '/listas' });

    })
    .controller('CtrlLogin', function($scope, $webSql) {
        $scope.submitLogin = function() {
            if ($scope.formLogin.$valid) {
                window.location.href  = location.href+"listas";
            }
        };

    })
    .controller('CtrlLista', function($scope, $location, $routeParams, $webSql) {

        $scope.db = $webSql.openDatabase('listaCompras', '1.0', 'Test DB', 2 * 1024 * 1024);
        
        $scope.list = [];
        $scope.listAtual = [];
        $scope.itens = [];
        $scope.checados = [];
        $scope.teste = "sfs";

        // carrega lista existente
        $scope.carregarListas = function() {
            $scope.db.selectAll('list').then(function(retorno) {
                $scope.lists = [];
                for(var i=0; i < retorno.rows.length; i++){
                    $scope.lists.push(retorno.rows.item(i));
                }
            });
        };

        // criar nova lista
        $scope.submitNova = function(titulo) {
            $scope.db.insert('list', {
                "titulo": titulo,
                "qtd": 0

            }).then(function(results) {
                $location.path('/lista-detalhe/' + results.insertId);
            });
        };

        // abre lista existente
        $scope.abrirLista = function() {
            $scope.db.select('list', {
                'id': {
                    'value': $routeParams.lista_id
                }
            }).then(function(retorno) {
                if(retorno.rows.length == 1) {
                    $scope.listAtual = retorno.rows[0];

                    $scope.db.select('list_itens', {
                        'list_id': {
                            'value': $routeParams.lista_id
                        }
                    }).then(function(retorno2) {
                        $scope.db.update("list", {"qtd": retorno2.rows.length}, {
                            'id': $routeParams.lista_id
                        })

                        $scope.itens = [];
                         $scope.checados = [];
                        for(var i=0; i < retorno2.rows.length; i++){

                            $scope.itens.push({
                                    id: retorno2.rows.item(i).id,
                                    list_id:retorno2.rows.item(i).list_id,
                                    item: retorno2.rows.item(i).item,
                                    done: retorno2.rows.item(i).done
                            });

                            $scope.db.update("list", {"qtd": retorno2.rows.length}, {
                                'id': $routeParams.lista_id
                            })


                            if(retorno2.rows.item(i).done== "true"){
                                $scope.checados.push({                                    
                                    id: retorno2.rows.item(i).id,
                                });
                            }

                            retorno2.rows.item(i);
                        }

                        // itens checados
                         $scope.checadosGeral = $scope.checados.length;
                    });
                } else {
                    $location.path('/listas');
                }
            });

        };

        // insere novo intem
        $scope.inserirItem = function(nomeNovoItem, id) {
            
            $scope.db.insert('list_itens', {
                "list_id": id,
                "item": nomeNovoItem,
                "done" : false
            }).then(function(results) {
                $scope.abrirLista();
                $scope.nomeNovoItem = "";
            });

        };


        // exclui lista
        $scope.excluiLista = function(id) {
            
            setTimeout(function(){
                $scope.db.del("list", {
                    "id": id
                }).then(function() {
                    $location.path('/listas');
                });

                $scope.db.select('list_itens', {
                        'list_id': {
                            'value': id
                        }
                    }).then(function(retorno2) {
                        for(var i=0; i < retorno2.rows.length; i++){

                            $scope.db.del("list_itens", {
                                "id": retorno2.rows.item(i).id
                            })
                        }
                    });

                // 
            }, 800);
            
            
        };

        // checa item
        $scope.checaItem = function(id, done, idLista) {
            
            $scope.db.update("list_itens", {"done": done}, {
                'id': id
            }).then(function(results) {
                
                $location.path('/lista-detalhe/'+idLista);
                // $scope.checadosGeral = $scope.listAtual.done;

                 
                $scope.db.select('list_itens', {
                    'list_id': {
                        'value': $routeParams.lista_id,
                        "union":'AND'
                    },
                    'done': 'true'
                }).then(function(retorno) {
                    $scope.checadosGeral = retorno.rows.length;
                })


            }); 
       
        };

        // checa item
        $scope.excluiItem = function(id, idLista) {
            
            $scope.db.del("list_itens", {
                "id": id
            }).then(function() {                   
                $location.path('/editar-lista/'+idLista);
            });
       
        };

         // atualiza titulo
        $scope.atualizaLista = function(id, titulo, idLista) {
            
            $scope.db.update("list", {"titulo": titulo}, {
                'id': id
            }).then(function() {             
                
                $location.path('/lista-detalhe/'+idLista);
            });
        
       
        };
        
    });

