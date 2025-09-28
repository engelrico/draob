
document.addEventListener('DOMContentLoaded', () => {
/*
    // Tab-Wechsel-Logik
    document.getElementById('mainTab').addEventListener('click', () => {
        document.getElementById('mainContent').classList.add('active-content');
        document.getElementById('configContent').classList.remove('active-content');
        document.getElementById('listTab').classList.remove('active');
        document.getElementById('mainTab').classList.add('active');
        document.getElementById('configTab').classList.remove('active');
        document.getElementById('aboutTab').classList.remove('active');
    });

  document.getElementById('listTab').addEventListener('click', () => {
        document.getElementById('mainContent').classList.remove('active-content');
        document.getElementById('configContent').classList.remove('active-content');
        document.getElementById('listTab').classList.add('active');
        loadPasswordList(); // Lade die Passwortliste
    });

    document.getElementById('configTab').addEventListener('click', () => {
        document.getElementById('mainContent').classList.remove('active-content');
        document.getElementById('configContent').classList.add('active-content');
        document.getElementById('mainTab').classList.remove('active');
        document.getElementById('configTab').classList.add('active');
        document.getElementById('aboutTab').classList.remove('active');
    });

    document.getElementById('aboutTab').addEventListener('click', () => {
        alert('Über MiroHero: Diese Erweiterung hilft dir, Passwörter für Miro-Boards zu speichern und zu verwalten.');
    });

*/
    // Funktion zum Anzeigen/Verstecken der Passwortliste
    document.getElementById('passwordCount').addEventListener('click', () => {
        const passwordListContainer = document.getElementById('passwordListContainer');
        if (passwordListContainer.style.display === 'none' || passwordListContainer.style.display === '') {
            loadPasswordList();
            passwordListContainer.style.display = 'block'; // Zeige die Passwortliste an
        } else {
            passwordListContainer.style.display = 'none'; // Verstecke die Passwortliste
        }
    });

    document.getElementById('togglePassword').addEventListener('click', () => {
    const passwordInput = document.getElementById('passwordInput');
    const toggleButton = document.getElementById('togglePassword');

    // Überprüfe, ob das Passwort aktuell sichtbar oder verborgen ist
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text'; // Passwort anzeigen
        toggleButton.textContent = '🙈'; // Symbol ändern (z.B. zu "Augen zu")
    } else {
        passwordInput.type = 'password'; // Passwort verbergen
        toggleButton.textContent = '👁️'; // Symbol ändern (z.B. zu "Augen auf")
    }
    });



    document.getElementById('savePassword').addEventListener('click', () => {
    const title = document.getElementById('titleInput').value; // Titel aus dem Eingabefeld
    const url = document.getElementById('urlInput').value; // URL aus dem Eingabefeld
    const password = document.getElementById('passwordInput').value; // Passwort aus dem Eingabefeld

    if (title && url && password) {
        chrome.storage.local.get('passwordStore', (data) => {
            const passwords = data.passwordStore || {};
            passwords[url] = { title, password }; // Titel und Passwort unter der URL speichern
            chrome.storage.local.set({ passwordStore: passwords }, () => {
                showInfo('Passwort gespeichert!');
                loadPasswordList(); // Aktualisiere die Passwortliste

            });
        });
    } else {
        showInfo('Bitte gib einen Titel, eine URL und ein Passwort ein.');
    }
    });


    function initValues() {
    // Abrufen der aktuellen URL und der gespeicherten Passwörter
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0]; // Aktueller Tab
        const titleInput = document.getElementById('titleInput');
        const urlInput = document.getElementById('urlInput');
        const passwordInput = document.getElementById('passwordInput');

        // Setze den Titel der aktuellen Seite in das Titel-Eingabefeld
        titleInput.value = currentTab.title; // Titel der aktuellen Seite
        urlInput.value = currentTab.url; // Aktuelle URL setzen

        // Kürze die URL nach dem letzten "/"
        const shortenedUrl = shortenUrl(currentTab.url); // URL kürzen
        urlInput.value = shortenedUrl; // Gekürzte URL setzen

        // Abrufen der gespeicherten Passwörter
        chrome.storage.local.get(['passwordStore'], (data) => {
            const passwords = data.passwordStore || {};
            const passwordCountDiv = document.getElementById('passwordCount');
            const passwordListContainer = document.getElementById('passwordListContainer');
            const passwordListDiv = document.getElementById('passwordList');

            // Anzahl der gespeicherten Passwörter anzeigen
            const passwordCount = Object.keys(passwords).length; // Anzahl der Passwörter
            passwordCountDiv.textContent = `Passwörter gespeichert: ${passwordCount}`;

            // Vorbefüllung der Eingabefelder, wenn ein Eintrag existiert
            if (passwords[shortenedUrl]) {
                const entry = passwords[shortenedUrl];
                titleInput.value = entry.title; // Titel setzen
                passwordInput.value = entry.password; // Passwort setzen
                showInfo("URL in Liste gefunden und Eintrag ausgewählt")
            }

            // Passwortliste initial ausblenden
            passwordListContainer.style.display = 'none'; // Standardmäßig ausgeblendet
        });
    });
    }
    initValues();

    function showInfo(text) {
        document.getElementById('infoField').textContent=text;
    }

    function shortenUrl(urlInput){
        // Kürze die URL ab dem letzten Slash
        const lastSlashIndex = urlInput.lastIndexOf('/');
        if (lastSlashIndex !== -1) {
            const shortenedUrl = urlInput.slice(0, lastSlashIndex); // Alles ab dem letzten Slash abschneiden
            urlInput = shortenedUrl; // Setze die gekürzte URL in das Eingabefeld
        }
        return urlInput;
    }

    // Funktion zum Laden der Passwortliste
    function loadPasswordList() {
    const passwordListDiv = document.getElementById('passwordList');
    passwordListDiv.innerHTML = ''; // Leere die Liste

    chrome.storage.local.get(['passwordStore'], (data) => {
        const passwords = data.passwordStore || {};
        for (const [url, { title, password }] of Object.entries(passwords)) {
            const passwordItem = document.createElement('div');
            passwordItem.className = 'password-item';

            // Erstelle ein Icon zum Öffnen der URL
            const openIcon = document.createElement('span');
            openIcon.className = 'open-icon';
            openIcon.textContent = '🔗'; // Emoji für das Öffnen der URL
            openIcon.title = 'URL im neuen Tab öffnen'; // Tooltip hinzufügen

            // Füge die Logik zum Öffnen der URL hinzu
            openIcon.addEventListener('click', (event) => {
                event.stopPropagation(); // Verhindere das Auslösen des Klicks auf den gesamten Eintrag
                window.open(url, '_blank'); // Öffne die URL in einem neuen Tab
            });

            // Erstelle einen Container für den Titel
            const titleDiv = document.createElement('div');
            titleDiv.className = 'password-title';
            titleDiv.textContent = title; // Titel kürzen

            // Erstelle ein Lösch-Icon
            const deleteIcon = document.createElement('span');
            deleteIcon.className = 'icon';
            deleteIcon.textContent = '🗑️'; // Emoji für das Lösch-Icon
            deleteIcon.title = 'Eintrag löschen'; // Tooltip hinzufügen

            // Füge die Lösch-Logik hinzu
            deleteIcon.addEventListener('click', (event) => {
                event.stopPropagation(); // Verhindere das Auslösen des Klicks auf den gesamten Eintrag
                delete passwords[url]; // Entferne das Passwort aus dem Speicher
                chrome.storage.local.set({ passwordStore: passwords }, () => {
                    showInfo('Eintrag gelöscht!');
                    loadPasswordList(); // Aktualisiere die Passwortliste
                });
            });

            // Füge den Titel und das Lösch-Icon zum Passwortitem hinzu
            passwordItem.appendChild(openIcon); // Füge das Öffnen-Icon hinzu
            passwordItem.appendChild(titleDiv);
            passwordItem.appendChild(deleteIcon); // Das Lösch-Icon wird immer zuletzt hinzugefügt

            // Link zur URL hinzufügen
            passwordItem.addEventListener('click', () => {
                document.getElementById('titleInput').value = title; // Titel in das Eingabefeld übernehmen
                document.getElementById('urlInput').value = url; // URL in das Eingabefeld übernehmen
                document.getElementById('passwordInput').value = password; // Passwort in das Eingabefeld übernehmen
                showInfo("Eintrag aus Liste selektiert")
            });

            passwordListDiv.appendChild(passwordItem);
        }
    });
}

});
