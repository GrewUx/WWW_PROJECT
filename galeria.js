const photos = [
    "PHOTO_1.jpeg",
    "PHOTO_2.jpg",
    "PHOTO_3.jpg"
];

let current = 0;
const imgElement = document.getElementById("car-image");

document.getElementById("btn-next").addEventListener("click", function() {
    current = (current + 1) % photos.length;
    imgElement.src = photos[current];
});

document.getElementById("btn-prev").addEventListener("click", function() {
    current = (current - 1 + photos.length) % photos.length;
    imgElement.src = photos[current];
});