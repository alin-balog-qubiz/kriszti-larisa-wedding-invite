// ===================== LOCALIZATION SYSTEM =====================

let currentLang = 'ro';
let textData = {};

/**
 * Load localization data
 */
async function initLocalization() {
    try {
        const response = await fetch('src/text.json');
        textData = await response.json();
        
        // Check URL parameter first (?lang=hu or ?lang=ro)
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        
        if (urlLang === 'hu') {
            currentLang = 'hu';
        } else if (urlLang === 'ro') {
            currentLang = 'ro';
        } else {
            // Fall back to saved preference or default to RO
            const savedLang = localStorage.getItem('wedding-lang');
            if (savedLang && textData[savedLang]) {
                currentLang = savedLang;
            } else {
                currentLang = 'ro'; // Default to Romanian
            }
        }
        
        // Update UI
        document.documentElement.lang = currentLang === 'ro' ? 'ro-RO' : 'hu-HU';
        document.documentElement.setAttribute('data-lang', currentLang);
        
        // Update language button text
        updateLanguageButton();
        
        applyLocalization();
    } catch (error) {
        console.error('Failed to load localization data:', error);
    }
}

/**
 * Apply localization to all elements with data-i18n attribute
 */
function applyLocalization() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const text = getNestedValue(textData[currentLang], key);
        if (text) {
            element.textContent = text;
        }
    });
    
    // Update countdown labels after translation
    updateCountdownLabels();
}

/**
 * Get nested object value by dot-notation key
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Update language button text
 */
function updateLanguageButton() {
    const langButton = document.querySelector('.lang-toggle');
    if (langButton) {
        langButton.textContent = currentLang === 'ro' ? 'RO' : 'HU';
        langButton.title = currentLang === 'ro' ? 'Schimbă la limba maghiară' : 'Schimbă la limba română';
    }
}

/**
 * Language toggle handler
 */
function setupLanguageToggle() {
    const langButton = document.querySelector('.lang-toggle');
    if (langButton) {
        langButton.addEventListener('click', () => {
            currentLang = currentLang === 'ro' ? 'hu' : 'ro';
            localStorage.setItem('wedding-lang', currentLang);
            document.documentElement.setAttribute('data-lang', currentLang);
            document.documentElement.lang = currentLang === 'ro' ? 'ro-RO' : 'hu-HU';
            
            // Update button text
            updateLanguageButton();
            
            // Update URL parameter
            const url = new URL(window.location);
            url.searchParams.set('lang', currentLang);
            window.history.replaceState({}, '', url);
            
            applyLocalization();
        });
    }
}

// ===================== CALENDAR SYSTEM =====================

const WEDDING_DATE = new Date('2026-09-26T17:00:00+02:00');

/**
 * Generate calendar for September 2026
 */
function generateCalendar() {
    const year = 2026;
    const month = 8; // September (0-indexed)
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Adjust for Monday start
    
    const calendarBody = document.getElementById('calendar-body');
    if (!calendarBody) return;
    
    calendarBody.innerHTML = '';
    let dayCounter = 1;
    
    // Create 6 weeks
    for (let week = 0; week < 6; week++) {
        const row = document.createElement('tr');
        
        for (let day = 0; day < 7; day++) {
            const cell = document.createElement('td');
            
            if (week === 0 && day < startingDayOfWeek) {
                // Empty cells before first day
                cell.textContent = '';
            } else if (dayCounter <= daysInMonth) {
                cell.textContent = dayCounter;
                cell.className = 'calendar__day';
                
                // Highlight wedding date (26th)
                if (dayCounter === 26) {
                    cell.classList.add('calendar__day--wedding');
                    cell.setAttribute('aria-label', 'Wedding day');
                }
                
                dayCounter++;
            }
            
            row.appendChild(cell);
        }
        
        calendarBody.appendChild(row);
    }
}

// ===================== COUNTDOWN SYSTEM =====================

/**
 * Update countdown timer
 */
function updateCountdown() {
    const now = new Date();
    const timeRemaining = WEDDING_DATE - now;
    
    if (timeRemaining <= 0) {
        // Wedding has passed
        document.querySelectorAll('[data-countdown]').forEach(el => {
            el.textContent = '0';
        });
        return;
    }
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
    const seconds = Math.floor((timeRemaining / 1000) % 60);
    
    const countdownDisplay = {
        days: document.querySelector('[data-countdown="days"]'),
        hours: document.querySelector('[data-countdown="hours"]'),
        minutes: document.querySelector('[data-countdown="minutes"]'),
        seconds: document.querySelector('[data-countdown="seconds"]')
    };
    
    if (countdownDisplay.days) countdownDisplay.days.textContent = String(days).padStart(2, '0');
    if (countdownDisplay.hours) countdownDisplay.hours.textContent = String(hours).padStart(2, '0');
    if (countdownDisplay.minutes) countdownDisplay.minutes.textContent = String(minutes).padStart(2, '0');
    if (countdownDisplay.seconds) countdownDisplay.seconds.textContent = String(seconds).padStart(2, '0');
}

