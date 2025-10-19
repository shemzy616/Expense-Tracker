// DOM Elements
const balanceEl = document.getElementById('balance');
const incomeAmountEl = document.getElementById('income-amount');
const expenseAmountEl = document.getElementById('expense-amount');
const transactionListEl = document.getElementById('transaction-list');
const transactionFormEl = document.getElementById('transaction-form');
const descriptionEl = document.getElementById('description');
const amountEl = document.getElementById('amount');
const categoryEl = document.getElementById('category');
const tagsEl = document.getElementById('tags');

// Search and Filter Elements
const searchInputEl = document.getElementById('searchInput');
const minAmountEl = document.getElementById('minAmount');
const maxAmountEl = document.getElementById('maxAmount');
const typeFilterEl = document.getElementById('typeFilter');
const applyFiltersBtn = document.getElementById('applyFilters');
const resetFiltersBtn = document.getElementById('resetFilters');

// Transaction data structure
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Format amount to currency
function formatAmount(amount) {
    return `Kes${amount.toFixed(2)}`;
}

// Calculate totals
function calculateTotals() {
    const amounts = transactions.map(transaction => transaction.amount);
    
    // Calculate balance
    const balance = amounts.reduce((acc, amount) => acc + amount, 0);
    
    // Calculate income (sum of positive amounts)
    const income = amounts
        .filter(amount => amount > 0)
        .reduce((acc, amount) => acc + amount, 0);
    
    // Calculate expenses (sum of negative amounts)
    const expense = amounts
        .filter(amount => amount < 0)
        .reduce((acc, amount) => acc + Math.abs(amount), 0);
    
    // Update DOM
    balanceEl.textContent = formatAmount(balance);
    incomeAmountEl.textContent = formatAmount(income);
    expenseAmountEl.textContent = formatAmount(expense);
}

// Add transaction to DOM
function addTransactionToDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const amount = Math.abs(transaction.amount);
    
    const li = document.createElement('li');
    li.classList.add('transaction-item');
    li.classList.add(transaction.amount < 0 ? 'expense' : 'income');
    
    li.innerHTML = `
        <div class="transaction-info">
            <span>${transaction.description}</span>
            <span class="category-badge category-${transaction.category}">${transaction.category}</span>
            ${transaction.tags.length > 0 ? `
                <div class="tags">
                    ${transaction.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
        <div>
            <span class="transaction-amount">${sign}${formatAmount(amount)}</span>
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})">×</button>
        </div>
    `;
    
    transactionListEl.appendChild(li);
}

// Calculate and display category totals
function updateCategoryTotals() {
    const categoryTotals = transactions.reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
    }, {});

    console.log('Category Totals:', 
        Object.entries(categoryTotals)
            .map(([category, amount]) => `${category}: ${formatAmount(amount)}`)
            .join(', ')
    );
}

// Remove transaction
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    saveTransactions();
    init();
}

// Add new transaction
function addTransaction(e) {
    e.preventDefault();
    
    const description = descriptionEl.value.trim();
    const amount = parseFloat(amountEl.value);
    const category = categoryEl.value;
    const tags = tagsEl.value.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
    
    if (description === '' || isNaN(amount) || category === '') {
        alert('Please add a valid description, amount, and category');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        description,
        amount,
        category,
        tags
    };
    
    transactions.push(transaction);
    saveTransactions();
    
    addTransactionToDOM(transaction);
    calculateTotals();
    updateCategoryTotals();
    
    // Clear form
    descriptionEl.value = '';
    amountEl.value = '';
    categoryEl.value = '';
    tagsEl.value = '';
}

// Filter transactions based on search and filter criteria
function filterTransactions() {
    const searchTerm = searchInputEl.value.toLowerCase();
    const minAmount = minAmountEl.value ? parseFloat(minAmountEl.value) : null;
    const maxAmount = maxAmountEl.value ? parseFloat(maxAmountEl.value) : null;
    const type = typeFilterEl.value;

    const filteredTransactions = transactions.filter(transaction => {
        // Search term filter (searches in description)
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm);

        // Amount filter
        const amount = Math.abs(transaction.amount);
        const matchesAmount = (!minAmount || amount >= minAmount) && 
                            (!maxAmount || amount <= maxAmount);

        // Type filter
        const matchesType = type === 'all' || 
                          (type === 'income' && transaction.amount > 0) ||
                          (type === 'expense' && transaction.amount < 0);

        return matchesSearch && matchesAmount && matchesType;
    });

    // Update display
    transactionListEl.innerHTML = '';
    filteredTransactions.forEach(addTransactionToDOM);
}

// Reset all filters
function resetFilters() {
    searchInputEl.value = '';
    minAmountEl.value = '';
    maxAmountEl.value = '';
    typeFilterEl.value = 'all';
    init();
}

// Initialize app
function init() {
    transactionListEl.innerHTML = '';
    transactions.forEach(addTransactionToDOM);
    calculateTotals();
}

// Event listeners
transactionFormEl.addEventListener('submit', addTransaction);
searchInputEl.addEventListener('input', filterTransactions);
applyFiltersBtn.addEventListener('click', filterTransactions);
resetFiltersBtn.addEventListener('click', resetFilters);

// Initialize app
init();
