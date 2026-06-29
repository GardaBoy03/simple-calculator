// ============================================================
//  i18n: Terjemahan Bahasa Indonesia & English
// ============================================================
const LANG_STORAGE_KEY = 'wa_kalkulator_lang';

function getLang() {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return (saved === 'en' || saved === 'id') ? saved : 'en';
}

const I18N = {
    id: {
        langName: 'Indonesia',
        title: 'Kalkulator Pintar',
        online: 'Online',
        tabStandar: '🔢 Standar',
        hintKeys: 'Tekan <b>Enter</b> untuk hitung • <b>Esc</b> untuk reset',
        hintCalc: '💡 Hitung bebas seperti kalkulator pada umumnya — angka, operator, dan tekan = kapan saja',
        rightClickBlocked: '❌ Right-click tidak diizinkan di halaman ini!',
        devToolsBlocked: '⚠️ Developer Tools tidak dapat diakses!',
        devToolsDetectedTitle: '⚠️ Akses Developer Tools Terdeteksi!',
        devToolsDetectedBody: 'Halaman telah diblokir untuk keamanan.',
    },
    en: {
        langName: 'English',
        title: 'Smart Calculator',
        online: 'Online',
        tabStandar: '🔢 Standard',
        hintKeys: 'Press <b>Enter</b> to calculate • <b>Esc</b> to reset',
        hintCalc: '💡 Calculate freely like a regular calculator — numbers, operators, press = anytime',
        rightClickBlocked: '❌ Right-click is not allowed on this page!',
        devToolsBlocked: '⚠️ Developer Tools cannot be accessed!',
        devToolsDetectedTitle: '⚠️ Developer Tools Access Detected!',
        devToolsDetectedBody: 'The page has been blocked for security.',
    },
};

// ============================================================
//  Proteksi: Disable Right-Click & Developer Tools
// ============================================================
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    alert(I18N[getLang()].rightClickBlocked);
    return false;
});

// Disable F12
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.shiftKey && e.key === 'K')) {
        e.preventDefault();
        alert(I18N[getLang()].devToolsBlocked);
        return false;
    }
});

// Detect Developer Tools opened (via setTimeout)
let devtools = { open: false };
let lastCheck = Date.now();

setInterval(() => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    
    if ((widthThreshold || heightThreshold) && !devtools.open) {
        devtools.open = true;
        const t = I18N[getLang()];
        document.body.innerHTML = `<h1 style="text-align:center; margin-top:50px; color:#d9534f;">${t.devToolsDetectedTitle}</h1><p style="text-align:center; font-size:18px;">${t.devToolsDetectedBody}</p>`;
    }
}, 500);

// ============================================================
//  Kalkulator WhatsApp — apps.js  v8 (Operasi Berantai)
// ============================================================

// ─── Format Angka ────────────────────────────────────────────
function formatRibuan(nilai) {
    if (nilai === '' || nilai === null || nilai === undefined) return '';
    if (typeof nilai === 'string' && isNaN(Number(nilai))) return nilai;
    
    // Handle nilai negatif
    let isNegative = false;
    let numStr = nilai.toString();
    if (numStr.startsWith('-')) {
        isNegative = true;
        numStr = numStr.substring(1);
    }
    
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    let result = parts.join(',');
    
    // Tambahkan minus kembali jika ada
    if (isNegative) {
        result = '-' + result;
    }
    
    return result;
}

function formatDesimal(nilai, angka = 6) {
    if (typeof nilai !== 'number') return nilai;
    // Buang trailing zero
    return parseFloat(nilai.toFixed(angka)).toString().replace('.', ',');
}

// ─── Sound Manager ─────────────────────────────────────────
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.loadSounds();
    }

    loadSounds() {
        const soundPath = 'assets/sound/';
        const soundNames = ['click'];
        
        soundNames.forEach(name => {
            const audio = new Audio();
            audio.src = soundPath + name + '.mp3';
            audio.preload = 'auto';
            audio.onerror = () => {
                audio.src = soundPath + name + '.wav';
            };
            this.sounds[name] = audio;
        });
    }

    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        try {
            const audio = this.sounds[soundName];
            audio.currentTime = 0;
            audio.play().catch(err => {
                console.debug('Audio play failed:', err);
            });
        } catch (err) {
            console.debug('Sound error:', err);
        }
    }

    toggle() {
        this.enabled = !this.enabled;
    }
}

