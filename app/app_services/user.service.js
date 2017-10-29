(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('UserService', Service);
 
    function Service($http, $q) {
        var service = {};
        service.Create = Create;
        service.addBook = addBook;
        service.issueBook = issueBook;
        service.removeBook = removeBook;
        service.returnBook = returnBook;

 
        return service;

        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError);
        }

        function addBook(formData) {
           var addDetails = {
              bookName : formData.bookName.value,
              author : formData.author.value
           }
           return $http({
            method: 'POST',
            url: '/api/users/addBook',
            data: addDetails,
            headers: {'Content-Type': 'application/json'}
            }).then(handleSuccess, handleError);
        }

        function removeBook(formData) {
            var removedetails = 
            {
                bookName : formData.bookName.value, 
                author : formData.author.value  
            }
            return $http({
            method: 'POST',
            url: '/api/users/removeBook',
            data: removedetails,
            headers: {'Content-Type': 'application/json'}
            }).then(handleSuccess, handleError);
        }

        function issueBook(formData) {
           var issueDetails = 
           { 
              userName : formData.userName.value,
              bookName : formData.bookName.value,
              dueDate : formData.dueDate.value,
              author : formData.author.value,
              transaction: "borrow"
           }
           return $http({
            method: 'POST',
            url: '/api/users/issueBook',
            data: issueDetails,
            headers: {'Content-Type': 'application/json'}
            }).then(handleSuccess, handleError);
        }

        function returnBook(formData) {
           var returnDetails = 
           { 
              userName : formData.userName.value,
              bookName : formData.bookName.value,
              dueDate : formData.dueDate.value,
              author : formData.author.value,
              transaction: "return"
           }
           return $http({
            method: 'POST',
            url: '/api/users/returnBook',
            data: returnDetails,
            headers: {'Content-Type': 'application/json'}
            }).then(handleSuccess, handleError);
        }


        // private functions
        function handleSuccess(res) {
            return res.data;
        }
 
        function handleError(res) {
            return $q.reject(res.data);
        }
    }
 
})();