/**
 * Update countdown labels after language change
 */
function updateCountdownLabels() {
    const labels = {
        days: document.querySelector('[data-i18n="calendar.days"]'),
        hours: document.querySelector('[data-i18n="calendar.hours"]'),
        minutes: document.querySelector('[data-i18n="calendar.minutes"]'),
        seconds: document.querySelector('[data-i18n="calendar.seconds"]')
    };
    
    // Trigger countdown update to refresh display
    updateCountdown();
}

/**
 * Start countdown interval
 */
function startCountdown() {
    updateCountdown(); // Initial call
    setInterval(updateCountdown, 1000);
}

// ===================== FORM SYSTEM =====================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzH_kObi7gaoVSyTT2Q7V1IqORQl7D8gzYpywYD_e-eeB1AzmNcbITvAaYU61n_39PU/exec';
let formLoadedAt = Date.now();

/**
 * Setup RSVP form with conditional visibility and validation
 */
function setupRSVPForm() {
    const form = document.getElementById('rsvp-form');
    if (!form) return;

    // Record when form was loaded (anti-spam timing check)
    formLoadedAt = Date.now();
    
    // Radio buttons for conditional logic
    const joinRadios = form.querySelectorAll('input[name="join"]');
    const partnerRadios = form.querySelectorAll('input[name="partner"]');
    const childrenRadios = form.querySelectorAll('input[name="children"]');
    const childrenCountInput = form.querySelector('input[name="childrenCount"]');
    
    // Conditional sections
    const partnerSection = document.getElementById('partner-section');
    const partnerNameSection = document.getElementById('partner-name-section');
    const menuSection = document.getElementById('menu-section');
    const dietarySection = document.getElementById('dietary-section');
    const partnerMenuSection = document.getElementById('partner-menu-section');
    const partnerDietarySection = document.getElementById('partner-dietary-section');
    const childrenSection = document.getElementById('children-section');
    const childrenCountSection = document.getElementById('children-count-section');
    const childMenusContainer = document.getElementById('child-menus-container');
    
    // Setup join radio listeners
    joinRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isJoining = radio.value === 'yes';
            toggleSection(partnerSection, isJoining);
            toggleSection(menuSection, isJoining);
            toggleSection(dietarySection, isJoining);
            toggleSection(childrenSection, isJoining);
            
            if (!isJoining) {
                // If not joining, hide partner sections
                hidePartnerSections();
                hideChildrenSections();
            }
        });
    });
    
    // Setup partner radio listeners
    partnerRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const hasPartner = radio.value === 'yes';
            toggleSection(partnerNameSection, hasPartner);
            toggleSection(partnerMenuSection, hasPartner);
            toggleSection(partnerDietarySection, hasPartner);
            
            if (!hasPartner) {
                clearSection(partnerNameSection);
                clearSection(partnerMenuSection);
                clearSection(partnerDietarySection);
            }
        });
    });
    
    // Setup children radio listeners
    childrenRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const hasChildren = radio.value === 'yes';
            toggleSection(childrenCountSection, hasChildren);
            
            if (!hasChildren) {
                childrenCountInput.value = '';
                childMenusContainer.innerHTML = '';
            }
        });
    });
    
    // Setup children count listener
    if (childrenCountInput) {
        childrenCountInput.addEventListener('change', () => {
            const count = parseInt(childrenCountInput.value) || 0;
            generateChildMenus(count, form);
        });
    }
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateCompleteForm(form)) {
            return;
        }
        
        const submitBtn = form.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        
        const payload = buildFormPayload(form);
        
        try {
            await submitToSheet(payload);
            showFormSuccess(form);
        } catch (err) {
            console.error('Submission failed:', err);
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            showFormError(form);
        }
    });
}

/**
 * Toggle visibility of a conditional section
 */
function toggleSection(section, show) {
    if (!section) return;
    
    if (show) {
        section.hidden = false;
        section.classList.add('visible');
        // Update required attributes for inputs
        section.querySelectorAll('input[data-conditional], select[data-conditional]').forEach(input => {
            input.required = true;
            input.setAttribute('aria-required', 'true');
        });
    } else {
        section.hidden = true;
        section.classList.remove('visible');
        // Remove required attributes
        section.querySelectorAll('input[data-conditional], select[data-conditional]').forEach(input => {
            input.required = false;
            input.removeAttribute('aria-required');
        });
    }
}

