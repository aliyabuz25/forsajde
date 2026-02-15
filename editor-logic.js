// OctoPanel - Designer Grade Logic (Zero Orange)
let sitemapData = null;
let currentSectionPath = 'site';

// Lisenziya və Mövzu
const VALID_LICENSE_CODES = ['ULTRA-EDIT-2026', 'AZ-OFFROAD-PREMIUM', 'ADMIN-LTE-FULL'];
const TRIAL_DAYS = 14;

// Professional Icon Mapping
const ICON_MAP = {
    title: 'fas fa-font',
    subtitle: 'fas fa-align-justify',
    description: 'fas fa-paragraph',
    link: 'fas fa-link',
    url: 'fas fa-external-link-alt',
    image: 'fas fa-image',
    photo: 'fas fa-camera',
    video: 'fas fa-play-circle',
    icon: 'fas fa-shapes',
    email: 'fas fa-envelope',
    phone: 'fas fa-mobile-alt',
    address: 'fas fa-map-pin',
    date: 'fas fa-calendar-day',
    time: 'fas fa-clock',
    active: 'fas fa-power-off',
    status: 'fas fa-info-circle',
    site_name: 'fas fa-shield-alt',
    keywords: 'fas fa-tags',
    hero: 'fas fa-star',
    official_partners: 'fas fa-briefcase',
    social: 'fas fa-share-nodes',
    established: 'fas fa-calendar-check',
    logo: 'fas fa-fingerprint',
    marqueeEnabled: 'fas fa-broadcast-tower',
    marqueeText: 'fas fa-bullhorn',
    title_line1: 'fas fa-heading',
    title_line2: 'fas fa-heading',
    title_highlight: 'fas fa-highlighter',
    stats: 'fas fa-chart-bar',
    mission_title: 'fas fa-bullseye',
    vision_title: 'fas fa-eye',
    tab_name: 'fas fa-folder',
    category: 'fas fa-layer-group',
    isMain: 'fas fa-thumbtack',
    address: 'fas fa-map-marker-alt',
    hours: 'fas fa-clock',
    departments: 'fas fa-sitemap'
};

// Human-friendly Azerbaijani Labels
const LABEL_MAP = {
    site: "Sayt Məlumatları",
    name: "Ad",
    established: "Yaranma Tarixi",
    description: "Təsvir",
    logo: "Loqo URL",
    settings: "Sistem Ayarları",
    marqueeEnabled: "Sürüşən Yazı Aktiv",
    marqueeText: "Sürüşən Yazı Mətni",
    navigation: "Naviqasiya Menyu",
    home: "Ana SƏhifə",
    about: "Haqqımızda",
    news: "Xəbərlər",
    events: "Yarışlar",
    drivers: "Sürücülər",
    gallery: "Qalereya",
    rules: "Qaydalar",
    contact: "Əlaqə",
    hero: "Giriş Seksiyası (Hero)",
    badge: "Nişan Mətni",
    title_line1: "Başlıq (Sətir 1)",
    title_line2: "Başlıq (Sətir 2)",
    title_highlight: "Vurğulanan Söz",
    subtitle: "Alt Başlıq",
    bg_image: "Arxa Fon Şəkli",
    btn_races: "Yarış Düyməsi",
    btn_about: "Haqqımızda Düyməsi",
    est_title: "Yaranma Başlığı",
    hero_text: "Əsas Mətn",
    stats: "Statistika",
    label: "Etiket",
    value: "Dəyər",
    mission_vision: "Missiya və Vizyon",
    mission_title: "Missiya Başlığı",
    mission_desc: "Missiya Təsviri",
    target_text: "Hədəf Mətni",
    vision_title: "Vizyon Başlığı",
    vision_desc: "Vizyon Təsviri",
    vision_goal: "Vizyon Məqsədi",
    values: "Dəyərlərimiz",
    tab_name: "Tab Adı",
    items: "Bəndlər",
    technical: "Texniki",
    safety: "Təhlükəsizlik",
    eco: "Ekologiya",
    news_subtitle: "Xəbərlər Alt Başlığı",
    date: "Tarix",
    category: "Kateqoriya",
    isMain: "Əsas Xəbər",
    events_upcoming: "Gələcək Yarışlar",
    events_past: "Keçmiş Yarışlar",
    location: "Məkan",
    status: "Status",
    car: "Avtomobil",
    team: "Komanda",
    points: "Xal",
    photos: "Şəkillər",
    videos: "Videolar",
    videoId: "YouTube ID",
    duration: "Müddət",
    video_archive: "Video Arxiv",
    partners: "Tərəfdaşlar",
    url: "Keçid Linki",
    address: "Ünvan",
    phone: "Telefon",
    email: "E-poçt",
    hours: "İş Saatları",
    social: "Sosial Şəbəkələr",
    departments: "Departamentlər"
};

