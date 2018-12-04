var vApp;
function init(){
	//Vue app used for template in search.html
	vApp = new Vue({
		el: "#app",
		data: {
			//data from optional course number input box
			courseNumberSearch: '',
			//data from optional crn input box
			crnNumberSearch: '',
			//array of objects from the SQL Departments table, filled by function getDepts()
			departments: [],
			//array of object from the SQL courses and sections tables, filled by fillTable()
			searchResults: [],
			//Users login
			login: '',
			//Users positon
			position: '',
			//Results from faculty pressing view roster button, array of objects containing university_id, first_name, last_name
			viewRosterResults: [],
			//Holds the crn that has been requested to view the roster of
			viewRegCRN: '',
			registeredCourses: []
		},
		watch: {
			searchResults: function(value){
				this.$nextTick(()=>{
					var i;
					var x;
					for(i=0;i<vApp.registeredCourses.length; i++){
						
						x = document.getElementById(vApp.registeredCourses[i] + 'color');
						console.log(x);
						if(x != null){
							x.style.backgroundColor = '#45e86e';
						}
					}
				});
			}
		}
	});
	
	document.getElementsByClassName("hideInfo").display = "none";
	getDepts();
	modSubject();
	
	//Call to getLogin to parse the HTML containing the users id
	vApp.login = getLogin();
	
	//Call to getPosition function to get request the position of the user 
	//Gets all of the users data from the SQL people table, do this once after login or after each search?
	getPosition();
	
	
	//These are used to create a loading animation for each time data is requested from a server, and to end that animation when data is received 
	$( document ).ajaxStart(function() {
			NProgress.start();
	});
	$( document ).ajaxStop(function() {
			NProgress.done();
	});
}

//gets the subject and full name for each department from our SQL departments table, used for filling our template of checkboxes
function getDepts(){
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": "/depts",
		"method": "GET"
	}
	$.ajax(settings).done(function (response) {
		vApp.departments = response;
	});
}

//Function in process
function modSubject(){
	//document.getElementsByClassName("subSelect")style.display = "none";
}

function reveal(crn, times){
	//console.log("subject"+crn);
	var x = document.getElementById(crn).style;//.display = 'table-row';
	//console.log(x);
	if(x.display == 'none'){
		x.display = 'table-row';
	}
	else if(x.display == 'table-row'){
		x.display = 'none';
	}
	loadthis(crn+'time',times);
}

function loadthis(y,z){
	//console.log('here');
	var times = '';
	var x = JSON.parse(z);
	//console.log(x.T);
	if(x.M != null){
		times += "M " +x.M;
	}
	if(x.T != null){
		times += "T " +x.T;
	}
	if(x.W != null){
		times += "W " +x.W;
	}
	if(x.R !=  null){
		times += "R " +x.R;
	}
	if(x.F != null){
		times += "F " +x.F;
	}
	if(x.SA != null){
		times += "SA " +x.SA;
	}
	if(x.SU != null){
		times += "SU " +x.SU;
	}
	document.getElementById(y).innerHTML = times;
	
	/*for(i=0;i<z.length;i++){
		if(z[i]!='<'&&z[i]!='>'&&z[i]!='b'&&z[i]!='r'&&z[i]!='{'&&z[i]!='}'&&z[i]!='/'){
			newStr += z[i];
		}
	}

	console.log(newStr);*/
}

//Used to check if a user hass previously searched from the page, if so clear the searchResults array before the next search begins
function checkStatus(){
	if(vApp.searchResults.length >0){
		vApp.searchResults = [];
	}
	fillTable();
}

