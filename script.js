// --- i18n Translations Dictionary ---
const i18n = {
    zh: {
        settingsBtnTitle: '设置',
        searchInputPlaceholder: '搜索网络或输入网址...',
        searchBtnTitle: '开始搜索',
        engineBaidu: '百度',
        engineBilibili: '哔哩哔哩',
        ctxEdit: '修改',
        ctxDelete: '删除',
        addShortcutTitle: '添加快捷方式',
        editShortcutTitle: '修改快捷方式',
        addShortcutBtn: '添加快捷方式',
        labelShortcutName: '名称',
        placeholderShortcutName: '例如：GitHub',
        labelShortcutUrl: '网址 (URL)',
        btnCancel: '取消',
        btnSave: '保存',
        settingsTitle: '设置',
        labelLanguage: '语言 (Language)',
        labelTheme: '外观模式',
        themeSystem: '跟随系统',
        themeLight: '浅色',
        themeDark: '深色',
        labelDefaultEngine: '默认搜索引擎',
        labelSearchTarget: '搜索跳转目标',
        labelShortcutTarget: '快捷方式跳转目标',
        targetNewTab: '新标签页',
        targetCurrentTab: '当前标签页',
        labelAccentColor: '主题主色 (Accent Seed Color)',
        colorGoogleBlue: 'Google 蓝',
        colorEmeraldGreen: '翡翠绿',
        colorCoralOrange: '珊瑚橙',
        colorLavenderPurple: '薰衣紫',
        colorCustomPalette: '自定义调色盘',
        btnDone: '完成',
        alertFillFields: '请填写名称和网址',
        greetingDefault: '你好，准备好开始新的一天了吗？',
        greetingMorning: '早上好，愿今天充满活力！',
        greetingAfternoon: '下午好，保持高效专注！',
        greetingEvening: '晚上好，享受悠闲时光！',
        dateLocale: 'zh-CN'
    },
    en: {
        settingsBtnTitle: 'Settings',
        searchInputPlaceholder: 'Search the web or type a URL...',
        searchBtnTitle: 'Search',
        engineBaidu: 'Baidu',
        engineBilibili: 'Bilibili',
        ctxEdit: 'Edit',
        ctxDelete: 'Delete',
        addShortcutTitle: 'Add shortcut',
        editShortcutTitle: 'Edit shortcut',
        addShortcutBtn: 'Add shortcut',
        labelShortcutName: 'Name',
        placeholderShortcutName: 'e.g. GitHub',
        labelShortcutUrl: 'URL',
        btnCancel: 'Cancel',
        btnSave: 'Save',
        settingsTitle: 'Settings',
        labelLanguage: 'Language',
        labelTheme: 'Theme',
        themeSystem: 'System',
        themeLight: 'Light',
        themeDark: 'Dark',
        labelDefaultEngine: 'Default search engine',
        labelSearchTarget: 'Search link target',
        labelShortcutTarget: 'Shortcut link target',
        targetNewTab: 'New tab',
        targetCurrentTab: 'Current tab',
        labelAccentColor: 'Accent Color (Seed Color)',
        colorGoogleBlue: 'Google Blue',
        colorEmeraldGreen: 'Emerald Green',
        colorCoralOrange: 'Coral Orange',
        colorLavenderPurple: 'Lavender Purple',
        colorCustomPalette: 'Custom Color Palette',
        btnDone: 'Done',
        alertFillFields: 'Please fill in both name and URL',
        greetingDefault: 'Hello, ready to start a new day?',
        greetingMorning: 'Good morning! Have a productive day.',
        greetingAfternoon: 'Good afternoon! Keep up the great work.',
        greetingEvening: 'Good evening! Time to relax and unwind.',
        dateLocale: 'en-US'
    }
};

// --- Default Shortcuts Data ---
const defaultShortcuts = [
    { name: 'Google', url: 'https://www.google.com', icon: 'g_mobiledata' },
    { name: 'YouTube', url: 'https://www.youtube.com', icon: 'play_arrow' },
    { name: 'GitHub', url: 'https://github.com', icon: 'code' },
    { name: 'Gemini', url: 'https://gemini.google.com', icon: 'auto_awesome' }
];

