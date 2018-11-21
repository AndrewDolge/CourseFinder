//Currently node js file is looping through each department and grabbing necessary information. Still need to place data in database. 

var fs     = require('fs');
var path   = require('path');
var https  = require('https');
var url    = require('url'); 
var sqlite = require('sqlite3').verbose();

//list of all departments to loop through for data
var depart = ["ACCT","ACSC","ACST","AERO","AMBA","ARAB","ARHS","ARTH","BCHM","BCOM","BETH","BIOL","BLAW","BUSN","CATH","CHDC","CHEM","CHIN","CIED","CISC","CJUS","CLAS","COAC","COJO","COMM","CPSY","CSIS","CSMA","CTED","DRSW","DSCI","DVDM","DVDT","DVHS","DVLS","DVMT","DVPH","DVPM","DVPT","DVSP","DVSS","DVST","ECMP","ECON","EDCE","EDLD","EDUA","EDUC","EGED","ENGL","ENGR","ENTR","ENVR","ESCI","ETLS","EXSC","FAST","FILM","FINC","FREN","GBEC","GENG","GEOG","GEOL","GERM","GIFT","GMUS","GRED","GREK","GRPE","GRSW","GSPA","HIST","HLTH","HONR","HRDO","IBUS","IDSC","IDSW","IDTH","INAC","INCH","INEC","INEG","INFC","INFR","INGR","INHR","INID","INIM","INJP","INLW","INMC","INMG","INMK","INOP","INPS","INRS","INSP","INST","INTR","IRGA","ITAL","JAPN","JOUR","JPST","LATN","LAWS","LEAD","LGST","LHDT","MATH","MBAC","MBEC","MBEN","MBEX","MBFC","MBFR","MBFS","MBGC","MBGM","MBHC","MBHR","MBIF","MBIM","MBIS","MBLW","MBMG","MBMK","MBNP","MBOP","MBQM","MBSK","MBSP","MBST","MBUN","MBVE","MFGS","MGMP","MGMT","MKTG","MMUS","MSQS","MSRA","MUSC","MUSN","MUSP","MUSR","MUSW","NSCI","ODOC","OPMT","PHED","PHIL","PHYS","PLLD","POLS","PSYC","PUBH","QMCS","READ","REAL","RECE","REDP","RUSS","SABC","SABD","SACS","SAED","SAIM","SAIN","SALS","SAMB","SASE","SASW","SEAM","SEIS","SMEE","SOCI","SOWK","SPAN","SPED","SPGT","SPUG","STAT","STEM","TEGR","THEO","THTR","WMST"];


var i;

