import { signOut } from './firebase.js';

const $ = id => document.getElementById(id);

/**
 * Sets up the main UI components like tabs and the hamburger menu.
 */
export function setupUI() {
    setupTabs();
    setupHamburgerMenu();
    setupGlobalEventListeners();
}

/**
 * Updates the read-only document view panel with the latest job data.
 * @param {object|null} jobData - The current job data, or null to clear the view.
 */
export function updateDocumentView(jobData) {
    const placeholder = $('docview-placeholder');
    const content = $('docview-content');
    
    if (!jobData || Object.keys(jobData).length === 0 || !jobData.docId) {
        if (placeholder) placeholder.style.display = 'flex';
        if (content) content.style.display = 'none';
        return;
    }

    if (placeholder) placeholder.style.display = 'none';
    if (content) content.style.display = 'block';

    const safeText = (text) => text || 'N/A';

    if ($('docview-name')) $('docview-name').textContent = safeText(jobData.name);
    if ($('docview-docId')) $('docview-docId').textContent = safeText(jobData.docId);
    if ($('docview-phone')) $('docview-phone').textContent = safeText(jobData.phone);
    if ($('docview-email')) $('docview-email').innerHTML = jobData.email ? `<a href="mailto:${jobData.email}" class="email-link">${jobData.email}</a>` : 'N/A';
    if ($('docview-jobsite')) $('docview-jobsite').textContent = safeText(jobData.jobsite);
    if ($('docview-request')) $('docview-request').textContent = safeText(jobData.request);
    
    const equipmentContainer = $('docview-equipment');
    if (equipmentContainer) {
        equipmentContainer.innerHTML = '';
        if (jobData.equipment && jobData.equipment.length > 0) {
            jobData.equipment.forEach((door, index) => {
                const doorInfo = door.door || 'No door info';
                const operatorInfo = door.operator ? ` / ${door.operator}` : '';
                const item = document.createElement('div');
                item.className = 'equipment-item';
                item.innerHTML = `<strong>Door ${index + 1}:</strong> ${doorInfo}${operatorInfo}`;
                equipmentContainer.appendChild(item);
            });
        } else {
            equipmentContainer.innerHTML = '<p>No equipment listed.</p>';
        }
    }
}


// --- Command Palette UI ---
export function openCommandPalette() {
    const overlay = $('command-overlay');
    const commandBox = $('command-box');
    if (overlay) overlay.classList.add('active');
    if (commandBox) {
        commandBox.focus();
        commandBox.select();
    }
}

export function closeCommandPalette() {
    const overlay = $('command-overlay');
    const commandBox = $('command-box');
    const commandResults = $('command-results');
    if (overlay) overlay.classList.remove('active');
    if (commandBox) commandBox.value = '';
    if (commandResults) commandResults.style.display = 'none';
}

// --- Helper Functions ---
export function generateUniqueId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `DOC-${year}${month}${day}-${hours}${minutes}${seconds}`;
}

export function prefillDates() {
    const now = new Date();
    const currentDateEl = $("current-date");
    const currentTimeEl = $("current-time");
    const installDateEl = $('installDate');

    if (currentDateEl) currentDateEl.value = now.toLocaleDateString();
    if (currentTimeEl) currentTimeEl.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (installDateEl) {
        const year = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        installDateEl.value = `${year}-${mm}-${dd}`;
    }
}

export function updateDocIdDisplay(id) {
    const displayElements = document.querySelectorAll('.doc-id-display');
    displayElements.forEach(el => {
        el.textContent = id || '';
    });
}

