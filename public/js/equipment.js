const $ = id => document.getElementById(id);

let currentEquipmentData = [];
const equipmentFieldIds = [
    'door', 'operator', 'doorWidth', 'doorHeight', 'spring'
];

/**
 * Generates <option> elements for feet (0-20).
 * @returns {string} HTML string of options.
 */
function generateFeetOptions() {
    let options = '<option value=""></option>';
    for (let i = 0; i <= 20; i++) {
        options += `<option value="${i}'">${i}'</option>`;
    }
    return options;
}

/**
 * Generates <option> elements for inches (0-11).
 * @returns {string} HTML string of options.
 */
function generateInchOptions() {
    let options = '<option value=""></option>';
    for (let i = 0; i <= 11; i++) {
        options += `<option value="${i}&quot;">${i}"</option>`;
    }
    return options;
}


export function setupEquipment() {
    const equipmentContainer = $('equipment-panels-container');
    if (!equipmentContainer) return;

    renderEquipmentTabs();
    
    const addBtn = $('add-door-btn');
    if(addBtn) addBtn.addEventListener('click', addEquipmentTab);

    const subNav = document.querySelector('.equipment-sub-nav');
    if(subNav) {
        subNav.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-equipment-tab-btn')) {
                e.stopPropagation();
                const index = parseInt(e.target.dataset.deleteTab, 10);
                deleteEquipmentTab(index);
                return;
            }
            
            const tabButton = e.target.closest('.equipment-tab-button');
            if (tabButton) {
                saveCurrentEquipmentTab();
                const index = parseInt(tabButton.dataset.equipmentTab, 10);
                switchEquipmentTab(index);
            }
        });
    }
}

/**
 * --- MODIFICATION: Reordered fields ---
 * Moved the Door Width and Height dropdowns to be the first inputs in the panel.
 * @param {number} index - The index of the equipment tab.
 * @returns {string} The HTML string for the equipment panel.
 */
function getEquipmentPanelHTML(index) {
    const i = index;
    return `
        <div class="equipment-panel" data-equipment-panel="${i}">
            <div class="form-group">
                <label for="doorWidthFeet-${i}">Door Width</label>
                <div class="size-selector">
                    <select id="doorWidthFeet-${i}">${generateFeetOptions()}</select>
                    <select id="doorWidthInches-${i}">${generateInchOptions()}</select>
                </div>
            </div>
            <div class="form-group">
                <label for="doorHeightFeet-${i}">Door Height</label>
                <div class="size-selector">
                    <select id="doorHeightFeet-${i}">${generateFeetOptions()}</select>
                    <select id="doorHeightInches-${i}">${generateInchOptions()}</select>
                </div>
            </div>

            <div class="form-group full-width"><label for="door-${i}">Door Info</label><textarea id="door-${i}"></textarea></div>
            <div class="form-group full-width"><label for="operator-${i}">Operator Info</label><textarea id="operator-${i}"></textarea></div>
            <div class="form-group full-width" style="grid-column: 1 / -1;"><label for="spring-${i}">Spring Info</label><textarea id="spring-${i}"></textarea></div>
        </div>
    `;
}