//for loop to go through each department 
for(i= 0; i < depart.length; i++){

	var year = 2019;
	var term = 20;

	//request to St. Thomas URL
	var request =  {
		protocol: "https:",
		hostname: "classes.aws.stthomas.edu", //break up url in search 
		port: 443,
		path: "/index.htm?year="+year+"&term="+term+"&schoolCode=AS&levelCode=ALL&selectedSubjects="+depart[i], //break up url //when actually write this code will need variables for term, school code and all selected subjects 
		agent: false
	};
	
	/*The received info is one large string, so on receiving info we call various functions to parse the string for the info we need
	  Each function just finds the correct class the information is labeled under for each course and returns it in an array*/
	https.get(request, (res) => {
		//body will contain the large string returned from the St. Thomas site that needs to be parsed 
		var body = "";
		var onlyCourseNumArr = []; //Contains only course numbers
		var sectionNumArr = []; //Contains only section numbers
		
		var courseNumArr = []; //Contains both course and section numbers, DO NOT need to add to database
		
		var profArr = []; //Contains Professor Names
		var courseNameArr = []; //Containes Course Names
		var buildArr= []; //Contains building name and number
		var capArr =[]; //Contains capacity of classes
		var crnArr = []; //Contains CRN of classes
		var creditArr = []; //Contains credits of classes
		var courseDescrip = []; //Contains decription of classes
		var timeArr = []; //Contains day/time of classes
		var subjectCode = ""; //Contains four letter subject code for the loaded page
		var fullSubjectName = ""; //Contains the full name of the loaded department page
	
		res.on("data", (chunk) =>{
			body += chunk.toString();
		});
		res.on("end", () => {
			
				//Once receive data call each function
				var i; 
				profArr= getProf(body);
				courseNumArr = getCourseNum(body);
				courseNameArr = getCourseName(body);
				buildArr = getBuild(body);
				capArr = getCapacity(body);
				crnArr = getCRN(body);
				creditArr = getCredits(body);
				courseDescrip = getDescrip(body);
				subject = getSubject(body);
				timeArr = getTime(body);
				subjectCode = getSubject(body);
				fullSubjectName = getSubjectName(body);
				
					console.log(subjectCode + ": " + fullSubjectName);
					console.log(timeArr);
				
		
		
				//to split out section and course number from courseNumArr
				for(x= 0; x < courseNumArr.length; x++){
						 var courseNum = courseNumArr[x];
						 var split = courseNum.split("-");
						 onlyCourseNumArr.push(split[0]);
						 sectionNumArr.push(split[1]);
				}
				
				
				//testing print statements, can remove later 
				var j;
				console.log("-----------");
			
				console.log(subjectCode);
				console.log(fullSubjectName);
				console.log(profArr.length);
				console.log(courseNumArr.length);
				console.log(buildArr.length);
				console.log(capArr.length);
				console.log(courseNameArr.length);
				console.log(crnArr.length);
				console.log(creditArr.length);
				console.log(courseDescrip.length);
				console.log(sectionNumArr.length);
				console.log(onlyCourseNumArr.length);
				console.log(timeArr.length);
			
				/*for(j=0; j < courseNumArr.length ; j++){
					console.log(courseNumArr[j]);
				};
				for(j=0; j < profArr.length ; j++){
					console.log(profArr[j]);
				};
				for(j=0; j < courseNameArr.length ; j++){
					console.log(courseNameArr[j]);
				};
				for(j=0; j < buildArr.length ; j++){
					console.log(buildArr[j]);
				};
				for(j=0; j < capArr.length ; j++){
					console.log(capArr[j]);
				};
				for(j=0; j < crnArr.length ; j++){
					console.log(crnArr[j]);
				};
				for(j=0; j < creditArr.length ; j++){
					console.log(creditArr[j]);
				};
				
				for(j=0; j < onlyCourseNumArr.length ; j++){
					console.log(onlyCourseNumArr[j]);
				};
				for(j=0; j < sectionNumArr.length ; j++){
					console.log(sectionNumArr[j]);
				};*/
			
				
				//console.log(subjectCode);
				//console.log(res.req.path);
		}); //res.on end

	}); //https.get

} //end of for loop


function setUpTables(){


	//open database connection
	let db = new sqlite.Database('.' + path.sep + 'db' + path.sep + 'course_data.db', sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
		  console.error(err.message);
		}
		console.log('Connected to the course_data database.');
	  });




	  //close the database connection
	  db.close((err) => {
		if (err) {
		  console.error(err.message);
		}
		console.log('Close the database connection.');
	  });



}


//returns array of professors 
function getProf(str){
	var profArray =[];
	var i;
	for (i= 0; i < str.length ; i++){
				if(str[i] === 's' && str[i+6] === '3' && str[i+8] === 'm' && str[i+15] === '2' && str[i+23] === '2'){
					
					var pos = 26; 
					var testString = '';
					
					while(str[i+pos] !== '<'){
						if(str[i+pos] !== '\t' && str[i+pos] !== '\n'){
							testString += str[i+pos];
						}
						pos++;					
					}
					
					testString = testString.trim();
						
					profArray.push(testString);		
				}		
	};
	
	return profArray;
	
}



//returns array of course and section numbers 
function getCourseNum(str){
	
	var courseNumArr = [];
	
		for (i= 0; i < str.length ; i++){
			if(str[i] === '>'){
				
				if(isNaN(str[i+1]) === false && isNaN(str[i+2]) === false && isNaN(str[i+3]) === false && str[i+4] === '-'){
					var pos = 1; 
					var testString = '';
					
					while(str[i+pos] !== '<'){
						if(str[i+pos] !== '\t' && str[i+pos] !== '\n'){
							testString += str[i+pos];
						}
						pos++;					
					}
					
					testString = testString.trim();
						
					courseNumArr.push(testString);					
				}
				
				else if(isNaN(str[i+1]) === false && isNaN(str[i+2]) === false && isNaN(str[i+3]) === false && str[i+5] === '-'){
						var pos = 1; 
					var testString = '';
					
					while(str[i+pos] !== '<'){
						if(str[i+pos] !== '\t' && str[i+pos] !== '\n'){
							testString += str[i+pos];
						}
						pos++;					
					}
					
					testString = testString.trim();
						
					courseNumArr.push(testString);
					
				}
				
			}
		
		};
	
	
	return courseNumArr;
}