function isImageURL(url) {
    if (typeof url !== 'string') return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null ||
        url.includes('unsplash.com') ||
        url.includes('placehold.co') ||
        url.includes('img.youtube.com');
}

document.addEventListener('DOMContentLoaded', async () => {
    initLicensing();
    applyStoredTheme();
    await fetchSitemap();
    await renderSidebar(); // Build sidebar dynamically
    initSidebarListener(); // Listen for clicks on dynamic items
    initSearch();
    initProductionUX();

    // Hide loading splash
    setTimeout(() => {
        const splash = document.getElementById('loadingSplash');
        if (splash) splash.classList.add('hidden');
    }, 800);

    document.getElementById('saveButton').onclick = saveChanges;
});

function initProductionUX() {
    // Scroll progress bar
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    window.onscroll = () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        bar.style.width = scrolled + "%";
    };
}

function initLicensing() {
    if (!localStorage.getItem('trial-start')) {
        localStorage.setItem('trial-start', new Date().toISOString());
    }
}

function getLicenseStatus() {
    const isActivated = localStorage.getItem('panel-activated') === 'true';
    if (isActivated) return { status: 'active', daysLeft: 0 };

    const startDate = new Date(localStorage.getItem('trial-start'));
    const now = new Date();
    const diffTime = Math.abs(now - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, TRIAL_DAYS - diffDays);

    if (daysLeft > 0) return { status: 'trial', daysLeft };
    return { status: 'expired', daysLeft: 0 };
}

function isFeatureAvailable() {
    const status = getLicenseStatus();
    return status.status === 'active' || status.status === 'trial';
}

function applyStoredTheme() {
    const theme = localStorage.getItem('panel-theme') || 'default';
    document.body.setAttribute('data-panel-theme', theme);

    const sidebar = $('.main-sidebar');
    if (theme === 'white-blue') {
        document.body.classList.remove('dark-mode');
        $('.main-header').removeClass('navbar-dark').addClass('navbar-light');
        sidebar.removeClass('sidebar-dark-primary').addClass('sidebar-light-primary');
    } else {
        document.body.classList.add('dark-mode');
        $('.main-header').removeClass('navbar-light').addClass('navbar-dark');
        sidebar.removeClass('sidebar-light-primary').addClass('sidebar-dark-primary');
    }
}

async function fetchSitemap() {
    try {
        const response = await fetch('/api/sitemap');
        sitemapData = await response.json();
        renderSection(currentSectionPath);
    } catch (err) {
        showNotification('Məlumatlar yüklənmədi', 'error');
    }
}

async function renderSidebar() {
    try {
        const response = await fetch('/api/sections');
        const sections = await response.json();
        const nav = document.getElementById('sectionNav');
        if (!nav) return;

        nav.innerHTML = '<li class="nav-header">MƏZMUN REDAKTƏSİ</li>';

        sections.forEach((s, index) => {
            const item = document.createElement('li');
            item.className = 'nav-item';

            // Smart Icon Mapping
            const icon = ICON_MAP[s.id] || ICON_MAP[s.id.split('_')[0]] || 'fas fa-circle-notch';

            item.innerHTML = `
                <a href="#" class="nav-link ${s.id === currentSectionPath ? 'active' : ''}" data-section="${s.id}">
                    <i class="nav-icon ${icon}"></i>
                    <p>${s.title}</p>
                </a>
            `;
            nav.appendChild(item);
        });

        // Add System Section at the bottom
        nav.innerHTML += `
            <li class="nav-header">SİSTEM</li>
            <li class="nav-item">
                <a href="#" class="nav-link" data-section="settings-ui">
                    <i class="nav-icon fas fa-sliders-h text-primary"></i>
                    <p>Panel Ayarları</p>
                </a>
            </li>
        `;

        // Update title if we have sections
        const currentSection = sections.find(s => s.id === currentSectionPath);
        if (currentSection) {
            $('#editorTitle').text(currentSection.title);
        }
    } catch (err) {
        console.error('Sidebar error:', err);
    }
}

