(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('addremoveBook.IndexController', Controller);
 
    function Controller(UserService, FlashService) {
        var vm = this;
        vm.addBook = addBook;
        vm.removeBook = removeBook;
        
 
        function addBook() {
            if(document.getElementById("bookName").value != "" && document.getElementById("author").value != "")
            {
            var form = document.forms[0];
            UserService.addBook(form)
                .then(function () {
                    FlashService.Success('Book has been added.');
                    document.forms[0].reset();
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
            }
        }
 
        function removeBook() {
            if(document.getElementById("bookName").value != "" && document.getElementById("author").value != "")
            {
            var form = document.forms[0];
            UserService.removeBook(form)
                .then(function () {
                    FlashService.Success('Book has been removed.');
                    document.forms[0].reset();
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
            }
        }
    }
})();
 