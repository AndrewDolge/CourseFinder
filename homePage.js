

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

//When retuning user logs in
app.post('/login' , (req, res) => {
	var login = 0;
	var pass = '';
	var checkHash = '';
	var form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
		//console.log(fields);
		login = fields.login;
		pass = fields.passwd;
	
		//if(login != '' && pass != ''){
		if(login == '' || pass == ''|| isNaN(login)===true){
			errorLog(res,"Please enter a login and password");
		}
		else{
			ust_db.all("Select * From People where university_id == ?",login, (err, rows) => {
				if (err) {
					console.log('Error running query');
				}
				else {
					//If user tries to login but no username exists
					if(rows.length === 0){
						errorLog(res,"Username does not exist! Please create new user");
					}
					//If user tries to login and user name exists
					else{
						checkHash = md5(pass);
						if(checkHash === rows[0].password){
							fs.readFile(path.join(public_dir, 'search.html'), (err, data) => { 
								if(err){
									res.writeHead(404, {'Content-Type': 'text/plain'});
									res.write('Oh no! Could\'t find that page!'); 
									res.end();
								} //when accessing url if there is an error in the filename then return this text 
								
								else{
									var mime_type= mime.lookup('search.html') || 'text/plain'; 
									res.writeHead(200, {'Content-Type': mime_type}); //for each file make the content type the mime type in order to properly display 
									res.write(data); //write the content received in data
									res.end();
								} 
							}); //fs.readFile
						} //if
						
						else{
							errorLog(res,"Login and password do not match!");
						}
							
					}//else
				}//else
			}); //ust_db.all
		} //else
		

	}); //form.parse

}); //app.post(/login)

//When user tries to create new account 
app.post('/new', (req, res) => {
	
	var login = 0;
	var pass = '';
	var hash = '';
	var position = '';
	var first = '';
	var last = '';
	var form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
		
		login = fields.login;
		pass = fields.passwd;
		position = fields.position;
		first = fields.firstName;
		last = fields.lastName;
	
		console.log(pass);
		if(login == '' || pass == '' || isNaN(login)===true || first == '' || last == ''){
			errorLog(res,"Please enter enter all fields");
		}
		else{
			ust_db.all("Select * From People where university_id == ?",login, (err, rows) => {
				if (err) {
					console.log('Error running query');
				}
				else {	
					if(rows.length === 0){
						//having trouble inserting multiple things at once, need to remember the escape 
						hash = md5(pass);
						//ust_db.run("INSERT INTO People(password) VALUES(?)", hash);
						ust_db.run("INSERT INTO People(university_id, position, password, first_name, last_name) VALUES("+login+",\""+position+"\",\""+hash+"\",\""+first+"\",\""+last+"\")");
						//Call to our search page
						fs.readFile(path.join(public_dir, 'search.html'), (err, data) => { 
							if(err){
								res.writeHead(404, {'Content-Type': 'text/plain'});
								res.write('Oh no! Could\'t find that page!'); //that backslash is used to signal that you specifically want the ' without ending the string
								res.end();
							} //when accessing url if there is an error in the filename then return this text 
							
							else{
								var mime_type= mime.lookup('search.html') || 'text/plain'; //if cant find mime type of file then content type is text/plain, mime.lookup will give valid mime type of file or  return false
								res.writeHead(200, {'Content-Type': mime_type}); //for each file make the content type the mime type in order to properly display 
								res.write(data); //write the content received in data
								res.end();
							} 
						});
						//after insert here do a read file to our search page
					}
					else{
						errorLog(res,"Cannot create user with existing login!");
						//if user tries to create a new user that already exists returns to home page with adding a warning banner 
						
					}//else
				}//else
			}); //ust_db.all
		} //else
		

		
	}); //form.parse
	

}); //app.post(/new);



app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
 


function errorLog(res,reason){
	fs.readFile(path.join(public_dir, 'index.html'), (err, data) => { 
		if(err){
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('Oh no! Could\'t find that page!'); 
			res.end();
		}  
		
		else{
			var mime_type= mime.lookup('index.html') || 'text/html'; 
			res.writeHead(200, {'Content-Type': mime_type}); 
			//Warning banner 
			res.write('<h3 style= "color: white; background-color: orange; text-align: center;">'+reason+'</h3>');
			res.write(data); //write the content received in data
			res.end();
		} 
	}); //fs.readFile 
	

}



