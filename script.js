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
                // const base = data.base;
                // console.log("base: " + base);
                storeLocally(rates);
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
                storeLocally(rates);
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
        //DOM are elemente unice(pti folosi option.clone() cand faci append)
        const option1 = document.createElement('option');
        const option2 = document.createElement('option');

        option1.value = currency;
        option1.text = currency;

        option2.value = currency;
        option2.text = currency;

        fromCurrencySelect.appendChild(option1);
        toCurrencySelect.appendChild(option2);
    }
}

function convert(rates, date, fromCurrency, toCurrency, amount){
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];

    if (fromRate && toRate) {
        const convertedAmount = (amount / fromRate) * toRate;
        resultDisplay.textContent = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(4)} ${toCurrency}`;
        console.log(amount + " " + fromCurrency + " is " + convertedAmount.toFixed(4) + " " + toCurrency);
    } else {
        resultDisplay.textContent = 'You are offline. Attempting to use previous data from ' + date;
    }
}

//in caz ca nu am net
function storeLocally(rates){
    //local instead of session(ca sa nu se goleasca cand se reseteaza pagina)
    localStorage.setItem('storedRates', JSON.stringify(rates));
    localStorage.setItem('lastUpdate', new Date().toISOString()); 
}

function switchToLocal(fromCurrency, toCurrency, amount){
    const storedRates = localStorage.getItem('storedRates');

    const storedDate = localStorage.getItem('lastUpdate')
    const lastUpdateDate = new Date(storedDate);
    const year = lastUpdateDate.getFullYear();
    const month = (lastUpdateDate.getMonth() + 1).toString().padStart(2, '0');
    const day = lastUpdateDate.getDate().toString().padStart(2, '0');
    
    if(storedRates){

        const rates = JSON.parse(storedRates);
        const date = day + "/" + month + "/" + year;

        resultDisplay.textContent = "No internet access, using local data!";
        selectCurrency(rates);
        convert(rates, date, fromCurrency, toCurrency, amount);
    }
    else{
        resultDisplay.textContent = "No internet access, unable to retrieve local data!"
    }
}

convertBTN.addEventListener('click', () => {
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    const amount = parseFloat(amountInput.value);

    if(!fromCurrency || !toCurrency || !amount || isNaN(amount)){
        resultDisplay.textContent = "Please fill with valid data!";
        return;
    }

    if (navigator.onLine) {
        console.log("online");
        fetchFromPrimaryAPI(fromCurrency, toCurrency, amount);
      } else {
        console.log("offline");
        resultDisplay.textContent = "You are offline. Attempting to use cached data...";
        switchToLocal(fromCurrency, toCurrency, amount);
      }
});

if (navigator.onLine) {
    fetchFromPrimaryAPI();
} else {
    switchToLocal();
}
// switchToLocal();