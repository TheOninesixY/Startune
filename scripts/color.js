// --- Accent Color State Management ---
let currentSeedColor = localStorage.getItem('startune_seed_color') || '#1a73e8';

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
    const theme = (typeof currentTheme !== 'undefined') ? currentTheme : (localStorage.getItem('startune_theme') || 'system');
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function generateMaterialTheme(seedHex) {
    const safeSeedHex = clampSeedColor(seedHex);
    const { h, s } = hexToHsl(safeSeedHex);
    const isDark = isDarkEffective();

    const softChroma = Math.min(s, 45);
    // Dynamic color saturation factor: Smoothly drops to 0 when low saturation or achromatic (black/white/gray) to avoid red tinting on Hue=0 (red)
    const chromaFactor = Math.min(s / 15, 1);
    let tokens = {};

    if (!isDark) {
        tokens = {
            '--md-sys-color-primary': safeSeedHex,
            '--md-sys-color-on-primary': '#ffffff',
            '--md-sys-color-primary-container': `hsl(${h}, ${Math.min(softChroma + 15 * chromaFactor, 60)}%, 93%)`,
            '--md-sys-color-on-primary-container': `hsl(${h}, ${softChroma + (50 - softChroma) * chromaFactor}%, 25%)`,

            '--md-sys-color-surface': `hsl(${h}, ${Math.min(softChroma, 15)}%, 97%)`,
            '--md-sys-color-surface-container-lowest': '#ffffff',
            '--md-sys-color-surface-container-low': `hsl(${h}, ${Math.min(softChroma, 18)}%, 95%)`,
            '--md-sys-color-surface-container': `hsl(${h}, ${Math.min(softChroma, 20)}%, 92%)`,
            '--md-sys-color-surface-container-high': `hsl(${h}, ${Math.min(softChroma, 22)}%, 89%)`,
            '--md-sys-color-surface-container-highest': `hsl(${h}, ${Math.min(softChroma, 25)}%, 86%)`,

            '--md-sys-color-on-surface': `hsl(${h}, ${10 * chromaFactor}%, 14%)`,
            '--md-sys-color-on-surface-variant': `hsl(${h}, ${12 * chromaFactor}%, 36%)`,
            '--md-sys-color-outline': `hsl(${h}, ${10 * chromaFactor}%, 55%)`,
            '--md-sys-color-outline-variant': `hsl(${h}, ${Math.min(softChroma, 22)}%, 88%)`
        };
    } else {
        tokens = {
            '--md-sys-color-primary': `hsl(${h}, ${Math.min(softChroma + 20 * chromaFactor, 85)}%, 80%)`,
            '--md-sys-color-on-primary': `hsl(${h}, ${softChroma + (60 - softChroma) * chromaFactor}%, 15%)`,
            '--md-sys-color-primary-container': `hsl(${h}, ${softChroma + (50 - softChroma) * chromaFactor}%, 26%)`,
            '--md-sys-color-on-primary-container': `hsl(${h}, ${Math.min(softChroma, 60)}%, 90%)`,

            '--md-sys-color-surface': `hsl(${h}, ${Math.min(softChroma, 15)}%, 9%)`,
            '--md-sys-color-surface-container-lowest': `hsl(${h}, ${Math.min(softChroma, 15)}%, 6%)`,
            '--md-sys-color-surface-container-low': `hsl(${h}, ${Math.min(softChroma, 15)}%, 11%)`,
            '--md-sys-color-surface-container': `hsl(${h}, ${Math.min(softChroma, 15)}%, 14%)`,
            '--md-sys-color-surface-container-high': `hsl(${h}, ${Math.min(softChroma, 15)}%, 18%)`,
            '--md-sys-color-surface-container-highest': `hsl(${h}, ${Math.min(softChroma, 15)}%, 22%)`,

            '--md-sys-color-on-surface': `hsl(${h}, ${10 * chromaFactor}%, 90%)`,
            '--md-sys-color-on-surface-variant': `hsl(${h}, ${12 * chromaFactor}%, 78%)`,
            '--md-sys-color-outline': `hsl(${h}, ${10 * chromaFactor}%, 55%)`,
            '--md-sys-color-outline-variant': `hsl(${h}, ${Math.min(softChroma, 18)}%, 24%)`
        };
    }

    const root = document.documentElement;
    Object.keys(tokens).forEach(key => {
        root.style.setProperty(key, tokens[key]);
    });
}

