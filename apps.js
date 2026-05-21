var app = new Vue({
    el: '#app',
    data: {
        bill: '',
        bil2: '',
        operasi: '+', // Nilai awal diset '+' agar siap digunakan & tidak bernilai null
    },
    computed: {
        hasil() {
            // Jika salah satu kolom input masih kosong, tampilkan angka 0
            if (this.bill === '' || this.bil2 === '') {
                return 0;
            }
            
            // Konversi nilai input (string) menjadi angka pecahan/desimal
            let angka1 = parseFloat(this.bill);
            let angka2 = parseFloat(this.bil2);

            // Logika kalkulator menggunakan switch-case (jauh lebih aman dibanding eval)
            switch(this.operasi) {
                case '+': 
                    return angka1 + angka2;
                case '-': 
                    return angka1 - angka2;
                case '*': 
                    return angka1 * angka2;
                case '/': 
                    // Validasi agar tidak memunculkan hasil Infinity saat dibagi angka 0
                    return angka2 !== 0 ? angka1 / angka2 : 'Tidak bisa dibagi 0';
                default: 
                    return 0;
            }
        }
    }
});