// ============================================================
//  Kalkulator WhatsApp — apps.js  v6
//  Mode: Standar | Persen | SPBU | KWH Listrik | Riwayat
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
        // Coba muat dari assets/sound/
        const soundPath = 'assets/sound/';
        const soundNames = ['click'];
        
        soundNames.forEach(name => {
            const audio = new Audio();
            audio.src = soundPath + name + '.mp3';
            audio.preload = 'auto';
            // Fallback ke .wav jika .mp3 gagal
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
                // Silent fail jika browser belum izin audio
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
            { id: 'persen',   label: '% Persen'  },
            { id: 'spbu',     label: '⛽ SPBU' },
            { id: 'kwh',      label: '⚡ KWH Listrik' },
            { id: 'riwayat',  label: '🕒 Riwayat' },
        ],

        // ── Standar (kalkulator bebas seperti kalkulator pada umumnya) ──
        standar: {
            display: '0',     // angka yang sedang tampil di layar
            stored: null,     // operand yang disimpan sebelum operator dipilih
            operator: null,   // operator yang sedang menunggu (+ - * /)
            overwrite: true,  // true = digit berikutnya menimpa layar
            exprText: '',     // teks ekspresi kecil di atas layar (mis. "12 +")
        },

        // ── Persen ──
        persen: {
            subMode: 'diskon', harga: '', pct: '', nilai: '', total: '',
            // PPN
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

        // ── SPBU (Harga per Liter) ──
        spbu: {
            subMode: 'liter',
            uang: '', hargaPerLiter: '', totalBayar: '', liter: '',
        },
        spbuTabs: [
            { id: 'liter', label: '🛢️ Liter dari Uang' },
            { id: 'harga', label: '💰 Harga/Liter' },
            { id: 'total', label: '🧾 Total Bayar' },
        ],

        // ── KWH Listrik (Prabayar/Pascabayar) ──
        kwh: {
            tipe: 'prabayar', // prabayar atau pascabayar
            awalMeter: '', akhirMeter: '', tarifPerKwh: '',
        },
        kwhTabs: [
            { id: 'prabayar', label: '💳 Prabayar' },
            { id: 'pascabayar', label: '📄 Pascabayar' },
        ],

        // ── Hasil ──
        hasilKalkulasi: 0,
        hasilMulti: [],   // [{label, nilai}] untuk persen

        // ── Riwayat ──
        riwayat: [],
        tampilkanRiwayat: true,
    },

    mounted() {
        // Load riwayat kalkulasi
        const savedRiwayat = localStorage.getItem('wa_kalkulator_riwayat');
        if (savedRiwayat) { 
            try { this.riwayat = JSON.parse(savedRiwayat); } catch(e) {} 
        }
    },

    computed: {
        // Standar — tampilan layar kalkulator dengan format ribuan
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
        // ── Sound Effects ─────────────────────────────────────
        playSound(soundName) {
            soundManager.play(soundName);
        },

        // ── Ganti Mode ────────────────────────────────────────
        gantiMode(newMode) {
            this.modeAktif = newMode;
        },

        // ── Hitung mode aktif ──────────────────────────────────
        hitungAktif() {
            const methodMap = {
                persen: 'hitungPersen',
                spbu: 'hitungSpbu',
                kwh: 'hitungKwh',
            };
            const method = methodMap[this.modeAktif];
            if (method && typeof this[method] === 'function') {
                this[method]();
            }
        },

        // ── Reset Kalkulator ───────────────────────────────────
        resetKalkulator() {
            if (this.modeAktif === 'standar') {
                this.stdClear();
            } else if (this.modeAktif === 'persen') {
                this.resetPersen();
            } else if (this.modeAktif === 'spbu') {
                this.resetSpbu();
            } else if (this.modeAktif === 'kwh') {
                this.resetKwh();
            }
        },

        resetHasil() {
            this.hasilKalkulasi = 0;
            this.hasilMulti = [];
        },

        // ── Riwayat Kalkulasi ──────────────────────────────────
        tambahRiwayat(teks, total) {
            const now = new Date();
            const jam = String(now.getHours()).padStart(2, '0');
            const menit = String(now.getMinutes()).padStart(2, '0');
            const waktu = `${jam}:${menit}`;

            this.riwayat.unshift({
                id: Date.now(),
                teks: teks,
                total: total,
                waktu: waktu,
            });

            // Simpan ke localStorage
            localStorage.setItem('wa_kalkulator_riwayat', JSON.stringify(this.riwayat));
        },

        hapusSatu(id) {
            const idx = this.riwayat.findIndex(x => x.id === id);
            if (idx > -1) {
                this.riwayat.splice(idx, 1);
                localStorage.setItem('wa_kalkulator_riwayat', JSON.stringify(this.riwayat));
            }
        },

        hapusSemua() {
            if (confirm('Hapus semua riwayat kalkulasi?')) {
                this.riwayat = [];
                localStorage.removeItem('wa_kalkulator_riwayat');
            }
        },

        // ════════════════════════════════════════════════════════
        // MODE: STANDAR
        // ════════════════════════════════════════════════════════

        stdDigit(d) {
            if (this.standar.overwrite) {
                this.standar.display = d;
                this.standar.overwrite = false;
            } else {
                if (this.standar.display.length >= 15) return;
                this.standar.display += d;
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

        stdOperator(op) {
            const current = parseFloat(this.standar.display) || 0;
            if (this.standar.stored !== null && !this.standar.overwrite) {
                const hasil = this.hitungOpStandar(this.standar.stored, current, this.standar.operator);
                this.standar.display = this.formatHasilStandar(hasil);
            }
            this.standar.stored = parseFloat(this.standar.display) || 0;
            this.standar.operator = op;
            this.standar.overwrite = true;
            this.standar.exprText = `${formatRibuan(this.standar.stored)} ${this.simbolOpStandar(op)}`;
        },

        simbolOpStandar(op) {
            const map = { '+': '+', '-': '−', '*': '×', '/': '÷' };
            return map[op] || op;
        },

        hitungOpStandar(a, b, op) {
            switch(op) {
                case '+': return a + b;
                case '-': return a - b;
                case '*': return a * b;
                case '/': return b !== 0 ? a / b : NaN;
                default: return b;
            }
        },

        formatHasilStandar(nilai) {
            const s = nilai.toFixed(10);
            return parseFloat(s).toString().replace('.', ',');
        },

        stdEquals() {
            const current = parseFloat(this.standar.display) || 0;
            const a = this.standar.stored;
            const op = this.standar.operator;
            const hasil = this.hitungOpStandar(a, current, op);
            const teks = `${formatRibuan(a)} ${this.simbolOpStandar(op)} ${formatRibuan(current)} =`;

            if (isNaN(hasil) || !isFinite(hasil)) {
                this.standar.display = 'Error';
                this.hasilKalkulasi = 'Tidak bisa dibagi 0';
                this.tambahRiwayat(teks, 'Tidak bisa dibagi 0');
            } else {
                this.standar.display = this.formatHasilStandar(hasil);
                this.hasilKalkulasi = hasil;
                this.tambahRiwayat(teks, formatDesimal(hasil));
            }
            this.hasilMulti = [];
            this.standar.stored = null;
            this.standar.operator = null;
            this.standar.overwrite = true;
            this.standar.exprText = '';
        },

        // Tombol "AC" — bersihkan layar kalkulator standar
        stdClear() {
            this.standar = { display: '0', stored: null, operator: null, overwrite: true, exprText: '' };
            this.hasilKalkulasi = 0;
            this.hasilMulti = [];
        },

        // Tombol "⌫" — hapus satu digit terakhir
        stdBackspace() {
            if (this.standar.display === 'Error') { this.stdClear(); return; }
            if (this.standar.overwrite) return;
            const d = this.standar.display;
            if (d.length <= 1 || (d.length === 2 && d.startsWith('-'))) {
                this.standar.display = '0';
                this.standar.overwrite = true;
            } else {
                this.standar.display = d.slice(0, -1);
            }
        },

        // Tombol "±" — balik tanda positif/negatif
        stdToggleSign() {
            if (this.standar.display === 'Error' || this.standar.display === '0') return;
            this.standar.display = this.standar.display.startsWith('-')
                ? this.standar.display.slice(1)
                : '-' + this.standar.display;
        },

        // Tombol "%"
        stdPercent() {
            if (this.standar.display === 'Error') return;
            const current = parseFloat(this.standar.display) || 0;
            const hasil = current / 100;
            this.standar.display = this.formatHasilStandar(hasil);
            this.standar.overwrite = true;
        },

        // Dukungan keyboard fisik untuk tab Standar
        stdKeydown(e) {
            const k = e.key;
            if (/^[0-9]$/.test(k)) { this.stdDigit(k); }
            else if (k === '.' || k === ',') { this.stdDecimal(); }
            else if (k === '+' || k === '-') { this.stdOperator(k); }
            else if (k === '*') { this.stdOperator('*'); }
            else if (k === '/') { e.preventDefault(); this.stdOperator('/'); }
            else if (k === 'Enter' || k === '=') { e.preventDefault(); this.stdEquals(); }
            else if (k === 'Backspace') { this.stdBackspace(); }
            else if (k === 'Escape') { this.stdClear(); }
            else if (k === '%') { this.stdPercent(); }
        },

        // ════════════════════════════════════════════════════════
        // MODE: PERSEN
        // ════════════════════════════════════════════════════════
        hitungPersen() {
            this.hasilMulti = [];
            const sub = this.persen.subMode;

            if (sub === 'diskon') {
                const harga = parseFloat(this.persen.harga.replace(/\./g,'')) || 0;
                const pct   = parseFloat(this.persen.pct) || 0;
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
                const nilai = parseFloat(this.persen.nilai.replace(/\./g,'')) || 0;
                const total = parseFloat(this.persen.total.replace(/\./g,'')) || 0;
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
                const harga = parseFloat(this.persen.harga.replace(/\./g,'')) || 0;
                const pct   = parseFloat(this.persen.pct) || 0;
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
                const harga = parseFloat(this.persen.ppnHarga.replace(/\./g,'')) || 0;
                const tarif = parseFloat(this.persen.ppnTarif) || 0;

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
        // MODE: SPBU
        // ════════════════════════════════════════════════════════
        hitungSpbu() {
            this.hasilMulti = [];
            const sub = this.spbu.subMode;

            if (sub === 'liter') {
                const uang = parseFloat(this.spbu.uang.replace(/\./g,'')) || 0;
                const harga = parseFloat(this.spbu.hargaPerLiter.replace(/\./g,'')) || 0;
                if (harga === 0) { this.hasilKalkulasi = 'Harga ≠ 0'; return; }
                const liter = uang / harga;
                this.hasilMulti = [
                    { label: 'Uang:', nilai: 'Rp ' + formatRibuan(uang) },
                    { label: 'Liter:', nilai: formatDesimal(liter) + ' L' },
                ];
                this.tambahRiwayat(
                    `Rp${formatRibuan(uang)} ÷ Rp${formatRibuan(harga)}/L =`,
                    formatDesimal(liter) + ' L'
                );

            } else if (sub === 'harga') {
                const total = parseFloat(this.spbu.totalBayar.replace(/\./g,'')) || 0;
                const liter = parseFloat(this.spbu.liter.replace(/\./g,'')) || 0;
                if (liter === 0) { this.hasilKalkulasi = 'Liter ≠ 0'; return; }
                const harga = total / liter;
                this.hasilMulti = [
                    { label: 'Total Bayar:', nilai: 'Rp ' + formatRibuan(total) },
                    { label: 'Harga/L:', nilai: 'Rp ' + formatDesimal(harga) },
                ];
                this.tambahRiwayat(
                    `Rp${formatRibuan(total)} ÷ ${formatDesimal(liter)}L =`,
                    'Rp ' + formatDesimal(harga)
                );

            } else if (sub === 'total') {
                const liter = parseFloat(this.spbu.liter.replace(/\./g,'')) || 0;
                const harga = parseFloat(this.spbu.hargaPerLiter.replace(/\./g,'')) || 0;
                const total = liter * harga;
                this.hasilMulti = [
                    { label: 'Liter:', nilai: formatDesimal(liter) + ' L' },
                    { label: 'Total Bayar:', nilai: 'Rp ' + formatRibuan(total) },
                ];
                this.tambahRiwayat(
                    `${formatDesimal(liter)}L × Rp${formatRibuan(harga)}/L =`,
                    'Rp ' + formatRibuan(total)
                );
            }
        },

        resetSpbu() {
            this.spbu = { subMode: 'liter', uang: '', hargaPerLiter: '', totalBayar: '', liter: '' };
            this.hasilKalkulasi = 0;
            this.hasilMulti = [];
        },

        // ════════════════════════════════════════════════════════
        // MODE: KWH LISTRIK
        // ════════════════════════════════════════════════════════
        hitungKwh() {
            this.hasilMulti = [];
            const tipe = this.kwh.tipe;

            if (tipe === 'prabayar') {
                const uang = parseFloat(this.kwh.awalMeter.replace(/\./g,'')) || 0;
                const tarif = parseFloat(this.kwh.tarifPerKwh.replace(/\./g,'')) || 0;
                if (tarif === 0) { this.hasilKalkulasi = 'Tarif ≠ 0'; return; }
                const kwh = uang / tarif;
                this.hasilMulti = [
                    { label: 'Uang Prabayar:', nilai: 'Rp ' + formatRibuan(uang) },
                    { label: 'Tarif/KWH:',    nilai: 'Rp ' + formatRibuan(tarif) },
                    { label: 'Total KWH:',    nilai: formatDesimal(kwh) + ' KWH' },
                ];
                this.tambahRiwayat(
                    `Rp${formatRibuan(uang)} ÷ Rp${formatRibuan(tarif)}/KWH =`,
                    formatDesimal(kwh) + ' KWH'
                );

            } else if (tipe === 'pascabayar') {
                const awal = parseFloat(this.kwh.awalMeter.replace(/\./g,'')) || 0;
                const akhir = parseFloat(this.kwh.akhirMeter.replace(/\./g,'')) || 0;
                const tarif = parseFloat(this.kwh.tarifPerKwh.replace(/\./g,'')) || 0;
                const selisih = akhir - awal;
                const bayar = selisih * tarif;
                this.hasilMulti = [
                    { label: 'Meter Awal:',  nilai: formatDesimal(awal) + ' KWH' },
                    { label: 'Meter Akhir:', nilai: formatDesimal(akhir) + ' KWH' },
                    { label: 'Terpakai:',    nilai: formatDesimal(selisih) + ' KWH' },
                    { label: 'Total Bayar:', nilai: 'Rp ' + formatRibuan(bayar) },
                ];
                this.tambahRiwayat(
                    `${formatDesimal(akhir)} - ${formatDesimal(awal)} = ${formatDesimal(selisih)} KWH × Rp${formatRibuan(tarif)}/KWH =`,
                    'Rp ' + formatRibuan(bayar)
                );
            }
        },

        resetKwh() {
            this.kwh = { tipe: 'prabayar', awalMeter: '', akhirMeter: '', tarifPerKwh: '' };
            this.hasilKalkulasi = 0;
            this.hasilMulti = [];
        },
    }
});
