var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
var reviewList = [];
var rp = require('request-promise');


var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'rootroot',
  database : 'booksys_database'
});
 
connection.connect();


function randomNum(minNum,maxNum){ 
    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1,10); 
        break; 
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
        break; 
            default: 
                return 0; 
            break; 
    } 
} 


function formatFunc (str){
    let a = 'https://book.douban.com/subject/30338769/?icn=index-editionrecommend';
    a.replace('30338769',str)
    return a
}


function visitEachReview(url,title){
    // rp(url).then((body)=>{
    //     let _ = cheerio.load(body);
    //     let reviewText = _('.comment-content').text().trim()
    //     reviewList.push({
    //         title:title,
    //         reviewText:reviewText
    //     })
    //     console.log(`write${title}---${reviewText}`)
    // }).catch(function (err) {
    //     console.log(err)
    //     // Crawling failed...
    // });
    request(url,(err,res,body)=>{
        console.log(err)
        if (!err && res.statusCode == 200) {
            let _ = cheerio.load(body);
            let reviewText = _('.comment-content').text().replace(/[\r\n]/g, "");
            reviewText = reviewText.replace(/\ +/g, "")
            reviewList.push(JSON.stringify({
                title:title,
                reviewText:reviewText
            }))
            // console.log(`write${title}---${reviewText}`)
            connection.query(`SELECT book_id from booksReview,books where books.name = ${title} AND books.id = booksReview.book_id`, function (error, results, fields) {
                if (error) throw error;

                connection.query(
                  `INSERT INTO booksReview (content, star, book_id ,user_id) VALUES (${reviewText}, ${randomNum(0,5)}, ${Number(results[0].book_id)}, 1)`
                ),function(error, results, fields){
                  
                }
              });

        }
    })
}

request('https://book.douban.com/', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    // 输出网页内容
    fs.writeFile('./douban.text',body,(err,data)=>{
        if(err){
            console.log(err)
        }
    })
    $ = cheerio.load(body);
    let res = '';
    let arr = [];
    $('.cover a').each((index,element) => {
        let _ = cheerio.load(element);
        let reg = /\/subject\/(.*?)\/?/
        let id = reg.exec(_(element).attr('href'))
        if(id){
            arr.push(JSON.stringify({
                title:_(element).attr('title'),
                url:formatFunc(id[1])
                // link:element.attr('href')
            }))
             res += element

             visitEachReview(formatFunc(id[1]),_(element).attr('title'))
             //欠差逻辑


        }
    })
    fs.writeFile('./data.text',arr,(err,data)=>{
        if(err){
            console.log(err)
        }
    })
  }
});


    setTimeout(()=>{fs.writeFile('./review.text',reviewList,(err,data)=>{
        console.log(JSON.stringify(reviewList))
        if(err){
            console.log(err)
        }
    })},30000)