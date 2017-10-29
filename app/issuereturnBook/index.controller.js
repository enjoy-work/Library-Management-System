(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('issuereturnBook.IndexController', Controller);

    function Controller(UserService, FlashService) {
        var vm = this;
        vm.issueBook = issueBook;
        vm.returnBook = returnBook;
        
        function issueBook() {
            if(document.getElementById("userName").value != "" && document.getElementById("bookName").value != "" && document.getElementById("dueDate").value != "")
            {
            var form = document.forms[0];
            UserService.issueBook(form)
                .then(function () {
                    FlashService.Success('Book has been issued.');
                    document.forms[0].reset();
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
            }
        };
 
        function returnBook() {
            if(document.getElementById("userName").value != "" && document.getElementById("bookName").value != "" && document.getElementById("dueDate").value != "")
            {
            var form = document.forms[0];
            UserService.returnBook(form)
                .then(function () {
                    FlashService.Success('Book has been returned.');
                    document.forms[0].reset();
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
            }
        }

         $( function() {
           $( "#dueDate").datepicker({ minDate: 0});
        });
    }
})();