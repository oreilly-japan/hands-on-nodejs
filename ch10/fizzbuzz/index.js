'use strict'
module.exports = function (num) {
  // FizzBuzzの判定を先頭に移動する
  if (num % 15 === 0) {
    return 'FizzBuzz'
  }
  if (num % 3 === 0) {
    return 'Fizz'
  }
  if (num % 5 === 0) {
    return 'Buzz'
  }
  return String(num)
}