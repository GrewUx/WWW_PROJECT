fetch("https://raw.githubusercontent.com/openfootball/football.json/master/2020-21/es.1.json")
.then(res => {
    if (!res.ok) throw new Error("Błąd pobierania danych");
    return res.json();
})
.then(data => {
    let html = "<ul>";
    
    data.matches.slice(-40).forEach((match, index) => {
        const date = match.date;
        const scoreHome = match.score ? match.score.ft[0] : "-";
        const scoreAway = match.score ? match.score.ft[1] : "-";
        const score = `(${scoreHome} - ${scoreAway})`;

        const homeTeam = match.team1;
        const awayTeam = match.team2;

        const matchLink = `mecz.html?team1=${encodeURIComponent(homeTeam)}&team2=${encodeURIComponent(awayTeam)}`;

        html += `<li><a href="${matchLink}"><b>${date}</b>: ${homeTeam} - ${awayTeam} <b>${score}</b></a></li>`;
    });

    document.getElementById('output').innerHTML = html + "</ul>";
})
.catch(error => {
    document.getElementById('output').innerHTML = "Błąd: " + error.message;
});