import { initializeFirebase } from './firebase.js';
import { setupUI, notify, generateUniqueId, prefillDates, updateDocIdDisplay, openCommandPalette, closeCommandPalette, updateDocumentView } from './ui.js';
import { persistRecord, performSearch, fetchJobById } from './crud.js';
import { setupEquipment, getEquipmentData, setEquipmentData } from './equipment.js';
import { setupOutput, getOutputData } from './output.js';
import { setupLocation, updateLocationVisuals } from './location.js';
import { searchPhoneLog } from './phoneLog.js';

// Global state
let currentRecordData = {};
let currentUser = null;
let searchResults = [];
let highlightedIndex = -1;
let debounceTimeout; 
const form = document.getElementById('intakeForm');

/**
 * Determines which address to use for the map and updates the visuals.
 */
function updateMapBasedOnCurrentState() {
    const isDifferent = document.getElementById('isJobsiteDifferent')?.checked;
    const jobsiteValue = document.getElementById('jobsite')?.value;
    const billingValue = document.getElementById('billing')?.value;

    if (isDifferent && jobsiteValue) {
        updateLocationVisuals(jobsiteValue);
    } else {
        updateLocationVisuals(billingValue);
    }
}

/**
 * Clears the form and starts a new job record.
 */
function createNewJob() {
    const newId = generateUniqueId();
    currentRecordData = { docId: newId };
    
    if (form) form.reset();
    
    const docIdInput = document.getElementById('docId');
    if (docIdInput) docIdInput.value = newId;
    
    updateDocIdDisplay(newId);
    prefillDates();
    
    const masterInitials = localStorage.getItem('masterInitials') || '';
    const initialsInput = document.getElementById('initials');
    if (initialsInput) {
        initialsInput.value = masterInitials;
    }
    
    setEquipmentData([]);
    updateLocationVisuals(''); // Start with no map
    updateDocumentView(currentRecordData);
    
    const contactTab = document.querySelector('.tab-button[data-tab="contact-request"]');
    if (contactTab) contactTab.click();
    
    notify('New job record created.');
}


/**
 * Centralized App Initialization. This runs after Firebase confirms login status.
 */
function startApp(user) {
    currentUser = user;

    setupUI();
    setupEquipment();
    setupOutput();
    setupLocation();

    const mainControls = document.querySelectorAll('.controls-main button');
    if (mainControls) {
        mainControls.forEach(btn => btn.disabled = !user);
    }
    
    const docIdInput = document.getElementById('docId');
    if (user && (!docIdInput || !docIdInput.value)) {
        createNewJob();
    } else if (!user) {
        updateDocumentView(null);
    }
    
    // --- MODIFICATION: Set up address logic event listeners ---
    const isJobsiteDifferentCheckbox = document.getElementById('isJobsiteDifferent');
    if (isJobsiteDifferentCheckbox) {
        isJobsiteDifferentCheckbox.addEventListener('change', (e) => {
            const jobsiteGroup = document.getElementById('jobsite-group');
            const jobsiteTextarea = document.getElementById('jobsite');
            if (e.target.checked) {
                jobsiteGroup.style.display = 'block';
            } else {
                jobsiteGroup.style.display = 'none';
                if (jobsiteTextarea.value) {
                    jobsiteTextarea.value = '';
                }
            }
            updateMapBasedOnCurrentState();
        });
    }

    const billingTextarea = document.getElementById('billing');
    if (billingTextarea) {
        billingTextarea.addEventListener('input', updateMapBasedOnCurrentState);
    }

    const jobsiteTextarea = document.getElementById('jobsite');
    if (jobsiteTextarea) {
        jobsiteTextarea.addEventListener('input', updateMapBasedOnCurrentState);
    }
}

initializeFirebase(startApp);


/**
 * Loads data from a job record into the form.
 */
function loadJob(jobData) {
    if (!jobData) return;
    currentRecordData = jobData;
    form.reset();
    Object.keys(jobData).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            if (el.type === 'checkbox') el.checked = !!jobData[key];
            else el.value = jobData[key] || '';
        }
    });

    // --- MODIFICATION: Handle visibility of jobsite address on load ---
    const isJobsiteDifferentCheckbox = document.getElementById('isJobsiteDifferent');
    const jobsiteGroup = document.getElementById('jobsite-group');
    if (jobData.jobsite && jobData.jobsite !== jobData.billing) {
        isJobsiteDifferentCheckbox.checked = true;
        jobsiteGroup.style.display = 'block';
    } else {
        isJobsiteDifferentCheckbox.checked = false;
        jobsiteGroup.style.display = 'none';
    }

    const poTypeEl = document.getElementById('poType');
    if(poTypeEl) {
        poTypeEl.dispatchEvent(new Event('change'));
    }
    updateDocIdDisplay(jobData.docId);
    setEquipmentData(jobData.equipment);
    updateMapBasedOnCurrentState(); // Update map based on the loaded state
    updateDocumentView(jobData);
    notify('📝 Job loaded for editing.');
    window.scrollTo(0, 0);
}

// --- Command Palette Logic ---
const commandOverlay = document.getElementById('command-overlay');
const commandBox = document.getElementById('command-box');
const commandResults = document.getElementById('command-results');

