var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');

var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('User');
db.bind('AdminUser');
db.bind('Books');
db.bind('LibraryTransaction');
 
var service = {};
 
service.authenticate = authenticate;
service.create = create;
service.addBook = addBook;
service.issueBook = issueBook;
service.removeBook = removeBook;
service.returnBook = returnBook;
var _role = "";
 
module.exports = service;
 
/**
  * validate UserName and Password.
  * @method authenticate
  * @param {String} username
  * @param {String} password
  * @param {String} role- role of loggedIn User.
*/ 
function authenticate(username, password, role) {
    var deferred = Q.defer();
    _role = role;
    var dbName = (role ==="librarian")? "AdminUser": "User";
    db[dbName].findOne({ username: username }, function (err, user) {
        if (err) deferred.reject(err);

        if (user && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
            deferred.resolve(jwt.sign({ sub: user._id }, config.secret));
        } else {
            // authentication failed
            deferred.resolve();
        }
    });
    return deferred.promise;
}
 
/**
  * Add Books to Books collection.
  * @method addBook
  * @param {Object} data
*/ 
function addBook(data) {
    var deferred = Q.defer();
    if( _role === "librarian")
    {
      db.Books.findOne(
        { $and: [{bookName: data.bookName },{author: data.author}]},
        function (err, book) {
            if (err) deferred.reject(err);
            if (book) {
              db.Books.update(book,{ $inc : {copy : 1} },
              function (err, doc) {
               if (err) deferred.reject(err);
                 deferred.resolve();
              });       
            } 
            else {
              data.copy = 1;
              data.status = "Available";     
              db.Books.insert(data,function (err, doc) {
               if (err) deferred.reject(err);
               deferred.resolve();
            });
            }
        });
    }
    else
    {
        deferred.reject("You don't have Permission.");
        deferred.resolve();
    }
    return deferred.promise;
}
 
/**
  * issue Book to the users.
  * @method issueBook
  * @param {Object} data
*/ 
function issueBook(data) {
    var deferred = Q.defer();
    if( _role === "librarian")
    {   
        db.User.findOne({username: data.userName},function (err, user) {
            if (err) deferred.reject(err);
            if (user) 
                issue();
            else 
                deferred.reject('User "'+ data.userName +'" does not exist.');
        });
         
        function issue(){
            db.Books.findOne(
               { $and: [{bookName: data.bookName },{author : data.author },{status:"Available"} ]},
                 function (err, book) {
                   if (err) deferred.reject(err);
                    if (book) 
                      addTransaction(book);
                    else 
                        deferred.reject('Book "' + data.bookName + '" is not available.');
                });
        }

        function addTransaction(book){
            db.LibraryTransaction.findOne(
                { $and: [{userName: data.userName}, {bookName: data.bookName },{author: data.author}]},
              function (err, record) {
                if (err) deferred.reject(err);
                if (record) {
                    if(record.transaction == "borrow")
                       deferred.reject('"'+ data.bookName + '" is already issued to User "'+ data.userName+ '".');
                    else{
                       db.LibraryTransaction.update(record,{ $set : {transaction : "borrow"} },
                       function (err, doc) {
                         if (err) deferred.reject(err);
                           deferred.resolve()
                        }); 
                       updateBooks(book);    
                   }
                } 
                else {               
                  db.LibraryTransaction.insert(data, function (err, doc) {
                    if (err) deferred.reject(err);
                        deferred.resolve();
                  });
                  updateBooks(book);    
                }
            });
        }

        function updateBooks(book){              
         db.Books.update(book,{ $set : { copy : book.copy - 1}},
             function (err, doc) {
               if (err) deferred.reject(err);
                 deferred.resolve();
               db.Books.update({copy: { $eq : 0 } },
                {$set : { status: "Unavailable"} },
                function(err, doc){
                    if(err) deferred.reject(err);
                    deferred.resolve();
                });
         });
        }
    }
    else
    {
        deferred.reject("You don't have Permission.");
        deferred.resolve();
    }
    return deferred.promise;
}

/**
  * remove Book from the collection.
  * @method removeBook
  * @param {Object} data
*/
function removeBook(data) {
    var deferred = Q.defer();
    if(_role === "librarian")
    {
    db.Books.findOne(
        { $and: [{bookName: data.bookName }, {author: data.author}, {status : "Available"}]},
        function (err, book) {
            if (err) deferred.reject(err);
            if (book) {
                _remove();
            } else {
                deferred.reject('Book "' + data.bookName + '" is not available.');
            }
    });


    function _remove(){
       db.Books.remove(
         { bookName: data.bookName},
        function (err) {
            if (err) deferred.reject(err);
            deferred.resolve();
        });
    };
    }
    else
    {
        deferred.reject("You don't have Permission.")
        deferred.resolve();
    }
    return deferred.promise;
}


/**
  * return Book from the users.
  * @method returnBook
  * @param {Object} data
*/
function returnBook(data) {
    var deferred = Q.defer();    
    if(_role === "librarian")
    {
      db.LibraryTransaction.findOne(
        { $and: [{bookName: data.bookName },{author : data.author},{userName : data.userName},{ transaction:"borrow"}]},
        function (err, book) {
            if (err) deferred.reject(err);
            if (book) {
                updateTransaction(book);
                updateBooks();
            } else {
                deferred.reject('Book "' + data.bookName + '" is not issued.');
            }
        });

        function updateTransaction(book){
          db.LibraryTransaction.update(book,{ $set : { transaction : "return"}},
             function (err, doc) {
               if (err) deferred.reject(err);
                 deferred.resolve();
         });           
        }

        function updateBooks(){              
         db.Books.update({$and: [{bookName: data.bookName },{author : data.author }]},{ $inc : { copy : 1}},
             function (err, doc) {
               if (err) deferred.reject(err);
                 deferred.resolve();
               db.Books.update({copy: { $gt : 0 } },
                {$set : { status: "Available"} },
                function(err, doc){
                    if(err) deferred.reject(err);
                    deferred.resolve();
                });
         });
        }
    }
    else
    {
        deferred.reject("You don't have Permission.");
        deferred.resolve();
    }
    return deferred.promise;
}

/**
  * create loggedInuser
  * @method create
  * @param {Object} userParam
*/
function create(userParam) {
    var deferred = Q.defer();
    var dbName = (userParam.role === "librarian")? "AdminUser": "User";
    db[dbName].findOne(
        { username: userParam.username },
        function (err, user) {
            if (err) deferred.reject(err);
            if (user) {
                deferred.reject('Username "' + userParam.username + '" is already taken');
            } else {
                createUser(dbName);
            }
    });

    function createUser(dbName) {
        var user = _.omit(userParam, 'password');
        user.hash = bcrypt.hashSync(userParam.password, 10);
        db[dbName].insert(
            user,
            function (err, doc) {
                if (err) deferred.reject(err);
                deferred.resolve();
    });}
    return deferred.promise;
}
