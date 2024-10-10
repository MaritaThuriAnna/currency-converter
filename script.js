import config from './config.js';

const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');
const amountInput = document.getElementById('amount');
const resultDisplay = document.getElementById('result');
const convertBTN = document.getElementById('convertBtn');

const primaryUrl = `https://api.exchangeratesapi.io/v1/latest?access_key=${config.primaryApiKey}`;
const fallbackUrl = `https://v6.exchangerate-api.com/v6/${config.fallbackApiKey}/latest/USD`;

function fetchFromPrimaryAPI(fromCurrency, toCurrency, amount) {
    fetch(primaryUrl)
        .then(response => response.json())
        .then(data => {

            console.log('Primary API Response:', data);

            if (data.success) {
                const rates = data.rates;
                if (!fromCurrencySelect.hasChildNodes()) {
                    selectCurrency(rates);
                }
                if (fromCurrency && toCurrency && amount) {
                    convert(rates, fromCurrency, toCurrency, amount);
                }
            } else {
                console.error('API Error:', data.error);
                fetchFromFallbackAPI(fromCurrency, toCurrency, amount);
            }
        }).catch(error => {
            console.error('Error fetching the exchange rates from the primary API: ', error);
            fetchFromFallbackAPI(fromCurrency, toCurrency, amount);
        });
}

function fetchFromFallbackAPI(fromCurrency, toCurrency, amount) {
    fetch(fallbackUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Secondary API Response:', data);

            if (data.result === "success") {
                const rates = data.conversion_rates;
                if (!fromCurrencySelect.hasChildNodes()) {
                    selectCurrency(rates);
                }
                if (fromCurrency && toCurrency && amount) {
                    convert(rates, fromCurrency, toCurrency, amount);
                }
            }
            else {
                console.error('Fallback API Error:', data['error-type']);
            }
        }).catch(error => {
            console.error('Error fetching the exchange rates from the fallback API:', error);
        });
}

function selectCurrency(rates) {
    fromCurrencySelect.innerHTML = '';
    toCurrencySelect.innerHTML = '';

    for (const currency in rates) {
        const option = document.createElement('option');
        option.value = currency;
        option.text = currency;
        fromCurrencySelect.appendChild(option.cloneNode(true));
        toCurrencySelect.appendChild(option);
    }
}

convertBTN.addEventListener('click', () => {
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    const amount = parseFloat(amountInput.value);

    if(!fromCurrency || !toCurrency || !amount || isNaN(amount)){
        resultDisplay.textContent = "please fill with valid data!";
        return;
    }
    fetchFromPrimaryAPI(fromCurrency, toCurrency, amount);
});

function convert(rates, fromCurrency, toCurrency, amount){
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];

    if (fromRate && toRate) {
        const convertedAmount = (amount / fromRate) * toRate;
        resultDisplay.textContent = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
    } else {
        resultDisplay.textContent = 'Currency conversion failed. Please try again.';
    }
}

fetchFromPrimaryAPI();