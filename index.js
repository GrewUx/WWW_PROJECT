let allMatches = [];
let filteredMatches = [];
let currentlyDisplayed = 10;

const outputElement = document.getElementById('output');
const loadMoreBtn = document.getElementById('load-more-btn');
const loadMoreContainer = document.getElementById('load-more-container');
const searchInput = document.getElementById('search-input');
const dateInput = document.getElementById('date-input');
const clearDateBtn = document.getElementById('clear-date-btn');
const sortSelect = document.getElementById('sort-select');
const seasonSelect = document.getElementById('season-select');
const seasonTitle = document.getElementById('season-title');

// Pobiera dane wybranego sezonu z API 
function loadSeason(season) {
    outputElement.innerHTML = "<div style='padding: 40px; text-align: center; color: #262B40;'>Downloading data...</div>";

    fetch(`https://raw.githubusercontent.com/openfootball/football.json/master/${season}/es.1.json`)
        .then(res => {
            if (!res.ok) throw new Error("Couldn't download data");
            return res.json();
        })
        .then(data => {
            allMatches = data.matches.reverse();

            seasonTitle.textContent = `LA LIGA ${season.replace('-', '/20')} SEASON`;

            calculateStats(allMatches);
            drawChart(allMatches);

            currentlyDisplayed = 10;
            applyFilters();
        })
        .catch(error => {
            outputElement.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">Error: ${error.message}</div>`;
        });
}

// Statystyki liczone w kodzie (nie pobierane z API)
function calculateStats(matches) {
    const playedMatches = matches.filter(m => m.score && m.score.ft);

    const totalGoals = playedMatches.reduce((sum, match) => {
        return sum + match.score.ft[0] + match.score.ft[1];
    }, 0);

    const avg = playedMatches.length > 0 ? (totalGoals / playedMatches.length).toFixed(2) : 0;

    document.getElementById('stat-matches').textContent = playedMatches.length;
    document.getElementById('stat-goals').textContent = totalGoals;
    document.getElementById('stat-avg').textContent = avg;
}

// Wykres: TOP 10 drużyn wg strzelonych goli, rysowany na canvas 
function drawChart(matches) {
    const goalsByTeam = {};

    matches.forEach(match => {
        if (!match.score || !match.score.ft) return;
        goalsByTeam[match.team1] = (goalsByTeam[match.team1] || 0) + match.score.ft[0];
        goalsByTeam[match.team2] = (goalsByTeam[match.team2] || 0) + match.score.ft[1];
    });

    // Sortujemy drużyny po golach i bierzemy 10 najlepszych
    const top = Object.entries(goalsByTeam)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const canvas = document.getElementById('goals-chart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (top.length === 0) return;

    const maxGoals = top[0][1];
    const labelWidth = 170;
    const valueWidth = 45;
    const rowHeight = canvas.height / top.length;
    const barAreaWidth = canvas.width - labelWidth - valueWidth;

    ctx.font = "13px Arial";
    ctx.textBaseline = "middle";

    top.forEach((entry, index) => {
        const [team, goals] = entry;
        const y = index * rowHeight;
        const barHeight = rowHeight * 0.6;
        const barWidth = (goals / maxGoals) * barAreaWidth;

        // Nazwa drużyny
        ctx.fillStyle = "#262B40";
        ctx.textAlign = "right";
        ctx.fillText(team, labelWidth - 10, y + rowHeight / 2);

        // Słupek
        ctx.fillStyle = "#06457F";
        ctx.fillRect(labelWidth, y + (rowHeight - barHeight) / 2, barWidth, barHeight);

        // Liczba goli
        ctx.fillStyle = "#262B40";
        ctx.textAlign = "left";
        ctx.fillText(goals, labelWidth + barWidth + 8, y + rowHeight / 2);
    });
}

//  Filtrowanie (nazwa + data) i sortowanie razem 
function applyFilters() {
    const text = searchInput.value.toLowerCase();
    const chosenDate = dateInput.value; // format "2020-09-12" - taki sam jak w danych

    filteredMatches = allMatches.filter(match => {
        const home = match.team1.toLowerCase();
        const away = match.team2.toLowerCase();
        const matchesText = home.includes(text) || away.includes(text);
        const matchesDate = !chosenDate || match.date === chosenDate;
        return matchesText && matchesDate;
    });

    sortMatches();
    renderMatches();
}

function totalGoalsOf(match) {
    if (!match.score || !match.score.ft) return -1; // mecze bez wyniku na koniec
    return match.score.ft[0] + match.score.ft[1];
}

function sortMatches() {
    const mode = sortSelect.value;

    filteredMatches.sort((a, b) => {
        if (mode === "date-asc") return a.date.localeCompare(b.date);
        if (mode === "date-desc") return b.date.localeCompare(a.date);
        if (mode === "goals-asc") return totalGoalsOf(a) - totalGoalsOf(b);
        if (mode === "goals-desc") return totalGoalsOf(b) - totalGoalsOf(a);
        return 0;
    });
}

function renderMatches() {
    const matchesToShow = filteredMatches.slice(0, currentlyDisplayed);

    if (matchesToShow.length === 0) {
        outputElement.innerHTML = "<div style='padding: 20px; text-align: center; color: #888;'>Couldn't find matching matches.</div>";
        loadMoreContainer.style.display = "none";
        return;
    }

    let html = "<ul>";

    matchesToShow.forEach(match => {
        const date = match.date;
        const scoreHome = match.score ? match.score.ft[0] : "-";
        const scoreAway = match.score ? match.score.ft[1] : "-";
        const score = `(${scoreHome} - ${scoreAway})`;

        const homeTeam = match.team1;
        const awayTeam = match.team2;

        const season = seasonSelect.value;
        const matchLink = `mecz.html?team1=${encodeURIComponent(homeTeam)}&team2=${encodeURIComponent(awayTeam)}&season=${encodeURIComponent(season)}`;

        html += `<li><a href="${matchLink}"><b>${date}</b> ${homeTeam} - ${awayTeam} <b>${score}</b></a></li>`;
    });

    outputElement.innerHTML = html + "</ul>";

    loadMoreContainer.style.display = filteredMatches.length > currentlyDisplayed ? "block" : "none";
}

// --- Zdarzenia ---
loadMoreBtn.addEventListener("click", () => {
    currentlyDisplayed += 10;
    renderMatches();
});

searchInput.addEventListener("input", () => {
    currentlyDisplayed = 10;
    applyFilters();
});

dateInput.addEventListener("input", () => {
    currentlyDisplayed = 10;
    applyFilters();
});

clearDateBtn.addEventListener("click", () => {
    dateInput.value = "";
    currentlyDisplayed = 10;
    applyFilters();
});

sortSelect.addEventListener("change", () => {
    applyFilters();
});

seasonSelect.addEventListener("change", () => {
    loadSeason(seasonSelect.value);
});

// Start - ładujemy domyślnie wybrany sezon
loadSeason(seasonSelect.value);
