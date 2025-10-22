const mapElement = document.getElementById("map");

var mapIcon = L.icon({
  iconUrl: "./assets/icons/favicon.ico",

  iconSize: [38, 38], // size of the icon

  iconAnchor: [19, 19], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -19], // point from which the popup should open relative to the iconAnchor
});

if (mapElement) {
  const map = L.map("map").setView([51.22992, 4.41509], 16);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  L.marker([51.22992, 4.41509], { icon: mapIcon })
    .addTo(map)
    .bindPopup("<b>AP Hogeschool</b><br>Ellermanstraat 33, 2060 Antwerpen")
    .openPopup();
}