//return array of course names
function getCourseName(str){
		var courseNameArr = [];
	
		var i;
		for (i= 0; i < str.length ; i++){
			if(str[i] === 's' && str[i+6] === '6' && str[i+8] === 'm' && str[i+15] === '4' && str[i+23] === '4'){
					
				var pos = 26; 
				var testString = '';
					
				while(str[i+pos] !== '<'){
					if(str[i+pos] !== '\t' && str[i+pos] !== '\n'){
						testString += str[i+pos];
					}
						pos++;					
				}
					
				testString = testString.trim();
						
				courseNameArr.push(testString);		
			}		
		};
	
	
	return courseNameArr;	
}

//returns array of building name and room number 
function getBuild(str){
		var buildArr = [];
	
		var i;
		for (i= 0; i < str.length ; i++){
			if(str[i] === 'l' && str[i+1] === 'o' && str[i+2] === 'c' && str[i+3] === 'a' && str[i+4] === 't' && str[i+5] === 'i' && str[i+6] === 'o' && str[i+7] === 'n' && str[i+8] === 'H' && str[i+9] === 'o'){
					
				var pos = i; 
				var testString = '';
					
				while(str[pos] !== '>'){
						pos++;					
				}
				
				pos++;
				
				while(str[pos] !== '<'){
					if(str[pos] !== '\t'){
						testString += str[pos];
					}
					pos++;					
				}
					
				testString = testString.trim();
						
				buildArr.push(testString);		
			}		
		};
	
	return buildArr;	
}

//returns array of capacity sizes
function getCapacity(str){
	
	var capArr = [];
	
		var i;
		for (i= 0; i < str.length ; i++){
			if(str[i] === 'c' && str[i+1] === 'o' && str[i+2] === 'l' && str[i+3] === 'u' && str[i+4] === 'm' && str[i+5] === 'n' && str[i+6] === 's' && str[i+8] === 's' && str[i+9] === 'm' && str[i+14] === '2' && str[i+16] === '>'){
					
				var pos = 17; 
				var testString = '';
				
				while(str[i+pos] !== '<'){
					if(str[i+pos] !== '\t' && isNaN(str[i+pos]) === false && str[i+pos] !== '\n'){
						testString += str[i+pos];
					}
					pos++;					
				}
						
				capArr.push(testString);		
			}		
		};
	
	return capArr;	
	
	
}

//returns an array of CRN numbers
function getCRN(str){
	
	var crnArr = [];
	
		var i;
		for (i= 0; i < str.length ; i++){
			if(str[i] === 'I' && str[i+1] === 'n' && str[i+2] === 'f' && str[i+3] === 'o' && str[i+4] === 'H' && str[i+5] === 'i' && str[i+6] === 'g' && str[i+7] === 'h' && str[i+8] === 'l' && str[i+9] === 'i' && str[i+10] === 'g' && str[i+11] === 'h' && str[i+12] === 't'){
				var pos = 15; 
				var testString = '';
				var crnNum = "";
				while(str[i+pos] !== '<'){
					if(str[i+pos] !== '\t' && str[i+pos]!== '\n'){
						testString += str[i+pos];
						if(isNaN(str[i+pos]) === false){
								crnNum += str[i+pos];
						}
					}
					pos++;					
				}
				testString = testString.trim();
			
				
				if(testString[0] == 'C' && testString[1] == 'R' && testString[2] == 'N' && testString[3] == ":"){
					crnArr.push(crnNum);
				}
			}		
		};
	
	return crnArr;	
	
}

//returns credits of each course 
function getCredits(str){
	
	
	var creditArr = [];
	
		var i;
		for (i= 0; i < str.length ; i++){
			if(str[i] === 'I' && str[i+1] === 'n' && str[i+2] === 'f' && str[i+3] === 'o' && str[i+4] === 'H' && str[i+5] === 'i' && str[i+6] === 'g' && str[i+7] === 'h' && str[i+8] === 'l' && str[i+9] === 'i' && str[i+10] === 'g' && str[i+11] === 'h' && str[i+12] === 't'){
				var pos = 15; 
				var testString = '';
				var creditNum = "";
				while(str[i+pos] !== '<'){
					if(str[i+pos] !== '\t' && str[i+pos]!== '\n'){
						testString += str[i+pos];
						if(isNaN(str[i+pos]) === false || str[i+pos] === '.'){
								creditNum += str[i+pos];
						}
					}
					pos++;					
				}
				testString = testString.trim();
			
				
				if(testString[2] == 'C' && testString[3] == 'r' && testString[4] == 'e' && testString[5] == "d" && testString[6] == "i" && testString[7] == "t"){
					creditArr.push(creditNum);
				}
				
				else if(testString[3] == 'C' && testString[4] == 'r' && testString[5] == 'e' && testString[6] == "d" && testString[7] == "i" && testString[8] == "t"){
					creditArr.push(creditNum);
				}
				
				else if(testString[4] == 'C' && testString[5] == 'r' && testString[6] == 'e' && testString[7] == "d" && testString[8] == "i" && testString[9] == "t"){
					creditArr.push(creditNum);
				}
			}		
		};
	
	return creditArr;	
	
}

