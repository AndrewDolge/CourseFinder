var subArray = [];
function init(){
	//searchResults contains an object of all information for each section from our section and courses database tables 
	vApp = new Vue({
		el: "#results",
		data: {
			searchResults: []
		}

	});
	
	vApp2 = new Vue({
		el: "#searchBoxes",
		data: {
			courseNumberSearch: '',
			crnNumberSearch: ''
		}
	});
	
	$(".subSelect").on("change", function(){
		id = '#'+this.id;
		if($(id).prop('checked') == true){
				subArray.push(this.value);
		}
		
		else{	
			var index = subArray.indexOf(this.value);
			subArray.splice(index,1);
		}
		
	});
	
}

//fillTable method sends a post request to our server to obtain all needed information for the subjects selected by the user 
function fillTable(){
		//console.log(vApp2.courseNumberSearch);
		//console.log(vApp2.crnNumberSearch);
		
		if(subArray.length > 0){
			var index;
			urlString = ''
			for(index = 0; index < subArray.length; index++ ){
				if(index > 0){
					urlString = urlString += '-';
				}
				
				urlString = urlString += subArray[index];
			
			}
			//console.log(urlString);
		
			var settings = {
				"async": true,
				"crossDomain": true,
				//Hardcoded CISC for testing purposes, will need to adjust this once we add the ability for the user to select subjects from a checklist 
				//"url": "/login/ACCT",
				"url": "/login/"+urlString,
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
		} //if subArray.length > 0
		else{
			
			console.log("error select atleast one subject");
		}
}


