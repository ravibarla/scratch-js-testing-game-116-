const csv = require("csv-parser");
const path = require("path");
const { readCsvFile } = require("./readCSV");
const prizeSymbol = {
  A: 2.5,
  B: 5,
  C: 10,
  D: 20,
  E: 50,
  F: 100,
  G: 500,
  H: 1000,
  I: 2000,
  J: 10000,
  K: 25000,
};
const filepath = path.join(
  path.resolve(),
  "data",
  "GameForTest116Amt_202406171544.csv"
);
// let headers = [];
// let data = [];
const readFunction = async () => {
  try {
    let { csvHeaders, csvData } = await readCsvFile(filepath);
    // console.log(csvData);
    const incorrectAccumulatedAmount =
      validateIncorrectAccumulatedAmount(csvData);
    //validate incorrect accumulated ticket if any
    if (incorrectAccumulatedAmount.length !== 0) {
      console.log(
        "incorrect accumulated-amount ticket found",
        incorrectAccumulatedAmount
      );
    } else {
      console.log("accumulated-amount ticket are correct ");
    }
    const IncorrectAmountAgtv = validateIncorrectAmountAgtv(csvData);
    if (!IncorrectAmountAgtv) {
      console.log("agtv code has correct amount");
    } else {
      console.log("agtv code has incorrect amount :");
    }
  } catch (err) {
    console.log("error :", err);
  }
};
readFunction();

//validate pattern with amount validation
const validateIncorrectAccumulatedAmount = (rows) => {
  let incorrectAccAmountTicket = [];
  rows.forEach((row) => {
    //incorrectAccAmountTicket
    //check if game-1 pattern is matched
    const isCZGamePatternMatched = findCZGamePatternMatched(row);
    //record the amount of game -1
    let prizeAmountGame_1 = 0;
    if (isCZGamePatternMatched) {
      prizeAmountGame_1 = prizeSymbol[row.prize_symbol_cz];
    }
    //check if game-2 pattern is matched
    const isMSSGamePatternMatched = findMSSGamePatternMatched(row);
    //record the amount of game-2
    let prizeAmountGame_2 = 0;
    if (isMSSGamePatternMatched) {
      prizeAmountGame_2 = prizeSymbol[row.prize_symbol_mss];
    }
    let sum = parseFloat(prizeAmountGame_1) + parseFloat(prizeAmountGame_2);
    if (parseFloat(row.amount) !== sum) {
      incorrectAccAmountTicket.push({
        ticket: row.ticket_no,
        amount: row.amount,
        sum: sum,
        amount_1: prizeAmountGame_1,
        amount_2: prizeAmountGame_2,
      });
    }
  });
  return incorrectAccAmountTicket;
};

//validate CNZ game pattern matching criteria
const findCZGamePatternMatched = (row) => {
  let isPatternMatched = false;
  //row pattern
  if (
    row.cz_symbol_1 == row.cz_symbol_2 &&
    row.cz_symbol_1 == row.cz_symbol_3
  ) {
    isPatternMatched = true;
  } else if (
    row.cz_symbol_4 == row.cz_symbol_5 &&
    row.cz_symbol_4 == row.cz_symbol_6
  ) {
    isPatternMatched = true;
  } else if (
    row.cz_symbol_7 == row.cz_symbol_8 &&
    row.cz_symbol_7 == row.cz_symbol_9
  ) {
    isPatternMatched = true;
  }
  //column pattern
  else if (
    row.cz_symbol_1 == row.cz_symbol_4 &&
    row.cz_symbol_1 == row.cz_symbol_7
  ) {
    isPatternMatched = true;
  } else if (
    row.cz_symbol_2 == row.cz_symbol_5 &&
    row.cz_symbol_2 == row.cz_symbol_8
  ) {
    isPatternMatched = true;
  } else if (
    row.cz_symbol_3 == row.cz_symbol_6 &&
    row.cz_symbol_3 == row.cz_symbol_9
  ) {
    isPatternMatched = true;
  }
  //diagonal pattern
  else if (
    row.cz_symbol_1 == row.cz_symbol_5 &&
    row.cz_symbol_1 == row.cz_symbol_9
  ) {
    isPatternMatched = true;
  } else if (
    row.cz_symbol_3 == row.cz_symbol_5 &&
    row.cz_symbol_3 == row.cz_symbol_7
  ) {
    isPatternMatched = true;
  }
  //cross pattern
  else if (
    row.cz_symbol_1 == row.cz_symbol_5 &&
    row.cz_symbol_1 == row.cz_symbol_9 &&
    row.cz_symbol_3 == row.cz_symbol_5 &&
    row.cz_symbol_3 == row.cz_symbol_7
  ) {
    isPatternMatched = true;
  }
  //corner pattern
  else if (
    row.cz_symbol_1 == row.cz_symbol_3 &&
    row.cz_symbol_1 == row.cz_symbol_7 &&
    row.cz_symbol_1 == row.cz_symbol_9
  ) {
    isPatternMatched = true;
  }
  return isPatternMatched;
};

//validate MSS game pattern matching criteria
const findMSSGamePatternMatched = (row) => {
  let symbols = [];
  for (let i = 1; i <= 6; i++) {
    symbols.push(row[`symbol_${i}`]);
  }
  const symbolCount = {};
  symbols.forEach((symbol) => {
    if (symbolCount[symbol]) {
      symbolCount[symbol]++;
    } else {
      symbolCount[symbol] = 1;
    }
  });
  for (symbol in symbolCount) {
    if (symbolCount[symbol] >= 3) {
      return true;
    }
  }
  return false;
};

const sharedAGTV = ["w", "x", "y", "z"];
const sharedAGTV1 = ["k", "l", "m", "n", "o", "p", "q", "r", "s", "t"];
//validate agtv with amount
const validateIncorrectAmountAgtv = (rows) => {
  let res;
  rows.forEach((row) => {
    //check for value 0 , 10000, 25000 as they have same kind of agtv code

    let curAgtv = row.agtv;
    let value = parseFloat(row.amount);
    if (value === 0 || value === 10000 || value === 25000) {
      for (let char of curAgtv) {
        if (!sharedAGTV1.includes(char)) {
          res = false;
          return false;
        }
      }
      res = true;
      return true;
    }
    //check for the first occurrence
    let requiredCharacter;
    switch (row.amount) {
      case "2.5":
        requiredCharacter = "a";
        break;
      case "5":
        requiredCharacter = "b";
        break;
      case "10":
        requiredCharacter = "c";
        break;
      case "20":
        requiredCharacter = "d";
        break;
      case "50":
        requiredCharacter = "e";
        break;
      case "100":
        requiredCharacter = "f";
        break;
      case "500":
        requiredCharacter = "g";
        break;
      case "1000":
        requiredCharacter = "h";
        break;
      case "1000":
        requiredCharacter = "i";
        break;
    }

    // Check that one character is the required character
    // let curAgtv = row.agtv;
    const requiredCharCount = (
      curAgtv.match(new RegExp(requiredCharacter, "g")) || []
    ).length;
    if (requiredCharCount !== 1) {
      res = false;
      return false;
    }
    // Check that the other two characters are either 'm', 'n', 'p', or 'q'
    const otherChars = curAgtv
      .split("")
      .filter((char) => char !== requiredCharacter);

    if (otherChars.length !== 2) {
      res = false;
      return false;
    }

    for (let char of curAgtv) {
      if (!sharedAGTV.includes(char)) {
        res = false;
        return false;
      }
    }

    // If all checks pass, return true
    res = true;
    return true;
  });
  return res;
};
