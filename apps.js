var app = new Vue({
    el: '#app',
    data: {
        bill: '', // Menyimpan data murni angka pertama
        bil2: '', // Menyimpan data murni angka kedua
        operasi: '+', 
        hasilKalkulasi: 0,
        riwayat: [], // Nanti akan diisi dari localStorage saat di-mount
        tampilkanRiwayat: true 
    },
    // Fungsi yang otomatis berjalan saat aplikasi pertama kali dimuat
    mounted() {
        const riwayatTersimpan = localStorage.getItem('wa_kalkulator_riwayat');
        if (riwayatTersimpan) {
            this.riwayat = JSON.parse(riwayatTersimpan);
        }
    },
    computed: {
        // Interseptor untuk memformat tampilan input 1 secara real-time
        billFormat: {
            get() {
                return this.formatRibuan(this.bill);
            },
            set(v_baru) {
                this.bill = v_baru.replace(/\./g, '').replace(/[^0-9]/g, '');
            }
        },
        // Interseptor untuk memformat tampilan input 2 secara real-time
        bil2Format: {
            get() {
                return this.formatRibuan(this.bil2);
            },
            set(v_baru) {
                this.bil2 = v_baru.replace(/\./g, '').replace(/[^0-9]/g, '');
            }
        }
    },
    methods: {
        // Helper Fungsi Pemisah Ribuan (Thousand Separator)
        formatRibuan(nilai) {
            if (nilai === '' || nilai === null || nilai === undefined) return '';
            if (typeof nilai === 'string' && isNaN(Number(nilai))) return nilai; 
            
            let parts = nilai.toString().split(',');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return parts.join(',');
        },
        // Fungsi pembantu untuk menyimpan perubahan riwayat ke localStorage
        simpanKeStorage() {
            localStorage.setItem('wa_kalkulator_riwayat', JSON.stringify(this.riwayat));
        },
        hitung() {
            if (this.bill === '' || this.bil2 === '') {
                this.hasilKalkulasi = 0;
                return;
            }
            
            let angka1 = parseFloat(this.bill);
            let angka2 = parseFloat(this.bil2);
            let hasil = 0;
            let simbolOperasi = this.operasi;

            if (simbolOperasi === '*') simbolOperasi = 'x';

            switch(this.operasi) {
                case '+': 
                    hasil = angka1 + angka2;
                    break;
                case '-': 
                    hasil = angka1 - angka2;
                    break;
                case '*': 
                    hasil = angka1 * angka2;
                    break;
                case '/': 
                    hasil = angka2 !== 0 ? angka1 / angka2 : 'Tidak bisa dibagi 0';
                    break;
                default: 
                    hasil = 0;
            }

            this.hasilKalkulasi = hasil;

            // Memasukkan log pencatatan berformat finansial ke dalam riwayat chat
            this.riwayat.unshift({
                id: Date.now(),
                teks: `${this.formatRibuan(angka1)} ${simbolOperasi} ${this.formatRibuan(angka2)} = `,
                total: this.formatRibuan(hasil),
                waktu: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            // Simpan perubahan ke storage
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
            
            if (document.activeElement) {
                document.activeElement.blur();
            }
        },
        hapusSatu(id) {
            this.riwayat = this.riwayat.filter(item => item.id !== id);
            // Simpan perubahan setelah ada item yang dihapus
            this.simpanKeStorage();
        },
        hapusSemua() {
            this.riwayat = [];
            // Hapus data dari storage karena sudah dikosongkan
            localStorage.removeItem('wa_kalkulator_riwayat');
        }
    }
});
