// Chrome storage API usage example for options
function saveOptions() {
  const options = {
    theme: document.getElementById('themeSelect')?.value || 'default',
    notifications: document.getElementById('notificationsCheckbox')?.checked || false
  };
  chrome.storage.local.set({ userOptions: options }, () => {
    showInfo('Optionen gespeichert!');
  });
}

function restoreOptions() {
  chrome.storage.local.get('userOptions', (data) => {
    const options = data.userOptions || {};
    document.getElementById('themeSelect')?.value = options.theme || 'default';
    document.getElementById('notificationsCheckbox')?.checked = options.notifications || false;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveOptions')?.addEventListener('click', saveOptions);

function showInfo(text) {
  const infoField = document.getElementById('infoField');
  if (infoField) infoField.textContent = text;
}