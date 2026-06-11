# Poradnik — co zostało zrobione w projekcie (do prezentacji)

Dokument tłumaczy każdą funkcję prostym językiem: **co to robi**, **jak działa** i
**jakie pytanie może zadać wykładowca**. Projekt to czysty HTML + CSS + JavaScript
(bez frameworków). Dane meczów pobierane są z publicznego pliku JSON na GitHubie
(openfootball).

---

## 0. Ogólna architektura 

- 4 podstrony HTML: `index.html` (wyniki), `mecz.html` (szczegóły meczu),
  `kontakt.html` (zgłoś błąd), `galeria.html` (galeria).
- Każda strona ma swój plik CSS (`style_*.css`) i swój plik JS.
- Wspólny plik `accessibility.js` dołączony do wszystkich stron (pasek dostępności).
- Dane: `fetch()` pobiera plik JSON z meczami danego sezonu.

**Pytanie wykładowcy:** „Skąd bierzecie dane?"
→ Z API/pliku JSON openfootball przez `fetch()`. Nie mamy własnego backendu —
wszystko liczymy po stronie przeglądarki w JavaScript.

---

## 1. Karuzela galerii — płynne przesuwanie zdjęć

**Pliki:** `galeria.html`, `galeria.js`, `style_galeria.css`

**Wcześniej:** kod podmieniał `img.src` — zdjęcia „przeskakiwały".

**Teraz:** wszystkie zdjęcia leżą obok siebie w jednej „taśmie" (`carousel-track`).
Okienko (`carousel-viewport`) ma `overflow: hidden`, więc widać tylko jedno zdjęcie.
Przesuwamy całą taśmę w bok:

```js
track.style.transform = `translateX(-${current * 100}%)`;
```

A w CSS jest `transition: transform 0.5s ease-in-out;` — to właśnie ono daje
płynną animację (przeglądarka sama „dopowiada" klatki między pozycjami).

**Kluczowe sztuczki:**
- `current = (index + slides.length) % slides.length` — operator modulo `%`
  sprawia, że po ostatnim zdjęciu wracamy do pierwszego (zawijanie).
- Kropki nawigacyjne generujemy w pętli `forEach` i dodajemy do DOM.

**Pytanie:** „Czemu translateX a nie zmiana src?"
→ Bo `transform` można animować przez `transition`, a podmiana `src` jest
natychmiastowa (brak animacji).

---

## 2. Sortowanie + wyszukiwanie po nazwie i dacie

**Pliki:** `index.html`, `index.js`

### Filtrowanie (`applyFilters`)
Używamy `Array.filter()` — przechodzi po wszystkich meczach i zostawia te,
które pasują jednocześnie do tekstu ORAZ do wybranej daty:

```js
const matchesText = home.includes(text) || away.includes(text);
const matchesDate = !chosenDate || match.date === chosenDate;
return matchesText && matchesDate;
```

`!chosenDate` znaczy „jeśli data nie wybrana, to nie filtruj po dacie".

**Dlaczego porównanie dat jest takie proste?**
Daty są w formacie ISO: `"2020-09-12"`. Takie napisy porównują się znak po znaku,
a chronologia = kolejność alfabetyczna. Dlatego `<input type="date">` (też zwraca
ten format) można porównać przez zwykłe `===`.

### Sortowanie (`sortMatches`)
`Array.sort()` z funkcją porównującą:
- daty: `a.date.localeCompare(b.date)` (porównanie napisów),
- gole: odejmowanie liczb `totalGoalsOf(a) - totalGoalsOf(b)`.

Zasada `sort`: jeśli wynik < 0 → a przed b, > 0 → b przed a.

**Pytanie:** „Co jak mecz nie ma jeszcze wyniku?"
→ Funkcja `totalGoalsOf` zwraca `-1`, więc takie mecze lądują na końcu.

---

## 3. Wykres słupkowy liczony w kodzie (canvas)

**Plik:** `index.js` → funkcja `drawChart`

**Cel zadania:** statystyki mają być LICZONE w kodzie, nie pobierane gotowe z API.

**Krok 1 — zliczamy gole każdej drużyny do obiektu (mapy):**
```js
goalsByTeam[match.team1] = (goalsByTeam[match.team1] || 0) + match.score.ft[0];
```
`score.ft` to tablica `[gole_gospodarzy, gole_gości]`.

**Krok 2 — TOP 10:**
```js
Object.entries(goalsByTeam).sort((a,b) => b[1]-a[1]).slice(0,10)
```
`Object.entries` zamienia obiekt na tablicę par `[drużyna, gole]`, sortujemy
malejąco, bierzemy 10 pierwszych.

**Krok 3 — rysujemy na `<canvas>`:** używamy kontekstu 2D:
- `ctx.fillRect(x, y, szerokość, wysokość)` — prostokąt (słupek),
- `ctx.fillText(tekst, x, y)` — napis (nazwa drużyny + liczba goli).

Szerokość słupka jest proporcjonalna: `(gole / maxGoals) * szerokość_obszaru`.

**Pytanie:** „Czemu canvas a nie gotowa biblioteka (np. Chart.js)?"
→ Bo zadanie było, żeby policzyć i narysować samodzielnie, bez zależności.

---

## 4. Więcej zapytań do API (sezony + head-to-head)

**Pliki:** `index.js`, `mecz.js`

### a) Wybór sezonu (`loadSeason`)
Lista rozwijana z sezonami. Każda zmiana = nowy `fetch()` innego pliku JSON:
```js
fetch(`https://.../master/${season}/es.1.json`)
```
To są szablony napisów (backticki `` ` ``) — wstawiamy zmienną `${season}` do URL.

