document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const messageBox = document.getElementById('form-message');

    if (name === "" || email === "" || message === "") {
        messageBox.textContent = "All fields are required.";
        messageBox.className = "msg-error";
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        messageBox.textContent = "Invalid e-mail.";
        messageBox.className = "msg-error";
        return;
    }

    if (message.length < 10) {
        messageBox.textContent = "Message has to have at least 10 characters";
        messageBox.className = "msg-error";
        return;
    }
    const newReport = {
        imie: name,
        mail: email,
        tresc: message,
        data: new Date().toLocaleString()
    };

    
    let savedReports = JSON.parse(localStorage.getItem('report')) || [];

    
    savedReports.push(newReport);

    localStorage.setItem('report', JSON.stringify(savedReports));



    messageBox.textContent = "Thank you. Form was sent succesfully.";
    messageBox.className = "msg-success";
    
    document.getElementById('contact-form').reset();
});