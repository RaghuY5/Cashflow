const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const typeInputs = document.getElementsByName('type');
const toggleHistoryBtn = document.getElementById('toggle-history-btn');

// Toggle History
toggleHistoryBtn.addEventListener('click', () => {
    list.classList.toggle('hidden');
    if (list.classList.contains('hidden')) {
        toggleHistoryBtn.innerText = 'Show History';
    } else {
        toggleHistoryBtn.innerText = 'Hide History';
    }
});

// Get transactions from local storage
const localStorageTransactions = JSON.parse(
    localStorage.getItem('transactions')
);

let transactions =
    localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Add transaction
function addTransaction(e) {
    e.preventDefault();

    if (text.value.trim() === '' || amount.value.trim() === '') {
        alert('Please add a text and amount');
        return;
    }

    // Determine transaction type from radio buttons
    let type = 'income';
    for (const input of typeInputs) {
        if (input.checked) {
            type = input.value;
            break;
        }
    }

    // Calculate value: Positive for income, Negative for expense
    // We use Math.abs to ensure user input is treated as magnitude
    let transactionAmount = Math.abs(+amount.value);
    if (type === 'expense') {
        transactionAmount = -transactionAmount;
    }

    const transaction = {
        id: generateID(),
        text: text.value,
        amount: transactionAmount,
        date: new Date().toLocaleString()
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);

    updateValues();

    updateLocalStorage();

    text.value = '';
    amount.value = '';
}

// Generate random ID
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Add transactions to DOM list
function addTransactionDOM(transaction) {
    // Get sign
    const sign = transaction.amount < 0 ? '-' : '+';

    const item = document.createElement('li');

    // Add class based on value
    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

    item.innerHTML = `
    <div class="transaction-info">
        <span>${transaction.text}</span>
        <span class="transaction-date">${transaction.date || new Date().toLocaleString()}</span>
    </div>
    <span>${sign}${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})"><i class="fas fa-times"></i></button>
  `;

    list.appendChild(item);
}

// Update the balance, income and expense
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);

    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);

    const expense = (
        amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) *
        -1
    ).toFixed(2);

    balance.innerText = `Rs. ${total}`;
    money_plus.innerText = `+RS. ${income}`;
    money_minus.innerText = `-Rs. ${expense}`;
}

// Remove transaction by ID
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);

    updateLocalStorage();

    init();
}

// Update local storage transactions
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Init app
function init() {
    list.innerHTML = '';

    transactions.forEach(addTransactionDOM);
    updateValues();
}

init();

form.addEventListener('submit', addTransaction);
