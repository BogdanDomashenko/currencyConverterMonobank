import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import cc from 'currency-codes'


new Vue({
    el: '#app',
    data: {
        ammout: '',
        convertFrom: 'USD',
        convertTo: 'UAH',
        convertationRes: '',
        currencyCourses: [],
        currencyNameList: [],
        convertFromFixed: '',
        convertToFixed: '',
    },
    mounted: function() {
        axios.get("https://api.monobank.ua/bank/currency").then((response) => {
            this.currencyCourses = response.data;

            this.currencyNameList.push('UAH');
            for (let course of this.currencyCourses) {
               let countryName = this.convertCurrencyCode(course.currencyCodeA);
               if (countryName) this.currencyNameList.push(countryName);
            }
        });
    },
    methods: {
        convert: function() {
            this.convertFromFixed = this.convertFrom;
            this.convertToFixed = this.convertTo;

            let convertFromCode = cc.code(this.convertFrom).number;
            let convertToCode = cc.code(this.convertTo).number;


            if (this.convertFrom != 'UAH' && this.convertTo == 'UAH') {
                this.convertationRes = convertAnyToUah(this.currencyCourses, convertFromCode, this.ammout);
            }
            
            else if (this.convertFrom == 'UAH' && this.convertTo != 'UAH') {
                this.convertationRes = convertUahToAny(this.currencyCourses, convertToCode, this.ammout);
            }

            else {
                this.convertationRes = convertAnyToAny(this.currencyCourses, convertFromCode, convertToCode, this.ammout);
            }

            function convertAnyToUah(currencyCourses, convertFrom, ammout) {
                let res = currencyCourses.find(course => course.currencyCodeA == convertFrom);
                if (res.rateBuy) {
                    return {buy: res.rateBuy*ammout, sell: res.rateSell*ammout};
                }
                return {buy: res.rateCross*ammout, sell: res.rateCross*ammout};
            }

            function convertUahToAny(currencyCourses, convertTo, ammout) {
                let res = currencyCourses.find(course => course.currencyCodeA == convertTo);
                if (res.rateBuy) {
                    return {buy: ammout/res.rateBuy, sell: ammout/res.rateSell};
                }
                return {buy: ammout/res.rateCross, sell: ammout/res.rateCross};
            }

            function convertAnyToAny(currencyCourses, convertFrom, convertTo, ammout) {
                let convertedToUah = convertAnyToUah(currencyCourses, convertFrom, ammout);
                
                let res = currencyCourses.find(course => course.currencyCodeA == convertTo);
                if (res.rateBuy) {
                    return {buy: convertedToUah.buy/res.rateBuy, sell: convertedToUah.sell/res.rateSell};
                }
                return {buy: convertedToUah.buy/res.rateCross, sell: convertedToUah.sell/res.rateCross};
            }
        },
        convertCurrencyCode: function(currencyCode) {
            try {
                return cc.number(parseInt(currencyCode)).code;
            } catch {

            }
        },
        roundToTenths: function (num) {
            return Math.round((num)*100)/100;
        }
    },
    computed: {

    }
});