function initSidebarListener() {
    $(document).on('click', '#sectionNav .nav-link', function (e) {
        e.preventDefault();
        const section = $(this).attr('data-section');
        if (section) {
            if (section === 'settings-ui') {
                switchView('settings');
            } else {
                switchSection(section, this);
            }
        }
    });
}

function switchView(view) {
    $('#sectionNav .nav-link').removeClass('active');
    $(`#sectionNav .nav-link[data-section="${view === 'settings' ? 'settings-ui' : ''}"]`).addClass('active');

    $('#formContainer').fadeOut(150, () => {
        if (view === 'settings') {
            renderSettings();
        }
        $('#formContainer').fadeIn(200);
    });
}

async function switchSection(path, element = null) {
    if (!sitemapData) return;

    $('#sectionNav .nav-link').removeClass('active');
    if (element) $(element).addClass('active');
    else $(`#sectionNav .nav-link[data-section="${path}"]`).addClass('active');

    currentSectionPath = path;
    const title = element ? $(element).find('p').text() : $(`#sectionNav .nav-link[data-section="${path}"] p`).text();
    $('#editorTitle').text(title);

    return new Promise((resolve) => {
        $('#formContainer').fadeOut(150, () => {
            renderSection(path);
            $('#formContainer').fadeIn(200, resolve);
        });
    });
}

function renderSection(path) {
    if (!isFeatureAvailable()) {
        const container = document.getElementById('formContainer');
        container.innerHTML = `
            <div class="col-12 text-center p-5 fade-in">
                <i class="fas fa-lock fa-4x text-muted mb-4 opacity-25"></i>
                <h2 class="font-weight-bold">Lisenziya Tələbi</h2>
                <p class="text-muted">Davam etmək üçün proqramı aktivləşdirin.</p>
                <button class="btn btn-primary px-5 rounded-pill mt-3" onclick="switchView('settings')">Ayarlara git</button>
            </div>
        `;
        return;
    }

    const container = document.getElementById('formContainer');
    container.innerHTML = '';

    const sectionData = getValueByPath(sitemapData, path);
    if (!sectionData) return;

    createFields(sectionData, path, container);
}

