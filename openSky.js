// Logic for the OpenSky API call for flight data
// DOC: https://openskynetwork.github.io/opensky-api/rest.html

// CONSTANTS
let USER;
let PASS;
const BASE = "https://opensky-network.org/api";
const ALLSTATES = "/states/all";


// Fetch credentials. This function looks at that local file, gets the body in JSON, and assigns the
// values from the JSON to our variables. We have an error statement in case of one.
// NOTE: The clientSecret token resets every 30 minutes so you have to regenerate it from here: https://opensky-network.org/my-opensky/account
fetch('credentials.json')
  .then(response => response.json())
  .then(data => {
    USER = data.clientId;
    PASS = data.clientSecret;
  })
  .catch(error => console.error("Error fetching Credentials:", error));


// Latitude is the horizontal imaginary lines on the globe, the equator is 0, below is neg. and above is pos.
// Longitude is the vertical lines, the prime meridian is 0, west (left) is neg. and east (right) is pos.
let lamin;                  // lower lat bound
let lomin;                  // lower long bound
let lamax;                  // upper lat bound
let lomax;                  // upper long bound

// Boxing around greater CSTAT area, OpenSky likes 4 decimal points where possible
lamin = 30.0707;
lomin = -97.2864;           // Bastrop, TX
lamax = 31.3664;
lomax = -95.4353;           // Crockett, TX

// Build the call
const fullUrl = BASE + ALLSTATES + `?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;


// Function for the OpenSky API, it returns an array of the flights with a ton of data in browser console
const openCall = async () => {
  const response = await fetch(fullUrl, {
    headers: {
      "Authorization": "Basic" + btoa(`${USER}:${PASS}`)
    }
  });
  
  const data = await response.json(); //extract JSON from the http response
  console.log(data);
}


// Call API function
// openCall();