`fetch` zwraca **Promise** (obietnicę). Obsługujemy ją łańcuchem `.then()`:
1. pierwszy `.then` zamienia odpowiedź na JSON,
2. drugi `.then` przetwarza dane,
3. `.catch` łapie błędy (np. brak internetu).

### b) Head-to-head na stronie meczu (`loadHeadToHead`)
Tu pobieramy WSZYSTKIE sezony naraz i liczymy bilans spotkań dwóch drużyn:
```js
const requests = ALL_SEASONS.map(s => fetch(seasonUrl(s)).then(...));
Promise.all(requests).then(results => { ... });
```
`Promise.all` czeka, aż WSZYSTKIE zapytania się skończą, i daje wyniki razem.
To realny przykład „wielu zapytań do API".

**Przekazywanie danych między stronami:** link do meczu zawiera parametry w URL
(`mecz.html?team1=...&team2=...&season=...`). Na stronie meczu czytamy je przez
`URLSearchParams`. Dzięki temu mecz.js wie, który mecz i sezon pokazać.

---

## 5. Report Bug — walidacja + lista zgłoszeń (localStorage)

**Pliki:** `kontakt.html`, `kontakt.js`

### Walidacja formularza
Każde pole sprawdzane osobno, z komunikatem błędu:
- **imię:** tylko litery i spacje, min. 2 znaki (regex),
- **e-mail:** wzorzec `coś@coś.coś` (regex),
- **telefon (najważniejsze!):** PUSTY jest OK **albo** musi być w pełni poprawny
  (9–15 cyfr). „Nic pomiędzy":
```js
function isPhoneValid(phone) {
    if (phone === "") return true;          // puste = OK
    if (!/^\+?[0-9\s-]+$/.test(phone)) return false; // dozwolone znaki
    const digits = phone.replace(/\D/g, ""); // usuń wszystko poza cyframi
    return digits.length >= 9 && digits.length <= 15;
}
```
- **wiadomość:** min. 10 znaków.

`regex` (wyrażenie regularne) to wzorzec do sprawdzania tekstu. `.test()` zwraca
true/false.

### localStorage (pamięć przeglądarki)
localStorage przechowuje tylko **napisy**, więc obiekty zamieniamy:
- zapis: `JSON.stringify(tablica)`,
- odczyt: `JSON.parse(napis)`.

Każde zgłoszenie ma unikalne `id` (`Date.now()` = liczba milisekund) — po nim
rozpoznajemy, które usunąć lub zmienić.