// --- Search Engines Config ---
const searchEngines = {
    google: { name: 'Google', action: 'https://www.google.com/search', param: 'q' },
    baidu: { name: '百度', nameEn: 'Baidu', action: 'https://www.baidu.com/s', param: 'wd' },
    bing: { name: 'Bing', action: 'https://www.bing.com/search', param: 'q' },
    duckduckgo: { name: 'DuckDuckGo', action: 'https://duckduckgo.com/', param: 'q' },
    bilibili: { name: '哔哩哔哩', nameEn: 'Bilibili', action: 'https://search.bilibili.com/all', param: 'keyword' },
    github: { name: 'GitHub', action: 'https://github.com/search', param: 'q' }
};

// --- State Management ---
let shortcuts = JSON.parse(localStorage.getItem('startune_shortcuts')) || defaultShortcuts;
let currentLang = localStorage.getItem('startune_lang') || 'zh';
let currentTheme = localStorage.getItem('startune_theme') || 'system';
let currentSeedColor = localStorage.getItem('startune_seed_color') || '#1a73e8';
let defaultEngine = localStorage.getItem('startune_default_engine') || 'google';
let currentEngine = defaultEngine;
let searchTarget = localStorage.getItem('startune_search_target') || '_blank';
let shortcutTarget = localStorage.getItem('startune_shortcut_target') || '_blank';
let editingShortcutIndex = -1; // -1 means adding new
let activeShortcutIndex = -1;  // index selected for context menu

// --- Language Switcher ---
function applyLanguage(lang) {
    currentLang = i18n[lang] ? lang : 'zh';
    localStorage.setItem('startune_lang', currentLang);
    document.documentElement.setAttribute('lang', currentLang === 'zh' ? 'zh-CN' : 'en');

    const t = i18n[currentLang];

    // Text content
    document.querySelectorAll('[data-i18n-text]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-text');
        if (t[key]) elem.textContent = t[key];
    });

    // Attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-placeholder');
        if (t[key]) elem.placeholder = t[key];
    });

    document.querySelectorAll('[data-i18n-title]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-title');
        if (t[key]) elem.title = t[key];
    });

    // Update Language Chips
    document.querySelectorAll('.lang-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-lang-val') === currentLang);
    });

    // Refresh Engine selector display name
    setEngine(currentEngine, true);

    // Refresh Clock & Greeting
    updateClock();

    // Refresh Shortcuts (Add Card text)
    renderShortcuts();
}