function applyColor(seedHex, updateHexInput = true, updatePickerUI = true) {
    currentSeedColor = seedHex;
    localStorage.setItem('startune_seed_color', seedHex);

    if (updateHexInput) {
        const hexInput = document.getElementById('hexInput');
        if (hexInput) {
            hexInput.value = seedHex.replace('#', '').toUpperCase();
        }
    }

    const isPreset = Array.from(document.querySelectorAll('.color-dot')).some(dot => {
        const val = dot.getAttribute('data-color-val').toLowerCase();
        const active = val === seedHex.toLowerCase();
        dot.classList.toggle('active', active);
        return active;
    });

    const customBtn = document.getElementById('customColorBtn');
    if (customBtn) {
        customBtn.classList.toggle('active', !isPreset);
    }

    if (updatePickerUI) {
        syncCustomPickerUI(seedHex);
    }

    generateMaterialTheme(seedHex);
}

// Custom HSV Color Picker Logic
let pickerHue = 0; // 0~360
let pickerSat = 1; // 0~1
let pickerVal = 1; // 0~1

function hexToHsv(hex) {
    hex = (hex || '').replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
        return { h: 0, s: 0, v: 1 };
    }

    let r = parseInt(hex.slice(0, 2), 16) / 255;
    let g = parseInt(hex.slice(2, 4), 16) / 255;
    let b = parseInt(hex.slice(4, 6), 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s, v };
}

function hsvToHex(h, s, v) {
    let r, g, b;
    let i = Math.floor((h / 60) % 6);
    let f = (h / 60) - Math.floor(h / 60);
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    switch (i) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }

    const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function syncCustomPickerUI(hex) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;
    const hsv = hexToHsv(hex);
    pickerHue = hsv.h;
    pickerSat = hsv.s;
    pickerVal = hsv.v;

    const satValBox = document.getElementById('satValBox');
    const satValHandle = document.getElementById('satValHandle');
    const hueSliderBox = document.getElementById('hueSliderBox');
    const hueHandle = document.getElementById('hueHandle');

    if (satValBox && satValHandle && hueSliderBox && hueHandle) {
        satValBox.style.backgroundColor = `hsl(${pickerHue}, 100%, 50%)`;
        satValHandle.style.left = `${pickerSat * 100}%`;
        satValHandle.style.top = `${(1 - pickerVal) * 100}%`;
        hueHandle.style.left = `${(pickerHue / 360) * 100}%`;
    }
}

function handleSatValMove(e) {
    const satValBox = document.getElementById('satValBox');
    if (!satValBox) return;
    const rect = satValBox.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, (e.touches ? e.touches[0].clientX : e.clientX) - rect.left));
    const y = Math.max(0, Math.min(rect.height, (e.touches ? e.touches[0].clientY : e.clientY) - rect.top));

    pickerSat = x / rect.width;
    pickerVal = 1 - (y / rect.height);

    const newHex = hsvToHex(pickerHue, pickerSat, pickerVal);
    applyColor(newHex, true, false);

    const handle = document.getElementById('satValHandle');
    if (handle) {
        handle.style.left = `${x}px`;
        handle.style.top = `${y}px`;
    }
}

function handleHueMove(e) {
    const hueSliderBox = document.getElementById('hueSliderBox');
    if (!hueSliderBox) return;
    const rect = hueSliderBox.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, (e.touches ? e.touches[0].clientX : e.clientX) - rect.left));

    pickerHue = (x / rect.width) * 360;
    if (pickerHue >= 360) pickerHue = 359.9;

    const satValBox = document.getElementById('satValBox');
    if (satValBox) {
        satValBox.style.backgroundColor = `hsl(${pickerHue}, 100%, 50%)`;
    }

    const newHex = hsvToHex(pickerHue, pickerSat, pickerVal);
    applyColor(newHex, true, false);

    const handle = document.getElementById('hueHandle');
    if (handle) {
        handle.style.left = `${x}px`;
    }
}

