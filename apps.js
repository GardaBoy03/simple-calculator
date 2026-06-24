// ============================================================
//  Kalkulator WhatsApp — apps.js  v7 (Persen di Standar)
//  Mode: Standar (Kalkulator + Persen) | Riwayat
//  Sound Effects & History Tab
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
    },

    mounted() {
        const savedRiwayat = localStorage.getItem('wa_kalkulator_riwayat');
        if (savedRiwayat) { 
            try { this.riwayat = JSON.parse(savedRiwayat); } catch(e) {} 
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
            
            this.riwayat.unshift({
                id: Date.now(),
                teks: teks,
                total: total,
                waktu: waktu,
            });
            
            localStorage.setItem('wa_kalkulator_riwayat', JSON.stringify(this.riwayat));
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

            const dataExport = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                count: this.riwayat.length,
                data: this.riwayat
            };

            const jsonString = JSON.stringify(dataExport, null, 2);
            const dataUrl = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `kalkulator-riwayat-${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            this.showSync('success', '✅ Riwayat berhasil di-export! File: kalkulator-riwayat-YYYY-MM-DD.json');
            
            // Salin ke clipboard juga
            setTimeout(() => {
                navigator.clipboard.writeText(jsonString).then(() => {
                    this.showSync('info', '📋 Data juga sudah disalin ke clipboard. Bisa di-paste ke Google Drive, Notion, dll');
                }).catch(() => {
                    console.log('Clipboard copy failed');
                });
            }, 500);
        },

        importRiwayat() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importedData = JSON.parse(event.target.result);
                        
                        // Validasi format
                        if (!importedData.data || !Array.isArray(importedData.data)) {
                            throw new Error('Format file tidak valid');
                        }

                        // Tanya konfirmasi
                        const count = importedData.data.length;
                        if (confirm(`Import ${count} kalkulasi dari backup ini?\n\nCatatan: Ini akan menambah dengan riwayat yang sudah ada.`)) {
                            // Merge riwayat
                            const newRiwayat = [...importedData.data, ...this.riwayat];
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

        showSync(type, message) {
            this.syncStatus = { type, message };
            setTimeout(() => {
                this.syncStatus = null;
            }, 5000);
        },
    }
});
