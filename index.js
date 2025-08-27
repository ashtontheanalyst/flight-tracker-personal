// Personal Flight Tracker Using OpenSky API

// CONSTs for Creds
let USER;
let PASS;

// CONSTs from HTML Items
const FLIGHTS = document.getElementById("flights");

// CONSTs for API
const LAMIN = 30.0707;
const LOMIN = -97.2864;
const LAMAX = 31.3664;
const LOMAX = -95.4353;

const BASE = "https://opensky-network.org/api";
const ALLSTATES = "/states/all";
const FULLURL = BASE + ALLSTATES + `?lamin=${LAMIN}&lomin=${LOMIN}&lamax=${LAMAX}&lomax=${LOMAX}`;

// CONSTs for Map
let map;
let markers = [];


// This is our DATA GATHERING function
async function openCall() {
	try {
		// Fetch credentials
		const CREDS = await fetch("credentials.json").then(res => res.json());
		USER = CREDS.clientId;
		PASS = CREDS.clientSecret;

		// Fetch our flights
		const response = await fetch(FULLURL, {
			headers: {
				"Authorization": "Basic" + btoa(`${USER}:${PASS}`)
			}
		});

		// Gather the data once it resolves from the fetch request then return it
		const DATA = await response.json();
		return DATA;
	}
	// Return an error in case something breaks
	catch(error) {
		console.error("Error in the openCall function:", error);
		return null;
	}
}

// Function for our individual flights
async function flightData() {
	// Gather the data by calling our data function
	const DATA = await openCall();

	// If no data is returned, end function
	if (!DATA || !DATA.states) {
		console.warn("No flight data received");
		return;
	}

	// Clear out old data if there was any
	FLIGHTS.innerHTML = "";

	// Each individual flight is pulled from DATA since it's a 2D array, from that we pull specifics
	for (let i = 0; i < DATA.states.length; i++) {
		// Gather the data from our object/2D array, if we get an invalid response say N/A
		const callsign = DATA.states[i][1] ? DATA.states[i][1].trim() : "N/A";
		const speed = DATA.states[i][9] ? DATA.states[i][9].toFixed(2) : "N/A";
		const altitude = DATA.states[i][7] ? DATA.states[i][7].toFixed(2) : "N/A";
		const lat = DATA.states[i][6] ? DATA.states[i][6].toFixed(4): "N/A";
		const long = DATA.states[i][5] ? DATA.states[i][5].toFixed(4) : "N/A";

		// With this pulled data about a specific flight, make new boxes for each flight
		const iFLIGHT = document.createElement("div");
		iFLIGHT.classList.add("iFlight");					// Add it's CSS, and then below the specific HTML
		iFLIGHT.innerHTML = `
			<h2><u>${callsign}</u></h2>
			<p><b>Speed:</b>       ${speed}</p>
			<p><b>Altitude:</b>    ${altitude}</p>
			<p><b>Latitude:</b>    ${lat}</p>
			<p><b>Longitude:</b>   ${long}</p>
		`

		// Put the specific flight data "box" into the larger one that displays it nicely on screen
		FLIGHTS.appendChild(iFLIGHT);
	}
}

// Call the function to get data and the boxes for index.html
if (document.getElementById("flights")) {
	// Only run flight boxes if we are on index.html
	flightData();
}



// MAP
// This is for map.html, if it sees we're on the map.html page we'll do this code:
if (document.getElementById("map")) {
    async function updateMap() {
		// Get our fresh data
        const DATA = await openCall();

		// If there's no data then quit, somethings wrong
        if (!DATA || !DATA.states) return;

        makeMap(DATA);
    }

    // Initial load
    updateMap();

    // Repeat every 5 seconds
    setInterval(updateMap, 5000);
}

function makeMap(DATA) {
	// If we don't have a map, make one, if one alread yexists then go on to markers
	if (!map) {
		map = L.map('map');							// Create an instance of a map from Leaflet
		map.setView([30.6210, -96.3255], 9);	    // [lat, long], zoom -> right now it's on CSTAT

		// Make a layer, this actually shows us the satellite image and details on the map
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map)
	}

	// Clear old markers if there are some
	markers.forEach(marker => map.removeLayer(marker));
	markers = [];

	// Add markers of where all the planes are
	for (let i = 0; i < DATA.states.length; i++) {
		const lat = DATA.states[i][6].toFixed(4);
		const long = DATA.states[i][5].toFixed(4);

		// If the values are indeed there, then add them to the map and the markers list
		if (lat && long) {
			const marker = L.marker([lat, long]).addTo(map)
			markers.push(marker);
		}
	}
}