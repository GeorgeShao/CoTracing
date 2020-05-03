var isMapReady = false;
var lastCompare

async function loadJSON(files){
  if (files.length <= 0) {
    return false;
  }
  
  console.debug("Attempting to load "+files[0].name);
  let domstr = await ReadFilePr(files.item(0));
  
  let result = JSON.parse(domstr);
  //---- FOR TESTING ----
  //var formatted = JSON.stringify(result, null, 2);
  //document.getElementById('result').innerHTML = formatted;
  //console.debug(result);
  //-- END FOR TESTING --
  return result;
}

function ReadFilePr(file){
  return new Promise((resolve, reject) => {
    var fr = new FileReader();  
    fr.onload = () => {
      resolve(fr.result)
    };
    fr.readAsText(file);
  });
}


async function compute(JSONPromise){
    let placeVisit = [];
    let locationData = await JSONPromise;
    for (i in locationData.timelineObjects){
      if (locationData.timelineObjects[i].hasOwnProperty('placeVisit')){
          placeVisit.push({
            latitude: locationData.timelineObjects[i].placeVisit.location.latitudeE7,
            longitude: locationData.timelineObjects[i].placeVisit.location.longitudeE7,
            startTime: Number(locationData.timelineObjects[i].placeVisit.duration.startTimestampMs),
            endTime: Number(locationData.timelineObjects[i].placeVisit.duration.endTimestampMs)
          });
      }
    }
    console.debug(placeVisit);
    //document.getElementById('result').innerHTML = JSON.stringify(placeVisit);
    
    return placeVisit;
}

async function SendtoDB(placeVisitPromise){
  let arrForPatient = await placeVisitPromise;
  if (arrForPatient.length==0){
    document.getElementById("MainTxt").innerHTML="Submission unsuccessful! Please submit a valid file";
    document.getElementById("MainTxt").style.color="Red";
    document.getElementById("selectFiles").style.display = "none";
    document.getElementById("import").style.display="none";
  }
  else{
    let database = firebase.database();
    database.ref("patients/Counter").once("value").then(function(snapshot){
    for(entrynum=0; entrynum<arrForPatient.length; entrynum++){
      database.ref("patients/"+snapshot.val()+"/"+entrynum).set({
        "latitude":arrForPatient[entrynum].latitude,
        "longitude":arrForPatient[entrynum].longitude,
        "startTime":arrForPatient[entrynum].startTime,
        "endTime":arrForPatient[entrynum].endTime
      });
    }
    database.ref("patients/"+snapshot.val()).update({Counter:arrForPatient.length});
    database.ref("patients/Counter").set(snapshot.val()+1);

    });
    document.getElementById("MainTxt").innerHTML="Submission successful!";
    document.getElementById("MainTxt").style.color="green";
    document.getElementById("selectFiles").style.display = "none";
    document.getElementById("import").style.display="none";

  }

}

// broken from CORS
// async function SendEmail(address, subject, body){
//   let headers = new Headers({'Content-Type': 'application/json', 'Authorization': 'Bearer '+SENDGRID_API_KEY})
//   let req = new Request("https://api.sendgrid.com/v3/mail/send", {method: "POST", headers, body: '{"personalizations": [{"to": [{"email": "' + address + '"}]}],"from": {"email": "tohacks@seang.win"},"subject": "' + subject + '","content": [{"type": "text/plain", "value": "' + body + '"}]}'});
//   fetch(req);
// }

// LEGACY IMPLEMENTATION - for reference only
async function compare(placeVisitPromise){
  let placeVisit = await placeVisitPromise;
  let patientCounter = 0;
  let database = firebase.database();
  patientCounter = (await database.ref("patients/Counter").once("value")).val();
  
  console.debug(patientCounter);
  let commonLocations = []

  for(i=0;i<patientCounter;i++)
  {
    let patientJSON = (await database.ref("patients/"+i).once("value")).val();
      
    for(j= 0; j < patientJSON.Counter; j++)
    {
      //console.log(i + " " +j);
      for(k=0;k<placeVisit.length;k++)
      {
        let loc = placeVisit[k];
        let patientLoc = patientJSON[j];
        
        const bounds = 3000;
        const quarantineTime = 86400000;
        if((Math.abs(patientLoc.latitude - loc.latitude) <= bounds) && (Math.abs(patientLoc.longitude - loc.longitude) <= bounds))
        {
          if(Math.abs(patientLoc.endTime-loc.startTime) <= quarantineTime)
          {
            
            commonLocations.push({longitude: loc.longitude, latitude: loc.latitude, time: loc.startTime}); 
          }
          
        }
      }
    }
  }
  if(commonLocations.length == 0){
    document.getElementById('selectFiles').style.display = "none";
    document.getElementById('import').style.display = "none";
    document.getElementById('feedback').innerHTML = "You have not been in contact with COVID-19 patients.";
    document.getElementById('feedback').style.color = "green";
    
  }
  else
  {
    document.getElementById('import').style.display = "none";
    document.getElementById('selectFiles').style.display = "none";
    let times = " time. ";
    if(commonLocations.length > 1) { times = " times. "; }
    document.getElementById('feedback').innerHTML = "You have been in contact with COVID-19 patients "  + commonLocations.length + times + ' <a href="https://www.who.int/health-topics/coronavirus">Click Here to Learn Potential Next Steps</a>';
    document.getElementById('feedback').style.color = "red";
    document.getElementById('toMap').classList.remove("map-hidden");
    export2txt(commonLocations); 
  }

  lastCompare = commonLocations;
  return commonLocations;
}