// --- Material You Dynamic Color Algorithm ---
function hexToHsl(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// Clamp seed lightness so hyper-bright colors don't break contrast/readability
function clampSeedColor(hex) {
    let { h, s, l } = hexToHsl(hex);
    if (l > 65) {
        l = 65; // cap max lightness to 65% for readability
        return hslToHex(h, s, l);
    }
    return hex;
}

function isDarkEffective() {
    if (currentTheme === 'dark') return true;
    if (currentTheme === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function generateMaterialTheme(seedHex) {
    const safeSeedHex = clampSeedColor(seedHex);
    const { h, s } = hexToHsl(safeSeedHex);
    const isDark = isDarkEffective();

    const softChroma = Math.min(s, 45);
    let tokens = {};

    if (!isDark) {
        tokens = {
            '--md-sys-color-primary': safeSeedHex,
            '--md-sys-color-on-primary': '#ffffff',
            '--md-sys-color-primary-container': `hsl(${h}, ${Math.min(softChroma + 15, 60)}%, 93%)`,
            '--md-sys-color-on-primary-container': `hsl(${h}, ${Math.max(softChroma, 50)}%, 25%)`,

            '--md-sys-color-surface': `hsl(${h}, ${Math.min(softChroma, 15)}%, 97%)`,
            '--md-sys-color-surface-container-lowest': '#ffffff',
            '--md-sys-color-surface-container-low': `hsl(${h}, ${Math.min(softChroma, 18)}%, 95%)`,
            '--md-sys-color-surface-container': `hsl(${h}, ${Math.min(softChroma, 20)}%, 92%)`,
            '--md-sys-color-surface-container-high': `hsl(${h}, ${Math.min(softChroma, 22)}%, 89%)`,
            '--md-sys-color-surface-container-highest': `hsl(${h}, ${Math.min(softChroma, 25)}%, 86%)`,

            '--md-sys-color-on-surface': `hsl(${h}, 10%, 14%)`,
            '--md-sys-color-on-surface-variant': `hsl(${h}, 12%, 36%)`,
            '--md-sys-color-outline': `hsl(${h}, 10%, 55%)`,
            '--md-sys-color-outline-variant': `hsl(${h}, ${Math.min(softChroma, 22)}%, 88%)`
        };
    } else {
        tokens = {
            '--md-sys-color-primary': `hsl(${h}, ${Math.min(softChroma + 20, 85)}%, 80%)`,
            '--md-sys-color-on-primary': `hsl(${h}, ${Math.max(softChroma, 60)}%, 15%)`,
            '--md-sys-color-primary-container': `hsl(${h}, ${Math.max(softChroma, 50)}%, 26%)`,
            '--md-sys-color-on-primary-container': `hsl(${h}, ${Math.min(softChroma, 60)}%, 90%)`,

            '--md-sys-color-surface': `hsl(${h}, ${Math.min(softChroma, 15)}%, 9%)`,
            '--md-sys-color-surface-container-lowest': `hsl(${h}, ${Math.min(softChroma, 15)}%, 6%)`,
            '--md-sys-color-surface-container-low': `hsl(${h}, ${Math.min(softChroma, 15)}%, 11%)`,
            '--md-sys-color-surface-container': `hsl(${h}, ${Math.min(softChroma, 15)}%, 14%)`,
            '--md-sys-color-surface-container-high': `hsl(${h}, ${Math.min(softChroma, 15)}%, 18%)`,
            '--md-sys-color-surface-container-highest': `hsl(${h}, ${Math.min(softChroma, 15)}%, 22%)`,

            '--md-sys-color-on-surface': `hsl(${h}, 10%, 90%)`,
            '--md-sys-color-on-surface-variant': `hsl(${h}, 12%, 78%)`,
            '--md-sys-color-outline': `hsl(${h}, 10%, 55%)`,
            '--md-sys-color-outline-variant': `hsl(${h}, ${Math.min(softChroma, 18)}%, 24%)`
        };
    }

    const root = document.documentElement;
    Object.keys(tokens).forEach(key => {
        root.style.setProperty(key, tokens[key]);
    });
}

// --- Apply Theme & Color & Target & Engine ---
function setEngine(engineKey, isTemporary = false) {
    const engine = searchEngines[engineKey] || searchEngines.google;
    currentEngine = engineKey;

    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    searchForm.action = engine.action;
    searchInput.name = engine.param;
    
    const displayName = (currentLang === 'en' && engine.nameEn) ? engine.nameEn : engine.name;
    document.getElementById('engineName').textContent = displayName;

    if (!isTemporary) {
        defaultEngine = engineKey;
        localStorage.setItem('startune_default_engine', engineKey);
    }

    document.querySelectorAll('.engine-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-engine-val') === defaultEngine);
    });
}

function applySearchTarget(target) {
    searchTarget = target;
    localStorage.setItem('startune_search_target', target);
    document.getElementById('searchForm').target = target;

    document.querySelectorAll('.target-chip[data-target-type="search"]').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-target-val') === target);
    });
}

function applyShortcutTarget(target) {
    shortcutTarget = target;
    localStorage.setItem('startune_shortcut_target', target);

    document.querySelectorAll('.target-chip[data-target-type="shortcut"]').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-target-val') === target);
    });

    renderShortcuts();
}

function applyColor(seedHex) {
    currentSeedColor = seedHex;
    localStorage.setItem('startune_seed_color', seedHex);

    document.getElementById('customColorPicker').value = seedHex;
    document.getElementById('hexInput').value = seedHex.replace('#', '').toUpperCase();

    document.querySelectorAll('.color-dot').forEach(dot => {
        const val = dot.getAttribute('data-color-val').toLowerCase();
        dot.classList.toggle('active', val === seedHex.toLowerCase());
    });

    generateMaterialTheme(seedHex);
}

