// DOM Elements
const display = document.getElementById('display');
const expressionDisplay = document.getElementById('expression-display');
const operatorDisplay = document.getElementById('operator-display');
const historyList = document.getElementById('history-list');
const decimalPlaces = document.getElementById('decimal-places');

// Initialize variables
let currentInput = '';
let previousInput = '';
let operation = null;
let shouldResetDisplay = false;
let waitingForSecondNumber = false;
let history = [];

// Constants
const MAX_HISTORY = 10;
const operatorSymbols = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
    '%': '%',
    'sqrt': '√',
    'pow2': '²',
    'pow3': '³',
    'powy': '^',
    'sin': 'sin',
    'cos': 'cos',
    'tan': 'tan',
    'log': 'log',
    'ln': 'ln',
    'fact': '!'
};

// Mode switching
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const mode = btn.dataset.mode;
        document.querySelector('.scientific-buttons').style.display =
            mode === 'scientific' ? 'grid' : 'none';
    });
});

// Add click event listener for all buttons
document.querySelector('.buttons-container').addEventListener('click', (e) => {
    const value = e.target.value;
    handleInput(value);
});

// Add keyboard support
document.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (/^[0-9.]$/.test(e.key)) {
        handleInput(e.key);
    }
    else if (['+', '-', '*', '/', 'powy', '%'].includes(e.key)) {
        handleInput(e.key);
    }
    else if (e.key === 'Enter') {
        handleInput('=');
    }
    else if (e.key === 'Backspace') {
        handleInput('backspace');
    }
    else if (e.key === 'Escape') {
        handleInput('clear');
    }
});

// Handle all inputs (both keyboard and click)
function handleInput(value) {
    if (!isNaN(value) || value === '.') {
        handleNumber(value);
        waitingForSecondNumber = false;
    } else if (['sin', 'cos', 'tan', 'sqrt', 'pow2', 'pow3', 'log', 'ln', 'fact', 'pi', 'e'].includes(value)) {
        handleScientific(value);
    } else {
        handleOperator(value);
    }
    updateDisplay();
}

// Handle number inputs
function handleNumber(num) {
    if (shouldResetDisplay) {
        currentInput = '';
        shouldResetDisplay = false;
    }
    if (num === '.' && currentInput.includes('.')) return;
    currentInput += num;
}

//! HANDLE SPECİFİC AND ONLY ONE OPERATION
function handleScientific(op) {
    const current = parseFloat(currentInput);
    if (isNaN(current) && !['pi', 'e'].includes(op)) return;
    let result;
    switch (op) {
        case 'sin':
            result = Math.sin(current);
            addToHistory(`sin(${current}) = ${result}`);
            break;
        case 'cos':
            result = Math.cos(current);
            addToHistory(`cos(${current}) = ${result}`);
            break;
        case 'tan':
            result = Math.tan(current);
            addToHistory(`tan(${current}) = ${result}`);
            break;
        case 'sqrt':
            result = Math.sqrt(current);
            addToHistory(`√${current} = ${result}`);
            break;
        case 'pow2':
            result = Math.pow(current, 2);
            addToHistory(`${current}² = ${result}`);
            break;
        case 'pow3':
            result = Math.pow(current, 3);
            addToHistory(`${current}³ = ${result}`);
            break;
        case 'log':
            result = Math.log10(current);
            addToHistory(`log(${current}) = ${result}`);
            break;
        case 'ln':
            result = Math.log(current);
            addToHistory(`ln(${current}) = ${result}`);
            break;
        case 'fact':
            result = factorial(current);
            addToHistory(`${current}! = ${result}`);
            break;
        case 'pi':
            result = Math.PI;
            addToHistory(`π = ${result}`);
            break;
        case 'e':
            result = Math.E;
            addToHistory(`e = ${result}`);
            break;
    }

    if (!isNaN(result)) {
        currentInput = formatNumber(result);
        shouldResetDisplay = true;
    }
}

// Handle operator inputs
function handleOperator(op) {
    switch (op) {
        case 'clear':
            currentInput = '';
            previousInput = '';
            operation = null;
            operatorDisplay.textContent = '';
            expressionDisplay.textContent = '';
            waitingForSecondNumber = false;
            break;

        case 'backspace':
            currentInput = currentInput.slice(0, -1);
            break;

        case '=':
            if (operation && previousInput && currentInput) {
                const result = calculate();
                addToHistory(`${previousInput} ${operatorSymbols[operation]} ${currentInput} = ${result}`);
                currentInput = result;
                previousInput = '';
                operation = null;
                operatorDisplay.textContent = '';
                expressionDisplay.textContent = '';
                shouldResetDisplay = true;
                waitingForSecondNumber = false;
            }
            break;

        default:
            if (currentInput || previousInput) {
                if (waitingForSecondNumber) {
                    operation = op;
                    operatorDisplay.textContent = operatorSymbols[op] || op;
                    expressionDisplay.textContent = `${previousInput} ${operatorSymbols[op]} ${currentInput}`;
                } else {
                    if (previousInput && currentInput) {
                        currentInput = calculate();
                    }
                    operation = op;
                    previousInput = currentInput || previousInput;
                    shouldResetDisplay = true;
                    waitingForSecondNumber = true;
                    operatorDisplay.textContent = operatorSymbols[op] || op;
                    expressionDisplay.textContent = `${previousInput} ${operatorSymbols[op]}`;
                }
            }
    }
}

//! PERFORM MATHEMATICAL CALCULATIONS
function calculate() {
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(current)) return '';

    let result;
    switch (operation) {
        case 'powy':
            result = Math.pow(prev, current);
            break;
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            result = prev / current;
            break;
        case '%':
            result = (prev * current) / 100;
            break;
        default:
            return '';
    }

    return formatNumber(result);
}

// Update display
function updateDisplay() {
    display.value = currentInput || '0';
}

// Format number based on decimal places setting
function formatNumber(num) {
    const places = parseInt(decimalPlaces.value);
    return Number(num).toFixed(places);
}

// Add calculation to history
function addToHistory(expression) {
    history.unshift(expression);
    if (history.length > MAX_HISTORY) {
        history.pop();
    }
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    historyList.innerHTML = history.map(item => `<div class="history-item">${item}</div>`).join('');
}

// Clear history
document.getElementById('clear-history').addEventListener('click', () => {
    history = [];
    updateHistoryDisplay();
});

// Helper function for factorial
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0) return 1;
    let result = 1;
    for (let i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
} 