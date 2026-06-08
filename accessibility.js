// Wspólny pasek dostępności - rozmiar czcionki + tryb wysokiego kontrastu.
// Ustawienia zapisywane w localStorage, więc działają na wszystkich podstronach.

(function () {
    // --- Wstrzykiwane style paska (żeby nie duplikować CSS w każdym pliku) ---
    const style = document.createElement("style");
    style.textContent = `
        .a11y-bar {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 8px;
            background: #06457F;
            padding: 6px 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        }
        .a11y-bar span {
            color: #ffffff;
            font-size: 0.85rem;
            margin-right: 4px;
        }
        .a11y-bar button {
            background: #ffffff;
            color: #06457F;
            border: 2px solid transparent;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 700;
            padding: 4px 10px;
            transition: background 0.2s, transform 0.1s;
        }
        .a11y-bar button:hover { background: #A8C4EC; }
        .a11y-bar button:active { transform: scale(0.92); }
        .a11y-bar button:focus-visible {
            outline: 3px solid #ffd54f;
            outline-offset: 2px;
        }
        .a11y-btn-small { font-size: 0.8rem; }
        .a11y-btn-normal { font-size: 1rem; }
        .a11y-btn-big { font-size: 1.2rem; }

        /* Tryb wysokiego kontrastu */
        body.high-contrast { background-color: #000000 !important; color: #ffffff !important; }
        body.high-contrast .header_1,
        body.high-contrast .footer_1 { background-color: #000000 !important; border-color: #ffffff !important; }
        body.high-contrast h1 { background-color: #000000 !important; color: #ffff00 !important; border-color: #ffff00 !important; }
        body.high-contrast .header_buttons,
        body.high-contrast .FOOTER_TEXT { color: #ffff00 !important; }
        body.high-contrast #output,
        body.high-contrast #form-container,
        body.high-contrast #details,
        body.high-contrast .stat-box,
        body.high-contrast .report-item,
        body.high-contrast #chart-container { background: #111111 !important; color: #ffffff !important; }
        body.high-contrast #output li a,
        body.high-contrast #details li { color: #ffffff !important; }
    `;
    document.head.appendChild(style);

    // --- Budowa paska ---
    const bar = document.createElement("div");
    bar.className = "a11y-bar";
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", "Accessibility options");
    bar.innerHTML = `
        <span>Font size:</span>
        <button type="button" id="a11y-small" class="a11y-btn-small" aria-label="Small font">A</button>
        <button type="button" id="a11y-normal" class="a11y-btn-normal" aria-label="Normal font">A</button>
        <button type="button" id="a11y-big" class="a11y-btn-big" aria-label="Large font">A</button>
        <button type="button" id="a11y-contrast" aria-pressed="false" aria-label="Toggle high contrast">High contrast</button>
    `;
    document.body.insertBefore(bar, document.body.firstChild);

    // --- Logika rozmiaru czcionki (skaluje root font-size) ---
    const sizes = { small: "87.5%", normal: "100%", big: "125%" };

    function applyFontSize(key) {
        document.documentElement.style.fontSize = sizes[key] || sizes.normal;
        localStorage.setItem("a11y-font", key);
    }

    document.getElementById("a11y-small").addEventListener("click", () => applyFontSize("small"));
    document.getElementById("a11y-normal").addEventListener("click", () => applyFontSize("normal"));
    document.getElementById("a11y-big").addEventListener("click", () => applyFontSize("big"));

    // --- Logika wysokiego kontrastu ---
    const contrastBtn = document.getElementById("a11y-contrast");

    function applyContrast(on) {
        document.body.classList.toggle("high-contrast", on);
        contrastBtn.setAttribute("aria-pressed", String(on));
        localStorage.setItem("a11y-contrast", on ? "1" : "0");
    }

    contrastBtn.addEventListener("click", () => {
        applyContrast(!document.body.classList.contains("high-contrast"));
    });

    // --- Wczytanie zapisanych ustawień ---
    applyFontSize(localStorage.getItem("a11y-font") || "normal");
    applyContrast(localStorage.getItem("a11y-contrast") === "1");
})();