function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('startune_theme', theme);

    document.querySelectorAll('.theme-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-theme-val') === theme);
    });

    generateMaterialTheme(currentSeedColor);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') {
        generateMaterialTheme(currentSeedColor);
    }
});

// --- Clock & Greeting Logic ---
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}`;

    const t = i18n[currentLang] || i18n.zh;
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('date').textContent = now.toLocaleDateString(t.dateLocale, options);

    const hour = now.getHours();
    let greeting = t.greetingDefault;
    let icon = 'wb_sunny';
    if (hour >= 5 && hour < 12) {
        greeting = t.greetingMorning;
        icon = 'wb_sunny';
    } else if (hour >= 12 && hour < 18) {
        greeting = t.greetingAfternoon;
        icon = 'wb_twilight';
    } else {
        greeting = t.greetingEvening;
        icon = 'bedtime';
    }
    const greetingBadge = document.getElementById('greetingText');
    greetingBadge.textContent = greeting;
    greetingBadge.previousElementSibling.textContent = icon;
}

setInterval(updateClock, 1000);
updateClock();

// --- Context Menu Management ---
const contextMenu = document.getElementById('shortcutContextMenu');

function showContextMenu(e, index) {
    e.preventDefault();
    e.stopPropagation();
    activeShortcutIndex = index;

    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2);

    const menuWidth = 150;
    const menuHeight = 100;
    let left = clientX;
    let top = clientY;

    if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 12;
    }
    if (top + menuHeight > window.innerHeight) {
        top = window.innerHeight - menuHeight - 12;
    }

    contextMenu.style.left = `${Math.max(12, left)}px`;
    contextMenu.style.top = `${Math.max(12, top)}px`;
    contextMenu.classList.add('active');
}

function hideContextMenu() {
    contextMenu.classList.remove('active');
}

document.addEventListener('click', hideContextMenu);
document.addEventListener('scroll', hideContextMenu);

document.getElementById('ctxEdit').addEventListener('click', () => {
    if (activeShortcutIndex !== -1) {
        openEditShortcutModal(activeShortcutIndex);
    }
    hideContextMenu();
});

document.getElementById('ctxDelete').addEventListener('click', () => {
    if (activeShortcutIndex !== -1) {
        shortcuts.splice(activeShortcutIndex, 1);
        saveShortcuts();
        renderShortcuts();
    }
    hideContextMenu();
});

// --- Render Shortcuts with Drag and Drop ---
let draggedIndex = null;

function renderShortcuts() {
    const container = document.getElementById('shortcutsContainer');
    container.innerHTML = '';

    const t = i18n[currentLang] || i18n.zh;

    shortcuts.forEach((item, index) => {
        const card = document.createElement('a');
        card.className = 'shortcut-card';
        card.href = item.url;
        card.target = shortcutTarget;
        card.draggable = true;
        card.setAttribute('data-index', index);

        const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}&sz=64`;

        card.innerHTML = `
            <div class="shortcut-icon-wrapper">
                <img src="${faviconUrl}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="shortcut-icon-fallback" style="display:none;">
                    <span class="material-symbols-rounded">${item.icon || 'public'}</span>
                </div>
            </div>
            <div class="shortcut-title">${item.name}</div>
        `;

        // Drag & Drop Handlers (HTML5 Drag and Drop)
        card.addEventListener('dragstart', (e) => {
            draggedIndex = index;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', index);
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            document.querySelectorAll('.shortcut-card').forEach(c => c.classList.remove('drag-over'));
        });

        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (draggedIndex !== null && draggedIndex !== index) {
                card.classList.add('drag-over');
            }
        });

        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });

        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');
            if (draggedIndex !== null && draggedIndex !== index) {
                // Reorder array
                const draggedItem = shortcuts.splice(draggedIndex, 1)[0];
                shortcuts.splice(index, 0, draggedItem);
                draggedIndex = null;
                saveShortcuts();
                renderShortcuts();
            }
        });

        // Context Menu
        card.addEventListener('contextmenu', (e) => showContextMenu(e, index));

        // Touch Long-Press Context Menu & Touch Drag & Drop
        let pressTimer = null;
        let touchDragClone = null;
        let isTouchDragging = false;
        let touchStartX = 0, touchStartY = 0;

        card.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;

            pressTimer = setTimeout(() => {
                // Show context menu on long press
                showContextMenu(e, index);
            }, 500);
        }, { passive: true });

        card.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const moveX = Math.abs(touch.clientX - touchStartX);
            const moveY = Math.abs(touch.clientY - touchStartY);

            // If user moves finger > 8px, cancel long press and start touch drag
            if (moveX > 8 || moveY > 8) {
                clearTimeout(pressTimer);

                if (!isTouchDragging) {
                    isTouchDragging = true;
                    draggedIndex = index;

                    // Create floating ghost element
                    touchDragClone = card.cloneNode(true);
                    touchDragClone.classList.add('touch-dragging');
                    touchDragClone.style.width = `${card.offsetWidth}px`;
                    touchDragClone.style.height = `${card.offsetHeight}px`;
                    document.body.appendChild(touchDragClone);

                    card.classList.add('dragging');
                }

                if (touchDragClone) {
                    touchDragClone.style.left = `${touch.clientX - card.offsetWidth / 2}px`;
                    touchDragClone.style.top = `${touch.clientY - card.offsetHeight / 2}px`;
                }

                // Check element under finger
                const targetElem = document.elementFromPoint(touch.clientX, touch.clientY);
                const targetCard = targetElem ? targetElem.closest('.shortcut-card:not(.add-shortcut-card)') : null;

                document.querySelectorAll('.shortcut-card').forEach(c => c.classList.remove('drag-over'));
                if (targetCard && targetCard !== card) {
                    targetCard.classList.add('drag-over');
                }
            }
        }, { passive: true });

        card.addEventListener('touchend', (e) => {
            clearTimeout(pressTimer);

            if (isTouchDragging) {
                const touch = e.changedTouches[0];
                const targetElem = document.elementFromPoint(touch.clientX, touch.clientY);
                const targetCard = targetElem ? targetElem.closest('.shortcut-card:not(.add-shortcut-card)') : null;

                if (targetCard) {
                    const targetIndex = parseInt(targetCard.getAttribute('data-index'), 10);
                    if (!isNaN(targetIndex) && draggedIndex !== null && draggedIndex !== targetIndex) {
                        const draggedItem = shortcuts.splice(draggedIndex, 1)[0];
                        shortcuts.splice(targetIndex, 0, draggedItem);
                        saveShortcuts();
                    }
                }

                if (touchDragClone && touchDragClone.parentNode) {
                    touchDragClone.parentNode.removeChild(touchDragClone);
                }

                draggedIndex = null;
                isTouchDragging = false;
                renderShortcuts();
            }
        });

        container.appendChild(card);
    });

    const addCard = document.createElement('div');
    addCard.className = 'shortcut-card add-shortcut-card';
    addCard.id = 'addShortcutCard';
    addCard.innerHTML = `
        <div class="shortcut-icon-wrapper">
            <div class="shortcut-icon-fallback" style="background: transparent; color: var(--md-sys-color-primary);">
                <span class="material-symbols-rounded" style="font-size: 32px;">add</span>
            </div>
        </div>
        <div class="shortcut-title" style="color: var(--md-sys-color-primary);">${t.addShortcutBtn}</div>
    `;
    addCard.addEventListener('click', openAddShortcutModal);
    container.appendChild(addCard);
}

