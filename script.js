import config from './config.js';

//fa ceva sa fie cautaarea mai usoara dupa numele monedei

// verifici daca ei date stocate
// verifici daca datele sunt fresh
// dupa dai starte la app
// daca datele sunt mai vechi de 24 de ore 
// -> faci fetch 
// -> daca nu poti face fetch-ul iei datele salvate si afisezi mesajca sunt vechi

//verifica faca e cifra sau litera -> validator

//window onload -> incarcare valute cand deschizi pagina

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
            if (data.success) {
                const rates = data.rates;
                storeLocally(rates);
                selectCurrencyIfNeeded(rates);
                if (fromCurrency && toCurrency && amount) {
                    convert(rates, fromCurrency, toCurrency, amount);
                }
            } else {
                fetchFromFallbackAPI(fromCurrency, toCurrency, amount);
            }
        })
        .catch(() => {
            fetchFromFallbackAPI(fromCurrency, toCurrency, amount);
        });
}

function fetchFromFallbackAPI(fromCurrency, toCurrency, amount) {
    fetch(fallbackUrl)
        .then(response => response.json())
        .then(data => {
            if (data.result === "success") {
                const rates = data.conversion_rates;
                storeLocally(rates);
                selectCurrencyIfNeeded(rates);
                if (fromCurrency && toCurrency && amount) {
                    convert(rates, fromCurrency, toCurrency, amount);
                }
            }
        });
}

function selectCurrencyIfNeeded(rates) {
    if (!fromCurrencySelect.hasChildNodes()) {
        selectCurrency(rates);
    }
}

function selectCurrency(rates) {
    fromCurrencySelect.innerHTML = '';
    toCurrencySelect.innerHTML = '';

    for (const currency in rates) {
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

function convert(rates,  fromCurrency, toCurrency, amount) {
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];

    if (fromRate && toRate) {
        const convertedAmount = (amount / fromRate) * toRate;
        resultDisplay.textContent = `${amount.toFixed(3)} ${fromCurrency} = ${convertedAmount.toFixed(3)} ${toCurrency}`;
        console.log(amount.toFixed(3) + " " + fromCurrency + " is " + convertedAmount.toFixed(3) + " " + toCurrency);
    } else {
        resultDisplay.textContent = 'Offline, using cached data.' ;
    }
}

//in caz ca nu am net
function storeLocally(rates) {
    //local instead of session(ca sa nu se goleasca cand se reseteaza pagina)
    localStorage.setItem('storedRates', JSON.stringify(rates));
    localStorage.setItem('lastUpdate', new Date().toISOString());  // iso format: YYYY-MM-DDTHH:mm:ss.sssZ
}

//mai recenta de o zi
function isDataFresh() {
    const lastUpdate = localStorage.getItem('lastUpdate');
    if (!lastUpdate) return false;
    const now = new Date();
    const lastUpdateDate = new Date(lastUpdate);
    const timeDifference = (now - lastUpdateDate) / (1000 * 60 * 60);
    return timeDifference < 24;
}

function switchToLocal(fromCurrency, toCurrency, amount) {
    const storedRates = localStorage.getItem('storedRates');

    if (storedRates) {
        const rates = JSON.parse(storedRates);
        resultDisplay.textContent = "Using local data!";
        selectCurrencyIfNeeded(rates);
        if (fromCurrency && toCurrency && amount) {
            convert(rates, fromCurrency, toCurrency, amount);
        }
    } else {
        resultDisplay.textContent = "No local data available!";
    }
}

convertBTN.addEventListener('click', () => {
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    const amount = parseFloat(amountInput.value);

    if (!fromCurrency || !toCurrency || !amount || isNaN(amount)) {
        resultDisplay.textContent = "Please fill with valid data!";
        return;
    }

    if (navigator.onLine) {
        if (isDataFresh()) {
            console.log("Using fresh data from local storage");
            switchToLocal(fromCurrency, toCurrency, amount);
        } else {
            console.log("Fetching fresh data from API");
            fetchFromPrimaryAPI(fromCurrency, toCurrency, amount);
        }
    } else {
        console.log("Offline, using cached data");
        switchToLocal(fromCurrency, toCurrency, amount);
    }
});


window.onload = () => {
    if (navigator.onLine) {
        if (isDataFresh()) {
            console.log("Using fresh data from local storage");
            switchToLocal();
        } else {
            console.log("Fetching fresh data from API");
            fetchFromPrimaryAPI();
        }
    } else {
        console.log("Offline, using cached data");
        switchToLocal();
    }
};

// if (navigator.onLine) {
//     fetchFromPrimaryAPI();
// } else {
//     switchToLocal();
// }
// switchToLocal();