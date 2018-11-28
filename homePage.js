var fs = require('fs');
var http = require('http');
var url = require('url'); 
var path = require('path');
var express = require('express'); 
var sqlite3 = require('sqlite3');
var multiparty = require('multiparty');
var app = express(); 
var mime = require('mime-types');

var port = 8014;
var public_dir = path.join(__dirname, 'public'); 

//Connection to our database
var ust_db = new sqlite3.Database(path.join(__dirname, 'db', 'ust_courses.sqlite3'), (err) => {
	if (err) {
		console.log('Error UST database'); 
	}
	else {
		console.log('Now connected to UST database!');
	}
});


//Any static files that do not come to home (javascript, css) will look to see if file exists 
app.use(express.static(public_dir));

//When a get request occurs to home page displays all homepage info
app.get('/home', (req, res) => {
	
    	fs.readFile(path.join(public_dir, 'index.html'), (err, data) => { 
			if(err){
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.write('Oh no! Could\'t find that page!'); 
				res.end();
			} 
			
			else{
				var mime_type= mime.lookup('index.html') || 'text/plain'; 
				res.writeHead(200, {'Content-Type': mime_type}); 
				res.write(data); 
				res.end();
			} 
		}); 
   
});

//In index when user clicks login will send here
app.post('/login' , (req, res) => {
	var login = 0;
	var pass = '';
	
	var form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
		//console.log(fields);
		login = fields.login;
		pass = fields.passwd;
		
		
		//If login is empty or not a number 
		if(login == '' || pass == ''|| isNaN(login)===true){
			errorLog(res,"Please enter a valid login and password");
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
						
						if(pass == rows[0].password){
							//Call to our search page if login and password match 
							callSearch(res);
							
						} 
						
						//If password and login do not match return to login page and add banner  
						else{
							errorLog(res,"Login and password do not match!");
						}
							
					}//else
				}//else
			}); //ust_db.all
		} //else
		

	}); //form.parse

}); //app.post(/login)

//When user creates a new user through the submit new user button
app.post('/new', (req, res) => {
	
	var login = '';
	var pass = '';
	var position = '';
	var first = '';
	var last = '';
	var isFloat = false
	
	var form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
		//console.log(fields);
		
		login = fields.login;
		pass = fields.passwd;
		position = fields.position;
		first = fields.firstName;
		last = fields.lastName;
		//If user enters floating point as login returns true
		isFloat = testFloat(login[0]);
		
		//If any fields are empty or login is not a number 
		if(login == '' || pass == '' || isNaN(login)===true || isFloat === true || first == '' || last == ''){
			errorLog(res,"Please enter enter valid values in all fields");
		}
		else{
			ust_db.all("Select * From People where university_id == ?",login, (err, rows) => {
				if (err) {
					console.log('Error running query');
				}
				else {	
					if(rows.length === 0){
						//If no user previously exists insert data and send user to our search page
						ust_db.run("INSERT INTO People(university_id, position, password, first_name, last_name) VALUES("+login+",\""+position+"\",\""+pass+"\",\""+first+"\",\""+last+"\")");
						
						callSearch(res);
						
					}
					else{
						//If user already exists send back to login page and notify with banner 
						errorLog(res,"Cannot create user with existing login!"); 
						
					}//else
				}//else
			}); //ust_db.all
		} //else
		

		
	}); //form.parse
	

}); //app.post(/new);



app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
 

//Function is used to send users back to login page with error banner when a login error occurs
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
			
			//Banner that displays to the user what is incorrect with their login 
			res.write('<h3 style= "color: white; background-color: orange; text-align: center;">'+reason+'</h3>');
			res.write(data); 
			res.end();
		} 
	}); //fs.readFile 
	

}

//Function is used to send users to our search page on successful login
function callSearch(res){
	
	fs.readFile(path.join(public_dir, 'search.html'), (err, data) => { 
		if(err){
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('Oh no! Could\'t find that page!'); 
			res.end();
		} 
		
		else{
			var mime_type= mime.lookup('search.html') || 'text/plain'; 
			res.writeHead(200, {'Content-Type': mime_type}); 
			res.write(data); 
			res.end();
		} 
	});
	
}

//Tests to see if user entered floating point number as login 
function testFloat(login){
	var i;
	for(i=0; i < login.length;i++){
		if(login[i] == '.'){
			return true;
			
		}
	}
	
	return false;
}


