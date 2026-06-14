// ============================================================
//  Kalkulator WhatsApp — apps.js
//  Versi PWA: mendukung install prompt Android & banner iOS
// ============================================================

// Simpan event beforeinstallprompt agar bisa dipanggil nanti
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Tahan prompt browser default
    deferredInstallPrompt = e;

    // Beri tahu Vue agar tombol Install muncul
    if (window.vueApp) {
        window.vueApp.showInstallBtn = true;
    }
});

// Deteksi jika app sudah berjalan sebagai PWA (standalone)
window.addEventListener('appinstalled', () => {
    console.log('✅ PWA berhasil di-install!');
    deferredInstallPrompt = null;
    if (window.vueApp) {
        window.vueApp.showInstallBtn = false;
    }
});

// Deteksi iOS Safari (tidak ada beforeinstallprompt di iOS)
function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isInStandaloneMode() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// ============================================================
//  Vue Instance
// ============================================================
window.vueApp = new Vue({
    el: '#app',
    data: {
        bill: '',
        bil2: '',
        operasi: '+',
        hasilKalkulasi: 0,
        riwayat: [],
        tampilkanRiwayat: true,

        // --- PWA Install State ---
        showInstallBtn: false,   // Tombol install di header (Android / Chrome)
        showIosBanner: false,    // Banner petunjuk manual untuk iOS
    },

    mounted() {
        // Muat riwayat dari localStorage
        const tersimpan = localStorage.getItem('wa_kalkulator_riwayat');
        if (tersimpan) {
            try { this.riwayat = JSON.parse(tersimpan); } catch (e) { this.riwayat = []; }
        }

        // Tampilkan banner iOS jika belum terinstall & belum pernah ditutup
        if (isIos() && !isInStandaloneMode()) {
            const sudahTutup = localStorage.getItem('ios_banner_tutup');
            if (!sudahTutup) {
                this.showIosBanner = true;
            }
        }
    },

    computed: {
        billFormat: {
            get() { return this.formatRibuan(this.bill); },
            set(v) { this.bill = v.replace(/\./g, '').replace(/[^0-9]/g, ''); }
        },
        bil2Format: {
            get() { return this.formatRibuan(this.bil2); },
            set(v) { this.bil2 = v.replace(/\./g, '').replace(/[^0-9]/g, ''); }
        }
    },

    methods: {
        // --------------------------------------------------------
        //  PWA Install
        // --------------------------------------------------------
        async installApp() {
            if (!deferredInstallPrompt) return;
            deferredInstallPrompt.prompt();
            const { outcome } = await deferredInstallPrompt.userChoice;
            console.log('Install outcome:', outcome);
            deferredInstallPrompt = null;
            this.showInstallBtn = false;
        },

        tutupIosBanner() {
            this.showIosBanner = false;
            localStorage.setItem('ios_banner_tutup', '1');
        },

        // --------------------------------------------------------
        //  Kalkulator
        // --------------------------------------------------------
        formatRibuan(nilai) {
            if (nilai === '' || nilai === null || nilai === undefined) return '';
            if (typeof nilai === 'string' && isNaN(Number(nilai))) return nilai;
            let parts = nilai.toString().split(',');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            return parts.join(',');
        },

        simpanKeStorage() {
            localStorage.setItem('wa_kalkulator_riwayat', JSON.stringify(this.riwayat));
        },

        hitung() {
            if (this.bill === '' || this.bil2 === '') {
                this.hasilKalkulasi = 0;
                return;
            }

            const angka1 = parseFloat(this.bill);
            const angka2 = parseFloat(this.bil2);
            let hasil = 0;
            let simbolTampil = this.operasi;

            switch (this.operasi) {
                case '+': hasil = angka1 + angka2; break;
                case '-': hasil = angka1 - angka2; break;
                case '*': hasil = angka1 * angka2; simbolTampil = '×'; break;
                case '/':
                    hasil = angka2 !== 0 ? angka1 / angka2 : 'Tidak bisa dibagi 0';
                    simbolTampil = '÷';
                    break;
                default: hasil = 0;
            }

            this.hasilKalkulasi = hasil;

            this.riwayat.unshift({
                id: Date.now(),
                teks: `${this.formatRibuan(angka1)} ${simbolTampil} ${this.formatRibuan(angka2)} = `,
                total: typeof hasil === 'number' ? this.formatRibuan(hasil) : hasil,
                waktu: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            this.simpanKeStorage();
            this.tampilkanRiwayat = true;
        },

        toggleRiwayat() {
            this.tampilkanRiwayat = !this.tampilkanRiwayat;
        },

        resetKalkulator() {
            this.bill = '';
            this.bil2 = '';
            this.operasi = '+';
            this.hasilKalkulasi = 0;
            if (document.activeElement) document.activeElement.blur();
        },

        hapusSatu(id) {
            this.riwayat = this.riwayat.filter(item => item.id !== id);
            this.simpanKeStorage();
        },

        hapusSemua() {
            this.riwayat = [];
            localStorage.removeItem('wa_kalkulator_riwayat');
        }
    }
});
