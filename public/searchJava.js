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
			position: ''
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
	//console.log(login);
	
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
		console.log(response);
	});
}

//Function in process
function modSubject(){
	//document.getElementsByClassName("subSelect")style.display = "none";
}

//hello there
function reveal(crn, times){
	console.log("subject"+crn);
	var x = document.getElementById(crn).style;//.display = 'table-row';
	console.log(x);
	if(x.display == 'none'){
		x.display = 'table-row';
	}
	else if(x.display == 'table-row'){
		x.display = 'none';
	}
	loadthis(crn+'time',times);
}

function loadthis(y,z){
	console.log('here');
	var times = '';
	var x = JSON.parse(z);
	console.log(x.T);
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
						reg = response[i].registered;
						cap = response[i].capacity;
						wait = 'Placeholder' //will have to manually calculate
						
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
					
					
					console.log(response);
					
				
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
	console.log(vApp.login);
	var info = {
				"async": true,
				"crossDomain": true,
				"url": "/position/"+vApp.login,
				"method": "GET"
			   }
			   
	$.ajax(info).done(function (response) {
			
			console.log(response);
			vApp.position = response[0].position;
			console.log(vApp.position);
		
		
	});
	

}