function createFields(data, fullPath, container) {
    for (const [key, value] of Object.entries(data)) {
        const fieldPath = `${fullPath}.${key}`;
        const icon = ICON_MAP[key] || 'fas fa-circle-notch';

        if (Array.isArray(value)) {
            const col = document.createElement('div');
            col.className = 'col-12 fade-in';

            const card = document.createElement('div');
            card.className = 'card card-primary card-outline glass-panel';
            card.id = `field-${fieldPath.replace(/\./g, '-')}`;

            const header = document.createElement('div');
            header.className = 'card-header d-flex align-items-center';
            const displayLabel = LABEL_MAP[key] || key.replace(/_/g, ' ');
            header.innerHTML = `
                <h3 class="card-title text-uppercase" style="font-size: 0.85rem; letter-spacing: 0.1em;">
                    <i class="${icon} mr-2 text-primary opacity-75"></i>${displayLabel}
                </h3>
                <div class="card-tools ml-auto">
                    <button class="btn btn-xs btn-outline-primary px-3 rounded-pill mr-2" onclick="openRawModal('${fieldPath}')">JSON</button>
                    <button class="btn btn-xs btn-primary px-3 rounded-pill" onclick="addItemToArray('${fieldPath}')">+ Əlavə Et</button>
                </div>
            `;

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            value.forEach((item, index) => {
                const itemPath = `${fieldPath}.${index}`;
                const itemWrapper = document.createElement('div');
                itemWrapper.className = 'bg-dark-soft mb-4 p-4 array-item-wrapper';
                itemWrapper.id = `field-${itemPath.replace(/\./g, '-')}`;

                const itemTitle = document.createElement('h6');
                itemTitle.className = 'font-weight-bold text-primary mb-4 pb-2 border-bottom';
                itemTitle.textContent = `${key.replace(/_/g, ' ').replace(/s$/, '').toUpperCase()} #${index + 1}`;
                itemWrapper.appendChild(itemTitle);

                const controls = document.createElement('div');
                controls.className = 'array-item-controls';
                controls.innerHTML = `
                    <button class="btn btn-outline-danger btn-xs" onclick="removeItemFromArray('${fieldPath}', ${index})"><i class="fas fa-trash-alt"></i></button>
                    <button class="btn btn-outline-primary btn-xs" onclick="duplicateArrayItem('${fieldPath}', ${index})"><i class="fas fa-copy"></i></button>
                `;
                itemWrapper.appendChild(controls);

                const innerRow = document.createElement('div');
                innerRow.className = 'row';
                createFields(item, itemPath, innerRow);
                itemWrapper.appendChild(innerRow);

                cardBody.appendChild(itemWrapper);
            });

            card.appendChild(header);
            card.appendChild(cardBody);
            col.appendChild(card);
            container.appendChild(col);
        } else if (typeof value === 'object' && value !== null) {
            const col = document.createElement('div');
            col.className = 'col-lg-6 fade-in';

            const card = document.createElement('div');
            card.className = 'card card-primary card-outline glass-panel';
            card.id = `field-${fieldPath.replace(/\./g, '-')}`;

            const header = document.createElement('div');
            header.className = 'card-header d-flex align-items-center';
            const displayLabel = LABEL_MAP[key] || key.replace(/_/g, ' ');
            header.innerHTML = `
                <h3 class="card-title text-uppercase" style="font-size: 0.85rem; letter-spacing: 0.1em;">
                    <i class="${icon} mr-2 text-primary opacity-75"></i>${displayLabel}
                </h3>
                <div class="card-tools ml-auto">
                    <button class="btn btn-xs btn-outline-primary px-3 rounded-pill" onclick="openRawModal('${fieldPath}')">JSON</button>
                </div>
            `;

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body row';

            createFields(value, fieldPath, cardBody);

            card.appendChild(header);
            card.appendChild(cardBody);
            col.appendChild(card);
            container.appendChild(col);
        } else {
            const formGroupCol = document.createElement('div');
            formGroupCol.className = (typeof value === 'string' && value.length > 100) ? 'col-12' : 'col-md-6';
            formGroupCol.id = `field-${fieldPath.replace(/\./g, '-')}`;

            const formGroup = document.createElement('div');
            formGroup.className = 'form-group mb-4';

            const label = document.createElement('label');
            const displayLabel = LABEL_MAP[key] || key.replace(/_/g, ' ');
            label.innerHTML = `<i class="${ICON_MAP[key] || 'fas fa-tag'} mr-1 opacity-50"></i> ${displayLabel}`;

            let input;
            if (typeof value === 'boolean') {
                input = document.createElement('div');
                input.className = 'custom-control custom-switch custom-switch-off-dark custom-switch-on-primary mt-2';
                input.innerHTML = `
                    <input type="checkbox" class="custom-control-input" id="switch-${fieldPath.replace(/\./g, '-')}" ${value ? 'checked' : ''}>
                    <label class="custom-control-label" for="switch-${fieldPath.replace(/\./g, '-')}"></label>
                `;
                const checkbox = input.querySelector('input');
                checkbox.onchange = (e) => {
                    setValueByPath(sitemapData, fieldPath, e.target.checked);
                    triggerAutoSave();
                };
            } else if (typeof value === 'string' && value.startsWith('#') && (value.length === 7 || value.length === 4)) {
                input = document.createElement('input');
                input.type = 'color';
                input.className = 'form-control h-auto p-1 border-0';
                input.style.width = '100%';
                input.style.height = '45px';
                input.value = value;
                input.oninput = (e) => {
                    setValueByPath(sitemapData, fieldPath, e.target.value);
                    triggerAutoSave();
                };
            } else if (isImageURL(value)) {
                input = document.createElement('div');
                input.className = 'url-input-wrapper';
                input.innerHTML = `
                    <div class="input-group">
                        <input type="text" class="form-control" value="${value}">
                        <div class="input-group-append">
                            <button class="btn btn-outline-primary" type="button" onclick="uploadImage('${fieldPath}', this.parentElement.previousElementSibling)">
                                <i class="fas fa-upload mr-1"></i> Yüklə
                            </button>
                        </div>
                    </div>
                    <div class="image-preview-container mt-2" id="preview-${fieldPath.replace(/\./g, '-')}">
                        <img src="${value}" alt="Preview" class="img-fluid rounded border" style="max-height: 120px; object-fit: cover; width: 100%;" onerror="this.src='https://placehold.co/400x200?text=Səhv+Link'">
                    </div>
                `;
                const textInput = input.querySelector('input');
                const previewImg = input.querySelector('img');
                textInput.oninput = (e) => {
                    const val = e.target.value;
                    setValueByPath(sitemapData, fieldPath, val);
                    previewImg.src = val;
                    triggerAutoSave();
                };
            } else if (typeof value === 'string' && value.length > 60) {
                input = document.createElement('textarea');
                input.className = 'form-control';
                input.rows = Math.min(6, Math.ceil(value.length / 80));
                input.value = value;
                input.oninput = (e) => {
                    setValueByPath(sitemapData, fieldPath, e.target.value);
                    triggerAutoSave();
                };
            } else {
                input = document.createElement('input');
                input.className = 'form-control';
                input.type = typeof value === 'number' ? 'number' : 'text';
                input.value = value;
                input.oninput = (e) => {
                    const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                    setValueByPath(sitemapData, fieldPath, val);
                    triggerAutoSave();
                };
            }

            formGroup.appendChild(label);
            formGroup.appendChild(input);
            formGroupCol.appendChild(formGroup);
            container.appendChild(formGroupCol);
        }
    }
}

