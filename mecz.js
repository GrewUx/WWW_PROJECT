const urlParams = new URLSearchParams(window.location.search);
const team1 = urlParams.get('team1');
const team2 = urlParams.get('team2');
const season = urlParams.get('season') || '2020-21'; // domyślny sezon dla starych linków

const detailsElement = document.getElementById('details');

// Sezony przeszukiwane dla statystyki "head to head"
const ALL_SEASONS = ['2018-19', '2019-20', '2020-21', '2021-22'];

function seasonUrl(s) {
    return `https://raw.githubusercontent.com/openfootball/football.json/master/${s}/es.1.json`;
}

if (!team1 || !team2) {
    detailsElement.innerHTML = "Error: No param about match in link.";
} else {
    // 1. zapytanie - dane wybranego meczu z konkretnego sezonu
    fetch(seasonUrl(season))
        .then(res => {
            if (!res.ok) throw new Error("Error: couldn't download the data.");
            return res.json();
        })
        .then(data => {
            const match = data.matches.find(m => m.team1 === team1 && m.team2 === team2);

            if (!match) {
                detailsElement.innerHTML = "Error: couldn't find this match.";
                return;
            }

            const scoreHome = match.score ? match.score.ft[0] : "-";
            const scoreAway = match.score ? match.score.ft[1] : "-";
            const score = `${scoreHome} - ${scoreAway}`;
            const status = match.score ? "Finished" : "Scheduled";

            detailsElement.innerHTML = `
                <h2>${match.team1} vs ${match.team2}</h2>
                <ul>
                    <li><b>Result:</b> ${score}</li>
                    <li><b>Status:</b> ${status}</li>
                    <li><b>Round:</b> ${match.round || "No data"}</li>
                    <li><b>Date:</b> ${match.date}</li>
                    <li><b>Season:</b> ${season.replace('-', '/20')}</li>
                </ul>
                <h3 class="h2h-title">Head to head (last seasons)</h3>
                <div id="h2h">Loading head to head...</div>
            `;

            loadHeadToHead();
        })
        .catch(error => {
            detailsElement.innerHTML = "Error: " + error.message;
        });
}

// Kolejne zapytania do API - pobieramy wszystkie sezony i liczymy bilans spotkań
function loadHeadToHead() {
    const requests = ALL_SEASONS.map(s =>
        fetch(seasonUrl(s))
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
    );

    Promise.all(requests).then(results => {
        let team1Wins = 0;
        let team2Wins = 0;
        let draws = 0;
        const meetings = [];

        results.forEach((data, index) => {
            if (!data) return;

            data.matches.forEach(m => {
                // szukamy spotkań tych dwóch drużyn (niezależnie kto gospodarzem)
                const sameTeams =
                    (m.team1 === team1 && m.team2 === team2) ||
                    (m.team1 === team2 && m.team2 === team1);

                if (!sameTeams || !m.score || !m.score.ft) return;

                const [home, away] = m.score.ft;
                let winner = null;
                if (home > away) winner = m.team1;
                else if (away > home) winner = m.team2;

                if (winner === team1) team1Wins++;
                else if (winner === team2) team2Wins++;
                else draws++;

                meetings.push(
                    `<li>${ALL_SEASONS[index].replace('-', '/20')} - ${m.team1} ${home} : ${away} ${m.team2}</li>`
                );
            });
        });

        const h2h = document.getElementById('h2h');

        if (meetings.length === 0) {
            h2h.innerHTML = "<p>No matches found between these teams.</p>";
            return;
        }

        h2h.innerHTML = `
            <p class="h2h-summary">
                <b>${team1}</b> ${team1Wins} &nbsp;|&nbsp; ${draws} draws &nbsp;|&nbsp; ${team2Wins} <b>${team2}</b>
            </p>
            <ul class="h2h-list">${meetings.join("")}</ul>
        `;
    });
}
