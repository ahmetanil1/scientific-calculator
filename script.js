// DOM Elements
const display = document.getElementById('display');
const expressionDisplay = document.getElementById('expression-display');
const operatorDisplay = document.getElementById('operator-display');
const historyList = document.getElementById('history-list');
const memoryList = document.getElementById('memory-list');
const decimalPlaces = document.getElementById('decimal-places');
const angleUnit = document.getElementById('angle-unit');

// Initialize variables
let currentInput = '';
let previousInput = '';
let operation = null;
let shouldResetDisplay = false;
let waitingForSecondNumber = false;
let memory = 0;
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
        //! WE CAN CHOOSE ONLY ONE MODE AT THE SAME TIME
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        //? FİRST WE REMOVE THE ACTIVE CLASS FROM ALL BUTTONS
        btn.classList.add('active');
        //? THEN WE ADD THE ACTIVE CLASS TO THE BUTTON THAT WE CLICKED

        const mode = btn.dataset.mode;
        document.querySelector('.scientific-buttons').style.display =
            mode === 'scientific' ? 'grid' : 'none';
    });
});

//? WE ADD CLICK EVENT LISTENER FOR ALL BUTTONS
document.querySelector('.buttons-container').addEventListener('click', (e) => {
    const value = e.target.value;
    handleInput(value);
});

//? ADD KEYBOARD SUPPORT
document.addEventListener('keydown', (e) => {
    e.preventDefault();
    //TODO REGEX FOR NUMBER AND DECIMAL
    if (/^[0-9.]$/.test(e.key)) {
        //! The test() method tests for a match in a string.
        handleInput(e.key);
    }
    else if (['+', '-', '*', '/', '%'].includes(e.key)) {
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
    } else if (['mc', 'mr', 'm+', 'm-'].includes(value)) {
        handleMemory(value);
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

// Handle scientific operations
function handleScientific(op) {
    const current = parseFloat(currentInput);
    if (isNaN(current) && !['pi', 'e'].includes(op)) return;

    let result;
    switch (op) {
        case 'sin':
            result = angleUnit.value === 'deg' ?
                //TODO PERİOD
                Math.sin(current * Math.PI / 180) :
                Math.sin(current);
            break;
        case 'cos':
            result = angleUnit.value === 'deg' ?
                Math.cos(current * Math.PI / 180) :
                Math.cos(current);
            break;
        case 'tan':
            result = angleUnit.value === 'deg' ?
                Math.tan(current * Math.PI / 180) :
                Math.tan(current);
            break;
        case 'sqrt':
            result = Math.sqrt(current);
            break;
        case 'pow2':
            result = Math.pow(current, 2);
            break;
        case 'pow3':
            result = Math.pow(current, 3);
            break;
        case 'log':
            result = Math.log10(current);
            break;
        case 'ln':
            result = Math.log(current);
            break;
        case 'fact':
            result = factorial(current);
            break;
        case 'pi':
            result = Math.PI;
            break;
        case 'e':
            result = Math.E;
            break;
    }

    if (!isNaN(result)) {
        addToHistory(`${op}(${current}) = ${result}`);
        currentInput = formatNumber(result);
        shouldResetDisplay = true;
    }
}

// Handle memory operations
function handleMemory(op) {
    const current = parseFloat(currentInput);

    switch (op) {
        case 'mc': // Memory Clear: Erases the stored value in memory
            memory = 0;
            updateMemoryDisplay();
            break;
        case 'mr': // Memory Recall: Retrieves the value stored in memory
            currentInput = formatNumber(memory);
            break;
        case 'm+': // Memory Add: Adds current display value to memory
            if (!isNaN(current)) {
                memory += current;
                updateMemoryDisplay();
            }
            break;
        case 'm-': // Memory Subtract: Subtracts current display value from memory
            if (!isNaN(current)) {
                memory -= current;
                updateMemoryDisplay();
            }
            break;
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
                    expressionDisplay.textContent = `${previousInput} ${operatorSymbols[op]}`;
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

// Perform mathematical calculations
function calculate() {
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(current)) return '';

    let result;
    switch (operation) {
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
            if (current === 0) {
                alert('Cannot divide by zero!');
                return '';
            }
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

// Helper Functions
function factorial(n) {
    if (!Number.isInteger(n) || n < 0) return NaN;
    if (n === 0) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

function formatNumber(num) {
    const places = parseInt(decimalPlaces.value);
    return Number.isInteger(num) ? num.toString() : num.toFixed(places);
}

function addToHistory(expression) {
    history.unshift(expression);
    if (history.length > MAX_HISTORY) {
        history.pop();
    }
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    historyList.innerHTML = history.map(expr =>
        `<div class="history-item">${expr}</div>`
    ).join('');
}

function updateMemoryDisplay() {
    memoryList.innerHTML = memory !== 0 ?
        `<div class="memory-item">Memory: ${formatNumber(memory)}</div>` : '';
}

// Update display
function updateDisplay() {
    display.value = currentInput || '0';
} 