//Method sends a post request to our server to obtain all needed information for the subjects selected by the user 
function fillTable(){
	
			var index;
			var urlString = ''
			var atLeastOneChecked = false;
			
			//Used to start loading animation when searching for a table 
			//NProgress.start();
			
			//Builds up our url based on checked subjects
			//Adds a '-' for parsing by the server 
			for(index =0; index < vApp.departments.length; index++){
				var x = document.getElementById(vApp.departments[index].subject);
				if (x.checked == true){
					urlString += x.id + '-';
					atLeastOneChecked = true;
				}
			}
			//If the user has selected at least one checkbox
			if(atLeastOneChecked){
				
				urlString = urlString.substring(0, urlString.length-1);
				
				//If user searches a specific course number add to URL
				if(vApp.courseNumberSearch !== ''){
					
					urlString += '+' + vApp.courseNumberSearch
					
					if(vApp.crnNumberSearch == ''){
						urlString += '+'
					}
				}
				//If user searches a specific CRN add to URL 
				if(vApp.crnNumberSearch !== ''){
					if(vApp.courseNumberSearch == ''){
						urlString += '+'
					}
					urlString += '+' + vApp.crnNumberSearch
				}
				
				var settings = {
					"async": true,
					"crossDomain": true,
					"url": "/search/"+urlString,
					"method": "POST"
				}
				
				$.ajax(settings).done(function (response) {
					var i;
					var sub;
					var cNum;
					var cred;
					var cName;
					var des;
					//Fills searchResults in the vApp
					for(i = 0; i < response.length; i++){
						sub = response[i].subject;
						cNum = response[i].course_number;
						sNum = response[i].section_number;
						cName =  response[i].name;
						build = response[i].building;
						roomNumber = response[i].room;
						prof = response[i].professors;
						cred = response[i].credits
						crn = response[i].crn;
						time = response[i].times;
						des = response[i].description;
						
						cap = response[i].capacity;
						reg = getRegCount(response[i].registered,cap);
						wait = getWaitCount(response[i].registered,cap); //will have to manually calculate, something like if registered > capacity
						
						vApp.searchResults.push({
							subject: sub,
							course_number: cNum,
							section_number: sNum,
							course_name: cName,
							building: build,
							room: roomNumber,
							professors: prof,
							credits: cred,
							CRN: crn,
							times: time,
							description: des,
							registered: reg,
							capacity: cap,
							waitlist: wait
						});
					} //for(i = 0; i < response.length; i++)
					
					
					//console.log(response);
					
					
				}) //ajax(settings)
			} //if(atLeastOneChecked)
			else{
				
				console.log("Must select at least one subject");

			}
} //fillTable


//function getLogin is used to parse the html written in the search.html page to store the user's login
function getLogin(){
	
	var fromSearch = document.getElementById('user').innerHTML;
	var parsed = fromSearch.split(":");
	var login = parsed[1].trim();
	return login;
	
}

//function gets the position (student or faculty) and stores it in our vApp
function getPosition(){
	//console.log(vApp.login);
	var info = {
				"async": true,
				"crossDomain": true,
				"url": "/position/"+vApp.login,
				"method": "GET"
			   }
			   
	$.ajax(info).done(function (response) {
		console.log(response);
			vApp.registeredCourses = response[0].registered_courses.split(',');
			vApp.position = response[0].position;
			//console.log(vApp.position);
		
	});
	

}

//Function sends a post request to homePage when a student registers for a class
function register(crn){
	var urlString = '';
	urlString = vApp.login+'+'+crn
	var settings = {
				"async": true,
				"crossDomain": true,
				"url": "/register/"+urlString,
				"method": "POST"
			   }
			   
	$.ajax(settings).done(function (response) {
			
			console.log(response);
		
	});
	
}

function getColor(crn){
	console.log("in getcolor");
	var x = vApp.registeredCourses;
	var y = x.split(',');
	var i;
	for(i=0;i<y.length;i++){
		if(crn == y[i]){
			document.getElementById(crn+'color').style.backgroundColor = '#45e86e';
		}
	}
}

//Function sends a post request to the server when a faculty selects the view roster button
function viewRoster(crn){
	vApp.viewRegCRN = crn;
	var settings = {
				"async": true,
				"crossDomain": true,
				"url": "/roster/"+crn,
				"method": "POST"
			   }
			   
	$.ajax(settings).done(function (response) {
			vApp.viewRosterResults = response;
			//console.log(vApp.viewRosterResults);
			
	});
	
	
}
//Function calculates the amount of registered students to display in the search table
function getRegCount(list,capacity){
	
	if(list === null){
		return 0;
		
	}
	
	else{
		list = list.split(',');
		if(list.length > capacity){
			return capacity;
		}
		return list.length;
	}
	
	
	
}

//Function calculates the amount of waitlisted students to display in the search table
function getWaitCount(list,capacity){
	if(list === null){
		return 0;
		
	}
	
	else{
		list = list.split(',');
		if(list.length > capacity){
			return list.length - capacity;
		}
		return 0;
	}
	
}


