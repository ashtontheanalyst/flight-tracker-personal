# Personal ADS-B Flight Tracking Application
The plan for this application as of 27AUG25 is to create a web application that utilizes the OpenSky
API (with account authorization) to display flight details in the greater CSTAT area.


## OpenSky REST API Notes:
Based on the [REST API Documentation](https://openskynetwork.github.io/opensky-api/rest.html#all-state-vectors), 
this API call returns an object which is actually a 2D array. The collection of arrays contains arrays that have 
aircraft data and telemetry, see the example below:

```sh
# This is the /all states query, boxed in with Long max/min and Lang max/min
https://opensky-network.org/api/states/all?lamin=30.0707&lomin=-97.2864&lamax=31.3664&lomax=-95.4353
```
  
```sh
{"time":1756305312,"states":
[["a728e2","N560WD  ","United States",1756305310,1756305311,-96.0715,30.6779,2872.74,false,165.3,162.24,-10.08,null,3055.62,null,false,0],
... (more JSON) ...
["a7f70e","N612KA  ","United States",1756305306,1756305306,-96.5878,30.8221,739.14,false,66.59,339.18,0.33,null,792.48,null,false,0]]}
```


## Map:
This [tutorial](https://www.youtube.com/watch?v=NyjMmNCtKf4) is useful for the basics of using Leaflet
and OpenStreet on your webpage.
- This [GitHub Repo](https://github.com/bbecquet/Leaflet.RotatedMarker/tree/master) is what allows
us to rotate the markers by the heading. It's initialized in `map.html` and used in `index.js`


## General Notes:
- **Latitude:** is the horizontal imaginary lines on the globe, the equator is 0, below is neg. and above is pos.
- **Longitude:** is the vertical lines, the prime meridian is 0, west (left) is neg. and east (right) is pos.

## Status:
The site is now tracking data from the OpenSky API within the predetermined box that I have assigned. It
intakes the data from the API and creates individual flight boxes on the screen.