function addItemToArray(path) {
    const arr = getValueByPath(sitemapData, path);
    const newItem = arr.length > 0 ? JSON.parse(JSON.stringify(arr[0])) : {};
    const reset = (obj) => {
        for (let k in obj) {
            if (typeof obj[k] === 'string') obj[k] = "";
            else if (typeof obj[k] === 'number') obj[k] = 0;
            else if (typeof obj[k] === 'boolean') obj[k] = false;
            else if (typeof obj[k] === 'object' && obj[k] !== null) reset(obj[k]);
        }
    };
    reset(newItem);
    arr.push(newItem);
    renderSection(currentSectionPath);
    showNotification('Məlumat əlavə edildi', 'success');
    triggerAutoSave();
}

function removeItemFromArray(path, index) {
    if (!confirm('Silmək istədiyinizə əminsiniz?')) return;
    const arr = getValueByPath(sitemapData, path);
    arr.splice(index, 1);
    renderSection(currentSectionPath);
    showNotification('Məlumat silindi', 'success');
    triggerAutoSave();
}

function duplicateArrayItem(path, index) {
    const arr = getValueByPath(sitemapData, path);
    const newItem = JSON.parse(JSON.stringify(arr[index]));
    arr.splice(index + 1, 0, newItem);
    renderSection(currentSectionPath);
    showNotification('Dublikat yaradıldı', 'success');
    triggerAutoSave();
}

let currentRawPath = '';
function openRawModal(path) {
    currentRawPath = path;
    const data = getValueByPath(sitemapData, path);
    document.getElementById('jsonRawArea').value = JSON.stringify(data, null, 4);
    $('#jsonModalTitle').text(`Konfiqurasiya: ${path.replace(/\./g, ' › ')}`);
    $('#jsonModal').modal('show');
}

function saveRawJSON() {
    try {
        const raw = document.getElementById('jsonRawArea').value;
        const parsed = JSON.parse(raw);
        setValueByPath(sitemapData, currentRawPath, parsed);
        $('#jsonModal').modal('hide');
        renderSection(currentSectionPath);
        showNotification('Dəyişikliklər tətbiq olundu', 'success');
        triggerAutoSave();
    } catch (e) {
        showNotification('JSON formatı yanlışdır', 'error');
    }
}

