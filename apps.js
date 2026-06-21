// ============================================================
//  Kalkulator WhatsApp — apps.js  v4
//  Mode: Standar | Persen | Pangkat & Akar | SPBU | Catatan
//  Sound Effects & Notes Feature
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
            { id: 'pangkat',  label: '√ Pangkat' },
            { id: 'spbu',     label: '⛽ SPBU' },
            { id: 'catatan',  label: '📝 Catatan' },
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

        // ── Pangkat & Akar ──
        pangkat: { subMode: 'kuadrat', a: '', n: '' },
        pangkatTabs: [
            { id: 'kuadrat',  label: 'x²' },
            { id: 'kubik',    label: 'x³' },
            { id: 'pangkat_n',label: 'xⁿ' },
            { id: 'akar2',    label: '√x' },
            { id: 'akar3',    label: '∛x' },
            { id: 'akar_n',   label: 'ⁿ√x' },
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

        // ── Catatan (Notes) ──
        catatan: {
            teks: '',
            waktuSimpan: '',
            autoSave: false,
        },
        catatanHistory: [],

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

        // Load catatan
        const savedCatatan = localStorage.getItem('wa_kalkulator_catatan');
        if (savedCatatan) {
            try {
                const data = JSON.parse(savedCatatan);
                this.catatan.teks = data.teks || '';
                this.catatan.waktuSimpan = data.waktuSimpan || '';
            } catch(e) {}
        }

        // Load catatan history
        const savedHistory = localStorage.getItem('wa_kalkulator_catatan_history');
        if (savedHistory) {
            try { this.catatanHistory = JSON.parse(savedHistory); } catch(e) {}
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

        labelPangkatInput() {
            const m = this.pangkat.subMode;
            if (m === 'akar2') return 'Nilai (√x)';
            if (m === 'akar3') return 'Nilai (∛x)';
            return 'Nilai Dasar';
        },

        hintPangkat() {
            const m = this.pangkat.subMode;
            const hints = {
                kuadrat: '💡 Contoh: 5² = 25',
                kubik:   '💡 Contoh: 3³ = 27',
                pangkat_n: '💡 Contoh: 2 pangkat 10 = 1.024',
                akar2:   '💡 Contoh: √144 = 12',
                akar3:   '💡 Contoh: ∛27 = 3',
                akar_n:  '💡 Contoh: akar ke-4 dari 81 = 3',
            };
            return hints[m] || '';
        },
    },

    methods: {
        // ── Sound Effects ─────────────────────────────────────
        playSound(soundName) {
            soundManager.play(soundName);
        },

        // ── Navigasi Tab ──────────────────────────────────────
        gantiMode(id) {
            this.modeAktif = id;
            this.resetHasil();
        },
        resetHasil() {
            this.hasilKalkulasi = 0;
            this.hasilMulti = [];
        },

        // ── Dispatcher Tombol Hitung ──────────────────────────
        hitungAktif() {
            const map = {
                standar: 'stdEquals',
                persen:  'hitungPersen',
                pangkat: 'hitungPangkat',
                spbu:    'hitungSpbu',
            };
            this[map[this.modeAktif]]();
        },

        // ── Simpan Riwayat ────────────────────────────────────
        simpanKeStorage() {
            localStorage.setItem('wa_kalkulator_riwayat', JSON.stringify(this.riwayat));
        },
        tambahRiwayat(teks, total) {
            this.riwayat.unshift({
                id: Date.now(),
                teks,
                total,
                waktu: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            this.simpanKeStorage();
            this.tampilkanRiwayat = true;
        },

        // ── Catatan (Notes) Methods ───────────────────────────
        simpanCatatan() {
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            this.catatan.waktuSimpan = now;
            
            // Simpan catatan utama
            const catatanData = {
                teks: this.catatan.teks,
                waktuSimpan: this.catatan.waktuSimpan
            };
            localStorage.setItem('wa_kalkulator_catatan', JSON.stringify(catatanData));

            // Tambah ke history jika ada isi baru
            if (this.catatan.teks.trim()) {
                const historyItem = {
                    teks: this.catatan.teks,
                    waktu: now
                };
                this.catatanHistory.unshift(historyItem);
                // Batasi history ke 10 item
                if (this.catatanHistory.length > 10) {
                    this.catatanHistory = this.catatanHistory.slice(0, 10);
                }
                localStorage.setItem('wa_kalkulator_catatan_history', JSON.stringify(this.catatanHistory));
            }
        },

        hapusCatatan() {
            if (confirm('Hapus catatan saat ini?')) {
                this.catatan.teks = '';
                this.catatan.waktuSimpan = '';
                localStorage.removeItem('wa_kalkulator_catatan');
            }
        },

        muatCatatan(idx) {
            if (idx !== undefined && this.catatanHistory[idx]) {
                this.catatan.teks = this.catatanHistory[idx].teks;
                this.catatan.waktuSimpan = this.catatanHistory[idx].waktu;
            }
        },

        hapusCatatanHistory(idx) {
            if (confirm('Hapus item dari riwayat?')) {
                this.catatanHistory.splice(idx, 1);
                localStorage.setItem('wa_kalkulator_catatan_history', JSON.stringify(this.catatanHistory));
            }
        },

        // ── MODE: STANDAR (kalkulator bebas) ──────────────────
        simbolOpStandar(op) { return { '+':'+', '-':'−', '*':'×', '/':'÷' }[op] || op; },

        hitungOpStandar(a, b, op) {
            switch (op) {
                case '+': return a + b;
                case '-': return a - b;
                case '*': return a * b;
                case '/': return b !== 0 ? a / b : NaN;
                default:  return b;
            }
        },

        formatHasilStandar(n) {
            if (!isFinite(n)) return 'Error';
            // Buang sisa pembulatan floating-point, batasi 10 digit desimal
            const s = parseFloat(n.toFixed(10)).toString();
            return s;
        },

        // Input digit 0-9
        stdDigit(d) {
            if (this.standar.display === 'Error') this.stdClear();
            if (this.standar.overwrite) {
                this.standar.display = d;
                this.standar.overwrite = false;
            } else {
                if (this.standar.display.replace('-', '').replace('.', '').length >= 15) return;
                this.standar.display = this.standar.display === '0' ? d : this.standar.display + d;
            }
        },

        // Input titik desimal
        stdDecimal() {
            if (this.standar.display === 'Error') this.stdClear();
            if (this.standar.overwrite) {
                this.standar.display = '0.';
                this.standar.overwrite = false;
            } else if (!this.standar.display.includes('.')) {
                this.standar.display += '.';
            }
        },

        // Pilih operator (+, -, *, /) — mendukung hitungan berantai
        stdOperator(op) {
            if (this.standar.display === 'Error') this.stdClear();
            const current = parseFloat(this.standar.display) || 0;
            if (this.standar.operator && !this.standar.overwrite) {
                const hasil = this.hitungOpStandar(this.standar.stored, current, this.standar.operator);
                this.standar.stored = hasil;
                this.standar.display = this.formatHasilStandar(hasil);
            } else {
                this.standar.stored = current;
            }
            this.standar.operator = op;
            this.standar.overwrite = true;
            this.standar.exprText = `${formatRibuan(this.standar.stored)} ${this.simbolOpStandar(op)}`;
        },

        // Tombol "="
        stdEquals() {
            if (this.standar.operator === null || this.standar.display === 'Error') return;
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

        // ── MODE: PERSEN ──────────────────────────────────────
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
                    `${formatRibuan(nilai)} dari ${formatRibuan(total)} =`,
                    formatDesimal(pct) + '%'
                );

            } else if (sub === 'naik') {
                const harga = parseFloat(this.persen.harga.replace(/\./g,'')) || 0;
                const pct   = parseFloat(this.persen.pct) || 0;
                const delta = harga * Math.abs(pct) / 100;
                const hasil = pct >= 0 ? harga + delta : harga - delta;
                const label = pct >= 0 ? 'Naik menjadi:' : 'Turun menjadi:';
                this.hasilMulti = [
                    { label, nilai: 'Rp ' + formatRibuan(hasil) },
                    { label: 'Selisih:', nilai: 'Rp ' + formatRibuan(delta) },
                ];
                this.tambahRiwayat(
                    `${pct >= 0 ? '+' : ''}${pct}% dari Rp${formatRibuan(harga)} =`,
                    'Rp ' + formatRibuan(hasil)
                );

            } else if (sub === 'ppn') {
                const harga = parseFloat(this.persen.ppnHarga.replace(/\./g,'')) || 0;
                const tarif = parseFloat(this.persen.ppnTarif) || 0;

                if (this.persen.ppnMode === 'tambah') {
                    // Harga dimasukkan = DPP (belum termasuk PPN)
                    const dpp     = harga;
                    const nilaiPpn = dpp * tarif / 100;
                    const total   = dpp + nilaiPpn;
                    this.hasilMulti = [
                        { label: 'DPP:',          nilai: 'Rp ' + formatRibuan(dpp) },
                        { label: `PPN (${tarif}%):`, nilai: 'Rp ' + formatRibuan(nilaiPpn) },
                        { label: 'Harga + PPN:',  nilai: 'Rp ' + formatRibuan(total) },
                    ];
                    this.tambahRiwayat(
                        `PPN ${tarif}% dari Rp${formatRibuan(dpp)} =`,
                        'Rp ' + formatRibuan(total)
                    );
                } else {
                    // Harga dimasukkan = sudah termasuk PPN, cari DPP
                    const totalHarga = harga;
                    const dpp        = tarif !== -100 ? totalHarga / (1 + tarif / 100) : 0;
                    const nilaiPpn   = totalHarga - dpp;
                    this.hasilMulti = [
                        { label: 'Harga Termasuk PPN:', nilai: 'Rp ' + formatRibuan(totalHarga) },
                        { label: 'DPP (Harga Dasar):',  nilai: 'Rp ' + formatRibuan(dpp) },
                        { label: `PPN (${tarif}%):`,    nilai: 'Rp ' + formatRibuan(nilaiPpn) },
                    ];
                    this.tambahRiwayat(
                        `DPP dari Rp${formatRibuan(totalHarga)} (PPN ${tarif}%) =`,
                        'Rp ' + formatRibuan(dpp)
                    );
                }
            }
        },

        // ── MODE: PANGKAT & AKAR ──────────────────────────────
        hitungPangkat() {
            const a = parseFloat(this.pangkat.a);
            const n = parseFloat(this.pangkat.n);
            if (isNaN(a)) { this.hasilKalkulasi = 'Masukkan nilai'; return; }
            let hasil, teks;
            const sub = this.pangkat.subMode;

            switch (sub) {
                case 'kuadrat':
                    hasil = a * a; teks = `${a}² =`; break;
                case 'kubik':
                    hasil = a * a * a; teks = `${a}³ =`; break;
                case 'pangkat_n':
                    if (isNaN(n)) { this.hasilKalkulasi = 'Masukkan pangkat'; return; }
                    hasil = Math.pow(a, n); teks = `${a}^${n} =`; break;
                case 'akar2':
                    if (a < 0) { this.hasilKalkulasi = 'Nilai ≥ 0'; return; }
                    hasil = Math.sqrt(a); teks = `√${a} =`; break;
                case 'akar3':
                    hasil = Math.cbrt(a); teks = `∛${a} =`; break;
                case 'akar_n':
                    if (isNaN(n) || n === 0) { this.hasilKalkulasi = 'Masukkan akar ke-'; return; }
                    hasil = Math.pow(Math.abs(a), 1/n) * (a < 0 && n%2 !== 0 ? -1 : 1);
                    teks = `${n}√${a} =`; break;
                default:
                    hasil = 0; teks = '?';
            }

            this.hasilKalkulasi = hasil;
            this.hasilMulti = [];
            const total = typeof hasil === 'number' ? formatDesimal(hasil) : hasil;
            this.tambahRiwayat(teks, total);
        },

        // ── MODE: SPBU (Harga per Liter) ───────────────────────
        hitungSpbu() {
            this.hasilMulti = [];
            const sub = this.spbu.subMode;

            if (sub === 'liter') {
                const uang  = parseFloat(String(this.spbu.uang).replace(/\./g, '')) || 0;
                const harga = parseFloat(String(this.spbu.hargaPerLiter).replace(/\./g, '')) || 0;
                if (harga === 0) { this.hasilKalkulasi = 'Harga/Liter ≠ 0'; return; }

                const literRaw = uang / harga;
                const literDapat = Math.floor(literRaw * 100) / 100; // pembulatan ke bawah 2 desimal (sesuai dispenser SPBU)
                const totalTerpakai = literDapat * harga;
                const kembalian = uang - totalTerpakai;

                this.hasilMulti = [
                    { label: 'Jumlah Liter:',  nilai: formatDesimal(literDapat, 2) + ' L' },
                    { label: 'Total Terpakai:', nilai: 'Rp ' + formatRibuan(Math.round(totalTerpakai)) },
                    { label: 'Kembalian:',     nilai: 'Rp ' + formatRibuan(Math.round(kembalian)) },
                ];
                this.tambahRiwayat(
                    `Rp${formatRibuan(uang)} ÷ Rp${formatRibuan(harga)}/L =`,
                    formatDesimal(literDapat, 2) + ' L'
                );

            } else if (sub === 'harga') {
                const totalBayar = parseFloat(String(this.spbu.totalBayar).replace(/\./g, '')) || 0;
                const liter = parseFloat(String(this.spbu.liter).replace(',', '.')) || 0;
                if (liter === 0) { this.hasilKalkulasi = 'Jumlah liter ≠ 0'; return; }

                const harga = totalBayar / liter;
                this.hasilMulti = [
                    { label: 'Harga per Liter:', nilai: 'Rp ' + formatRibuan(Math.round(harga)) },
                    { label: 'Jumlah Liter:',     nilai: formatDesimal(liter, 2) + ' L' },
                    { label: 'Total Bayar:',      nilai: 'Rp ' + formatRibuan(totalBayar) },
                ];
                this.tambahRiwayat(
                    `Rp${formatRibuan(totalBayar)} ÷ ${formatDesimal(liter, 2)} L =`,
                    'Rp ' + formatRibuan(Math.round(harga)) + '/L'
                );

            } else if (sub === 'total') {
                const liter = parseFloat(String(this.spbu.liter).replace(',', '.')) || 0;
                const harga = parseFloat(String(this.spbu.hargaPerLiter).replace(/\./g, '')) || 0;
                const total = liter * harga;

                this.hasilMulti = [
                    { label: 'Total Bayar:',     nilai: 'Rp ' + formatRibuan(Math.round(total)) },
                    { label: 'Jumlah Liter:',     nilai: formatDesimal(liter, 2) + ' L' },
                    { label: 'Harga per Liter:',  nilai: 'Rp ' + formatRibuan(harga) },
                ];
                this.tambahRiwayat(
                    `${formatDesimal(liter, 2)} L × Rp${formatRibuan(harga)}/L =`,
                    'Rp ' + formatRibuan(Math.round(total))
                );
            }
        },

        // ── Reset ─────────────────────────────────────────────
        resetKalkulator() {
            this.standar = { display: '0', stored: null, operator: null, overwrite: true, exprText: '' };
            this.persen.harga = ''; this.persen.pct = '';
            this.persen.nilai = ''; this.persen.total = '';
            this.persen.ppnHarga = ''; this.persen.ppnTarif = '11';
            this.pangkat.a = ''; this.pangkat.n = '';
            this.spbu.uang = ''; this.spbu.hargaPerLiter = '';
            this.spbu.totalBayar = ''; this.spbu.liter = '';
            this.hasilKalkulasi = 0;
            this.hasilMulti = [];
            if (document.activeElement) document.activeElement.blur();
        },

        // ── Riwayat ───────────────────────────────────────────
        toggleRiwayat() { this.tampilkanRiwayat = !this.tampilkanRiwayat; },
        hapusSatu(id) {
            this.riwayat = this.riwayat.filter(i => i.id !== id);
            this.simpanKeStorage();
        },
        hapusSemua() {
            this.riwayat = [];
            localStorage.removeItem('wa_kalkulator_riwayat');
        },

        // ── Helper expose ke template ─────────────────────────
        formatRibuan(v) { return formatRibuan(v); },
    }
});