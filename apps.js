// ============================================================
//  Kalkulator WhatsApp — apps.js  v7 (Persen di Standar)
//  Mode: Standar (Kalkulator + Persen) | Riwayat
//  Sound Effects & History Tab
// ============================================================

// ─── Format Angka ────────────────────────────────────────────
function formatRibuan(nilai) {
    if (nilai === '' || nilai === null || nilai === undefined) return '';
    if (typeof nilai === 'string' && isNaN(Number(nilai))) return nilai;
    const parts = nilai.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
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

        // ── Standar (dengan Sub-Mode: Kalkulator & Persen) ──
        standar: {
            subMode: 'kalkulator',
            // Kalkulator
            display: '0',
            stored: null,
            operator: null,
            overwrite: true,
            exprText: '',
        },

        // ── Persen (Sub-mode dari Standar) ──
        persen: {
            subMode: 'diskon', harga: '', pct: '', nilai: '', total: '',
            ppnMode: 'tambah', ppnHarga: '', ppnTarif: '11',
        },
        persenTabs: [
            { id: 'diskon', label: '🏷️ Diskon' },
            { id: 'dari',   label: '📊 % dari' },
            { id: 'naik',   label: '📈 Naik/Turun' },
            { id: 'ppn',    label: '🧾 PPN' },
        ],
        ppnModeTabs: [
            { id: 'tambah', label: 'Tambah PPN' },
            { id: 'cari',   label: 'Cari DPP' },
        ],

        // ── Hasil ──
        hasilKalkulasi: 0,
        hasilMulti: [],

        // ── Riwayat ──
        riwayat: [],
        tampilkanRiwayat: true,
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
            // Hanya ambil digit angka saja
            let hanyaAngka = nilaiAsli.replace(/\D/g, '');
            let terformat = formatRibuan(hanyaAngka);
            
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
        },

        stdToggleSign() {
            let num = parseFloat(this.standar.display.replace(',', '.'));
            num = -num;
            this.standar.display = num.toString();
            this.standar.overwrite = true;
        },

        stdOperator(op) {
            let current = parseFloat(this.standar.display.replace(',', '.'));
            
            if (this.standar.operator !== null && !this.standar.overwrite) {
                current = this.stdCalcInternal();
                this.standar.display = current.toString();
            }
            
            this.standar.stored = current;
            this.standar.operator = op;
            this.standar.overwrite = true;
            
            const opSymbol = op === '/' ? '÷' : op === '*' ? '×' : op === '-' ? '−' : '+';
            this.standar.exprText = formatRibuan(this.standar.stored.toString()) + ' ' + opSymbol;
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
            } else {
                const operand2 = this.standar.display;
                const resultStr = result.toString();
                this.standar.display = resultStr;
                
                // Format pesan: "10 + 2 = 12"
                const opSymbol = this.standar.operator === '/' ? '÷' : this.standar.operator === '*' ? '×' : this.standar.operator === '-' ? '−' : '+';
                const historyMsg = formatRibuan(this.standar.stored.toString()) + ' ' + opSymbol + ' ' + formatRibuan(operand2) + ' =';
                
                this.tambahRiwayat(
                    historyMsg,
                    formatRibuan(this.standar.display)
                );
            }
            
            this.standar.stored = null;
            this.standar.operator = null;
            this.standar.overwrite = true;
            this.standar.exprText = '';
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
        // MODE: STANDAR - PERSEN
        // ════════════════════════════════════════════════════════
        hitungPersen() {
            this.hasilMulti = [];
            const sub = this.persen.subMode;

            if (sub === 'diskon') {
                const harga = parseFloat(this.persen.harga.toString().replace(/\./g,'')) || 0;
                const pct   = parseFloat(this.persen.pct.toString().replace(/\./g,'')) || 0;
                const hemat = harga * pct / 100;
                const bayar = harga - hemat;
                this.hasilMulti = [
                    { label: 'Harga Bayar:', nilai: 'Rp ' + formatRibuan(bayar) },
                    { label: 'Hemat:',       nilai: 'Rp ' + formatRibuan(hemat) },
                    { label: 'Diskon:',      nilai: pct + '%' },
                ];
                this.tambahRiwayat(
                    `Diskon ${pct}% dari Rp${formatRibuan(harga)} =`,
                    'Rp ' + formatRibuan(bayar)
                );

            } else if (sub === 'dari') {
                const nilai = parseFloat(this.persen.nilai.toString().replace(/\./g,'')) || 0;
                const total = parseFloat(this.persen.total.toString().replace(/\./g,'')) || 0;
                if (total === 0) { this.hasilKalkulasi = 'Total ≠ 0'; return; }
                const pct = (nilai / total) * 100;
                this.hasilMulti = [
                    { label: 'Persentase:', nilai: formatDesimal(pct) + '%' },
                    { label: 'Dari total:', nilai: formatRibuan(total) },
                ];
                this.tambahRiwayat(
                    `${formatRibuan(nilai)} dari Rp${formatRibuan(total)} =`,
                    formatDesimal(pct) + '%'
                );

            } else if (sub === 'naik') {
                const harga = parseFloat(this.persen.harga.toString().replace(/\./g,'')) || 0;
                const pct   = parseFloat(this.persen.pct.toString().replace(/\./g,'')) || 0;
                const delta = harga * pct / 100;
                const hasil = harga + delta;
                this.hasilMulti = [
                    { label: 'Nilai Baru:', nilai: 'Rp ' + formatRibuan(hasil) },
                    { label: 'Perubahan:',  nilai: 'Rp ' + formatRibuan(delta) },
                    { label: 'Naik/Turun:', nilai: (pct >= 0 ? '+' : '') + pct + '%' },
                ];
                this.tambahRiwayat(
                    `Rp${formatRibuan(harga)} ${pct >= 0 ? 'naik' : 'turun'} ${Math.abs(pct)}% =`,
                    'Rp ' + formatRibuan(hasil)
                );

            } else if (sub === 'ppn') {
                const harga = parseFloat(this.persen.ppnHarga.toString().replace(/\./g,'')) || 0;
                const tarif = parseFloat(this.persen.ppnTarif.toString().replace(/\./g,'')) || 0;

                if (this.persen.ppnMode === 'tambah') {
                    const ppn = harga * tarif / 100;
                    const total = harga + ppn;
                    this.hasilMulti = [
                        { label: 'Harga:',      nilai: 'Rp ' + formatRibuan(harga) },
                        { label: 'PPN:',        nilai: 'Rp ' + formatRibuan(ppn) },
                        { label: 'Total + PPN:', nilai: 'Rp ' + formatRibuan(total) },
                    ];
                    this.tambahRiwayat(
                        `Rp${formatRibuan(harga)} + PPN ${tarif}% =`,
                        'Rp ' + formatRibuan(total)
                    );
                } else {
                    const faktor = 1 + tarif / 100;
                    const dpp = harga / faktor;
                    const ppn = harga - dpp;
                    this.hasilMulti = [
                        { label: 'Total Harga:',nilai: 'Rp ' + formatRibuan(harga) },
                        { label: 'DPP:',        nilai: 'Rp ' + formatRibuan(dpp) },
                        { label: 'PPN:',        nilai: 'Rp ' + formatRibuan(ppn) },
                    ];
                    this.tambahRiwayat(
                        `Cari DPP dari Rp${formatRibuan(harga)} (PPN ${tarif}%) =`,
                        'Rp ' + formatRibuan(dpp)
                    );
                }
            }
        },

        resetPersen() {
            this.persen = {
                subMode: 'diskon', harga: '', pct: '', nilai: '', total: '',
                ppnMode: 'tambah', ppnHarga: '', ppnTarif: '11',
            };
            this.hasilKalkulasi = 0;
            this.hasilMulti = [];
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
    }
});