async function getPatients()
{
  let database = firebase.database();
  let patient = (await database.ref("patients").once("value")).val();
  let patients = [];
  for(i =0 ; i < patient.Counter; i++)
  {
    patients.push(patient[i]);
  }
  return patients;
}
async function runDCPInner(placeVisitPromise)
{
  let placeVisit = await placeVisitPromise;
  let patients = (await getPatients());
  
  let placeVisitArr = [];
  for(i = 0; i < patients.length; i++)
  {
    placeVisitArr.push(placeVisit);
  }
  let result = await compareDCP(placeVisitArr, patients);
  return result;
  /*let resultsArr = await compareDCP(placeVisitArr, patients);
  let returningArr = [];

  for(i = 0; i < resultsArr.length; i++)
  {
    let arr = resultsArr[i];
    for(j = 0; j < arr.length; j++)
    {
      returningArr.push(resultsArr[j]);
    }
  }
  return returningArr;
  */
}
async function runDCPOuter(placeVisit)
{
  document.getElementById('selectFiles').style.display = "none";
  document.getElementById('import').style.display = "none";

  document.getElementById('feedback').innerHTML = "Processing data, please wait...";
  document.getElementById('feedback').style.color = "yellow";

  let resultsArr = await runDCPInner(placeVisit);
  let commonLocations = [];

  for(i = 0; i < resultsArr.length; i++)
  {
    let arr = resultsArr[i];
    for(j = 0; j < arr.length; j++)
    {
      
      commonLocations.push(arr[j]);
    }
  }
  console.log(commonLocations);
  if(commonLocations.length == 0){
    document.getElementById('feedback').innerHTML = "You have not been in contact with COVID-19 patients.";
    document.getElementById('feedback').style.color = "lightgreen";
  }
  else
  {
    let times = " time. ";
    if(commonLocations.length > 1) { times = " times. "; }
    document.getElementById('feedback').innerHTML = "You have been in contact with COVID-19 patients "  + commonLocations.length + times + ' <a href="https://www.who.int/health-topics/coronavirus" target="_blank">Click Here For Next Steps</a>';
    document.getElementById('feedback').style.color = "red";
    document.getElementById('toMap').classList.remove("map-hidden");
    export2txt(commonLocations); 
  }

  lastCompare = commonLocations;
  return commonLocations;
}

async function compareDCP(placeVisit, patients){
  const { compute } = dcp;
  var arr = patients;
  var arr1 = placeVisit;
  // Create Job
  let job = compute.for(arr,
  function(i, arr1) {
      progress(1);
      let commonLocations = [];
      for(j=0; j < i.Counter; j++)
      {
        for(k=0;k<arr1.length;k++)
        {
          let loc = arr1[k];
          let patientLoc = i[j];
          
          const bounds = 3000;
          const quarantineTime = 86400000;
          if((Math.abs(patientLoc.latitude - loc.latitude) <= bounds) && (Math.abs(patientLoc.longitude - loc.longitude) <= bounds))
          {
            if(Math.abs(patientLoc.endTime-loc.startTime) <= quarantineTime)
            {
              commonLocations.push({longitude: loc.longitude, latitude: loc.latitude, time: loc.startTime}); 
            }
            
          }
        }
      }

      return commonLocations;
    }, arr1
  );

  // Listen for events
  job.addListener('status', event => {
    if (event.distributed < 1) {
    	console.debug("Distributing to workers...");
    } else {
  	  console.debug(`${event.computed} out of ${event.total} results computed. ${event.distributed} distributed.`);
    }
  });

  let resultHandle = await job.exec(0.00001);
  let results = resultHandle.values();
  return results;
}
async function export2txt(arr) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(arr, null, 2)], {
    type: "text/plain"
  }));
  a.setAttribute("download", "data.txt");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
// non-functional pdf code
// function createPDF(){
//   var doc = new jsPDF();
//   // replace #ignorePDF with the id(s) of stuff you don't want to be printed to html
//   var elementHandler = {
//     '#createPDF': function (element, renderer) {
//       return true;
//     }
//   };
//   var source = window.document.getElementsByTagName("body")[0];
//   doc.fromHTML(
//       source,
//       15,
//       15,
//       {
//         'width': 180,'elementHandlers': elementHandler
//       });
//   doc.output("dataurlnewwindow");
// }

function initMap() {
  map = new google.maps.Map(document.getElementById('heatmap'), {
      center: {lat: 0, lng: 0},
      zoom: 8
  });
}

function mapReady() {
  isMapReady = true;
}

function geocodeLatLng(lat, lng) {
  var latlng = {lat: lat/10000000, lng: lng/10000000};
  var geocoder = new google.maps.Geocoder;
  return new Promise(function(resolve, reject) {
    geocoder.geocode({'location': latlng}, function(results, status) {
      if (status === 'OK') {
          resolve(results[0].formatted_address);
      } else {
          // reject(new Error('Couldnt\'t find the location ' + latlng));
          resolve('Couldnt\'t find the location ' + latlng.lat + " " + latlng.lng);
      }
    })
  })
}

async function plotCommonLocations(commonLocationsPromise){
  let commonLocations = await commonLocationsPromise;
  if(!commonLocations.length > 0 || !isMapReady) { return; }
  initMap();
  let elems = document.getElementsByClassName("map-hidden");
  Array.from(elems).forEach(function(element){ element.classList.remove("map-hidden") });
  commonLocations.forEach(function(location) {
    let encounterTime = new Date(location.time);
    let latlng = {lat: location.latitude/10000000, lng: location.longitude/10000000};
    // console.log(latlng.lat+ " " +latlng.lng);
    let marker = new google.maps.Marker({
      position: latlng,
      title: encounterTime.toLocaleDateString()
    });
    marker.setMap(map);
  });
  map.panTo({lat: commonLocations[0].latitude/10000000, lng: commonLocations[0].longitude/10000000});
  document.getElementById("heatmap").scrollIntoView({ 
    behavior: 'smooth'
  });
}
