
var fs = require('fs');
var http = require('http');
var url = require('url'); 

var path = require('path');
var express = require('express'); 
//var sqlite3 = require('sqlite3');

var app = express(); 
var port = 8014;

var public_dir = path.join(__dirname, 'public'); //can only access what you put in public dir
var mime = require('mime-types');

/*var ust_db = new sqlite3.Database(path.join(__dirname, 'db', 'ust_courses.sqlite3'), (err) => {
	if (err) {
		console.log('Error UST database'); 
	}
	else {
		console.log('Now connected to UST database!');
	}
});*/

//When a get request occurs to home page displays all homepage info
app.get('/home', (req, res) => {
	
    	fs.readFile(path.join(public_dir, 'index.html'), (err, data) => { 
			if(err){
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.write('Oh no! Could\'t find that page!'); //that backslash is used to signal that you specifically want the ' without ending the string
				res.end();
			} //when accessing url if there is an error in the filename then return this text 
			
			else{
				var mime_type= mime.lookup('index.html') || 'text/plain'; //if cant find mime type of file then content type is text/plain, mime.lookup will give valid mime type of file or  return false
				res.writeHead(200, {'Content-Type': mime_type}); //for each file make the content type the mime type in order to properly display 
				res.write(data); //write the content received in data
				res.end();
			} 
		}); 
   
});

app.post('/home', (req, res) => {
	
	var body = '';
	req.on('data', (chunk) => {
		body += chunk.toString(); 
	});
	
	req.on('end', ()=>{	
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write("Thank you");
		res.end();
		
		console.log(body);
	});

});



app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
//Do we need to do a form post or how do we do just a regular post or check without leaving the page?
//Just do an on click with the buttons and once then check if already in database / post to database. 







