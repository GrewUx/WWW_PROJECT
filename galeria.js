const track = document.getElementById("carousel-track");
const slides = track.querySelectorAll("img");
const dotsContainer = document.getElementById("carousel-dots");

let current = 0;

// Tworzymy kropki nawigacyjne - po jednej na każde zdjęcie
slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.setAttribute("aria-label", "Go to photo " + (index + 1));
    dot.addEventListener("click", () => goTo(index));
    dotsContainer.appendChild(dot);
});

const dots = dotsContainer.querySelectorAll(".dot");

// Przesuwa całą taśmę ze zdjęciami
function updateCarousel() {
    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === current);
    });
}

function goTo(index) {
    current = (index + slides.length) % slides.length;
    updateCarousel();
}

document.getElementById("btn-next").addEventListener("click", () => goTo(current + 1));
document.getElementById("btn-prev").addEventListener("click", () => goTo(current - 1));

// Obsługa strzałek na klawiaturze 
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") goTo(current + 1);
    if (event.key === "ArrowLeft") goTo(current - 1);
});

updateCarousel();
