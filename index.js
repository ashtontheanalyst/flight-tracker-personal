// Personal Flight Tracker Using OpenSky API

// CONSTs for Creds
let USER;
let PASS;

// CONSTs from HTML Items, latyer used to tell which page we're on
const FLIGHT_PAGE = document.getElementById("flights");
const MAP_PAGE = document.getElementById("map");

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
let boundBox;
let markers = [];
const BCDC_LA = 30.6409;
const BCDC_LO = -96.4876;


// Initialize Icons
var planeIcon = L.icon({
	iconUrl: 'assets/plane.svg',
	iconSize: [22, 22],
	iconAnchor: [11, 11]
})

var boundPointIcon = L.icon({
	iconUrl: 'assets/boundaryIcon.svg',
	iconSize: [22, 22],
	iconAnchor: [11, 21]
})

var BCDCIcon = L.icon({
	iconUrl: 'assets/BCDCIcon.svg',
	iconSize: [22, 22],
	iconAnchor: [11, 21]
})


// DATA: This is the API call to OpenSky that gathers our data object
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



// FLIGHT: If it sees we're on index.html, run these functions
if (FLIGHT_PAGE) {
	flightData();
}


// Takes the big data gathered from the function at top of file and breaks it down by flight and 
// creates a separate div on the page for each
async function flightData() {
	const DATA = await openCall();

	// If no data is returned, end function
	if (!DATA || !DATA.states) {
		console.warn("No flight data received");
		return;
	}

	// Access the flights div on index.html, clear out old data so we can refresh
	let flights = document.getElementById("flights");
	flights.innerHTML = "";

	// Each individual flight is pulled from DATA since it's a 2D array, from that we pull specifics
	for (let i = 0; i < DATA.states.length; i++) {
		// Gather the data from our object/2D array, if we get an invalid response say N/A
		const callsign = DATA.states[i][1] ? DATA.states[i][1].trim() : "N/A";
		const speed = DATA.states[i][9] ? DATA.states[i][9].toFixed(2) : "N/A";
		const altitude = DATA.states[i][7] ? DATA.states[i][7].toFixed(2) : "N/A";
		const lat = DATA.states[i][6] ? DATA.states[i][6].toFixed(4): "N/A";
		const long = DATA.states[i][5] ? DATA.states[i][5].toFixed(4) : "N/A";

		// With this pulled data about a specific flight, make new boxes for each flight
		const indivFlight = document.createElement("div");
		indivFlight.classList.add("indivFlight");					// Add it's CSS, and then below the specific HTML
		indivFlight.innerHTML = `
			<h2><u>${callsign}</u></h2>
			<p><b>Speed:</b>       ${speed}</p>
			<p><b>Altitude:</b>    ${altitude}</p>
			<p><b>Latitude:</b>    ${lat}</p>
			<p><b>Longitude:</b>   ${long}</p>
		`

		// Put the specific flight data "box" into the larger one that displays it nicely on screen
		flights.appendChild(indivFlight);
	}
}




// MAP: If it sees we're on map.html, run these functions
if (MAP_PAGE) {
	// Runs it a single time
    updateMap();

    // Repeats for a time amount
    // setInterval(updateMap, 5000);
}


async function updateMap() {
	// Get our fresh data from the function
	const DATA = await openCall();

	// If there's no data then quit, otherwise make the map
	if (!DATA || !DATA.states) {
		console.warn("No flight data received");
		return;
	} else {
		console.log("Updated map");
		makeMap(DATA);
	}
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

		// Points for the boundaries and location of BCDC
		L.marker([LAMIN, LOMIN], {icon: boundPointIcon}).addTo(map);
		L.marker([LAMAX, LOMAX], {icon: boundPointIcon}).addTo(map);
		boundBox = [[LAMIN, LOMIN], [LAMAX, LOMAX]];
		L.rectangle(boundBox, {color: "#277CE0", weight: 1}).addTo(map);

		// BCDC Location and radius of m
		L.marker([BCDC_LA, BCDC_LO], {icon: BCDCIcon}).addTo(map);
		L.circle([BCDC_LA, BCDC_LO], {radius: 20000, color: "#500000"}).addTo(map);
	}

	// Clear old markers if there are some
	markers.forEach(marker => map.removeLayer(marker));
	markers = [];

	// Add markers of where all the planes are
	for (let i = 0; i < DATA.states.length; i++) {
		// Gather lat, long, and heading (svg rotation)
		const lat = DATA.states[i][6].toFixed(4);
		const long = DATA.states[i][5].toFixed(4);
		const heading = DATA.states[i][10];

		// If the values are indeed there, then add them to the map and the markers list with our ICON
		// This is where that GitHub package is used to rotate the plane SVG icon
		if (lat && long && heading) {
			const marker = L.marker([lat, long], {
				icon: planeIcon,
				rotationAngle: heading,
				rotationOrigin: 'center center'
			}).addTo(map);

			markers.push(marker);
		}
	}
}