function initColorListeners() {
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            applyColor(dot.getAttribute('data-color-val'));
        });
    });

    const customColorBtn = document.getElementById('customColorBtn');
    const colorPickerPopover = document.getElementById('colorPickerPopover');
    const satValBox = document.getElementById('satValBox');
    const hueSliderBox = document.getElementById('hueSliderBox');

    if (customColorBtn && colorPickerPopover) {
        function openColorPicker() {
            colorPickerPopover.classList.remove('closing');
            colorPickerPopover.style.display = 'flex';
            void colorPickerPopover.offsetHeight;
            colorPickerPopover.classList.add('active');
            syncCustomPickerUI(currentSeedColor);
        }

        function closeColorPicker() {
            if (!colorPickerPopover.classList.contains('active')) return;
            colorPickerPopover.classList.remove('active');
            colorPickerPopover.classList.add('closing');
            const onTransitionEnd = (e) => {
                if (e.target === colorPickerPopover) {
                    colorPickerPopover.classList.remove('closing');
                    colorPickerPopover.style.display = 'none';
                    colorPickerPopover.removeEventListener('transitionend', onTransitionEnd);
                }
            };
            colorPickerPopover.addEventListener('transitionend', onTransitionEnd);
            setTimeout(() => {
                if (colorPickerPopover.classList.contains('closing')) {
                    colorPickerPopover.classList.remove('closing');
                    colorPickerPopover.style.display = 'none';
                }
            }, 260);
        }

        // 挂载全局方法方便 Esc 或外部安全关闭
        window.closeColorPicker = closeColorPicker;

        customColorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (colorPickerPopover.classList.contains('active')) {
                closeColorPicker();
            } else {
                openColorPicker();
            }
        });

        document.addEventListener('click', (e) => {
            if (!colorPickerPopover.contains(e.target) && !customColorBtn.contains(e.target)) {
                closeColorPicker();
            }
        });
    }

    let isDraggingSatVal = false;
    let isDraggingHue = false;

    if (satValBox && hueSliderBox) {
        satValBox.addEventListener('pointerdown', (e) => {
            isDraggingSatVal = true;
            satValBox.setPointerCapture(e.pointerId);
            handleSatValMove(e);
        });

        satValBox.addEventListener('pointermove', (e) => {
            if (isDraggingSatVal) handleSatValMove(e);
        });

        satValBox.addEventListener('pointerup', (e) => {
            isDraggingSatVal = false;
            try { satValBox.releasePointerCapture(e.pointerId); } catch(err) {}
        });

        hueSliderBox.addEventListener('pointerdown', (e) => {
            isDraggingHue = true;
            hueSliderBox.setPointerCapture(e.pointerId);
            handleHueMove(e);
        });

        hueSliderBox.addEventListener('pointermove', (e) => {
            if (isDraggingHue) handleHueMove(e);
        });

        hueSliderBox.addEventListener('pointerup', (e) => {
            isDraggingHue = false;
            try { hueSliderBox.releasePointerCapture(e.pointerId); } catch(err) {}
        });
    }

    const hexInput = document.getElementById('hexInput');
    if (hexInput) {
        hexInput.addEventListener('input', (e) => {
            let rawVal = e.target.value.trim();
            let val = rawVal.replace(/^#/, '');

            let fullHex = '';
            if (/^[0-9A-Fa-f]{3}$/.test(val)) {
                fullHex = val.split('').map(c => c + c).join('');
            } else if (/^[0-9A-Fa-f]{6}$/.test(val)) {
                fullHex = val;
            }

            if (fullHex) {
                applyColor('#' + fullHex, false);
            }
        });

        hexInput.addEventListener('blur', () => {
            hexInput.value = currentSeedColor.replace('#', '').toUpperCase();
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initColorListeners);
} else {
    initColorListeners();
}
