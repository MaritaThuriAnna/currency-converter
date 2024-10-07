// endpoint = 'latest'
access_key = '33b2ec2025ff2b88ad3c0f772d4853cf';

const fromCurrency = 'EUR';   
const toCurrency = 'JPY';    
const amount = 25;

const url = `https://api.exchangeratesapi.io/v1/latest?access_key=${access_key}&from=${fromCurrency}&to=${toCurrency}&amount=${amount}`;

fetch(url)
    .then(response => response.json())  
    .then(data => {
        console.log('Full API Response:', data);
        if (data.success) {
            const rates = data.rates;

            const fromRate = rates[fromCurrency];
            const toRate = rates[toCurrency];
            if (fromRate && toRate) {
                const convertedAmount = (amount / fromRate) * toRate;
                console.log(amount.toFixed(2) + " " + fromCurrency + " is " + convertedAmount.toFixed(2) + " " + toCurrency);
                // console.log("Converted Amount: " +  convertedAmount.toFixed(2) + " " + toCurrency);
            } else {
                alert("Error: One of the selected currencies is not available in the API response.");
            }
        } else {
            console.error('API Error:', data.error);
            alert('Error: ${data.error.info}');
        }
    }).catch(error => {
        console.error('Error fetching the exchange rates:', error);
    });
