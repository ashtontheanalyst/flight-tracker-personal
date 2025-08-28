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

		console.log("Authorization header:", "Basic " + btoa(`${USER}:${PASS}`));

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
		}).addTo(map);

		/* This is a good satellite map!
		L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
			maxZoom: 20,
			attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
		}).addTo(map);
		*/

		// Draw the boundary box on the map
		boundBox = [[LAMIN, LOMIN], [LAMAX, LOMAX]];
		L.rectangle(boundBox, {color: "#277CE0", weight: 3}).addTo(map);
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

		// This is the text that is in our pop up for the planes
		const callsign = DATA.states[i][1].trim();
		const speed = DATA.states[i][9].toFixed(2);
		let flightInfo = `<pre>${callsign}<br>Speed: ${speed}<br>Dir:   ${heading}<br>Lat:   ${lat}<br>Long:  ${long}</pre>`;

		// If the values are indeed there, then add them to the map and the markers list with our ICON
		// This is where that GitHub package is used to rotate the plane SVG icon
		if (lat && long && heading) {
			const marker = L.marker([lat, long], {
				icon: planeIcon,
				rotationAngle: heading,
				rotationOrigin: 'center center'
			}).addTo(map)
				.bindPopup(flightInfo)
				.openPopup();

			markers.push(marker);
		}
	}
}