function getValueByPath(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function setValueByPath(obj, path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((acc, part) => acc[part], obj);
    target[last] = value;
}

let searchDebounceTimer = null;
let currentSearchIndex = -1;

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (!searchInput || !searchResults) return;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length < 2) {
                searchResults.style.display = 'none';
                currentSearchIndex = -1;
                return;
            }
            const results = searchJSON(sitemapData, query);
            renderSearchResults(results, query);
        }, 300);
    });

    searchInput.addEventListener('keydown', (e) => {
        const items = searchResults.querySelectorAll('.search-result-item:not(.text-muted)');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentSearchIndex = (currentSearchIndex + 1) % items.length;
            updateActiveSearchItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentSearchIndex = (currentSearchIndex - 1 + items.length) % items.length;
            updateActiveSearchItem(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentSearchIndex >= 0) items[currentSearchIndex].click();
        } else if (e.key === 'Escape') {
            searchResults.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

function updateActiveSearchItem(items) {
    items.forEach((item, idx) => {
        item.classList.toggle('active', idx === currentSearchIndex);
        if (idx === currentSearchIndex) item.scrollIntoView({ block: 'nearest' });
    });
}

function searchJSON(obj, query, path = '', results = []) {
    for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        // Match in Key
        if (key.toLowerCase().includes(query)) {
            results.push({
                path: currentPath,
                displayPath: currentPath,
                value: (typeof value === 'object' ? '[Bölmə]' : value),
                type: 'key'
            });
        }

        // Match in Value
        if (typeof value === 'string' || typeof value === 'number') {
            if (String(value).toLowerCase().includes(query)) {
                results.push({
                    path: currentPath,
                    displayPath: currentPath,
                    value: value,
                    type: 'value'
                });
            }
        } else if (typeof value === 'object' && value !== null) {
            searchJSON(value, query, currentPath, results);
        }
    }
    // Sort results: key matches first, then value matches
    return results.sort((a, b) => (a.type === 'key' ? -1 : 1)).slice(0, 10);
}

function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return String(text).replace(regex, '<span class="search-highlight">$1</span>');
}

function renderSearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    currentSearchIndex = -1;

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item text-muted">Heç nə tapılmadı</div>';
    } else {
        results.forEach(res => {
            const item = document.createElement('div');
            item.className = 'search-result-item fade-in';

            const displayPath = res.path.replace(/\./g, ' › ');
            const highlightedPath = highlightMatch(displayPath, query);
            const highlightedValue = highlightMatch(String(res.value).substring(0, 40), query);

            item.innerHTML = `
                <span class="search-result-path">${highlightedPath}</span>
                <span class="search-result-value">${highlightedValue}</span>
            `;
            item.onclick = () => jumpToResult(res.path);
            searchResults.appendChild(item);
        });
    }
    searchResults.style.display = 'block';
}

async function jumpToResult(path) {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) searchResults.style.display = 'none';

    // Improved Dynamic Section Detection
    const parts = path.split('.');
    let sectionPath = parts[0];
    if (parts[0] === 'homepage') sectionPath = `homepage.${parts[1]}`;

    // Switch section if needed
    if (currentSectionPath !== sectionPath) {
        await switchSection(sectionPath);
    }

    // Wait a bit for DOM to render if section was switched
    setTimeout(() => {
        const fieldId = `field-${path.replace(/\./g, '-')}`;
        const element = document.getElementById(fieldId);

        if (element) {
            // Scroll to the specific card
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Highlight and Focus the child input/textarea/select
            const input = element.querySelector('input, textarea, select');
            if (input) {
                input.focus();
                // If it's a text input, select the text
                if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
                    input.select();
                }
            }

            element.classList.add('highlight-field');
            setTimeout(() => element.classList.remove('highlight-field'), 2000);
        }
    }, 100);
}

let autoSaveTimeout;
function triggerAutoSave() {
    $('#statusMessage').text('Yadda saxlanılır...').removeClass('badge-success').addClass('badge-warning');
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => saveChanges(true), 1500);
}

async function saveChanges(silent = false) {
    if (!sitemapData) return;
    try {
        const response = await fetch('/api/sitemap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sitemapData)
        });
        if (response.ok) {
            $('#statusMessage').text('Sinxronlaşdırıldı').removeClass('badge-warning').addClass('badge-success');
        }
    } catch (err) { }
}

function showNotification(message, type) {
    const nav = document.getElementById('notification');
    nav.textContent = message;
    nav.className = `notification show ${type}`;
    setTimeout(() => nav.classList.remove('show'), 3000);
}

