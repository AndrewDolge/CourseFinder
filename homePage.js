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
		
		login = fields.login;
		pass = fields.passwd;
		
		
		//If login is empty or not a number 
		if(login == '' || pass == ''|| isNaN(login)===true){
			backHome(res,"Please enter a valid login and password", 'orange');
		}
		else{
			ust_db.all("Select * From People where university_id == ?",login, (err, rows) => {
				if (err) {
					console.log('Error running query');
				}
				else {
					//If user tries to login but no username exists
					if(rows.length === 0){
						backHome(res,"Username does not exist! Please create new user",'orange');
					}
					//If user tries to login and user name exists
					else{
						
						if(pass == rows[0].password){
							//Call to our search page if login and password match 
							callSearch(res);
							
						} 
						
						//If password and login do not match return to login page and add banner  
						else{
							backHome(res,"Login and password do not match!",'orange');
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
		
		login = fields.login;
		pass = fields.passwd;
		position = fields.position;
		first = fields.firstName;
		last = fields.lastName;
		//If user enters floating point as login returns true
		isFloat = testFloat(login[0]);
		
		//If any fields are empty or login is not a number 
		if(login == '' || pass == '' || isNaN(login)===true || isFloat === true || first == '' || last == ''){
			backHome(res,"Please enter enter valid values in all fields",'orange');
		}
		else{
			ust_db.all("Select * From People where university_id == ?",login, (err, rows) => {
				if (err) {
					console.log('Error running query');
				}
				else {	
					if(rows.length === 0){
						//If no user previously exists insert data and send user back to home page to log in
						ust_db.run("INSERT INTO People(university_id, position, password, first_name, last_name) VALUES("+login+",\""+position+"\",\""+pass+"\",\""+first+"\",\""+last+"\")");
						
						backHome(res, "Successful creation, please log in!", 'green');
						
					}
					else{
						//If user already exists send back to login page and notify with banner 
						backHome(res,"Cannot create user with existing login!", 'orange'); 
						
					}//else
				}//else
			}); //ust_db.all
		} //else
		

		
	}); //form.parse
	

}); //app.post(/new);

 
//When a user logs in and the search button is clicked, a post request is sent here
//Database selects all information from both the Courses and Sections tables and sends the JSON object back to the browser
app.post('/search/:nconst', (req, res) => {
	
	//1. Parse the subjects sent in the url and place them in subs array
	var urlSubs = req.params.nconst
	var subs = [];
	var courseNumReq = '';
	var crnReq = '';
	subs = urlSubs.split("-");
	
	/*2. If user also searched with crn number or course number will be added to end of url separated by +
		 Parse the last position in the subs array to get the course number and/or crn number */
	var checkSearch =[];
	checkSearch = subs[subs.length-1].split("+");
	
	subs[subs.length-1] = checkSearch[0];
	
	if(checkSearch.length > 1){
		courseNumReq = checkSearch[1];
		crnReq = checkSearch[2];
	}
	
	
	//3. Place all the subjects in the subs array into the proper format to be handled for the SQL statement
	var subsForSQL = '';
	var ind;
	for(ind=0; ind < subs.length; ind++){
		if(ind === 0){
			subsForSQL += "(";
			subsForSQL += "'";
			subsForSQL += subs[ind];
			subsForSQL += "'";
			
		}
		else{
			subsForSQL += ",";
			subsForSQL += "'";
			subsForSQL += subs[ind];
			subsForSQL += "'";
			
		}
	}
	
	//4. If no crn number or course number is searched, call searchNoText function
	if(crnReq == '' && courseNumReq == ''){
		 searchNoText(res,subsForSQL);
		
	}
	
	//5. If a crn or course number is added to the search, call searchWithText function 
	else{
		searchWithText(res,subsForSQL,crnReq,courseNumReq);

	}
	
	
});


//Sends all subjects and fullname from department table to browser for checkboxes
app.get('/depts', (req, res) => {
	ust_db.all("SELECT * FROM Departments ORDER BY Departments.subject", (err, rows) => {	
		if (err) {
			console.log('Error running query');
		}
		else {	
			res.send(rows);
		}
	});
});

//Server listens for requests
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});

