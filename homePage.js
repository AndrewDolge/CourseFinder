
var fs = require('fs');
var http = require('http');
var url = require('url'); 

var path = require('path');
var express = require('express'); 
var sqlite3 = require('sqlite3');
var multiparty = require('multiparty');
var md5 = require('md5');

var app = express(); 
var port = 8014;

var public_dir = path.join(__dirname, 'public'); 
var mime = require('mime-types');

//connection to our database
var ust_db = new sqlite3.Database(path.join(__dirname, 'db', 'ust_courses.sqlite3'), (err) => {
	if (err) {
		console.log('Error UST database'); 
	}
	else {
		console.log('Now connected to UST database!');
	}
});

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

//When user tries to login/create a new user 
app.post('/login', (req, res) => {
	
	var login = 0;
	var pass = '';
	var hash = '';
	var form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
		
		login = fields.login;
		pass = fields.password;
	
		if(login != '' && pass != ''){
			ust_db.all("Select * From People where university_id == ?",login, (err, rows) => {
				if (err) {
					console.log('Error running query');
				}
				else {
					
					if(rows.length === 0){
						
						//having trouble inserting multiple things at once, need to remember the escape 
						hash = md5(pass);
						//ust_db.run("INSERT INTO People(password) VALUES(?)", hash);
						ust_db.run("INSERT INTO People(university_id) VALUES(?)",login);
						
						//after insert here do a read file to our search page
			
					}
					else{
						//if user tries to create a new user that already exists returns to home page with adding a warning banner 
						fs.readFile(path.join(public_dir, 'index.html'), (err, data) => { 
							if(err){
								res.writeHead(404, {'Content-Type': 'text/plain'});
								res.write('Oh no! Could\'t find that page!'); 
								res.end();
							}  
							
							else{
								var mime_type= mime.lookup('index.html') || 'text/html'; //if cant find mime type of file then content type is text/plain, mime.lookup will give valid mime type of file or  return false
								res.writeHead(200, {'Content-Type': mime_type}); //for each file make the content type the mime type in order to properly display 
								//Warning banner 
								res.write('<h3 style= "color: white; background-color: orange; text-align: center;"> Cannot create user with existing login!</h3>');
								res.write(data); //write the content received in data
								res.end();
							} 
						}); //fs.readFile 
					}//else
				}//else
			}); //ust_db.all
		} //if
		

		
	});
	

});



app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
 