//returns an array of course descriptions
function getDescrip(str){
	var descripArr = [];
	
		var i;
		for (i= 0; i < str.length ; i++){
			if(str[i] === 'c' && str[i+1] === 'o' && str[i+2] === 'u' && str[i+3] === 'r' && str[i+4] === 's' && str[i+5] === 'e' && str[i+6] === 'I' && str[i+7] === 'n' && str[i+8] === 'f' && str[i+9] === 'o' && str[i+10]== '"'){
				var pos = 12; 
				var testString = '';
				while(str[i+pos] !== '<'){
					if(str[i+pos] !== '\t' && str[i+pos]!== '\n'){
						testString += str[i+pos];
						
					}
					pos++;					
				}
				testString = testString.trim();
			
				descripArr.push(testString);
				
				
			}		
		};
	
	return descripArr;	

}

//returns the four letter subject code of the current page being parsed 
function getSubject(str){
	var subjectString = "";
	var pattern = /(<h3 style="margin-top:1.5rem">).+<\/h3>/g;
	var match = str.match(pattern);
	if(match != null){
		var fullSubject = match[0];
		var i;
		var flag = true;
		for(i=0; i<fullSubject.length;i++){
			//console.log(fullSubject[i]);
			if(fullSubject[i] == '>' && flag==true){
				subjectString = fullSubject.substring((i+1),(i+5));
				flag=false;
			}
			
		}
	}
	return subjectString;
}


/**
 * parses the given str for the times of the given class.
 * 
 * @param {string} str 
 * @returns {Array} an array of strings that contain the class times for each class, or an empty string if no matches were found.
 */
function getTime(str){
	//parse the string with regex
	var pattern = /(<td class="time">[0-9]+:[0-9]+ (am|pm)<br>[0-9]+:[0-9]+ (am|pm))|(<td class="noTime">(&nbsp))/g;
	var result = str.match(pattern);
	time = []

	// if there were matches
	if(Array.isArray(result)){
		var timePattern = /[0-9]+:[0-9]+ (am|pm)/g;

		//for every class (i = starting index of each new course)
		for(let i = 0; i < result.length; i= i + 7){
			var timestr = "";
			//for every day of the week in the course
			for(let j = i; j < i+7; j++){

				//if there is a time pattern
				if(timePattern.test(result[j])){
					//append the string
					timestr =timestr.concat( getDayNumber(j) + " " +  result[j].match(timePattern)[0] + "-"+result[j].match(timePattern)[1] + ",");	
				}

			}
			//delete the last comma, and add it to the array.
			timestr = timestr.substr(0,timestr.length -1);
			time.push(timestr);	
		}

		return time;
	//if no matches return an empty array.
	}else{
		return [];
	}

}

/**
 * returns the letter code of the day of the week based on the given number.
 * @param {number} i the number of the array 
 * @returns {string} the letter code of the day of the week.
 */
function getDayNumber(i){
	result = "";

	if(i % 7 == 0){
		result = "M";
	}else if(i % 7 == 1){
		result = "T";
	}else if(i % 7 == 2){
		result = "W";
	}else if(i % 7 == 3){
		result = "R";
	}else if(i % 7 == 4){
		result = "F";
	}else if(i % 7 == 5){
		result = "SA";
	}else if(i % 7 == 6){
		result = "SU";
	}


	return result;
}


function getSubjectName(str){
	var pattern = /(<h3 style="margin-top:1.5rem">).+<\/h3>/g;
	var match = str.match(pattern);
	//console.log(match);
	if(match != null){
		var fullSubject = match[0];
		var subjectName = "";
		var i;
		for(i=0; i<fullSubject.length;i++){
			//console.log(fullSubject[i]);
			if(fullSubject[i-15] == ':'){
				var j = i;
				while(fullSubject[j]!='<'){
					subjectName += fullSubject[j];
					j++;
				}
				break;
			}
		}
		//console.log(subjectCode);
	}
	return subjectName;
}