### Lista, zmiana statusu, usuwanie (`renderReports`)
Budujemy karty zgłoszeń w pętli. Przyciski podpinamy przez **domknięcia
(closures)** — każda funkcja „pamięta" `report.id` swojego zgłoszenia:
```js
item.querySelector(".delete-btn").addEventListener("click", () => {
    deleteReport(report.id);
});
```
Statusy: New / In progress / Resolved (kolorowe plakietki).

**Migracja:** `migrateOldReports` dopisuje `id`/`status` starym zgłoszeniom,
które mogły powstać wcześniej (żeby nie wywaliło się przy usuwaniu).

**Pytanie:** „Czy dane przetrwają odświeżenie?"
→ Tak, localStorage zostaje w przeglądarce nawet po zamknięciu karty.

---

## 6. Dostępność (kontrast + rozmiar czcionki)

**Plik:** `accessibility.js` (wspólny dla wszystkich stron) + poprawki w CSS

### Pasek dostępności
JavaScript sam **wstrzykuje** (tworzy w kodzie) pasek z przyciskami:
- **A− / A / A+** — zmieniają rozmiar czcionki,
- **High contrast** — czarne tło, żółty/biały tekst.

Ustawienia zapisujemy w localStorage, więc działają na wszystkich podstronach
i pamiętają się po odświeżeniu.

### Dlaczego `rem` zamiast `px`?
Zmieniliśmy rozmiary tekstu z `px` na `rem`. `1rem` = rozmiar czcionki elementu
`<html>`. Pasek dostępności zmienia właśnie ten rozmiar:
```js
document.documentElement.style.fontSize = "125%";
```
Więc cały tekst w `rem` powiększa się proporcjonalnie. Tekst w `px` by się NIE
skalował — dlatego konwersja była potrzebna.

### Kontrast i nawigacja klawiaturą
- Naprawiliśmy zbyt jasny tekst nawigacji (był jasnoniebieski na jasnym tle =
  słaby kontrast, niezgodny z wytycznymi WCAG).
- Pogrubiliśmy cienki tekst stopki.
- Dodaliśmy `:focus-visible` — wyraźna ramka, gdy ktoś nawiguje Tabem (osoby
  niewidzące myszki / korzystające z klawiatury).
- `aria-label` na przyciskach (czytniki ekranu wiedzą, co robi przycisk).

**Pytanie:** „Co to WCAG?"
→ Wytyczne dostępności stron WWW — m.in. minimalny kontrast tekstu do tła
i możliwość obsługi klawiaturą.

---

## Ściąga — najważniejsze pojęcia JS użyte w projekcie

| Pojęcie | Co robi | Gdzie |
|---|---|---|
| `fetch()` + `.then()` | pobiera dane z sieci (asynchronicznie) | index.js, mecz.js |
| `Promise.all()` | czeka na wiele zapytań naraz | mecz.js (head-to-head) |
| `Array.filter()` | wybiera pasujące elementy | filtrowanie meczów |
| `Array.sort()` | sortuje wg funkcji porównującej | sortowanie meczów |
| `Array.map()` | przekształca każdy element | tworzenie zapytań/opcji |
| `localStorage` | pamięć przeglądarki (napisy) | zgłoszenia, dostępność |
| `JSON.stringify/parse` | obiekt ↔ napis | zapis/odczyt zgłoszeń |
| regex (`/.../.test()`) | wzorce walidacji | formularz |
| `transform` + `transition` | animacje CSS | karuzela |
| `canvas` 2D | rysowanie wykresu | wykres goli |
| `URLSearchParams` | parametry z adresu URL | strona meczu |
| domknięcia (closures) | funkcja pamięta zmienną | przyciski zgłoszeń |

---

## Jak uruchomić projekt lokalnie

W folderze projektu w terminalu:
```
python3 -m http.server 8123
```
Potem w przeglądarce: `http://localhost:8123/index.html`

(Trzeba przez serwer, a nie otwierać pliku z dysku, bo `fetch` z lokalnego pliku
bywa blokowany przez przeglądarkę.)