// --- Private Setup Functions ---
function setupTabs() {
  const tabContainer = document.querySelector('.tab-container');
  if (!tabContainer) return;

  const tabNav = tabContainer.querySelector('.tab-nav');
  const form = document.getElementById('intakeForm');
  if (!tabNav || !form) return;
  
  tabNav.addEventListener('click', (e) => {
    const targetTab = e.target.closest('.tab-button');
    if (targetTab) {
      const tabName = targetTab.dataset.tab;
      localStorage.setItem('activeQuasarTab', tabName);
      
      tabNav.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      targetTab.classList.add('active');
      
      form.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      const activePanel = form.querySelector(`[data-tab-content="${tabName}"]`);
      if (activePanel) {
          activePanel.classList.add('active');
      }
    }
  });

  const lastTab = localStorage.getItem('activeQuasarTab');
  if (lastTab) {
      const tabButton = tabNav.querySelector(`[data-tab="${lastTab}"]`);
      if (tabButton) tabButton.click();
  }
}

/**
 * --- FIX: Robust Element Handling ---
 * Added checks to ensure elements exist before adding event listeners.
 * This prevents crashes if the script runs on a page without these elements.
 */
function setupHamburgerMenu() {
    const openNavBtn = $('openNavBtn');
    const closeNavBtn = $('closeNavBtn');
    const overlay = $('overlay');
    const darkModeToggle = $('darkModeToggle');
    const googleMapsApiKeyInput = $('googleMapsApiKey');
    const signOutBtn = $('signOutBtn');
    const masterInitialsInput = $('master-initials');

    const openNav = () => {
        const sidenav = $("mySidenav");
        if (sidenav) sidenav.style.width = "250px";
        if (overlay) overlay.style.display = "block";
    };

    const closeNav = () => {
        const sidenav = $("mySidenav");
        if (sidenav) sidenav.style.width = "0";
        if (overlay) overlay.style.display = "none";
    };

    if (openNavBtn) openNavBtn.addEventListener('click', openNav);
    if (closeNavBtn) closeNavBtn.addEventListener('click', closeNav);
    if (overlay) overlay.addEventListener('click', closeNav);

    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            signOut();
            closeNav();
        });
    }
    
    // --- MODIFICATION: Handle Master Initials ---
    if (masterInitialsInput) {
        // On load, get initials from localStorage
        masterInitialsInput.value = localStorage.getItem('masterInitials') || '';
        
        // On change, save initials to localStorage
        masterInitialsInput.addEventListener('input', (e) => {
            localStorage.setItem('masterInitials', e.target.value.toUpperCase());
        });
    }

    if (darkModeToggle) {
        const applyDarkMode = (isDark) => {
            document.body.classList.toggle('dark-mode', isDark);
            darkModeToggle.checked = isDark;
        };
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        applyDarkMode(savedDarkMode);
        darkModeToggle.addEventListener('change', () => {
            const isDark = darkModeToggle.checked;
            localStorage.setItem('darkMode', isDark);
            applyDarkMode(isDark);
        });
    }

    if (googleMapsApiKeyInput) {
        const savedApiKey = localStorage.getItem('googleMapsApiKey');
        if (savedApiKey) {
            googleMapsApiKeyInput.value = savedApiKey;
        }
        googleMapsApiKeyInput.addEventListener('input', () => {
            localStorage.setItem('googleMapsApiKey', googleMapsApiKeyInput.value);
        });
    }
}

function setupGlobalEventListeners() {
    const commandOverlay = $('command-overlay');
    if (!commandOverlay) return; // Exit if the main element is not found

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (commandOverlay.classList.contains('active')) {
                closeCommandPalette();
            } else {
                openCommandPalette();
            }
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (!commandOverlay.classList.contains('active')) {
                openCommandPalette();
            }
        }
    });

    commandOverlay.addEventListener('click', (e) => {
        if (e.target === commandOverlay) {
            closeCommandPalette();
        }
    });
}


// --- Notifications ---
export function showSaveStatus(message) {
    const statusEl = $('save-status');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.classList.add('visible');
        setTimeout(() => {
            statusEl.classList.remove('visible');
        }, 2000);
    }
}

export function notify(msg) {
    const container = $('toast-container');
    if (!container) return;
    const n = document.createElement('div');
    n.className = 'toast';
    n.textContent = msg;
    container.appendChild(n);
    
    setTimeout(() => {
        n.remove();
    }, 5000);
}
