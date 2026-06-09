var app = new Vue({
    el: '#app',
    data: {
        bill: '',
        bil2: '',
        operasi: '+', 
        hasilKalkulasi: 0 
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

            switch(this.operasi) {
                case '+': 
                    this.hasilKalkulasi = angka1 + angka2;
                    break;
                case '-': 
                    this.hasilKalkulasi = angka1 - angka2;
                    break;
                case '*': 
                    this.hasilKalkulasi = angka1 * angka2;
                    break;
                case '/': 
                    // Validasi pembagian dengan angka 0
                    this.hasilKalkulasi = angka2 !== 0 ? angka1 / angka2 : 'Tidak bisa dibagi 0';
                    break;
                default: 
                    this.hasilKalkulasi = 0;
            }
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
        }
    }
});
