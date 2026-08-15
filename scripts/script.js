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

// --- Safe localStorage Reader ---
function loadSafeShortcuts() {
    try {
        const raw = localStorage.getItem('startune_shortcuts');
        if (!raw) return defaultShortcuts;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(item => ({
                name: String(item.name || '').trim(),
                url: String(item.url || '').trim(),
                icon: String(item.icon || 'public')
            })).filter(item => item.name && item.url);
        }
        return defaultShortcuts;
    } catch (e) {
        return defaultShortcuts;
    }
}

// --- URL / Search Query Helper ---
function isLikelyUrl(input) {
    const trimmed = input.trim();
    if (/^https?:\/\//i.test(trimmed)) return true;
    // 类似 domain.com、sub.domain.org/path 或带端口的 localhost:3000
    if (/^[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)+(:\d+)?(\/.*)?$/i.test(trimmed)) return true;
    if (/^localhost(:\d+)?(\/.*)?$/i.test(trimmed)) return true;
    return false;
}

function getSafeHostname(urlStr) {
    try {
        const u = new URL(urlStr.startsWith('http://') || urlStr.startsWith('https://') ? urlStr : `https://${urlStr}`);
        return u.hostname;
    } catch (e) {
        return urlStr.replace(/^https?:\/\//i, '').split('/')[0] || 'localhost';
    }
}

// --- State Management ---
let shortcuts = loadSafeShortcuts();
let currentLang = localStorage.getItem('startune_lang') || 'zh';
let currentTheme = localStorage.getItem('startune_theme') || 'system';
let defaultEngine = localStorage.getItem('startune_default_engine') || 'google';
let currentEngine = defaultEngine;
let searchTarget = localStorage.getItem('startune_search_target') || '_blank';
let shortcutTarget = localStorage.getItem('startune_shortcut_target') || '_blank';
let showGreeting = localStorage.getItem('startune_show_greeting') !== 'false'; // Default to true (show)
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
        if (t[key]) {
            elem.title = t[key];
            if (elem.hasAttribute('aria-label')) {
                elem.setAttribute('aria-label', t[key]);
            }
        }
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

function applyGreeting(visible) {
    showGreeting = visible;
    localStorage.setItem('startune_show_greeting', visible ? 'true' : 'false');

    const greetingBadge = document.querySelector('.greeting-badge');
    if (greetingBadge) {
        greetingBadge.style.display = visible ? 'inline-flex' : 'none';
    }

    const greetingToggle = document.getElementById('greetingToggle');
    if (greetingToggle) {
        greetingToggle.checked = visible;
    }
}

function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('startune_theme', theme);

    document.querySelectorAll('.theme-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-theme-val') === theme);
    });

    if (typeof generateMaterialTheme === 'function') {
        generateMaterialTheme(currentSeedColor);
    }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system' && typeof generateMaterialTheme === 'function') {
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
    contextMenu.classList.remove('closing');
    contextMenu.style.display = 'flex';
    void contextMenu.offsetHeight;
    contextMenu.classList.add('active');
}

