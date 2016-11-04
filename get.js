  if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " [input file]");
    process.exit(-1);
}

var inputFile = process.argv[2];
console.log('input file: ' + inputFile);
var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader(inputFile);

var google = require('googleapis');
google.options({ params: { auth: 'AIzaSyDDonpM1vybmCVszUgAeyw9RbgngN85Idc'} }); // specify your API key here
var civicinfo = google.civicinfo('v2');
var electionId = 5000; // 5000 is the id of the U.S. Federal election 2016
var logline;
var Lines = [];
var LinesLength = 0;
var LineParts = [];


function getLines() {
  lr.on('line', function (line) {
//    precinctAndvoterAddress = precinctName + "," + voterAddress;
    // console.log("voterAddress is " + voterAddress);  // DEBUG
    Lines.unshift(line);
  });

  lr.on('end', function () {
  	// All lines are read, file is closed now.
    LoopLines(Lines, Lines.length);
  });
}


function LoopLines(Lines, length){
  --length; // work our way backwards through the array
  setTimeout(function () {
    line = Lines[length];
    LineParts = line.split(',');
    precinctName = LineParts[0];
    voterAddress = LineParts[1];

    getPollingplace(precinctName,voterAddress);
      if (length) {          // if we haven't decremented down to zero,
        LoopLines(Lines, length);       // Call the loop again, and pass it the current value of i
      }
    }, 3000); // wait three seconds to avoid hitting the API too fast
  }


  function getPollingplace(precinctName, voterAddress){
        civicinfo.elections.voterInfoQuery({ 'electionId' : electionId,  'address' : voterAddress}, function(err, response) {
          // var logline = precinctName + "\t" +voterAddress + " \t" ;
          var logline = precinctName + "\t"  ;
          if (err) {
            logline += err.message;
          } else if (response.pollingLocations){
            try {
               logline +=
                         response.pollingLocations[0].address.locationName + "\t" +
                         response.pollingLocations[0].address.line1 + "\t" +
                         response.pollingLocations[0].address.city + "\t" +
                         response.pollingLocations[0].address.state + "\t" +
                         response.pollingLocations[0].address.zip + "\t" +
                         response.pollingLocations[0].sources[0].name // should be smarter about the case where there is more than one source
                         ;




             }
             catch(err) {
               logline += "something unexpected happened";
             }
           } else {
             logline += "no polling locations found";
           }
           console.log(logline);
         });
  }


getLines();
