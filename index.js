let allMatches = [];
let filteredMatches = []; 
let currentlyDisplayed = 10;

const outputElement = document.getElementById('output');
const loadMoreBtn = document.getElementById('load-more-btn');
const loadMoreContainer = document.getElementById('load-more-container');
const searchInput = document.getElementById('search-input');

outputElement.innerHTML = "<div style='padding: 40px; text-align: center; color: #262B40;'>Downloading data...</div>";

fetch("https://raw.githubusercontent.com/openfootball/football.json/master/2020-21/es.1.json")
.then(res => {
    if (!res.ok) throw new Error("Błąd pobierania danych");
    return res.json();
})
.then(data => {
    allMatches = data.matches.reverse(); 
    filteredMatches = allMatches; 
    
    
    calculateStats(allMatches);

    renderMatches();
})
.catch(error => {
    outputElement.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">Błąd: ${error.message}</div>`;
});


function calculateStats(matches) {
    
    const rozegraneMecze = matches.filter(m => m.score && m.score.ft);
    
   
    const sumaGoli = rozegraneMecze.reduce((suma, match) => {
        return suma + match.score.ft[0] + match.score.ft[1];
    }, 0);

    // Wstrzykujemy obliczone liczby do HTML
    document.getElementById('stat-matches').textContent = rozegraneMecze.length;
    document.getElementById('stat-goals').textContent = sumaGoli;
}



function renderMatches() {
    let html = "<ul>";
    
    
    const matchesToShow = filteredMatches.slice(0, currentlyDisplayed);
    
    if (matchesToShow.length === 0) {
        outputElement.innerHTML = "<div style='padding: 20px; text-align: center; color: #888;'>Couldn't find matching teams.</div>";
        loadMoreContainer.style.display = "none";
        return;
    }

    matchesToShow.forEach(match => {
        const date = match.date;
        const scoreHome = match.score ? match.score.ft[0] : "-";
        const scoreAway = match.score ? match.score.ft[1] : "-";
        const score = `(${scoreHome} - ${scoreAway})`;

        const homeTeam = match.team1;
        const awayTeam = match.team2;

        const matchLink = `mecz.html?team1=${encodeURIComponent(homeTeam)}&team2=${encodeURIComponent(awayTeam)}`;

        html += `<li><a href="${matchLink}"><b>${date}</b> ${homeTeam} - ${awayTeam} <b>${score}</b></a></li>`;
    });

    outputElement.innerHTML = html + "</ul>";

   
    if (filteredMatches.length > currentlyDisplayed) {
        loadMoreContainer.style.display = "block";
    } else {
        loadMoreContainer.style.display = "none";
    }
}

loadMoreBtn.addEventListener("click", () => {
    currentlyDisplayed += 10;
    renderMatches();
});


searchInput.addEventListener("input", (event) => {
    
    const wpisanyTekst = event.target.value.toLowerCase();
    
    
    filteredMatches = allMatches.filter(match => {
        const home = match.team1.toLowerCase();
        const away = match.team2.toLowerCase();
        
        return home.includes(wpisanyTekst) || away.includes(wpisanyTekst);
    });

    
    currentlyDisplayed = 10;
    renderMatches();
});