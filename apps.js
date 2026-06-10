var app = new Vue({
    el: '#app',
    data: {
        bill: '',
        bil2: '',
        operasi: '+', 
        hasilKalkulasi: 0,
        riwayat: [] // Menyimpan daftar riwayat kalkulasi
    },
    methods: {
        hitung() {
            // Jika salah satu kolom input masih kosong, set hasil ke 0
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
                    // Validasi pembagian dengan angka 0
                    hasil = angka2 !== 0 ? angka1 / angka2 : 'Tidak bisa dibagi 0';
                    break;
                default: 
                    hasil = 0;
            }

            this.hasilKalkulasi = hasil;

            // Masukkan data ke riwayat di urutan paling atas (paling baru)
            this.riwayat.unshift({
                id: Date.now(),
                teks: `${angka1} ${simbolOperasi} ${angka2} = `,
                total: hasil,
                waktu: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        },
        resetKalkulator() {
            this.bill = '';
            this.bil2 = '';
            this.operasi = '+';
            this.hasilKalkulasi = 0;
            
            // Menghilangkan kursor fokus dari input setelah reset dilakukan
            if (document.activeElement) {
                document.activeElement.blur();
            }
        },
        hapusSatu(id) {
            // Menghapus satu item dari riwayat berdasarkan ID uniknya
            this.riwayat = this.riwayat.filter(item => item.id !== id);
        },
        hapusSemua() {
            // Mengosongkan seluruh array riwayat
            this.riwayat = [];
        }
    }
});
