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
const transferError = document.querySelector(".error-transfer");
const closeAccountError = document.querySelector(".error-close-account");
const loanError = document.querySelector(".error-loan");

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

//Common functionallity for Transfers and Close Account messages
const resetInputStyle = function (message, ...inputFields) {
  for (const input of inputFields) {
    input.style.color = "#333";
  }
  message.style.visibility = "hidden";
};

const transferMessageDisplay = function (message) {
  transferMessage.classList.remove("hidden-balance");
  setTimeout(() => {
    transferMessage.textContent = message;
    transferMessage.classList.add("hidden-balance");
  }, 200);
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
  if (receiverObj && receiverObj?.username !== loggedAccount.username) {
    if (amount > 0 && loggedAccount.balance >= amount) {
      loggedAccount.movements.push(-amount);
      receiverObj.movements.push(amount);
      updateUI(loggedAccount);
      transferMessage.textContent = "";
      transferMessageDisplay(`Successful transaction to ${receiverObj.owner.split(" ")[0]}✅`);
      inputTransferAmount.value = "";
      inputTransferTo.value = "";
      resetInputStyle(transferError, inputTransferTo, inputTransferAmount);
    } else {
      resetInputStyle(transferError, inputTransferTo, inputTransferAmount);
      transferError.textContent = "The amount transferred is incorrect!❌";
      transferError.style.visibility = "visible";
      inputTransferAmount.style.color = "red";
    }
  } else {
    resetInputStyle(transferError, inputTransferTo, inputTransferAmount);
    transferError.textContent = "The bank account for transfer is incorrect!❌";
    transferError.style.visibility = "visible";
    inputTransferTo.style.color = "red";
  }
});

btnClose.addEventListener("click", function (evt) {
  evt.preventDefault(); //prevent form from submitting and reloading
  if (inputCloseUsername.value === loggedAccount.username) {
    if (inputClosePin.value === String(loggedAccount.pin)) {
      const index = accounts.findIndex(function (account) {
        return account.username === loggedAccount.username;
      });
      accounts.splice(index, 1); //remove account
      containerApp.style.opacity = 0; //Hide UI
      inputCloseUsername.value = "";
      inputClosePin.value = "";
      resetInputStyle(closeAccountError, inputCloseUsername, inputClosePin);
    } else {
      resetInputStyle(closeAccountError, inputCloseUsername, inputClosePin);
      closeAccountError.textContent = "Pin is incorrect❌";
      closeAccountError.style.visibility = "visible";
      inputClosePin.style.color = "red";
    }
  } else {
    resetInputStyle(closeAccountError, inputCloseUsername, inputClosePin);
    closeAccountError.textContent = "Username is incorrect❌";
    closeAccountError.style.visibility = "visible";
    inputCloseUsername.style.color = "red";
  }
});

btnLoan.addEventListener("click", function (evt) {
  evt.preventDefault(); //prevent form from submitting and reloading
  const amountRequested = Number(inputLoanAmount.value);
  if (amountRequested > 0) {
    if (loggedAccount.movements.some((mov) => mov >= amountRequested * 0.1)) {
      loggedAccount.movements.push(amountRequested);
      updateUI(loggedAccount);
      inputLoanAmount.value = "";
      transferMessage.textContent = "";
      transferMessageDisplay(`Successful addition of a loan amount of ${amountRequested}€ ✅`);
      resetInputStyle(loanError, inputLoanAmount);
    } else {
      resetInputStyle(loanError, inputLoanAmount);
      loanError.textContent = "You have exceeded your acceptable limit!❌";
      loanError.style.visibility = "visible";
      inputLoanAmount.style.color = "red";
    }
  } else {
    resetInputStyle(loanError, inputLoanAmount);
    loanError.textContent = "Enter a positive number!❌";
    loanError.style.visibility = "visible";
    inputLoanAmount.style.color = "red";
  }
});

generateUsernames(accounts);
