#!/usr/bin/env node
'use strict'

const arg = process.argv[2]
const num = Number(arg)
// Number.isNaN()で数値が渡されたかどうかをチェック
if (Number.isNaN(num)) {
  throw new Error(`${arg} is not a number`)
}
console.log(require('.')(num))