const mapElement = document.getElementById('map');
if (mapElement) {
    const map = L.map("map").setView([51.22992, 4.41509], 16);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([51.22992, 4.41509])
        .addTo(map)
        .bindPopup("<b>AP Hogeschool</b><br>Ellermanstraat 33, 2060 Antwerpen")
        .openPopup();
}
