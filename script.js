const balanceEl = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const source = document.getElementById('source');
const typeToggle = document.getElementById('type-toggle');
const dateInput = document.getElementById('date');
const incomeLabel = document.querySelector('.toggle-label.income');
const expenseLabel = document.querySelector('.toggle-label.expense');

// Breakdown Elements
const bankInc = document.getElementById('bank-inc');
const bankExp = document.getElementById('bank-exp');
const cardInc = document.getElementById('card-inc');
const cardExp = document.getElementById('card-exp');
const cashInc = document.getElementById('cash-inc');
const cashExp = document.getElementById('cash-exp');

// Toggle History Button
const toggleHistoryBtn = document.getElementById('toggle-history-btn');
const historySection = document.querySelector('.transactions-container');

if (toggleHistoryBtn) {
    toggleHistoryBtn.addEventListener('click', () => {
        historySection.classList.toggle('show');
        const isShown = historySection.classList.contains('show');
        toggleHistoryBtn.innerText = isShown ? 'Hide History' : 'Show History';
    });
}

// Set today's date as default
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;

// Initialize Toggle State
updateToggleVisuals();

// Toggle Event Listener
typeToggle.addEventListener('change', updateToggleVisuals);

function updateToggleVisuals() {
    if (typeToggle.checked) {
        // Expense
        expenseLabel.classList.add('active');
        incomeLabel.classList.remove('active');
    } else {
        // Income
        incomeLabel.classList.add('active');
        expenseLabel.classList.remove('active');
    }
}

const localStorageKey = 'transactions';

let transactions = localStorage.getItem(localStorageKey) !== null ?
    JSON.parse(localStorage.getItem(localStorageKey)) : [];

// Add transaction
function addTransaction(e) {
    e.preventDefault();

    const textValue = text.value.trim();
    const amountValue = amount.value.trim();
    let isValid = true;

    if (textValue === '') {
        showError(text, 'Please add a description');
        isValid = false;
    } else {
        showSuccess(text);
    }

    if (amountValue === '') {
        showError(amount, 'Please add an amount');
        isValid = false;
    } else {
        showSuccess(amount);
    }

    if (!isValid) return;

    const transactionType = typeToggle.checked ? 'expense' : 'income';

    const transaction = {
        id: generateID(),
        text: textValue,
        amount: transactionType === 'expense' ? -Math.abs(+amountValue) : Math.abs(+amountValue),
        type: transactionType,
        source: source.value,
        date: dateInput.value
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();

    text.value = '';
    amount.value = '';
    dateInput.value = today; // Reset to today

    // Clear success states
    showSuccess(text);
    showSuccess(amount);
    text.parentElement.classList.remove('success');
    amount.parentElement.classList.remove('success');
}

// Generate random ID
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Add transactions to DOM list
function addTransactionDOM(transaction) {
    // Get sign
    const sign = transaction.amount < 0 ? '-' : '+';
    const itemClass = transaction.amount < 0 ? 'minus' : 'plus';

    const item = document.createElement('li');
    item.classList.add(itemClass);

    item.innerHTML = `
        <div style="flex:1;">
            <div>${transaction.text} <small style="color:#777">(${transaction.source || 'cash'})</small></div>
            <small>${transaction.date}</small>
        </div>
        <span>${sign}₹${Math.abs(transaction.amount).toFixed(2)}</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">×</button>
    `;

    list.prepend(item);
}

// Update the balance, income and expense
function updateValues() {
    // Filter out Credit Card transactions for the main balance/totals
    const nonCardTransactions = transactions.filter(t => t.source !== 'card');
    const amounts = nonCardTransactions.map(transaction => transaction.amount);

    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);

    const expense = (
        amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1
    ).toFixed(2);

    balanceEl.innerText = `₹${total} `;
    money_plus.innerText = `+₹${income} `;
    money_minus.innerText = `-₹${expense} `;

    // Update Breakdown (pass ALL transactions so breakdown remains accurate)
    updateBreakdown(transactions);
}

function updateBreakdown(transactions) {
    const calculateTotal = (src, type) => {
        return transactions
            .filter(t => (t.source || 'cash') === src && t.type === type)
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    };

    const updateSource = (src, incEl, expEl) => {
        const income = calculateTotal(src, 'income');
        const expense = calculateTotal(src, 'expense');
        const net = income - expense;

        incEl.innerText = `+₹${net.toFixed(2)} `;
        expEl.innerText = `-₹${expense.toFixed(2)} `;
    };

    updateSource('bank', bankInc, bankExp);
    updateSource('card', cardInc, cardExp);
    updateSource('cash', cashInc, cashExp);
}

// Remove transaction by ID
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);

    updateLocalStorage();
    init();
}

// Update local storage transactions
function updateLocalStorage() {
    localStorage.setItem(localStorageKey, JSON.stringify(transactions));
}

// Init app
function init() {
    list.innerHTML = '';

    transactions.forEach(addTransactionDOM);
    updateValues();
}

init();

form.addEventListener('submit', addTransaction);

// Show Input Error
function showError(input, message) {
    const formControl = input.parentElement;
    formControl.className = 'form-control error';
    const small = formControl.querySelector('small');
    small.innerText = message;
}

// Show Input Success
function showSuccess(input) {
    const formControl = input.parentElement;
    formControl.className = 'form-control'; // Removes 'error' class if present
}
