// ============================================================
//  i18n: Terjemahan Bahasa Indonesia & English
// ============================================================
const LANG_STORAGE_KEY = 'wa_kalkulator_lang';

function getLang() {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return (saved === 'en' || saved === 'id') ? saved : 'id';
}

const I18N = {
    id: {
        langName: 'Indonesia',
        title: 'Kalkulator Pintar',
        online: 'Online',
        tabStandar: '🔢 Standar',
        tabRiwayat: '🕒 Riwayat',
        hintKeys: 'Tekan <b>Enter</b> untuk hitung • <b>Esc</b> untuk reset',
        hintCalc: '💡 Hitung bebas seperti kalkulator pada umumnya — angka, operator, dan tekan = kapan saja',
        historyCount: (n) => `${n} kalkulasi`,
        driveConnectBtn: '☁️ Hubungkan Drive',
        driveConnectedBtn: '🟢 Drive Terhubung',
        driveConnectTitle: 'Hubungkan ke Google Drive',
        driveDisconnectTitle: 'Putuskan koneksi Drive',
        exportBtn: '💾 Export',
        exportTitle: 'Export ke file lokal',
        importBtn: '📥 Import',
        importTitle: 'Import dari file lokal',
        clearAllBtn: '🗑️ Hapus Semua',
        driveFolderInfo: (name) => `📁 Otomatis tersimpan ke folder Drive: <b>${name}</b>`,
        historyEmpty: '📭 Belum ada riwayat kalkulasi',
        confirmClearAll: 'Hapus semua riwayat?',
        confirmDisconnectDrive: 'Putuskan koneksi Google Drive?\n\nFile yang sudah tersimpan di Drive tidak akan terhapus.',
        errDriveNotReady: '❌ Google Drive belum siap, coba lagi sebentar',
        errClientId: '❌ Client ID Google belum diisi. Lihat komentar di apps.js bagian initDriveTokenClient()',
        infoOpeningLogin: '🔐 Membuka jendela login Google...',
        infoDisconnected: '🔌 Koneksi Google Drive diputus',
        successConnected: (file, folder) => `✅ Terhubung ke Drive! File "${file}" di folder "${folder}" siap digunakan`,
        errFolderSetup: (msg) => `❌ Gagal menyiapkan folder Drive: ${msg}`,
        errDriveToken: '❌ Gagal mendapatkan izin akses Google Drive',
        errNoExport: '❌ Tidak ada riwayat untuk di-export',
        successExport: '✅ Riwayat berhasil di-export! File: kalkulator-riwayat-YYYY-MM-DD.txt',
        infoClipboard: '📋 Data juga sudah disalin ke clipboard. Bisa di-paste ke Google Drive, Notion, dll',
        errNoImportData: 'Tidak ada data yang dikenali di file ini',
        confirmImport: (count) => `Import ${count} kalkulasi dari backup ini?\n\nCatatan: Ini akan menambah dengan riwayat yang sudah ada.`,
        successImport: (count, total) => `✅ Berhasil import ${count} kalkulasi! Total sekarang: ${total}`,
        errImportFailed: (msg) => `❌ Gagal import: ${msg}`,
        errDriveSave: (msg) => `⚠️ Gagal auto-save ke Drive: ${msg}`,
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
        tabRiwayat: '🕒 History',
        hintKeys: 'Press <b>Enter</b> to calculate • <b>Esc</b> to reset',
        hintCalc: '💡 Calculate freely like a regular calculator — numbers, operators, press = anytime',
        historyCount: (n) => `${n} calculation${n === 1 ? '' : 's'}`,
        driveConnectBtn: '☁️ Connect Drive',
        driveConnectedBtn: '🟢 Drive Connected',
        driveConnectTitle: 'Connect to Google Drive',
        driveDisconnectTitle: 'Disconnect Drive',
        exportBtn: '💾 Export',
        exportTitle: 'Export to local file',
        importBtn: '📥 Import',
        importTitle: 'Import from local file',
        clearAllBtn: '🗑️ Clear All',
        driveFolderInfo: (name) => `📁 Automatically saved to Drive folder: <b>${name}</b>`,
        historyEmpty: '📭 No calculation history yet',
        confirmClearAll: 'Delete all history?',
        confirmDisconnectDrive: 'Disconnect Google Drive?\n\nFiles already saved to Drive will not be deleted.',
        errDriveNotReady: '❌ Google Drive is not ready yet, please try again shortly',
        errClientId: '❌ Google Client ID has not been set. See the comment in apps.js under initDriveTokenClient()',
        infoOpeningLogin: '🔐 Opening Google login window...',
        infoDisconnected: '🔌 Google Drive connection disconnected',
        successConnected: (file, folder) => `✅ Connected to Drive! File "${file}" in folder "${folder}" is ready`,
        errFolderSetup: (msg) => `❌ Failed to set up Drive folder: ${msg}`,
        errDriveToken: '❌ Failed to get Google Drive access permission',
        errNoExport: '❌ No history to export',
        successExport: '✅ History exported successfully! File: kalkulator-riwayat-YYYY-MM-DD.txt',
        infoClipboard: '📋 Data has also been copied to clipboard. You can paste it into Google Drive, Notion, etc.',
        errNoImportData: 'No recognizable data found in this file',
        confirmImport: (count) => `Import ${count} calculation(s) from this backup?\n\nNote: This will be added to your existing history.`,
        successImport: (count, total) => `✅ Successfully imported ${count} calculation(s)! Total now: ${total}`,
        errImportFailed: (msg) => `❌ Import failed: ${msg}`,
        errDriveSave: (msg) => `⚠️ Auto-save to Drive failed: ${msg}`,
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

        // ── Mode Tab ──
        modeAktif: 'standar',
        tabs: [
            { id: 'standar',  key: 'tabStandar' },
            { id: 'riwayat',  key: 'tabRiwayat' },
        ],

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

        // ── Hasil ──
        hasilKalkulasi: 0,
        hasilMulti: [],

        // ── Riwayat ──
        riwayat: [],
        tampilkanRiwayat: true,
        syncStatus: null,

        // ── Google Drive Sync ──
        driveConnected: false,
        driveFolderName: 'Kalkulator WhatsApp - Riwayat',
        driveFolderId: null,
        driveFileName: 'riwayat-kalkulator.txt',
        driveFileId: null,
        driveAccessToken: null,
        driveTokenClient: null,
        driveSaving: false,
    },

    mounted() {
        document.documentElement.lang = this.lang;

        const savedRiwayat = localStorage.getItem('wa_kalkulator_riwayat');
        if (savedRiwayat) {
            try { this.riwayat = JSON.parse(savedRiwayat); } catch(e) {}
        }

        const savedFolderId = localStorage.getItem('wa_kalkulator_drive_folder_id');
        if (savedFolderId) this.driveFolderId = savedFolderId;

        const savedFileId = localStorage.getItem('wa_kalkulator_drive_file_id');
        if (savedFileId) this.driveFileId = savedFileId;

        this.initDriveTokenClient();

        // Coba sambungkan ulang otomatis (silent) jika user sudah pernah konek sebelumnya
        if (localStorage.getItem('wa_kalkulator_drive_connected') === '1') {
            this.$nextTick(() => {
                setTimeout(() => this.connectDrive(true), 500);
            });
        }
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

        tampilHasil() {
            if (this.hasilMulti.length > 0) return '';
            const h = this.hasilKalkulasi;
            if (typeof h === 'number') return formatDesimal(h);
            return h;
        },
    },

    methods: {
        // ── Helper: Live Format Ribuan Saat Diketik ──
        formatInputRibuan(objek, properti, event) {
            let nilaiAsli = event.target.value;
            
            // Field yang boleh negatif: pct, ppnTarif
            const bolehNegatif = ['pct', 'ppnTarif'].includes(properti);
            
            // Ambil tanda minus jika ada (untuk field yang boleh negatif)
            let tanda = '';
            if (bolehNegatif && nilaiAsli.includes('-')) {
                tanda = '-';
            }
            
            // Hanya ambil digit angka saja
            let hanyaAngka = nilaiAsli.replace(/\D/g, '');
            let terformat = formatRibuan(hanyaAngka);
            
            // Tambahkan tanda minus kembali jika ada
            if (tanda && terformat) {
                terformat = tanda + terformat;
            }
            
            // Update model data secara reaktif
            objek[properti] = terformat;
            // Sinkronisasi teks tampilan pada elemen input
            event.target.value = terformat;
        },

        resetHasil() {
            this.hasilKalkulasi = 0;
            this.hasilMulti = [];
        },

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

        // ── Ganti Mode ────────────────────────────────────────
        gantiMode(newMode) {
            this.modeAktif = newMode;
        },

        // ── Reset Kalkulator ───────────────────────────────────
        resetKalkulator() {
            if (this.standar.subMode === 'kalkulator') {
                this.stdClear();
            } else if (this.standar.subMode === 'persen') {
                this.resetPersen();
            }
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
                current = (this.standar.stored * current) / 100;
            } else {
                current = current / 100;
            }
            this.standar.display = current.toString();
            this.standar.overwrite = true;
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
                let fullExpr, historyMsg;
                if (this.standar.exprFull !== '') {
                    // Operasi berantai: "2 + 2 + 2 = 6"
                    fullExpr = this.standar.exprFull + ' ' + opSymbol + ' ' + formatRibuan(operand2) + ' = ' + formatRibuan(resultStr);
                    historyMsg = this.standar.exprFull + ' ' + opSymbol + ' ' + formatRibuan(operand2) + ' =';
                } else {
                    // Operasi sederhana: "10 + 2 = 12"
                    fullExpr = formatRibuan(this.standar.stored.toString()) + ' ' + opSymbol + ' ' + formatRibuan(operand2) + ' = ' + formatRibuan(resultStr);
                    historyMsg = formatRibuan(this.standar.stored.toString()) + ' ' + opSymbol + ' ' + formatRibuan(operand2) + ' =';
                }
                
                // Tampilkan format lengkap di exprText (di std-ekspresi)
                this.standar.exprText = fullExpr;
                
                this.tambahRiwayat(
                    historyMsg,
                    formatRibuan(this.standar.display)
                );
                
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

        // ════════════════════════════════════════════════════════
        // RIWAYAT / HISTORY
        // ════════════════════════════════════════════════════════
        tambahRiwayat(teks, total) {
            const now = new Date();
            const jam = String(now.getHours()).padStart(2, '0');
            const menit = String(now.getMinutes()).padStart(2, '0');
            const waktu = jam + ':' + menit;

            const item = {
                id: Date.now(),
                teks: teks,
                total: total,
                waktu: waktu,
            };

            this.riwayat.unshift(item);

            localStorage.setItem('wa_kalkulator_riwayat', JSON.stringify(this.riwayat));

            // Auto-save ke Google Drive — selalu menimpa SATU file yang sama (tidak membuat file baru)
            if (this.driveConnected) {
                this.simpanRiwayatKeDrive();
            }
        },

        hapusSatu(id) {
            this.riwayat = this.riwayat.filter(r => r.id !== id);
            localStorage.setItem('wa_kalkulator_riwayat', JSON.stringify(this.riwayat));

            if (this.driveConnected) {
                this.simpanRiwayatKeDrive();
            }
        },

        hapusSemua() {
            if (confirm(this.t.confirmClearAll)) {
                this.riwayat = [];
                localStorage.setItem('wa_kalkulator_riwayat', JSON.stringify(this.riwayat));

                if (this.driveConnected) {
                    this.simpanRiwayatKeDrive();
                }
            }
        },

        // ════════════════════════════════════════════════════════
        // CLOUD SYNC - EXPORT / IMPORT
        // ════════════════════════════════════════════════════════
        exportRiwayat() {
            if (this.riwayat.length === 0) {
                this.showSync('error', this.t.errNoExport);
                return;
            }

            const SEP = '----------------------------------------';
            const lines = [];
            lines.push('KALKULATOR WHATSAPP - RIWAYAT EXPORT');
            lines.push(`Timestamp: ${new Date().toISOString()}`);
            lines.push(`Jumlah: ${this.riwayat.length}`);
            lines.push('========================================');

            this.riwayat.forEach(item => {
                lines.push(`ID: ${item.id}`);
                lines.push(`Teks: ${item.teks}`);
                lines.push(`Hasil: ${item.total}`);
                lines.push(`Waktu: ${item.waktu}`);
                lines.push(SEP);
            });

            const txtString = lines.join('\n');
            const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txtString);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `kalkulator-riwayat-${new Date().toISOString().split('T')[0]}.txt`;
            link.click();

            this.showSync('success', this.t.successExport);

            // Salin ke clipboard juga
            setTimeout(() => {
                navigator.clipboard.writeText(txtString).then(() => {
                    this.showSync('info', this.t.infoClipboard);
                }).catch(() => {
                    console.log('Clipboard copy failed');
                });
            }, 500);
        },

        importRiwayat() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.txt';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importedItems = this.parseRiwayatTxt(event.target.result);

                        if (importedItems.length === 0) {
                            throw new Error(this.t.errNoImportData);
                        }

                        // Tanya konfirmasi
                        const count = importedItems.length;
                        if (confirm(this.t.confirmImport(count))) {
                            // Merge riwayat
                            const newRiwayat = [...importedItems, ...this.riwayat];
                            // Remove duplikat berdasarkan ID
                            const uniqueIds = new Set();
                            const merged = newRiwayat.filter(item => {
                                if (uniqueIds.has(item.id)) return false;
                                uniqueIds.add(item.id);
                                return true;
                            });

                            this.riwayat = merged;
                            localStorage.setItem('wa_kalkulator_riwayat', JSON.stringify(this.riwayat));

                            if (this.driveConnected) {
                                this.simpanRiwayatKeDrive();
                            }

                            this.showSync('success', this.t.successImport(count, this.riwayat.length));
                        }
                    } catch (error) {
                        this.showSync('error', this.t.errImportFailed(error.message));
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        },

        // Parser untuk format .txt hasil export riwayat
        parseRiwayatTxt(text) {
            const blocks = text.split('----------------------------------------');
            const items = [];

            blocks.forEach(block => {
                const idMatch = block.match(/ID:\s*(.+)/);
                const teksMatch = block.match(/Teks:\s*(.+)/);
                const hasilMatch = block.match(/Hasil:\s*(.+)/);
                const waktuMatch = block.match(/Waktu:\s*(.+)/);

                if (idMatch && teksMatch && hasilMatch) {
                    items.push({
                        id: idMatch[1].trim(),
                        teks: teksMatch[1].trim(),
                        total: hasilMatch[1].trim(),
                        waktu: waktuMatch ? waktuMatch[1].trim() : ''
                    });
                }
            });

            return items;
        },

        showSync(type, message) {
            this.syncStatus = { type, message };
            setTimeout(() => {
                this.syncStatus = null;
            }, 5000);
        },

        // ════════════════════════════════════════════════════════
        // GOOGLE DRIVE — AUTO SAVE OTOMATIS (.txt per kalkulasi)
        // ════════════════════════════════════════════════════════
        //
        // CARA SETUP (sekali saja):
        // 1. Buka https://console.cloud.google.com/ -> buat project baru
        // 2. Aktifkan "Google Drive API" (menu API & Services -> Library)
        // 3. Buat OAuth Client ID (tipe: Web application)
        //    - Authorized JavaScript origins: isi dengan domain tempat halaman ini dihosting
        //      (contoh: https://namadomainanda.com atau http://localhost:5500 saat testing)
        // 4. Tempel Client ID ke variabel DRIVE_CLIENT_ID di bawah ini
        // ════════════════════════════════════════════════════════

        initDriveTokenClient() {
            const DRIVE_CLIENT_ID = '323461411376-2bsnhdk55amd5qm7c2p4jf8cqbfn2rl7.apps.googleusercontent.com';
            this.DRIVE_CLIENT_ID = DRIVE_CLIENT_ID;

            const trySetup = () => {
                if (typeof google === 'undefined' || !google.accounts) {
                    setTimeout(trySetup, 300);
                    return;
                }
                this.standar.exprText = this.standar.exprText; // no-op (Vue reactivity nudge)
                this.driveTokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: DRIVE_CLIENT_ID,
                    scope: 'https://www.googleapis.com/auth/drive.file',
                    callback: (response) => {
                        if (response && response.access_token) {
                            this.driveAccessToken = response.access_token;
                            this.onDriveTokenReady();
                        } else {
                            this.showSync('error', this.t.errDriveToken);
                        }
                    },
                });
            };
            trySetup();
        },

        toggleDrive() {
            if (this.driveConnected) {
                if (confirm(this.t.confirmDisconnectDrive)) {
                    this.disconnectDrive();
                }
            } else {
                this.connectDrive(false);
            }
        },

        connectDrive(silent) {
            if (!this.driveTokenClient) {
                this.showSync('error', this.t.errDriveNotReady);
                return;
            }

            if (this.DRIVE_CLIENT_ID && this.DRIVE_CLIENT_ID.indexOf('GANTI_DENGAN_CLIENT_ID') === 0) {
                if (!silent) {
                    this.showSync('error', this.t.errClientId);
                }
                return;
            }

            if (!silent) this.showSync('info', this.t.infoOpeningLogin);

            // 'silent' mencoba tanpa menampilkan consent screen jika sesi masih ada;
            // jika gagal, browser akan otomatis tetap menampilkan popup saat klik manual.
            this.driveTokenClient.requestAccessToken({ prompt: silent ? '' : 'consent' });
        },

        disconnectDrive() {
            if (this.driveAccessToken && typeof google !== 'undefined' && google.accounts) {
                google.accounts.oauth2.revoke(this.driveAccessToken, () => {});
            }
            this.driveConnected = false;
            this.driveAccessToken = null;
            localStorage.removeItem('wa_kalkulator_drive_connected');
            this.showSync('info', this.t.infoDisconnected);
        },

        async onDriveTokenReady() {
            try {
                const folderId = await this.pastikanFolderDrive();
                await this.pastikanFileDrive(folderId);
                this.driveConnected = true;
                localStorage.setItem('wa_kalkulator_drive_connected', '1');
                this.showSync('success', this.t.successConnected(this.driveFileName, this.driveFolderName));

                // Sinkronkan riwayat yang sudah ada saat ini ke file tersebut
                if (this.riwayat.length > 0) {
                    this.simpanRiwayatKeDrive();
                }
            } catch (err) {
                console.error(err);
                this.showSync('error', this.t.errFolderSetup(err.message));
            }
        },

        driveFetch(url, options = {}) {
            options.headers = Object.assign({}, options.headers, {
                Authorization: 'Bearer ' + this.driveAccessToken,
            });
            return fetch(url, options).then(async (res) => {
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Drive API error (${res.status}): ${errText}`);
                }
                return res.status === 204 ? null : res.json();
            });
        },

        // Cari folder berdasarkan nama; jika belum ada, buat baru
        async pastikanFolderDrive() {
            if (this.driveFolderId) {
                // Verifikasi folder masih ada
                try {
                    await this.driveFetch(
                        `https://www.googleapis.com/drive/v3/files/${this.driveFolderId}?fields=id,trashed`
                    );
                    return this.driveFolderId;
                } catch (e) {
                    this.driveFolderId = null; // folder hilang/terhapus, buat ulang
                }
            }

            const q = encodeURIComponent(
                `name='${this.driveFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
            );
            const searchRes = await this.driveFetch(
                `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`
            );

            if (searchRes.files && searchRes.files.length > 0) {
                this.driveFolderId = searchRes.files[0].id;
            } else {
                const createRes = await this.driveFetch(
                    'https://www.googleapis.com/drive/v3/files?fields=id',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: this.driveFolderName,
                            mimeType: 'application/vnd.google-apps.folder',
                        }),
                    }
                );
                this.driveFolderId = createRes.id;
            }

            localStorage.setItem('wa_kalkulator_drive_folder_id', this.driveFolderId);
            return this.driveFolderId;
        },

        // Cari file riwayat di dalam folder; jika belum ada, biarkan null (akan dibuat sekali saja)
        async pastikanFileDrive(folderId) {
            if (this.driveFileId) {
                // Verifikasi file masih ada & belum dihapus
                try {
                    const meta = await this.driveFetch(
                        `https://www.googleapis.com/drive/v3/files/${this.driveFileId}?fields=id,trashed`
                    );
                    if (!meta.trashed) return this.driveFileId;
                } catch (e) {
                    // file tidak ditemukan, lanjut cari/buat ulang di bawah
                }
                this.driveFileId = null;
            }

            const q = encodeURIComponent(
                `name='${this.driveFileName}' and '${folderId}' in parents and trashed=false`
            );
            const searchRes = await this.driveFetch(
                `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`
            );

            if (searchRes.files && searchRes.files.length > 0) {
                this.driveFileId = searchRes.files[0].id;
                localStorage.setItem('wa_kalkulator_drive_file_id', this.driveFileId);
            }

            return this.driveFileId; // null berarti file belum pernah dibuat
        },

        // Susun seluruh riwayat jadi satu teks utuh
        buatTeksRiwayatLengkap() {
            let txt = `Kalkulator WhatsApp - Riwayat Perhitungan\n`;
            txt += `==========================================\n`;
            txt += `Terakhir diperbarui: ${new Date().toLocaleString('id-ID')}\n`;
            txt += `Jumlah: ${this.riwayat.length}\n\n`;

            this.riwayat.forEach(item => {
                txt += `Waktu   : ${item.waktu}\n`;
                txt += `Operasi : ${item.teks}\n`;
                txt += `Hasil   : ${item.total}\n`;
                txt += `----------------------------------------\n`;
            });

            return txt;
        },

        // Simpan seluruh riwayat ke SATU file yang sama di Drive (selalu menimpa isinya, bukan membuat file baru)
        async simpanRiwayatKeDrive() {
            this.driveSaving = true;
            try {
                const folderId = await this.pastikanFolderDrive();
                await this.pastikanFileDrive(folderId);

                const isiFile = this.buatTeksRiwayatLengkap();

                if (this.driveFileId) {
                    // File sudah ada -> timpa isinya saja (PATCH media), tidak membuat file baru
                    await this.driveFetch(
                        `https://www.googleapis.com/upload/drive/v3/files/${this.driveFileId}?uploadType=media`,
                        {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
                            body: isiFile,
                        }
                    );
                } else {
                    // Belum pernah ada file -> buat satu kali, setelah ini selalu dipakai ulang
                    const metadata = {
                        name: this.driveFileName,
                        parents: [folderId],
                        mimeType: 'text/plain',
                    };

                    const boundary = '-------kalkulatorwa' + Date.now();
                    const body =
                        `--${boundary}\r\n` +
                        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
                        JSON.stringify(metadata) + `\r\n` +
                        `--${boundary}\r\n` +
                        `Content-Type: text/plain; charset=UTF-8\r\n\r\n` +
                        isiFile + `\r\n` +
                        `--${boundary}--`;

                    const createRes = await this.driveFetch(
                        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
                        {
                            method: 'POST',
                            headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
                            body: body,
                        }
                    );

                    this.driveFileId = createRes.id;
                    localStorage.setItem('wa_kalkulator_drive_file_id', this.driveFileId);
                }
            } catch (err) {
                console.error('Gagal simpan ke Drive:', err);
                this.showSync('error', this.t.errDriveSave(err.message));
            } finally {
                this.driveSaving = false;
            }
        },
    }
});