function renderEquipmentTabs() {
    const navContainer = document.querySelector('.equipment-sub-nav');
    const panelsContainer = $('equipment-panels-container');
    if (!navContainer || !panelsContainer) return;

    navContainer.innerHTML = '';
    panelsContainer.innerHTML = '';

    if (currentEquipmentData.length === 0) {
        addEquipmentTab();
        return;
    }

    currentEquipmentData.forEach((doorData, index) => {
        const tabButton = document.createElement('button');
        tabButton.type = 'button';
        tabButton.className = 'equipment-tab-button';
        tabButton.dataset.equipmentTab = index;
        tabButton.innerHTML = `<span>Door ${index + 1}</span>`;

        if (currentEquipmentData.length > 1) {
                tabButton.innerHTML += `<span class="delete-equipment-tab-btn" data-delete-tab="${index}" title="Delete Door ${index + 1}">×</span>`;
        }
        navContainer.appendChild(tabButton);

        const panelHTML = getEquipmentPanelHTML(index);
        panelsContainer.insertAdjacentHTML('beforeend', panelHTML);
        
        const panel = panelsContainer.querySelector(`[data-equipment-panel="${index}"]`);
        if(panel) {
            // Set values for standard inputs
            ['door', 'operator', 'spring'].forEach(fieldId => {
                const input = panel.querySelector(`#${fieldId}-${index}`);
                if (input) input.value = doorData[fieldId] || '';
            });

            // Set values for the new dropdowns by parsing the doorSize string
            if (doorData.doorSize) {
                const [width, height] = doorData.doorSize.split('x').map(s => s.trim());
                if (width) {
                    const [wFeet, wInches] = width.split("'").map(s => s.replace('"', '').trim());
                    panel.querySelector(`#doorWidthFeet-${index}`).value = wFeet ? `${wFeet}'` : '';
                    panel.querySelector(`#doorWidthInches-${index}`).value = wInches ? `${wInches}"` : '';
                }
                if (height) {
                    const [hFeet, hInches] = height.split("'").map(s => s.replace('"', '').trim());
                    panel.querySelector(`#doorHeightFeet-${index}`).value = hFeet ? `${hFeet}'` : '';
                    panel.querySelector(`#doorHeightInches-${index}`).value = hInches ? `${hInches}"` : '';
                }
            }
        }
    });
    
    const activeIndex = Math.min(0, currentEquipmentData.length -1);
    switchEquipmentTab(activeIndex >= 0 ? activeIndex : 0);
}

function addEquipmentTab() {
    saveCurrentEquipmentTab();
    
    const newDoorData = {};
    equipmentFieldIds.forEach(id => newDoorData[id] = '');
    currentEquipmentData.push(newDoorData);

    const newIndex = currentEquipmentData.length - 1;

    renderEquipmentTabs();
    switchEquipmentTab(newIndex);
}

function deleteEquipmentTab(indexToDelete) {
    if (currentEquipmentData.length <= 1) {
        // If it's the last tab, just clear its data instead of deleting it.
        currentEquipmentData[indexToDelete] = {};
        equipmentFieldIds.forEach(id => currentEquipmentData[indexToDelete][id] = '');
    } else {
        currentEquipmentData.splice(indexToDelete, 1);
    }
    renderEquipmentTabs();
}


function switchEquipmentTab(index) {
    document.querySelectorAll('.equipment-tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.equipment-panel').forEach(panel => panel.classList.remove('active'));

    const tabButton = document.querySelector(`.equipment-tab-button[data-equipment-tab="${index}"]`);
    const panel = document.querySelector(`.equipment-panel[data-equipment-panel="${index}"]`);
    
    if (tabButton) tabButton.classList.add('active');
    if (panel) panel.classList.add('active');
}

function saveCurrentEquipmentTab() {
    const activeTabButton = document.querySelector('.equipment-tab-button.active');
    if (!activeTabButton) return;

    const index = parseInt(activeTabButton.dataset.equipmentTab, 10);
    const panel = document.querySelector(`.equipment-panel[data-equipment-panel="${index}"]`);
    
    if (!panel || !currentEquipmentData[index]) return;

    const doorData = currentEquipmentData[index] || {};
    
    // Save standard fields
    ['door', 'operator', 'spring'].forEach(fieldId => {
        const input = panel.querySelector(`#${fieldId}-${index}`);
        if (input) doorData[fieldId] = input.value;
    });

    // Combine dropdown values into a single doorSize string
    const wFeet = panel.querySelector(`#doorWidthFeet-${index}`).value;
    const wInches = panel.querySelector(`#doorWidthInches-${index}`).value;
    const hFeet = panel.querySelector(`#doorHeightFeet-${index}`).value;
    const hInches = panel.querySelector(`#doorHeightInches-${index}`).value;
    
    const widthString = `${wFeet || "0'"}${wInches ? " " + wInches : ''}`.trim();
    const heightString = `${hFeet || "0'"}${hInches ? " " + hInches : ''}`.trim();

    if (widthString !== "0'" || heightString !== "0'") {
        doorData.doorSize = `${widthString} x ${heightString}`;
    } else {
        doorData.doorSize = '';
    }

    currentEquipmentData[index] = doorData;
}

export function getEquipmentData() {
    saveCurrentEquipmentTab();
    return currentEquipmentData;
}

export function setEquipmentData(data) {
    currentEquipmentData = data || [];
    if (currentEquipmentData.length === 0) {
        currentEquipmentData.push({});
    }
    renderEquipmentTabs();
}
