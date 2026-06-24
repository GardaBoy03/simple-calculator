// ============================================================
//  Proteksi: Disable Right-Click & Developer Tools
// ============================================================
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    alert('❌ Right-click tidak diizinkan di halaman ini!');
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
        alert('⚠️ Developer Tools tidak dapat diakses!');
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
        document.body.innerHTML = '<h1 style="text-align:center; margin-top:50px; color:#d9534f;">⚠️ Akses Developer Tools Terdeteksi!</h1><p style="text-align:center; font-size:18px;">Halaman telah diblokir untuk keamanan.</p>';
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
        // ── Mode Tab ──
        modeAktif: 'standar',
        tabs: [
            { id: 'standar',  label: '🔢 Standar' },
            { id: 'riwayat',  label: '🕒 Riwayat' },
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
        driveAccessToken: null,
        driveTokenClient: null,
    },

    mounted() {
        const savedRiwayat = localStorage.getItem('wa_kalkulator_riwayat');
        if (savedRiwayat) {
            try { this.riwayat = JSON.parse(savedRiwayat); } catch(e) {}
        }

        const savedFolderId = localStorage.getItem('wa_kalkulator_drive_folder_id');
        if (savedFolderId) this.driveFolderId = savedFolderId;

        this.initDriveTokenClient();

        // Coba sambungkan ulang otomatis (silent) jika user sudah pernah konek sebelumnya
        if (localStorage.getItem('wa_kalkulator_drive_connected') === '1') {
            this.$nextTick(() => {
                setTimeout(() => this.connectDrive(true), 500);
            });
        }
    },

    computed: {
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

            // Auto-save ke Google Drive sebagai file .txt (jika sudah terhubung)
            if (this.driveConnected) {
                this.simpanItemKeDrive(item);
            }
        },

        hapusSatu(id) {
            this.riwayat = this.riwayat.filter(r => r.id !== id);
            localStorage.setItem('wa_kalkulator_riwayat', JSON.stringify(this.riwayat));
        },

        hapusSemua() {
            if (confirm('Hapus semua riwayat?')) {
                this.riwayat = [];
                localStorage.setItem('wa_kalkulator_riwayat', JSON.stringify(this.riwayat));
            }
        },

        // ════════════════════════════════════════════════════════
        // CLOUD SYNC - EXPORT / IMPORT
        // ════════════════════════════════════════════════════════
        exportRiwayat() {
            if (this.riwayat.length === 0) {
                this.showSync('error', '❌ Tidak ada riwayat untuk di-export');
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

            this.showSync('success', '✅ Riwayat berhasil di-export! File: kalkulator-riwayat-YYYY-MM-DD.txt');

            // Salin ke clipboard juga
            setTimeout(() => {
                navigator.clipboard.writeText(txtString).then(() => {
                    this.showSync('info', '📋 Data juga sudah disalin ke clipboard. Bisa di-paste ke Google Drive, Notion, dll');
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
                            throw new Error('Tidak ada data yang dikenali di file ini');
                        }

                        // Tanya konfirmasi
                        const count = importedItems.length;
                        if (confirm(`Import ${count} kalkulasi dari backup ini?\n\nCatatan: Ini akan menambah dengan riwayat yang sudah ada.`)) {
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

                            this.showSync('success', `✅ Berhasil import ${count} kalkulasi! Total sekarang: ${this.riwayat.length}`);
                        }
                    } catch (error) {
                        this.showSync('error', `❌ Gagal import: ${error.message}`);
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
                            this.showSync('error', '❌ Gagal mendapatkan izin akses Google Drive');
                        }
                    },
                });
            };
            trySetup();
        },

        toggleDrive() {
            if (this.driveConnected) {
                if (confirm('Putuskan koneksi Google Drive?\n\nFile yang sudah tersimpan di Drive tidak akan terhapus.')) {
                    this.disconnectDrive();
                }
            } else {
                this.connectDrive(false);
            }
        },

        connectDrive(silent) {
            if (!this.driveTokenClient) {
                this.showSync('error', '❌ Google Drive belum siap, coba lagi sebentar');
                return;
            }

            if (this.DRIVE_CLIENT_ID && this.DRIVE_CLIENT_ID.indexOf('GANTI_DENGAN_CLIENT_ID') === 0) {
                if (!silent) {
                    this.showSync('error', '❌ Client ID Google belum diisi. Lihat komentar di apps.js bagian initDriveTokenClient()');
                }
                return;
            }

            if (!silent) this.showSync('info', '🔐 Membuka jendela login Google...');

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
            this.showSync('info', '🔌 Koneksi Google Drive diputus');
        },

        async onDriveTokenReady() {
            try {
                await this.pastikanFolderDrive();
                this.driveConnected = true;
                localStorage.setItem('wa_kalkulator_drive_connected', '1');
                this.showSync('success', `✅ Terhubung ke Drive! Folder "${this.driveFolderName}" siap digunakan`);
            } catch (err) {
                console.error(err);
                this.showSync('error', '❌ Gagal menyiapkan folder Drive: ' + err.message);
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

        // Simpan satu item riwayat sebagai file .txt baru di folder Drive
        async simpanItemKeDrive(item) {
            try {
                const folderId = await this.pastikanFolderDrive();

                const namaFile = `kalkulasi-${item.id}.txt`;
                const isiFile =
                    `Kalkulator WhatsApp - Riwayat Perhitungan\n` +
                    `==========================================\n\n` +
                    `Waktu   : ${item.waktu}\n` +
                    `Operasi : ${item.teks}\n` +
                    `Hasil   : ${item.total}\n`;

                const metadata = {
                    name: namaFile,
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

                await this.driveFetch(
                    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
                        body: body,
                    }
                );
            } catch (err) {
                console.error('Gagal simpan ke Drive:', err);
                this.showSync('error', '⚠️ Gagal auto-save ke Drive: ' + err.message);
            }
        },
    }
});
