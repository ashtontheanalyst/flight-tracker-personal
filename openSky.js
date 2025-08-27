// Personal Flight Tracker Using OpenSky API

// When 'See Flights' is CLICKED, do this...
function callAPI() {
  // CONSTANTS
  const LAMIN = 30.0707;
  const LOMIN = -97.2864;
  const LAMAX = 31.3664;
  const LOMAX = -95.4353;

  const BASE = "https://opensky-network.org/api";
  const ALLSTATES = "/states/all";
  const FULLURL = BASE + ALLSTATES + `?lamin=${LAMIN}&lomin=${LOMIN}&lamax=${LAMAX}&lomax=${LOMAX}`;


  // Function for the OpenSky API, it returns an array of the flights with a ton of data in browser console
  const openCall = async () => {
    // Fetch credentials from our local JSON file containing it
    let USER;
    let PASS;

    fetch('credentials.json') 
      .then(response => response.json())
      .then(data => {
        USER = data.clientId;
        PASS = data.clientSecret;
      })
      .catch(error => console.error("Error fetching Credentials:", error));
    
    const response = await fetch(FULLURL, {
      headers: {
        "Authorization": "Basic" + btoa(`${USER}:${PASS}`)
      }
    });
    
    const data = await response.json(); //extract JSON from the http response

    // Listing out our flights
    const FLIGHTS = document.getElementById("flights");

    for (let i = 0; i < data.states.length; i++) {
      // Gather the data from our object/2D array
      const callsign = data.states[i][1] ? data.states[i][1].trim() : "N/A";
      const speed = data.states[i][9] ? data.states[i][9].toFixed(2) : "N/A";
      const altitude = data.states[i][7] ? data.states[i][7].toFixed(2) : "N/A";
      const lat = data.states[i][6] ? data.states[i][6].toFixed(4): "N/A";
      const long = data.states[i][5] ? data.states[i][5].toFixed(4) : "N/A";

      // Create the individual flight boxes
      const indivFlight = document.createElement("div");
      indivFlight.classList.add("indivFlight");
      indivFlight.innerHTML = `
        <h2><u>${callsign}</u></h2>
        <p><b>Speed:</b>     ${speed}</p>
        <p><b>Altitude:</b>  ${altitude}</p>
        <p><b>Latitude:</b>  ${lat}</p>
        <p><b>Longitude:</b> ${long}</p>
      `

      // Append the newly made box to the list
      FLIGHTS.appendChild(indivFlight);
    }
  }

  // Call API function
  openCall();
}