/**
 * Clear section (remove values and errors)
 */
function clearSection(section) {
    if (!section) return;
    
    section.querySelectorAll('input, select, textarea').forEach(input => {
        input.value = '';
        input.setAttribute('aria-invalid', 'false');
    });
    
    section.querySelectorAll('.form-error').forEach(error => {
        error.textContent = '';
    });
}

/**
 * Hide all partner-related sections
 */
function hidePartnerSections() {
    document.getElementById('partner-name-section').hidden = true;
    document.getElementById('partner-menu-section').hidden = true;
    document.getElementById('partner-dietary-section').hidden = true;
    clearSection(document.getElementById('partner-name-section'));
    clearSection(document.getElementById('partner-menu-section'));
    clearSection(document.getElementById('partner-dietary-section'));
}

/**
 * Hide all children-related sections
 */
function hideChildrenSections() {
    document.getElementById('children-count-section').hidden = true;
    document.getElementById('child-menus-container').innerHTML = '';
    clearSection(document.getElementById('children-count-section'));
}

/**
 * Generate child menu selections based on count
 */
function generateChildMenus(count, form) {
    const container = document.getElementById('child-menus-container');
    container.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const fieldset = document.createElement('div');
        fieldset.className = 'form-group';
        fieldset.innerHTML = `
            <label for="child-menu-${i}" class="form-label">
                <span data-i18n="rsvp.childMenuLabel">Meniu copil</span>
                <span style="font-weight: 400; font-size: 0.85rem;">#${i}</span>
            </label>
            <select id="child-menu-${i}" name="childMenu${i}" class="form-select" data-child-menu="true">
                <option value="">-- Selectează --</option>
                <option value="children" data-i18n="rsvp.childMenuChildren">Meniu pentru copii</option>
                <option value="adult" data-i18n="rsvp.childMenuAdult">Meniu adult</option>
                <option value="no-menu" data-i18n="rsvp.childMenuNoMenu">Fără meniu</option>
            </select>
            <span class="form-error" role="alert"></span>
        `;
        container.appendChild(fieldset);
    }
    
    // Re-apply localization to new elements
    applyLocalization();
}

/**
 * Validate complete form
 */
function validateCompleteForm(form) {
    let isValid = true;
    let firstInvalidField = null;
    
    // Clear all errors
    form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    form.querySelectorAll('input, select, textarea').forEach(el => {
        el.setAttribute('aria-invalid', 'false');
    });
    
    // Validate join question (required)
    const joinRadio = form.querySelector('input[name="join"]:checked');
    if (!joinRadio) {
        const error = form.querySelector('fieldset:first-of-type .form-error');
        if (error) {
            error.textContent = getTranslation('rsvp.requiredField');
            if (!firstInvalidField) firstInvalidField = joinRadio;
        }
        isValid = false;
    }
    
    const isJoining = joinRadio?.value === 'yes';
    
    // Validate name (always required)
    const nameInput = form.querySelector('input[name="name"]');
    if (!nameInput.value.trim()) {
        showFieldError(nameInput, getTranslation('rsvp.nameError'));
        if (!firstInvalidField) firstInvalidField = nameInput;
        isValid = false;
    }
    
    if (isJoining) {
        // Validate menu (required if joining)
        const menuSelect = form.querySelector('select[name="menu"]');
        if (!menuSelect.value) {
            showFieldError(menuSelect, getTranslation('rsvp.menuError'));
            if (!firstInvalidField) firstInvalidField = menuSelect;
            isValid = false;
        }
        
        // Validate partner question
        const partnerRadio = form.querySelector('input[name="partner"]:checked');
        if (partnerRadio?.value === 'yes') {
            // Validate partner name
            const partnerNameInput = form.querySelector('input[name="partnerName"]');
            if (!partnerNameInput.value.trim()) {
                showFieldError(partnerNameInput, getTranslation('rsvp.partnerNameError'));
                if (!firstInvalidField) firstInvalidField = partnerNameInput;
                isValid = false;
            }
            
            // Validate partner menu
            const partnerMenuSelect = form.querySelector('select[name="partnerMenu"]');
            if (!partnerMenuSelect.value) {
                showFieldError(partnerMenuSelect, getTranslation('rsvp.partnerMenuError'));
                if (!firstInvalidField) firstInvalidField = partnerMenuSelect;
                isValid = false;
            }
        }
        
        // Validate children
        const childrenRadio = form.querySelector('input[name="children"]:checked');
        if (childrenRadio?.value === 'yes') {
            const childrenCountInput = form.querySelector('input[name="childrenCount"]');
            const count = parseInt(childrenCountInput.value) || 0;
            
            if (count < 1 || count > 10) {
                showFieldError(childrenCountInput, getTranslation('rsvp.childrenCountError'));
                if (!firstInvalidField) firstInvalidField = childrenCountInput;
                isValid = false;
            }
            
            // Validate each child menu
            for (let i = 1; i <= count; i++) {
                const childMenuSelect = form.querySelector(`select[name="childMenu${i}"]`);
                if (!childMenuSelect.value) {
                    showFieldError(childMenuSelect, getTranslation('rsvp.childMenuError'));
                    if (!firstInvalidField) firstInvalidField = childMenuSelect;
                    isValid = false;
                }
            }
        }
    }
    
    // Focus first invalid field
    if (!isValid && firstInvalidField) {
        firstInvalidField.focus();
    }
    
    return isValid;
}

