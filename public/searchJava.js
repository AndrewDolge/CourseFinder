
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
			searchResults: []
		}
	});
	
	getDepts();
	modSubject();
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
			urlString = ''
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
						descrip = response[i].description
						reg = response[i].registered,
						cap = response[i].capacity,
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
							descrip: des,
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



