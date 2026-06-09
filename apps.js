var app = new Vue({
    el: '#app',
    data: {
        bill: '',
        bil2: '',
        operasi: '+', 
    },
    computed: {
        hasil() {
            if (this.bill === '' || this.bil2 === '') {
                return 0;
            }
            
            let angka1 = parseFloat(this.bill);
            let angka2 = parseFloat(this.bil2);

            switch(this.operasi) {
                case '+': 
                    return angka1 + angka2;
                case '-': 
                    return angka1 - angka2;
                case '*': 
                    return angka1 * angka2;
                case '/': 
                    return angka2 !== 0 ? angka1 / angka2 : 'Tidak bisa dibagi 0';
                default: 
                    return 0;
            }
        }
    }
});
