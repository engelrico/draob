/*
chrome.webNavigation.onCompleted.addListener(
    function(details) {
        // Überprüfen, ob die URL "miro.com/app/board" enthält
        if (details.url.includes("miro.com/app/board")) {
          setTimeout(() => {

          }, 50000);
                     chrome.action.openPopup(); // Öffne das Popup
        }
    },
    {
        url: [{urlMatches: 'miro.com/app/board'}] // Filter für die URLs
    }
);
*/
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Überprüfen, ob die Seite vollständig geladen ist

    if (changeInfo.status === 'complete' && tab.url && tab.url.includes("miro.com/app/board/")) {
  // Hier sollte der Titel verfügbar sein
        // Warte 5 Sekunden, um sicherzustellen, dass alles geladen ist
        setTimeout(() => {
            // Hier kannst du die Logik zum Öffnen des Popups einfügen
            chrome.action.openPopup(); // Öffne das Popup
            
        }, 5000); // 5000 Millisekunden = 5 Sekunden
    }
});
