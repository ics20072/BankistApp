"use strict";

let loggedAccount;

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const transferMessage = document.querySelector(".transfer-message");

const displayMovements = function (movementsArr) {
  containerMovements.innerHTML = ""; //clear the container before adding new movements

  for (const [index, movement] of movementsArr.entries()) {
    const movementType = movement > 0 ? "deposit" : "withdrawal";

    const html = `<div class="movements__row">
                    <div class="movements__type movements__type--${movementType}">${index + 1}. ${movementType}</div>
                      <div class="movements__date">3 days ago</div>
                    <div class="movements__value">${movement}</div>
                  </div>`;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  }
};

const calcAndDisplayBalance = function (accountObj) {
  accountObj.balance = accountObj.movements.reduce(function (previousSum, curr) {
    return previousSum + curr;
  }, 0);

  labelBalance.textContent = `${accountObj.balance}€`;
};

const calcAndDisplaySummary = function (accountObj) {
  const income = accountObj.movements.filter((data) => data > 0).reduce((previousSum, curr) => previousSum + curr, 0);
  labelSumIn.textContent = `${income}€`;
  const charge = accountObj.movements.filter((data) => data < 0).reduce((previousSum, curr) => previousSum + curr, 0);
  labelSumOut.textContent = `${Math.abs(charge)}€`;
  const interest = accountObj.movements
    .filter((data) => data > 0)
    .map((data) => (data * accountObj.interestRate) / 100)
    .filter((interest) => interest >= 1) //To get the interest rate, it must be at least equal to 1 euros
    .reduce((previousSum, curr) => previousSum + curr, 0);
  labelSumInterest.textContent = `${interest}€`;
};

const generateUsernames = function (accountsArr) {
  for (const account of accountsArr) {
    account["username"] = account.owner
      .toLowerCase()
      .split(" ")
      .map((word) => word[0])
      .join("");
  }
};

const updateUI = function (loggedAccount) {
  displayMovements(loggedAccount.movements);
  calcAndDisplayBalance(loggedAccount);
  calcAndDisplaySummary(loggedAccount);
};

//Event Handlers
btnLogin.addEventListener("click", function (evt) {
  evt.preventDefault(); //prevent form from submitting and reloading
  loggedAccount = accounts.find(function (accountObj) {
    return accountObj.username === inputLoginUsername.value;
  });

  if (loggedAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome Back ${loggedAccount.owner.split(" ")[0]}!`; //display only the owner name
    containerApp.style.opacity = 100;
    updateUI(loggedAccount);
    inputLoginUsername.value = "";
    inputLoginPin.value = "";
    inputLoginPin.blur(); //field looses focus while logged in
  } else {
    console.log("no");
  }
});

btnTransfer.addEventListener("click", function (evt) {
  evt.preventDefault(); //prevent form from submitting and reloading
  const amount = Number(inputTransferAmount.value);
  const receiverObj = accounts.find((accountObj) => accountObj.username === inputTransferTo.value);
  if (amount > 0 && loggedAccount.balance >= amount && receiverObj && receiverObj?.username !== loggedAccount.username) {
    loggedAccount.movements.push(-amount);
    receiverObj.movements.push(amount);
    updateUI(loggedAccount);
    transferMessage.textContent = "";
    transferMessage.classList.remove("hidden-balance");
    setTimeout(() => {
      transferMessage.textContent = `Successful transaction to ${receiverObj.owner.split(" ")[0]}✅`;
      transferMessage.classList.add("hidden-balance");
    }, 200);
  }
  inputTransferAmount.value = "";
  inputTransferTo.value = "";
});

generateUsernames(accounts);