function saveShortcuts() {
    localStorage.setItem('startune_shortcuts', JSON.stringify(shortcuts));
}

renderShortcuts();

// --- Add/Edit Shortcut Modal Handlers ---
function openAddShortcutModal() {
    editingShortcutIndex = -1;
    const t = i18n[currentLang] || i18n.zh;
    document.getElementById('shortcutModalTitle').innerHTML = `
        <span class="material-symbols-rounded" style="color: var(--md-sys-color-primary);">add_link</span>
        <span>${t.addShortcutTitle}</span>
    `;
    document.getElementById('siteName').value = '';
    document.getElementById('siteUrl').value = '';
    openModal('shortcutModal');
}

function openEditShortcutModal(index) {
    editingShortcutIndex = index;
    const item = shortcuts[index];
    const t = i18n[currentLang] || i18n.zh;
    document.getElementById('shortcutModalTitle').innerHTML = `
        <span class="material-symbols-rounded" style="color: var(--md-sys-color-primary);">edit</span>
        <span>${t.editShortcutTitle}</span>
    `;
    document.getElementById('siteName').value = item.name;
    document.getElementById('siteUrl').value = item.url;
    openModal('shortcutModal');
}

document.getElementById('saveShortcutBtn').addEventListener('click', () => {
    const name = document.getElementById('siteName').value.trim();
    let url = document.getElementById('siteUrl').value.trim();
    const t = i18n[currentLang] || i18n.zh;

    if (!name || !url) {
        alert(t.alertFillFields);
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    if (editingShortcutIndex === -1) {
        shortcuts.push({ name, url, icon: 'public' });
    } else {
        shortcuts[editingShortcutIndex].name = name;
        shortcuts[editingShortcutIndex].url = url;
    }

    saveShortcuts();
    renderShortcuts();

    document.getElementById('siteName').value = '';
    document.getElementById('siteUrl').value = '';
    closeModal('shortcutModal');
});

document.getElementById('cancelShortcutBtn').addEventListener('click', () => {
    closeModal('shortcutModal');
});

// --- Search Engine Selector ---
const engineSelector = document.getElementById('engineSelector');
const engineMenu = document.getElementById('engineMenu');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

engineSelector.addEventListener('click', (e) => {
    e.stopPropagation();
    engineMenu.classList.toggle('active');
});

document.addEventListener('click', () => {
    engineMenu.classList.remove('active');
});

document.querySelectorAll('.engine-item').forEach(item => {
    item.addEventListener('click', () => {
        const engineKey = item.getAttribute('data-engine');
        setEngine(engineKey, true); // 搜索框旁边切换：临时修改，不写入 localStorage
        engineMenu.classList.remove('active');
    });
});

// --- Event Listeners for Theme & Engine & Colors & Targets & Language ---
document.querySelectorAll('.lang-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        applyLanguage(chip.getAttribute('data-lang-val'));
    });
});

