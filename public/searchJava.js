var subArray = [];
var vApp;
function init(){
	//searchResults contains an object of all information for each section from our section and courses database tables 
	vApp = new Vue({
		el: "#app",
		data: {
			courseNumberSearch: '',
			crnNumberSearch: '',
			departments: [],
			searchResults: []
		}
	});
	
	/*$(".subSelect").on("change", function(){
		id = '#'+this.id;
		if($(id).prop('checked') == true){
				subArray.push(this.value);
		}
		
		else{	
			var index = subArray.indexOf(this.value);
			subArray.splice(index,1);
		}
		
	});*/
	getDepts();
	modSubject();
}

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

function modSubject(){
	//document.getElementsByClassName("subSelect")style.display = "none";
}

//fillTable method sends a post request to our server to obtain all needed information for the subjects selected by the user 
function fillTable(){
		//console.log(vApp2.courseNumberSearch);
		//console.log(vApp2.crnNumberSearch);
		
		
			var index;
			urlString = ''
			var atLeastOneChecked = false;
			for(index =0; index<vApp.departments.length; index++){
				var x = document.getElementById(vApp.departments[index].subject);
				if (x.checked == true){
					urlString += x.id + '-';
					atLeastOneChecked = true;
				}
			}
			if(atLeastOneChecked){
				urlString = urlString.substring(0, urlString.length-1);
			/*	for(index = 0; index < subArray.length; index++ ){
					if(index > 0){
						urlString = urlString += '-';
					}
					
					urlString = urlString += subArray[index];
					
				}*/
				//console.log(urlString);
			
				var settings = {
					"async": true,
					"crossDomain": true,
					//Hardcoded CISC for testing purposes, will need to adjust this once we add the ability for the user to select subjects from a checklist 
					//"url": "/login/ACCT",
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
					}
					console.log(response);
				
				})
			}
			else{
				console.log("Must select at least one subject");
			}
}