const soundManager = new SoundManager();

// ============================================================
//  Vue Instance
// ============================================================
window.vueApp = new Vue({
    el: '#app',
    data: {
        // ── Bahasa ──
        lang: getLang(),

        // ── Standar (Kalkulator) ──
        standar: {
            // Kalkulator
            display: '0',
            stored: null,
            operator: null,
            overwrite: true,
            exprText: '',
            exprFull: '',  // Menyimpan ekspresi lengkap berantai
            nextInputResetExpr: false,
        },
    },

    mounted() {
        document.documentElement.lang = this.lang;
    },

    computed: {
        t() {
            return I18N[this.lang];
        },

        standarDisplayFormatted() {
            const d = this.standar.display;
            if (d === 'Error') return d;
            return formatRibuan(d);
        },
    },

    methods: {
        // ── Sound Effects ─────────────────────────────────────
        playSound(soundName) {
            soundManager.play(soundName);
        },

        // ── Ganti Bahasa ──────────────────────────────────────
        gantiBahasa(newLang) {
            if (newLang !== 'id' && newLang !== 'en') return;
            this.lang = newLang;
            localStorage.setItem(LANG_STORAGE_KEY, newLang);
            document.documentElement.lang = newLang;
        },

        // ════════════════════════════════════════════════════════
        // MODE: STANDAR - KALKULATOR
        // ════════════════════════════════════════════════════════
        stdDigit(d) {
            // Reset exprText dan exprFull jika ini input setelah equals
            if (this.standar.nextInputResetExpr) {
                this.standar.exprText = '';
                this.standar.exprFull = '';
                this.standar.nextInputResetExpr = false;
            }
            
            if (this.standar.overwrite) {
                this.standar.display = d;
                this.standar.overwrite = false;
            } else {
                if (this.standar.display === '0') {
                    this.standar.display = d;
                } else {
                    if (this.standar.display.length < 16) {
                        this.standar.display += d;
                    }
                }
            }
        },

        stdDecimal() {
            if (this.standar.overwrite) {
                this.standar.display = '0,';
                this.standar.overwrite = false;
            } else if (!this.standar.display.includes(',')) {
                this.standar.display += ',';
            }
        },

        stdBackspace() {
            if (this.standar.display.length === 1) {
                this.standar.display = '0';
                this.standar.overwrite = true;
            } else {
                this.standar.display = this.standar.display.slice(0, -1);
            }
        },

        stdClear() {
            this.standar.display = '0';
            this.standar.stored = null;
            this.standar.operator = null;
            this.standar.overwrite = true;
            this.standar.exprText = '';
            this.standar.exprFull = '';
        },

        stdToggleSign() {
            let num = parseFloat(this.standar.display.replace(',', '.'));
            num = -num;
            this.standar.display = num.toString();
            this.standar.overwrite = true;
        },

        stdOperator(op) {
            let current = parseFloat(this.standar.display.replace(',', '.'));
            const opSymbol = op === '/' ? '÷' : op === '*' ? '×' : op === '-' ? '−' : '+';
            
            // Jika ada operator sebelumnya, hitung dulu (untuk operasi berantai)
            if (this.standar.operator !== null && !this.standar.overwrite) {
                const prevResult = this.stdCalcInternal();
                const prevOpSymbol = this.standar.operator === '/' ? '÷' : this.standar.operator === '*' ? '×' : this.standar.operator === '-' ? '−' : '+';
                
                // Build ekspresi lengkap: "2 + 2"
                if (this.standar.exprFull === '') {
                    // Operasi pertama
                    this.standar.exprFull = formatRibuan(this.standar.stored.toString()) + ' ' + prevOpSymbol + ' ' + formatRibuan(current.toString());
                } else {
                    // Operasi selanjutnya (berantai)
                    this.standar.exprFull += ' ' + prevOpSymbol + ' ' + formatRibuan(current.toString());
                }
                
                current = prevResult;
                this.standar.display = current.toString();
            } else if (this.standar.exprFull === '' && this.standar.operator === null) {
                // Operator pertama kali ditekan
                this.standar.exprFull = formatRibuan(current.toString());
            }
            
            this.standar.stored = current;
            this.standar.operator = op;
            this.standar.overwrite = true;
            
            // Display untuk dilihat saat input angka berikutnya
            this.standar.exprText = this.standar.exprFull + ' ' + opSymbol;
        },

        stdPercent() {
            let current = parseFloat(this.standar.display.replace(',', '.'));
            if (this.standar.stored !== null && this.standar.operator !== null) {
                // Ada operator aktif (mis. 15.000 + 10%): ubah jadi nilai persen dari stored,
                // dan biarkan overwrite = false agar tombol "=" bisa langsung menghitung hasilnya.
                current = (this.standar.stored * current) / 100;
                this.standar.overwrite = false;
            } else {
                // Persen berdiri sendiri (mis. 50% -> 0,5): tetap overwrite = true.
                current = current / 100;
                this.standar.overwrite = true;
            }
            this.standar.display = current.toString();
        },

        stdCalcInternal() {
            let result = this.standar.stored;
            let current = parseFloat(this.standar.display.replace(',', '.'));
            
            if (this.standar.operator === '+') result += current;
            else if (this.standar.operator === '-') result -= current;
            else if (this.standar.operator === '*') result *= current;
            else if (this.standar.operator === '/') {
                if (current === 0) return 'Error';
                result /= current;
            }
            return result;
        },

        stdEquals() {
            if (this.standar.operator === null || this.standar.overwrite) return;
            
            let result = this.stdCalcInternal();
            
            if (result === 'Error') {
                this.standar.display = 'Error';
                this.standar.exprText = '';
            } else {
                const operand2 = this.standar.display;
                const resultStr = result.toString();
                this.standar.display = resultStr;
                
                // Format pesan untuk operasi berantai
                const opSymbol = this.standar.operator === '/' ? '÷' : this.standar.operator === '*' ? '×' : this.standar.operator === '-' ? '−' : '+';
                
                // Jika ada ekspresi berantai (exprFull), gunakan itu
                let fullExpr;
                if (this.standar.exprFull !== '') {
                    // Operasi berantai: "2 + 2 + 2 = 6"
                    fullExpr = this.standar.exprFull + ' ' + opSymbol + ' ' + formatRibuan(operand2) + ' = ' + formatRibuan(resultStr);
                } else {
                    // Operasi sederhana: "10 + 2 = 12"
                    fullExpr = formatRibuan(this.standar.stored.toString()) + ' ' + opSymbol + ' ' + formatRibuan(operand2) + ' = ' + formatRibuan(resultStr);
                }
                
                // Tampilkan format lengkap di exprText (di std-ekspresi)
                this.standar.exprText = fullExpr;
                
                // Mark untuk reset exprText pada input selanjutnya
                this.standar.nextInputResetExpr = true;
            }
            
            this.standar.stored = null;
            this.standar.operator = null;
            this.standar.overwrite = true;
            this.standar.exprFull = '';  // Reset ekspresi
        },

        stdKeydown(event) {
            const k = event.key;
            if (/^\d$/.test(k)) { this.stdDigit(k); }
            else if (k === ',' || k === '.') { this.stdDecimal(); }
            else if (k === '+' || k === '-' || k === '*' || k === '/') {
                event.preventDefault();
                this.stdOperator(k === '/' ? '/' : k === '*' ? '*' : k === '-' ? '-' : '+');
            }
            else if (k === 'Enter') { event.preventDefault(); this.stdEquals(); }
            else if (k === 'Escape') { this.stdClear(); }
            else if (k === 'Backspace') { this.stdBackspace(); }
            else if (k === '%') { this.stdPercent(); }
        },
    }
});
