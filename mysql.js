var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'rootroot',
  database : 'booksys_database'
});
 
connection.connect();


// select * from tch_teacher left join tch_contact on tch_teacher.Id = tch_contact.TId;
connection.query(`SELECT book_id from booksReview,books where books.name = '偷书贼' AND books.id = booksReview.book_id`, function (error, results, fields) {
    if (error) throw error;
    // connection.query(
    //   `INSERT INTO booksReview (content, star, book_id ,user_id) VALUES ('Gates', 'Bill', 'Xuanwumen 10', 'Beijing')`
    // ),function(error, results, fields){

    // }
    console.log(results[0].book_id===14);
  });