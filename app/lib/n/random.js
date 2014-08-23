/**********************************************************************

File     : random.js
Project  : N Simulator Library
Purpose  : Source file for a uniform random number generator. Taken from Numerical Recipes in C (or possibly Fortran, and ported).
Revisions: Original definition in C++ by Lawrence Gunn.
           1996/08/01
           Ported to Javascript by Lawrence Gunn.
           2014/05/24

Copyright (c) 1995-2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};
N.Rand = N.Rand || {};

N.Rand.maxInteger =  9007199254740992;
N.Rand.minInteger = -9007199254740992;

    //**************************
    //* N.Rand.RandomGenerator *
    //**************************

N.Rand.RandomGenerator = function(seed) {
  this.seedSet          = false;
  if(arguments.length > 0) {
    this.setSeed(seed);
  }
}

N.Rand.RandomGenerator.getDefaultRandomGenerator = function() {
  if(!N.Rand.globalGenerator) {
    N.Rand.globalGenerator = new N.Rand.RandomGenerator((new Date()).getTime());
  }
  return N.Rand.globalGenerator;
}

N.Rand.RandomGenerator.prototype.reinitialize = function() {
  if(!this.seedSet) {
    this.seed = N.Rand.RandomGenerator.getDefaultRandomGenerator().getRandomInteger();
    this.seedSet = true;
  }
  this.generator = new Random(this.seed);
}

N.Rand.RandomGenerator.prototype.getSeed = function() {
  if(!this.seedSet) {
    this.reinitialize();
  }

  return this.seed;
}

N.Rand.RandomGenerator.prototype.setSeed = function(seed) {
  this.seedSet      = true;
  this.seed         = seed;
  this.randomNumber = this.seed;
  this.reinitialize();
}

N.Rand.RandomGenerator.prototype.getRandomInteger = function() {
  if(!this.seedSet) {
    this.reinitialize();
  }
  return parseInt(this.generator.uniform(N.Rand.minInteger, N.Rand.maxInteger), 10);
}

N.Rand.RandomGenerator.prototype.getRandomIntegerInRange = function(minValue, maxValue) {
  var randomValue = this.getRandomInteger();
  return (Math.abs(randomValue) % (maxValue-minValue+1)) + minValue;
}

/**
 * Get a floating point number between a minimum and maximum value. Note that min can be greater than max - the function reverses them.
 * @method getRandomDouble
 * @param {Real} minValue
 * @param {Real} maxValue
 * @returns {Real} A double precision floating point number at or between minValue and maxValue.
 */
N.Rand.RandomGenerator.prototype.getRandomDouble = function(minValue, maxValue) {
  if(!this.seedSet) {
    this.reinitialize();
  }
  return this.generator.uniform(minValue, maxValue);
}

N.Rand.RandomGenerator.prototype.getRandSignalArray = function(data) {  //{Range: [0.0, 0.5], TimeEnd: 0, Num: 5 }
  var a = [];
  var val = this.getRandomDouble(data.range[0], data.range[1]);
  for(var i = data.timeEnd-(data.num-1); i <= data.timeEnd; i++) {
    a.push({ t: i, v: val });
  }
  return a;
}