function hideContextMenu() {
    if (!contextMenu || !contextMenu.classList.contains('active')) return;
    contextMenu.classList.remove('active');
    contextMenu.classList.add('closing');
    const onEnd = (e) => {
        if (e.target === contextMenu) {
            contextMenu.classList.remove('closing');
            contextMenu.style.display = 'none';
            contextMenu.removeEventListener('transitionend', onEnd);
        }
    };
    contextMenu.addEventListener('transitionend', onEnd);
    setTimeout(() => {
        if (contextMenu.classList.contains('closing')) {
            contextMenu.classList.remove('closing');
            contextMenu.style.display = 'none';
        }
    }, 200);
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

// --- Render Shortcuts with Drag and Drop & Touch Handling ---
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

        const hostname = getSafeHostname(item.url);
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;

        // 采用安全的 DOM 构造方式，防御 XSS
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'shortcut-icon-wrapper';

        const img = document.createElement('img');
        img.src = faviconUrl;
        img.alt = item.name;

        const fallback = document.createElement('div');
        fallback.className = 'shortcut-icon-fallback';
        fallback.style.display = 'none';

        const iconSpan = document.createElement('span');
        iconSpan.className = 'material-symbols-rounded';
        iconSpan.textContent = item.icon || 'public';
        fallback.appendChild(iconSpan);

        img.onerror = () => {
            img.style.display = 'none';
            fallback.style.display = 'flex';
        };

        iconWrapper.appendChild(img);
        iconWrapper.appendChild(fallback);

        const titleDiv = document.createElement('div');
        titleDiv.className = 'shortcut-title';
        titleDiv.textContent = item.name;

        card.appendChild(iconWrapper);
        card.appendChild(titleDiv);

        // HTML5 Drag & Drop Handlers
        card.addEventListener('dragstart', (e) => {
            draggedIndex = index;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(index));
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            draggedIndex = null;
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

        const cleanupTouchDrag = () => {
            clearTimeout(pressTimer);
            if (touchDragClone && touchDragClone.parentNode) {
                touchDragClone.parentNode.removeChild(touchDragClone);
            }
            touchDragClone = null;
            draggedIndex = null;
            isTouchDragging = false;
            document.querySelectorAll('.shortcut-card').forEach(c => {
                c.classList.remove('dragging');
                c.classList.remove('drag-over');
            });
        };

        card.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;

            pressTimer = setTimeout(() => {
                showContextMenu(e, index);
            }, 500);
        }, { passive: true });

        card.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const moveX = Math.abs(touch.clientX - touchStartX);
            const moveY = Math.abs(touch.clientY - touchStartY);

            if (moveX > 8 || moveY > 8) {
                clearTimeout(pressTimer);

                if (!isTouchDragging) {
                    isTouchDragging = true;
                    draggedIndex = index;

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

                cleanupTouchDrag();
                renderShortcuts();
            }
        });

        card.addEventListener('touchcancel', cleanupTouchDrag);

        container.appendChild(card);
    });

    const addCard = document.createElement('div');
    addCard.className = 'shortcut-card add-shortcut-card';
    addCard.id = 'addShortcutCard';
    addCard.setAttribute('role', 'button');
    addCard.setAttribute('tabindex', '0');
    addCard.innerHTML = `
        <div class="shortcut-icon-wrapper">
            <div class="shortcut-icon-fallback" style="background: transparent; color: var(--md-sys-color-primary);">
                <span class="material-symbols-rounded" style="font-size: 32px;" aria-hidden="true">add</span>
            </div>
        </div>
        <div class="shortcut-title" style="color: var(--md-sys-color-primary);">${t.addShortcutBtn}</div>
    `;
    addCard.addEventListener('click', openAddShortcutModal);
    addCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openAddShortcutModal();
        }
    });
    container.appendChild(addCard);
}

function saveShortcuts() {
    localStorage.setItem('startune_shortcuts', JSON.stringify(shortcuts));
}

renderShortcuts();

// --- Copy Link & Toast Notification ---
const copyLinkBtn = document.getElementById('copyLinkBtn');
const toast = document.getElementById('toast');
let toastTimer = null;

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
        const textToCopy = 'stune.onsy.qzz.io';
        const t = i18n[currentLang] || i18n.zh;
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast(t.toastCopied || '已复制');
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast(t.toastCopied || '已复制');
        });
    });
}

// --- Add/Edit Shortcut Modal Handlers ---
function openAddShortcutModal() {
    editingShortcutIndex = -1;
    const t = i18n[currentLang] || i18n.zh;
    document.getElementById('shortcutModalTitle').innerHTML = `
        <span class="material-symbols-rounded" style="color: var(--md-sys-color-primary);" aria-hidden="true">add_link</span>
        <span id="shortcutModalTitleText">${t.addShortcutTitle}</span>
    `;
    document.getElementById('siteName').value = '';
    document.getElementById('siteUrl').value = '';
    openModal('shortcutModal');
    setTimeout(() => {
        const nameInput = document.getElementById('siteName');
        if (nameInput) nameInput.focus();
    }, 50);
}

function openEditShortcutModal(index) {
    editingShortcutIndex = index;
    const item = shortcuts[index];
    const t = i18n[currentLang] || i18n.zh;
    document.getElementById('shortcutModalTitle').innerHTML = `
        <span class="material-symbols-rounded" style="color: var(--md-sys-color-primary);" aria-hidden="true">edit</span>
        <span id="shortcutModalTitleText">${t.editShortcutTitle}</span>
    `;
    document.getElementById('siteName').value = item.name;
    document.getElementById('siteUrl').value = item.url;
    openModal('shortcutModal');
    setTimeout(() => {
        const nameInput = document.getElementById('siteName');
        if (nameInput) nameInput.focus();
    }, 50);
}

