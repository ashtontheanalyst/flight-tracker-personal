// Personal Flight Tracker Using OpenSky API

// This is our site logic, this all kicks off when we click the 'See Flights' button
function callAPI() {
  // CONSTANTS
  let USER;
  let PASS;

  const LAMIN = document.getElementById("lamin").value;
  const LOMIN = document.getElementById("lomin").value;
  const LAMAX = document.getElementById("lamax").value;
  const LOMAX = document.getElementById("lomax").value;

  const BASE = "https://opensky-network.org/api";
  const ALLSTATES = "/states/all";
  const FULLURL = BASE + ALLSTATES + `?lamin=${LAMIN}&lomin=${LOMIN}&lamax=${LAMAX}&lomax=${LOMAX}`;


  // Fetch credentials. This function looks at that local file, gets the body in JSON, and assigns the
  // values from the JSON to our variables. We have an error statement in case of one.
  fetch('credentials.json') 
    .then(response => response.json())
    .then(data => {
      USER = data.clientId;
      PASS = data.clientSecret;
    })
    .catch(error => console.error("Error fetching Credentials:", error));


  // Function for the OpenSky API, it returns an array of the flights with a ton of data in browser console
  const openCall = async () => {
    const response = await fetch(FULLURL, {
      headers: {
        "Authorization": "Basic" + btoa(`${USER}:${PASS}`)
      }
    });
    
    const data = await response.json(); //extract JSON from the http response

    // We can access the 2D array of the returned API object in this manner:
    // console.log(data.states);              Returns the entire 2D array in JSON format
    // console.log(data.states[x])            Returns the array of data for aircraft at index x
    // console.log(data.states[x][x])         Returns the specific piece of data from aircraft at index x
    console.log(data.states[0]);
  }


  // Call API function
  //openCall();
}