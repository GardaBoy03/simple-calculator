// ============================================================
//  Kalkulator WhatsApp — apps.js  v3
//  Mode: Standar | Desimal | Pecahan | Persen | Pangkat & Akar
// ============================================================

let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (window.vueApp) window.vueApp.showInstallBtn = true;
});

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (window.vueApp) window.vueApp.showInstallBtn = false;
});

function isIos() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
function isInStandaloneMode() {
    return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

// ─── Matematika Pecahan ──────────────────────────────────────
function gcd(a, b) { return b === 0 ? Math.abs(a) : gcd(b, a % b); }
function sederhanakan(num, den) {
    if (den === 0) return { num: 0, den: 0, err: 'Penyebut tidak boleh 0' };
    const g = gcd(Math.abs(num), Math.abs(den));
    const n = num / g, d = den / g;
    return d < 0 ? { num: -n, den: -d } : { num: n, den: d };
}
function operasiPecahan(an, ad, op, bn, bd) {
    let rn, rd;
    switch (op) {
        case '+': rn = an * bd + bn * ad; rd = ad * bd; break;
        case '-': rn = an * bd - bn * ad; rd = ad * bd; break;
        case '*': rn = an * bn; rd = ad * bd; break;
        case '/': rn = an * bd; rd = ad * bn; break;
        default:  rn = 0; rd = 1;
    }
    return sederhanakan(rn, rd);
}

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
            { id: 'desimal',  label: '🔣 Desimal' },
            { id: 'pecahan',  label: '½ Pecahan' },
            { id: 'persen',   label: '% Persen'  },
            { id: 'pangkat',  label: '√ Pangkat' },
        ],

        // ── Standar ──
        bill: '',
        bil2: '',
        operasi: '+',

        // ── Desimal ──
        desimal: { a: '', b: '', op: '+' },

        // ── Pecahan ──
        pecahan: { a_num: '', a_den: '', b_num: '', b_den: '', op: '+' },

        // ── Persen ──
        persen: { subMode: 'diskon', harga: '', pct: '', nilai: '', total: '' },
        persenTabs: [
            { id: 'diskon', label: '🏷️ Diskon' },
            { id: 'dari',   label: '📊 % dari' },
            { id: 'naik',   label: '📈 Naik/Turun' },
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

        // ── Hasil ──
        hasilKalkulasi: 0,
        hasilMulti: [],   // [{label, nilai}] untuk persen/pecahan

        // ── Riwayat ──
        riwayat: [],
        tampilkanRiwayat: true,

        // ── PWA ──
        showInstallBtn: false,
        showIosBanner: false,
    },

    mounted() {
        const saved = localStorage.getItem('wa_kalkulator_riwayat');
        if (saved) { try { this.riwayat = JSON.parse(saved); } catch(e) {} }

        if (isIos() && !isInStandaloneMode() && !localStorage.getItem('ios_banner_tutup')) {
            this.showIosBanner = true;
        }

        // Init fade indicator setelah DOM siap
        this.$nextTick(() => this.updateFade());
    },

    computed: {
        // Standar — format ribuan input
        billFormat: {
            get() { return formatRibuan(this.bill); },
            set(v) { this.bill = v.replace(/\./g, '').replace(/[^0-9]/g, ''); }
        },
        bil2Format: {
            get() { return formatRibuan(this.bil2); },
            set(v) { this.bil2 = v.replace(/\./g, '').replace(/[^0-9]/g, ''); }
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
        // ── PWA ──────────────────────────────────────────────
        async installApp() {
            if (!deferredInstallPrompt) return;
            deferredInstallPrompt.prompt();
            const { outcome } = await deferredInstallPrompt.userChoice;
            deferredInstallPrompt = null;
            this.showInstallBtn = false;
        },
        tutupIosBanner() {
            this.showIosBanner = false;
            localStorage.setItem('ios_banner_tutup', '1');
        },

        // ── Navigasi Tab ──────────────────────────────────────
        gantiMode(id) {
            this.modeAktif = id;
            this.resetHasil();
            this.$nextTick(() => this.scrollToActiveTab());
        },

        // Scroll container agar tab aktif selalu terlihat
        scrollToActiveTab() {
            const container = this.$refs.tabsScroll;
            if (!container) return;
            const activeBtn = container.querySelector('.tab-btn.active');
            if (!activeBtn) return;
            const containerRect = container.getBoundingClientRect();
            const btnRect = activeBtn.getBoundingClientRect();
            const offset = btnRect.left - containerRect.left - (containerRect.width / 2) + (btnRect.width / 2);
            container.scrollBy({ left: offset, behavior: 'smooth' });
        },

        // Update kelas fade kiri/kanan berdasarkan posisi scroll
        updateFade() {
            const el = this.$refs.tabsScroll;
            const wrapper = this.$refs.tabsWrapper;
            if (!el || !wrapper) return;
            const scrollLeft = el.scrollLeft;
            const maxScroll  = el.scrollWidth - el.clientWidth;
            wrapper.classList.toggle('show-left',  scrollLeft > 4);
            wrapper.classList.toggle('hide-right', scrollLeft >= maxScroll - 4);
        },
        resetHasil() {
            this.hasilKalkulasi = 0;
            this.hasilMulti = [];
        },

        // ── Dispatcher Tombol Hitung ──────────────────────────
        hitungAktif() {
            const map = {
                standar: 'hitung',
                desimal: 'hitungDesimal',
                pecahan: 'hitungPecahan',
                persen:  'hitungPersen',
                pangkat: 'hitungPangkat',
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

        // ── MODE: STANDAR ─────────────────────────────────────
        hitung() {
            if (this.bill === '' || this.bil2 === '') { this.hasilKalkulasi = 0; return; }
            const a = parseFloat(this.bill), b = parseFloat(this.bil2);
            let hasil = 0, simbol = this.operasi;
            switch (this.operasi) {
                case '+': hasil = a + b; break;
                case '-': hasil = a - b; break;
                case '*': hasil = a * b; simbol = '×'; break;
                case '/':
                    hasil = b !== 0 ? a / b : 'Tidak bisa dibagi 0';
                    simbol = '÷'; break;
            }
            this.hasilKalkulasi = hasil;
            this.hasilMulti = [];
            const total = typeof hasil === 'number' ? formatDesimal(hasil) : hasil;
            this.tambahRiwayat(`${formatRibuan(a)} ${simbol} ${formatRibuan(b)} =`, total);
        },

        // ── MODE: DESIMAL ─────────────────────────────────────
        hitungDesimal() {
            const rawA = this.desimal.a.replace(',', '.');
            const rawB = this.desimal.b.replace(',', '.');
            if (rawA === '' || rawB === '') { this.hasilKalkulasi = 0; return; }
            const a = parseFloat(rawA), b = parseFloat(rawB);
            if (isNaN(a) || isNaN(b)) { this.hasilKalkulasi = 'Input tidak valid'; return; }
            let hasil = 0, simbol = this.desimal.op;
            switch (this.desimal.op) {
                case '+': hasil = a + b; break;
                case '-': hasil = a - b; break;
                case '*': hasil = a * b; simbol = '×'; break;
                case '/':
                    hasil = b !== 0 ? a / b : 'Tidak bisa dibagi 0';
                    simbol = '÷'; break;
            }
            this.hasilKalkulasi = hasil;
            this.hasilMulti = [];
            const total = typeof hasil === 'number' ? formatDesimal(hasil) : hasil;
            this.tambahRiwayat(`${a} ${simbol} ${b} =`, total);
        },

        // ── MODE: PECAHAN ─────────────────────────────────────
        hitungPecahan() {
            const an = parseInt(this.pecahan.a_num), ad = parseInt(this.pecahan.a_den);
            const bn = parseInt(this.pecahan.b_num), bd = parseInt(this.pecahan.b_den);
            if ([an,ad,bn,bd].some(isNaN)) { this.hasilKalkulasi = 'Isi semua field'; return; }
            if (ad === 0 || bd === 0) { this.hasilKalkulasi = 'Penyebut ≠ 0'; return; }

            const hasil = operasiPecahan(an, ad, this.pecahan.op, bn, bd);
            if (hasil.err) { this.hasilKalkulasi = hasil.err; this.hasilMulti = []; return; }

            const { num, den } = hasil;
            const desimalVal = num / den;
            const tampilPecahan = den === 1 ? `${num}` : `${num}/${den}`;
            const tampilDesimal = formatDesimal(desimalVal);

            this.hasilMulti = [
                { label: 'Pecahan:', nilai: tampilPecahan },
                { label: 'Desimal:', nilai: tampilDesimal },
            ];
            this.hasilKalkulasi = 0;

            const opSimbol = { '+':'+', '-':'−', '*':'×', '/':'÷' }[this.pecahan.op];
            this.tambahRiwayat(
                `${an}/${ad} ${opSimbol} ${bn}/${bd} =`,
                tampilPecahan
            );
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

        // ── Reset ─────────────────────────────────────────────
        resetKalkulator() {
            this.bill = ''; this.bil2 = ''; this.operasi = '+';
            this.desimal = { a: '', b: '', op: '+' };
            this.pecahan = { a_num: '', a_den: '', b_num: '', b_den: '', op: '+' };
            this.persen.harga = ''; this.persen.pct = '';
            this.persen.nilai = ''; this.persen.total = '';
            this.pangkat.a = ''; this.pangkat.n = '';
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
