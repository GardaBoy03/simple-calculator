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
        tabDiskon: '🏷️ Diskon',
        hintKeys: 'Tekan <b>Enter</b> untuk hitung • <b>Esc</b> untuk reset',
        hintCalc: '💡 Hitung bebas seperti kalkulator pada umumnya — angka, operator, dan tekan = kapan saja',
        hintDiskon: '💡 Isi harga awal & persen diskon. Diskon 2 opsional untuk diskon bertingkat (mis. 20%+10%)',
        diskonHargaAwal: 'Harga Awal (Rp)',
        diskonPlaceholderHarga: 'Contoh: 150.000',
        diskonPersen1: 'Diskon 1 (%)',
        diskonPersen2: 'Diskon 2 (%)',
        diskonOpsional: 'opsional',
        diskonPlaceholderPersen: 'Contoh: 20',
        diskonHitungBtn: 'Hitung',
        diskonResetBtn: 'Reset',
        diskonErrorHarga: '⚠️ Masukkan harga awal terlebih dahulu!',
        diskonHasilLabel: '🏷️ Hasil Diskon',
        diskonHargaAwalLabel: 'Harga Awal',
        diskonTotalPotongan: 'Total Potongan',
        diskonHargaAkhir: 'Harga Akhir',
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
        tabDiskon: '🏷️ Discount',
        hintKeys: 'Press <b>Enter</b> to calculate • <b>Esc</b> to reset',
        hintCalc: '💡 Calculate freely like a regular calculator — numbers, operators, press = anytime',
        hintDiskon: '💡 Enter the original price & discount percentage. Discount 2 is optional for stacked discounts (e.g. 20%+10%)',
        diskonHargaAwal: 'Original Price (Rp)',
        diskonPlaceholderHarga: 'e.g. 150,000',
        diskonPersen1: 'Discount 1 (%)',
        diskonPersen2: 'Discount 2 (%)',
        diskonOpsional: 'optional',
        diskonPlaceholderPersen: 'e.g. 20',
        diskonHitungBtn: 'Calculate',
        diskonResetBtn: 'Reset',
        diskonErrorHarga: '⚠️ Please enter the original price first!',
        diskonHasilLabel: '🏷️ Discount Result',
        diskonHargaAwalLabel: 'Original Price',
        diskonTotalPotongan: 'Total Discount',
        diskonHargaAkhir: 'Final Price',
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

        // ── Tab Aktif ──
        activeTab: 'standar', // 'standar' | 'diskon'

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

        // ── Diskon (Kalkulator Diskon) ──
        diskon: {
            hargaDisplay: '',   // Nilai harga yang tampil di input (sudah diformat ribuan)
            hargaRaw: '',       // Nilai harga mentah (hanya digit)
            persen1: '',
            persen2: '',
            error: '',
            hasil: null,        // { hargaAwal, totalPotongan, persenEfektif, hargaAkhir }
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

        // ── Ganti Tab ─────────────────────────────────────────
        gantiTab(tab) {
            if (tab !== 'standar' && tab !== 'diskon') return;
            this.activeTab = tab;
        },

        // ── Helper Format ─────────────────────────────────────
        formatRupiah(nilai) {
            if (nilai === null || nilai === undefined || isNaN(nilai)) return '0';
            const rounded = Math.round(nilai);
            return formatRibuan(rounded.toString());
        },

        formatPersenHasil(nilai) {
            if (nilai === null || nilai === undefined || isNaN(nilai)) return '0';
            return formatDesimal(nilai, 2);
        },

        // ════════════════════════════════════════════════════════
        // MODE: DISKON - KALKULATOR DISKON
        // ════════════════════════════════════════════════════════
        diskonHargaInput(event) {
            // Hanya izinkan digit, format otomatis dengan pemisah ribuan
            const raw = event.target.value.replace(/[^\d]/g, '');
            this.diskon.hargaRaw = raw;
            this.diskon.hargaDisplay = raw ? formatRibuan(raw) : '';
            this.diskon.error = '';
        },

        diskonHitung() {
            const harga = parseFloat(this.diskon.hargaRaw || '0');

            if (!harga || harga <= 0) {
                this.diskon.error = this.t.diskonErrorHarga;
                this.diskon.hasil = null;
                return;
            }
            this.diskon.error = '';

            let p1 = parseFloat((this.diskon.persen1 || '0').toString().replace(',', '.'));
            let p2 = parseFloat((this.diskon.persen2 || '0').toString().replace(',', '.'));
            if (isNaN(p1) || p1 < 0) p1 = 0;
            if (isNaN(p2) || p2 < 0) p2 = 0;

            // Diskon bertingkat: diskon 2 dihitung dari harga setelah diskon 1
            const setelahDiskon1 = harga - (harga * p1 / 100);
            const setelahDiskon2 = setelahDiskon1 - (setelahDiskon1 * p2 / 100);

            const hargaAkhir = Math.max(setelahDiskon2, 0);
            const totalPotongan = harga - hargaAkhir;
            const persenEfektif = harga > 0 ? (totalPotongan / harga) * 100 : 0;

            this.diskon.hasil = {
                hargaAwal: harga,
                totalPotongan: totalPotongan,
                persenEfektif: persenEfektif,
                hargaAkhir: hargaAkhir,
            };
        },

        diskonReset() {
            this.diskon.hargaDisplay = '';
            this.diskon.hargaRaw = '';
            this.diskon.persen1 = '';
            this.diskon.persen2 = '';
            this.diskon.error = '';
            this.diskon.hasil = null;
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