function renderSettings() {
    const status = getLicenseStatus();
    $('#editorTitle').text('Panel Ayarları');
    const container = document.getElementById('formContainer');

    let statusHTML = '';
    if (status.status === 'trial') {
        statusHTML = `<div class="license-status-banner status-trial p-4 mb-5 d-flex justify-content-between align-items-center"><span><i class="fas fa-hourglass-half mr-3"></i><strong>Sınaq Rejimi:</strong> ${status.daysLeft} gün qalıb</span><button class="btn btn-sm btn-dark px-4 rounded-pill" onclick="document.getElementById('licenseKey').focus()">Aktivləşdir</button></div>`;
    } else if (status.status === 'active') {
        statusHTML = `<div class="license-status-banner status-active p-4 mb-5"><span><i class="fas fa-check-circle mr-3"></i><strong>Lisenziya:</strong> Premium Versiya Aktivdir</span></div>`;
    }

    container.innerHTML = `
        <div class="col-md-10 offset-md-1 mb-5">
            ${statusHTML}
            
            <h5 class="mb-4 font-weight-bold">İş Sahəsi Görünüşü</h5>
            <div class="theme-preview-grid mb-5">
                <div class="theme-card ${localStorage.getItem('panel-theme') === 'default' ? 'active' : ''}" onclick="selectTheme('default', this)">
                    <div class="theme-swatch"><div class="swatch-sidebar" style="background: #09090b;"></div><div class="swatch-content" style="background: #111113; border-top: 5px solid #6366f1;"></div></div>
                    <div class="theme-label">Pro Midnight (Indigo)</div>
                </div>
                <div class="theme-card ${localStorage.getItem('panel-theme') === 'black-red' ? 'active' : ''}" onclick="selectTheme('black-red', this)">
                    <div class="theme-swatch"><div class="swatch-sidebar" style="background: #000;"></div><div class="swatch-content" style="background: #09090b; border-left: 5px solid #e11d48;"></div></div>
                    <div class="theme-label">Midnight Rose (Rose)</div>
                </div>
                <div class="theme-card ${localStorage.getItem('panel-theme') === 'white-blue' ? 'active' : ''}" onclick="selectTheme('white-blue', this)">
                    <div class="theme-swatch"><div class="swatch-sidebar" style="background: #f8fafc; border-right: 1px solid #e2e8f0;"></div><div class="swatch-content" style="background: #fff; border-top: 10px solid #0ea5e9;"></div></div>
                    <div class="theme-label">Studio Sky (Azure)</div>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-5">
                <div class="card-body p-4">
                    <h6 class="font-weight-bold mb-3">Lisenziya Aktivasiyası</h6>
                    <div class="input-group">
                        <input type="text" id="licenseKey" class="form-control" placeholder="Açarı daxil edin..." value="${localStorage.getItem('license-key') || ''}">
                        <div class="input-group-append">
                            <button class="btn btn-primary px-4" onclick="activateLicense()">İndi Aktivləşdir</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function selectTheme(theme, element) {
    $('.theme-card').removeClass('active');
    $(element).addClass('active');
    localStorage.setItem('panel-theme', theme);
    applyStoredTheme();
    showNotification(`Görünüş yeniləndi`, 'success');
}

function activateLicense() {
    const key = document.getElementById('licenseKey').value.trim().toUpperCase();
    if (VALID_LICENSE_CODES.includes(key)) {
        localStorage.setItem('panel-activated', 'true');
        localStorage.setItem('license-key', key);
        showNotification('Təbriklər! Premium aktiv olundu.', 'success');
        renderSettings();
    } else {
        showNotification('Açar yanlışdır.', 'error');
    }
}
async function uploadImage(fieldPath, inputElement) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            showNotification('Fayl yüklənir...', 'info');
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                setValueByPath(sitemapData, fieldPath, result.url);
                inputElement.value = result.url;
                const previewImg = document.querySelector(`#preview-${fieldPath.replace(/\./g, '-')} img`);
                if (previewImg) previewImg.src = result.url;
                showNotification('Fayl yükləndi', 'success');
                triggerAutoSave();
            } else {
                showNotification('Yükləmə xətası', 'error');
            }
        } catch (err) {
            showNotification('Server xətası', 'error');
        }
    };
    fileInput.click();
}

window.uploadImage = uploadImage;