document.querySelectorAll('.engine-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const engineKey = chip.getAttribute('data-engine-val');
        setEngine(engineKey, false); // 设置面板修改：默认修改，写入 localStorage
    });
});

document.querySelectorAll('.target-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const targetType = chip.getAttribute('data-target-type');
        const targetVal = chip.getAttribute('data-target-val');
        if (targetType === 'search') {
            applySearchTarget(targetVal);
        } else if (targetType === 'shortcut') {
            applyShortcutTarget(targetVal);
        }
    });
});

document.querySelectorAll('.theme-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        applyTheme(chip.getAttribute('data-theme-val'));
    });
});

document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        applyColor(dot.getAttribute('data-color-val'));
    });
});

const customColorPicker = document.getElementById('customColorPicker');
const hexInput = document.getElementById('hexInput');

customColorPicker.addEventListener('input', (e) => {
    applyColor(e.target.value);
});

hexInput.addEventListener('input', (e) => {
    let val = e.target.value.trim().replace(/^#/, '');
    if (val.length === 6 && /^[0-9A-Fa-f]{6}$/.test(val)) {
        applyColor('#' + val);
    }
});

// Settings Modal Handlers
document.getElementById('settingsBtn').addEventListener('click', () => openModal('settingsModal'));
document.getElementById('closeSettingsBtn').addEventListener('click', () => closeModal('settingsModal'));

// Initialize Language & Theme & Color Algorithm & Target & Engine
applyLanguage(currentLang);
applyTheme(currentTheme);
applyColor(currentSeedColor);
applySearchTarget(searchTarget);
applyShortcutTarget(shortcutTarget);
setEngine(defaultEngine, false);

// Modal Helpers
function openModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('active');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('active');
}

document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});