if (commandBox) {
    commandBox.addEventListener('input', async (e) => {
        const query = e.target.value.trim();

        if (query.startsWith('>')) {
            handleCommand(query);
            if (commandResults) commandResults.style.display = 'none';
            return;
        }

        if (query.length < 2) {
            if (commandResults) commandResults.style.display = 'none';
            searchResults = [];
            return;
        }
        
        const jobPromise = performSearch(currentUser, query);
        const phonePromise = Promise.resolve(searchPhoneLog(query));

        const [jobResults, phoneResults] = await Promise.all([jobPromise, phonePromise]);
        
        const typedJobResults = jobResults.map(job => ({ ...job, type: 'job' }));
        searchResults = [...typedJobResults, ...phoneResults];
        
        renderSearchResults(searchResults, commandResults);
    });

    commandBox.addEventListener('keydown', (e) => {
        if (!commandResults || commandResults.style.display === 'none' || searchResults.length === 0) return;
        const items = commandResults.children;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            highlightedIndex = (highlightedIndex + 1) % items.length;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex > -1) items[highlightedIndex].click();
        }
        updateHighlight(commandResults);
    });
}


function renderSearchResults(results, container) {
    if (!container) return;
    if (results.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.innerHTML = '';
    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        
        if (result.type === 'job') {
            item.dataset.jobId = result.id;
            item.innerHTML = `
                <div class="search-result-item-info">
                    <strong>${result.name || 'No Name'} (Job)</strong>
                    <small>${result.jobsite || 'No Address'}</small>
                </div>
            `;
        } else if (result.type === 'phone') {
            item.style.cursor = 'default';
            item.innerHTML = `
                <div class="search-result-item-info">
                    <strong>${result.name || 'No Name'} (Phone)</strong>
                    <small>${result.primaryPhone || ''} ${result.department ? ' - ' + result.department : ''}</small>
                </div>
            `;
        }
        container.appendChild(item);
    });
    container.style.display = 'block';
    highlightedIndex = -1;
}

function handleCommand(query) {
    const command = query.substring(1).toLowerCase();
    const newFormBtn = document.getElementById('newFormBtnTop');
    const saveBtn = document.getElementById('saveBtn');

    if (command === 'new' && newFormBtn) {
        newFormBtn.click();
        closeCommandPalette();
    } else if (command === 'save' && saveBtn) {
        saveBtn.click();
        closeCommandPalette();
    }
}

function updateHighlight(container) {
    Array.from(container.children).forEach((item, index) => {
        if (index === highlightedIndex) {
            item.classList.add('active');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

if (commandResults) {
    commandResults.addEventListener('click', async (e) => {
        const item = e.target.closest('.search-result-item');
        if (item && item.dataset.jobId) {
            const jobId = item.dataset.jobId;
            const jobData = await fetchJobById(jobId);
            if (jobData) loadJob(jobData);
            closeCommandPalette();
        }
    });
}


// --- Main Action Event Listeners ---
if (form) {
    form.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        try {
            const dataForView = { ...getOutputData(), equipment: getEquipmentData() };
            updateDocumentView(dataForView);
        } catch (error) {
            console.error("Error updating document view on input:", error);
        }
        debounceTimeout = setTimeout(() => {
            if (currentUser) {
                const dataToSave = { ...getOutputData(), equipment: getEquipmentData() };
                persistRecord(dataToSave, currentRecordData, currentUser).then((savedRecord) => {
                    if (savedRecord) {
                        currentRecordData = savedRecord;
                    }
                }).catch(err => {
                    console.error("Debounced auto-save failed:", err);
                    notify("❌ Auto-save failed. Check console.");
                });
            }
        }, 750);
    });
}

const newFormBtn = document.getElementById('newFormBtnTop');
if (newFormBtn) {
    newFormBtn.addEventListener('click', createNewJob);
}

const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        if (currentUser) {
            const data = { ...getOutputData(), equipment: getEquipmentData() };
            persistRecord(data, currentRecordData, currentUser, true).then((savedRecord) => {
                 if (savedRecord) currentRecordData = savedRecord;
            });
        }
    });
}

const poTypeSelect = document.getElementById('poType');
if (poTypeSelect) {
    poTypeSelect.addEventListener('change', function() {
        const selectedValue = this.value;
        const poNumberGroup = document.getElementById('poNumberGroup');
        const verbalPoGroup = document.getElementById('verbalPoGroup');
        const warrantyGroup = document.getElementById('warrantyGroup');
        const ccInfoGroup = document.getElementById('cc-info-group');

        if(poNumberGroup) poNumberGroup.style.display = 'none';
        if(verbalPoGroup) verbalPoGroup.style.display = 'none';
        if(warrantyGroup) warrantyGroup.style.display = 'none';
        if(ccInfoGroup) ccInfoGroup.style.display = 'none';

        if (selectedValue === 'PO Number' && poNumberGroup) {
            poNumberGroup.style.display = 'block';
        } else if (selectedValue === 'Verbal PO' && verbalPoGroup) {
            verbalPoGroup.style.display = 'block';
        } else if (selectedValue === 'Warranty' && warrantyGroup) {
            warrantyGroup.style.display = 'block';
        } else if (selectedValue === 'CC on File' && ccInfoGroup) {
            ccInfoGroup.style.display = 'block';
        }
    });
}