document.getElementById('saveShortcutBtn').addEventListener('click', () => {
    const name = document.getElementById('siteName').value.trim();
    let url = document.getElementById('siteUrl').value.trim();
    const t = i18n[currentLang] || i18n.zh;

    if (!name || !url) {
        alert(t.alertFillFields);
        return;
    }

    // 协议安全性补全与校验
    if (!/^https?:\/\//i.test(url)) {
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

// --- Search Engine Selector & Search Submission ---
const engineSelector = document.getElementById('engineSelector');
const engineMenu = document.getElementById('engineMenu');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

function openEngineMenu() {
    engineMenu.classList.remove('closing');
    engineMenu.style.display = 'flex';
    void engineMenu.offsetHeight;
    engineMenu.classList.add('active');
}

function closeEngineMenu() {
    if (!engineMenu || !engineMenu.classList.contains('active')) return;
    engineMenu.classList.remove('active');
    engineMenu.classList.add('closing');
    const onEnd = (e) => {
        if (e.target === engineMenu) {
            engineMenu.classList.remove('closing');
            engineMenu.style.display = 'none';
            engineMenu.removeEventListener('transitionend', onEnd);
        }
    };
    engineMenu.addEventListener('transitionend', onEnd);
    setTimeout(() => {
        if (engineMenu.classList.contains('closing')) {
            engineMenu.classList.remove('closing');
            engineMenu.style.display = 'none';
        }
    }, 220);
}

// 支持直接在搜索框中输入网址并跳转
searchForm.addEventListener('submit', (e) => {
    const query = searchInput.value.trim();
    if (!query) {
        e.preventDefault();
        return;
    }

    if (isLikelyUrl(query)) {
        e.preventDefault();
        const targetUrl = /^https?:\/\//i.test(query) ? query : `https://${query}`;
        if (searchTarget === '_blank') {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
        } else {
            window.location.href = targetUrl;
        }
    }
});

engineSelector.addEventListener('click', (e) => {
    e.stopPropagation();
    if (engineMenu.classList.contains('active')) {
        closeEngineMenu();
    } else {
        openEngineMenu();
    }
});

document.addEventListener('click', () => {
    closeEngineMenu();
});

document.querySelectorAll('.engine-item').forEach(item => {
    item.addEventListener('click', () => {
        const engineKey = item.getAttribute('data-engine');
        setEngine(engineKey, true); // Search bar side switch: temporary change, do not write to localStorage
        closeEngineMenu();
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
        setEngine(engineKey, false); // Settings panel change: default engine change, write to localStorage
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

const greetingToggle = document.getElementById('greetingToggle');
if (greetingToggle) {
    greetingToggle.addEventListener('change', (e) => {
        applyGreeting(e.target.checked);
    });
}

document.querySelectorAll('.theme-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        applyTheme(chip.getAttribute('data-theme-val'));
    });
});

// Settings Modal Handlers
document.getElementById('settingsBtn').addEventListener('click', () => openModal('settingsModal'));
document.getElementById('closeSettingsBtn').addEventListener('click', () => closeModal('settingsModal'));

// Initialize Language & Theme & Color Algorithm & Target & Engine & Greeting
applyLanguage(currentLang);
applyTheme(currentTheme);
if (typeof applyColor === 'function') {
    applyColor(currentSeedColor);
}
applySearchTarget(searchTarget);
applyShortcutTarget(shortcutTarget);
applyGreeting(showGreeting);
setEngine(defaultEngine, false);

// Modal Helpers (支持平滑滑入滑出与背景淡入淡出动画)
function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('closing');
    modal.style.display = 'flex';
    // 强制触发回流以确保 transition 动画平滑播放
    void modal.offsetHeight;
    modal.classList.add('active');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal || !modal.classList.contains('active')) return;
    modal.classList.remove('active');
    modal.classList.add('closing');

    const onTransitionEnd = (e) => {
        if (e.target === modal) {
            modal.classList.remove('closing');
            modal.style.display = 'none';
            modal.removeEventListener('transitionend', onTransitionEnd);
        }
    };
    modal.addEventListener('transitionend', onTransitionEnd);
    // 安全兜底定时器，防止某些异常情况下 transitionend 未触发
    setTimeout(() => {
        if (modal.classList.contains('closing')) {
            modal.classList.remove('closing');
            modal.style.display = 'none';
        }
    }, 400);
}

document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});

// 全局 Esc 键快速关闭弹窗与下拉菜单，以及全局按键自动聚焦搜索框
document.addEventListener('keydown', (e) => {
    // 1. Esc 快捷关闭
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
        closeEngineMenu();
        hideContextMenu();
        if (typeof window.closeColorPicker === 'function') {
            window.closeColorPicker();
        }
        return;
    }

    // 2. 如果存在激活的弹窗，不拦截按键
    const hasActiveModal = document.querySelector('.modal-overlay.active');
    if (hasActiveModal) return;

    // 3. 忽略特殊修饰组合键 (如 Ctrl+C, Alt+Tab, Cmd+R, F1~F12 等)
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key === 'Tab' || e.key === 'Enter' || e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'CapsLock') return;
    if (/^F\d{1,2}$/.test(e.key)) return;

    // 4. 判断当前焦点是否已经在输入控件或可编辑元素上
    const activeEl = document.activeElement;
    const isEditing = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable
    );

    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    // 5. 若未聚焦在搜索框上，自动聚焦并输入文本
    if (activeEl !== searchInput) {
        if (!isEditing) {
            searchInput.focus();
            // 单字符直接输入（支持中英文、数字、符号、空格等可打印字符），非单字符（如 Backspace/Delete 等）由 focus 后的浏览器行为自然接管
            if (e.key.length === 1) {
                e.preventDefault();
                searchInput.value += e.key;
                // 触发 input 事件以保证可能存在的监听器正常响应
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }
});