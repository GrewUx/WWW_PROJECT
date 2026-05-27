const urlParams = new URLSearchParams(window.location.search);
const team1 = urlParams.get('team1');
const team2 = urlParams.get('team2');

const detailsElement = document.getElementById('details');

if (!team1 || !team2) {
    detailsElement.innerHTML = "Error: No param about match in link.";
} else {
    fetch("https://raw.githubusercontent.com/openfootball/football.json/master/2020-21/es.1.json")
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

        let html = `
            <h2>${match.team1} vs ${match.team2}</h2>
            <ul>
                <li><b>Result:</b> ${score}</li>
                <li><b>Status:</b> ${status}</li>
                <li><b>Round:</b> ${match.round || "No data"}</li>
                <li><b>Date:</b> ${match.date}</li>
            </ul>
        `;

        detailsElement.innerHTML = html;
    })
    .catch(error => {
        detailsElement.innerHTML = "Error: " + error.message;
    });
}