/**
 * Show field error
 */
function showFieldError(field, message) {
    const errorEl = field.closest('.form-group') ? field.closest('.form-group').querySelector('.form-error') : 
                    field.closest('fieldset') ? field.closest('fieldset').querySelector('.form-error') :
                    field.parentElement.querySelector('.form-error');
    
    if (errorEl) {
        errorEl.textContent = message;
        field.setAttribute('aria-invalid', 'true');
    }
}

/**
 * Build form payload
 */
function buildFormPayload(form) {
    const join = form.querySelector('input[name="join"]:checked').value;
    
    const payload = {
        join,
        name: form.querySelector('input[name="name"]').value,
        partner: null,
        partnerName: null,
        partnerMenu: null,
        partnerDietary: null,
        menu: null,
        dietary: form.querySelector('textarea[name="dietary"]').value || null,
        children: null,
        childrenCount: null,
        childMenus: [],
        message: form.querySelector('textarea[name="message"]').value || null,
        timestamp: new Date().toISOString()
    };
    
    if (join === 'yes') {
        payload.menu = form.querySelector('select[name="menu"]').value;
        payload.children = form.querySelector('input[name="children"]:checked')?.value || null;
        
        const partnerRadio = form.querySelector('input[name="partner"]:checked');
        if (partnerRadio?.value === 'yes') {
            payload.partner = 'yes';
            payload.partnerName = form.querySelector('input[name="partnerName"]').value;
            payload.partnerMenu = form.querySelector('select[name="partnerMenu"]').value;
            payload.partnerDietary = form.querySelector('textarea[name="partnerDietary"]').value || null;
        } else {
            payload.partner = 'no';
        }
        
        if (payload.children === 'yes') {
            const count = parseInt(form.querySelector('input[name="childrenCount"]').value) || 0;
            payload.childrenCount = count;
            
            for (let i = 1; i <= count; i++) {
                payload.childMenus.push(form.querySelector(`select[name="childMenu${i}"]`).value);
            }
        } else {
            payload.children = 'no';
        }
    }
    
    return payload;
}

/**
 * Get translation string
 */
function getTranslation(key) {
    return getNestedValue(textData[currentLang], key) || key;
}

/**
 * Submit form data to Google Sheets via Apps Script
 */
async function submitToSheet(payload) {
    // Add anti-spam fields
    payload._loadedAt = new Date(formLoadedAt).toISOString();
    payload.lang = currentLang;
    
    // Honeypot value
    const hpField = document.querySelector('input[name="_hp"]');
    if (hpField?.value) {
        payload._hp = hpField.value;
    }
    
    await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
    });
    
    // no-cors returns opaque response, so we can't read status
    // but if fetch didn't throw, the request was sent
}

/**
 * Show form success message
 */
function showFormSuccess(form) {
    const successEl = form.querySelector('.form-success');
    if (successEl) {
        successEl.style.display = 'block';
    }
}

/**
 * Show form error message
 */
function showFormError(form) {
    let errorEl = form.querySelector('.form-submit-error');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'form-submit-error';
        errorEl.role = 'alert';
        errorEl.style.cssText = 'color:#c0392b;text-align:center;margin-top:1rem;';
        form.querySelector('.btn-submit').after(errorEl);
    }
    errorEl.textContent = getTranslation('rsvp.errorMessage') || 'A apărut o eroare. Vă rugăm încercați din nou.';
}

// ===================== INITIALIZATION =====================

/**
 * Initialize all components when DOM is ready
 */
async function initializeApp() {
    await initLocalization();
    setupLanguageToggle();
    generateCalendar();
    startCountdown();
    setupRSVPForm();
}

// Start when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
