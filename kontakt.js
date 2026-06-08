const form = document.getElementById('contact-form');
const messageBox = document.getElementById('form-message');
const reportsList = document.getElementById('reports-list');

const STATUSES = ["New", "In progress", "Resolved"];

// --- Walidacja ---

// Telefon: PUSTY jest OK, albo musi być w pełni poprawny (nic "pomiędzy").
// Akceptujemy opcjonalny +, cyfry, spacje i myślniki; po oczyszczeniu 9-15 cyfr.
function isPhoneValid(phone) {
    if (phone === "") return true; // puste pole dozwolone

    // dozwolone tylko znaki telefonu
    if (!/^\+?[0-9\s-]+$/.test(phone)) return false;

    const digits = phone.replace(/\D/g, "");
    return digits.length >= 9 && digits.length <= 15;
}

function isEmailValid(email) {
    // prosty, ale sensowny wzorzec: coś@coś.coś
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isNameValid(name) {
    // tylko litery (w tym polskie) i spacje, min. 2 znaki
    return /^[A-Za-zÀ-ÿĀ-ſ\s]{2,}$/.test(name);
}

function showError(text) {
    messageBox.textContent = text;
    messageBox.className = "msg-error";
}

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();

    if (name === "" || email === "" || message === "") {
        showError("Name, e-mail and message are required.");
        return;
    }

    if (!isNameValid(name)) {
        showError("Name can contain only letters and spaces (min. 2 characters).");
        return;
    }

    if (!isEmailValid(email)) {
        showError("Invalid e-mail address.");
        return;
    }

    if (!isPhoneValid(phone)) {
        showError("Phone must be empty or a full valid number (9-15 digits).");
        return;
    }

    if (message.length < 10) {
        showError("Message has to have at least 10 characters.");
        return;
    }

    const newReport = {
        id: Date.now(),
        imie: name,
        mail: email,
        telefon: phone,
        tresc: message,
        status: "New",
        data: new Date().toLocaleString()
    };

    const savedReports = getReports();
    savedReports.push(newReport);
    saveReports(savedReports);

    messageBox.textContent = "Thank you. Report was sent successfully.";
    messageBox.className = "msg-success";

    form.reset();
    renderReports();
});

// --- Lista zgłoszeń (localStorage) ---

function getReports() {
    return JSON.parse(localStorage.getItem('report')) || [];
}

function saveReports(reports) {
    localStorage.setItem('report', JSON.stringify(reports));
}

function deleteReport(id) {
    const reports = getReports().filter(r => r.id !== id);
    saveReports(reports);
    renderReports();
}

function changeStatus(id, newStatus) {
    const reports = getReports();
    const report = reports.find(r => r.id === id);
    if (report) {
        report.status = newStatus;
        saveReports(reports);
        renderReports();
    }
}

function statusClass(status) {
    if (status === "Resolved") return "status-resolved";
    if (status === "In progress") return "status-progress";
    return "status-new";
}

function renderReports() {
    const reports = getReports();

    if (reports.length === 0) {
        reportsList.innerHTML = "<p class='no-reports'>No reports yet.</p>";
        return;
    }

    reportsList.innerHTML = "";

    // najnowsze na górze
    reports.slice().reverse().forEach(report => {
        const item = document.createElement("div");
        item.className = "report-item";

        const phoneLine = report.telefon
            ? `<p><b>Phone:</b> ${report.telefon}</p>`
            : "";

        // budujemy opcje selecta zaznaczając aktualny status
        const options = STATUSES.map(s =>
            `<option value="${s}" ${s === report.status ? "selected" : ""}>${s}</option>`
        ).join("");

        item.innerHTML = `
            <div class="report-head">
                <span class="report-name">${report.imie}</span>
                <span class="status-badge ${statusClass(report.status)}">${report.status}</span>
            </div>
            <p><b>E-mail:</b> ${report.mail}</p>
            ${phoneLine}
            <p><b>Date:</b> ${report.data}</p>
            <p class="report-msg">${report.tresc}</p>
            <div class="report-actions">
                <label>Status:
                    <select aria-label="Change report status">${options}</select>
                </label>
                <button type="button" class="delete-btn">Delete</button>
            </div>
        `;

        // podpinamy zdarzenia (id przekazujemy przez domknięcie)
        item.querySelector("select").addEventListener("change", (e) => {
            changeStatus(report.id, e.target.value);
        });
        item.querySelector(".delete-btn").addEventListener("click", () => {
            deleteReport(report.id);
        });

        reportsList.appendChild(item);
    });
}

// Uzupełniamy starsze zgłoszenia, którym mogło brakować id/statusu
function migrateOldReports() {
    const reports = getReports();
    let changed = false;

    reports.forEach((report, index) => {
        if (report.id === undefined) {
            report.id = Date.now() + index;
            changed = true;
        }
        if (report.status === undefined) {
            report.status = "New";
            changed = true;
        }
    });

    if (changed) saveReports(reports);
}

// pokazujemy listę od razu po wejściu na stronę
migrateOldReports();
renderReports();
