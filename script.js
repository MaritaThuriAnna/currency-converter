import config from './config.js';

const fromCurrency = 'EUR';
const toCurrency = 'RON';
const amount = 25;

const primaryUrl = `https://api.exchangeratesapi.io/v1/latest?access_key=${config.primaryApiKey}`;
const fallbackUrl = `https://v6.exchangerate-api.com/v6/${config.fallbackApiKey}/latest/USD`;

const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');

function fetchFromPrimaryAPI() {
    fetch(primaryUrl)
        .then(response => response.json())
        .then(data => {

            console.log('Primary API Response:', data);

            if (data.success) {
                const rates = data.rates;

                selectCurrency(rates, fromCurrencySelect);
                selectCurrency(rates, toCurrencySelect);

                const fromRate = rates[fromCurrency];
                const toRate = rates[toCurrency];

                if (fromRate && toRate) {
                    const convertedAmount = (amount / fromRate) * toRate;
                    console.log(amount.toFixed(2) + " " + fromCurrency + " is " + convertedAmount.toFixed(2) + " " + toCurrency);
                } else {
                    alert("Error: One of the selected currencies is not available in the API response.");
                }

            } else {
                console.error('API Error:', data.error);
                alert('Error: ${data.error.info}');
            }
        }).catch(error => {
            console.error('Error fetching the exchange rates from the primary API: ', error);
            fetchFromFallbackAPI();
        });
}

function fetchFromFallbackAPI() {
    fetch(fallbackUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Secondary API Response:', data);

            if (data.result == "success") {
                const rates = data.conversion_rates;

                selectCurrency(rates, fromCurrencySelect);
                selectCurrency(rates, toCurrencySelect);

                const fromRate = rates[fromCurrency];
                const toRate = rates[toCurrency];

                if (fromRate && toRate) {
                    const convertedAmount = (amount / fromRate) * toRate;
                    console.log(amount.toFixed(2) + " " + fromCurrency + " is " + convertedAmount.toFixed(2) + " " + toCurrency);
                } else {
                    alert("Error: One of the selected currencies is not available in the API response.");
                }
            }
            else {
                console.error('Fallback API Error:', data['error-type']);
                alert("Error: ${data['error-type']}");
            }
        }).catch(error => {
            console.error('Error fetching the exchange rates from the fallback API:', error);
            alert('Error: Unable to fetch exchange rates from both APIs.');
        });
}

fetchFromPrimaryAPI();

function selectCurrency(rates, selectElement) {
    for (const currency in rates) {
        const option = document.createElement('option');
        option.value = currency;
        option.text = currency;
        selectElement.appendChild(option);
    }
}

