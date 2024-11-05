// logic.js

// Create a map and set initial view
var map = L.map('map').setView([37.8, -96], 5); 

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to determine color based on earthquake depth
function getColor(depth) {
    return depth < 10 ? "#00FF00" : // Shallow earthquakes (green)
           depth < 100 ? "#FFFF00" : // Moderate depth (yellow)
           depth < 300 ? "#FF7F00" : // Deep earthquakes (orange)
           "#FF0000";               // Very deep earthquakes (red)
}

function getRadius(magnitude) {
    return Math.max(magnitude * 4, 5); 
}

// Fetch earthquake data from the USGS feed
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(response => response.json())
    .then(data => {
        data.features.forEach(function (quake) {
            var lat = quake.geometry.coordinates[1]; // Latitude
            var lon = quake.geometry.coordinates[0]; // Longitude
            var depth = quake.geometry.coordinates[2]; // Depth (in km)
            var magnitude = quake.properties.mag; // Magnitude

            // Create a circle marker for each earthquake
            L.circleMarker([lat, lon], {
                radius: getRadius(magnitude),
                fillColor: getColor(depth), 
                color: "#000", 
                weight: 1, 
                opacity: 1, 
                fillOpacity: 0.7 
            })
            .bindPopup(`
                <strong>Location:</strong> ${quake.properties.place}<br>
                <strong>Magnitude:</strong> ${magnitude}<br>
                <strong>Depth:</strong> ${depth} km<br>
                <strong>Time:</strong> ${new Date(quake.properties.time).toLocaleString()}
            `) 
            .addTo(map); 
        });

        // Add a legend to the map
        var legend = L.control({ position: "bottomright" });

        legend.onAdd = function () {
            var div = L.DomUtil.create('div', 'legend');
            var grades = [0, 10, 100, 300]; 
            var labels = ['< 10 km', '10 - 100 km', '100 - 300 km', '> 300 km']; 
            var colors = ['#00FF00', '#FFFF00', '#FF7F00', '#FF0000']; 

            // Loop through each range and create a label with a colored box
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<div><i style="background:' + colors[i] + '"></i> ' +
                    labels[i] + '</div>';
            }

            return div;
        };
        legend.addTo(map);
    })
    .catch(error => console.error('Error fetching the earthquake data:', error));