/*Function is used to send users back to login page with banner for either successful creation of a new account
or an error on login/creation of an account*/
function backHome(res,reason,color){
	fs.readFile(path.join(public_dir, 'index.html'), (err, data) => { 
		if(err){
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('Oh no! Could\'t find that page!'); 
			res.end();
		}  
		
		else{
			var mime_type= mime.lookup('index.html') || 'text/html'; 
			res.writeHead(200, {'Content-Type': mime_type});
			
			//Banner that displays to the user what is incorrect with their login or successful creation of a new account 
			res.write('<h3 style= "color: white; background-color: '+color+'; text-align: center;">'+reason+'</h3>');
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

//searchNoText function is used to call the SQL database if a user searches based on checkboxes but no crn or course number 
function searchNoText(res,subsForSQL){
	
	var sqlString = "SELECT  Sections.subject, Sections.course_number, Sections.section_number, Courses.name, Sections.building, Sections.room, Sections.professors, Courses.credits, Sections.crn, Sections.registered, Sections.capacity, Sections.times, Courses.description FROM Sections INNER JOIN Courses ON Sections.course_number=Courses.course_number AND Sections.subject = Courses.subject WHERE Sections.subject IN ";
	
	sqlString += subsForSQL;

	sqlString+= ") ORDER BY Sections.subject, Sections.course_number, sections.section_number";
	//console.log(sqlString);
		
	ust_db.all(sqlString, (err, rows) => {	
			if (err) {
				console.log('Error running query');
			}
			else {
					res.send(rows);
					
			}
		});
	
}

//searchWithText function is used to call the SQL database if a user searches based on checkboxes and a crn and/or course number 
function searchWithText(res,subsForSQL,crnNum,courseNum){

	var isCRN = true;
	var isCourseNum = true;
	
	//Did a user search a crn 
	if(crnNum.length < 1){
		isCRN = false;
	}
	else{
		crnNum = parseInt(crnNum);
	}
	
	//Did a user search a course number 
	if(courseNum.length < 1){
		isCourseNum = false;
	}
	
	//SQL search for only course number 
	if(isCourseNum == true && isCRN == false){
		var sqlString = "SELECT  Sections.subject, Sections.course_number, Sections.section_number, Courses.name, Sections.building, Sections.room, Sections.professors, Courses.credits, Sections.crn, Sections.registered, Sections.capacity, Sections.times, Courses.description FROM Sections INNER JOIN Courses ON Sections.course_number=Courses.course_number AND Sections.subject = Courses.subject WHERE Sections.course_number = \""+courseNum+"\" AND Sections.subject IN ";
	
		sqlString += subsForSQL;
		sqlString+= ") ORDER BY Sections.subject, Sections.course_number, sections.section_number";
		//console.log(sqlString);
			
			ust_db.all(sqlString, (err, rows) => {	
					if (err) {
						console.log('Error running query');
					}
					else {	
							res.send(rows);
					}
				});
			
	}
	
	//SQL search for only CRN
	if(isCourseNum == false && isCRN == true){
		
			var sqlString = "SELECT  Sections.subject, Sections.course_number, Sections.section_number, Courses.name, Sections.building, Sections.room, Sections.professors, Courses.credits, Sections.crn, Sections.registered, Sections.capacity, Sections.times, Courses.description FROM Sections INNER JOIN Courses ON Sections.course_number=Courses.course_number AND Sections.subject = Courses.subject WHERE Sections.crn = "+crnNum+" AND Sections.subject IN ";
	
			sqlString += subsForSQL;
			sqlString+= ")";
			//console.log(sqlString);
				
			ust_db.all(sqlString, (err, rows) => {	
					if (err) {
						console.log('Error running query');
					}
					else {	
							res.send(rows);
					}
				});
		
		
	}
	
	//SQL search for both course number and CRN
	if(isCourseNum == true && isCRN == true){
	
		var sqlString = "SELECT  Sections.subject, Sections.course_number, Sections.section_number, Courses.name, Sections.building, Sections.room, Sections.professors, Courses.credits, Sections.crn, Sections.registered, Sections.capacity, Sections.times, Courses.description FROM Sections INNER JOIN Courses ON Sections.course_number=Courses.course_number AND Sections.subject = Courses.subject WHERE Sections.course_number = \""+courseNum+"\" AND Sections.subject IN ";
		
			sqlString += subsForSQL;
			sqlString+= ") AND Sections.crn = "+crnNum;
			
				ust_db.all(sqlString, (err, rows) => {	
						if (err) {
							console.log('Error running query');
						}
						else {	
								res.send(rows);
						}
					});
			
		
	}
}
