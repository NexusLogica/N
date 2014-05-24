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

N.Rand.MaxInteger =  9007199254740992;
N.Rand.MinInteger = -9007199254740992;

    //**************************
    //* N.Rand.RandomGenerator *
    //**************************

N.Rand.RandomGenerator = function(seed) {
  this.SeedSet          = false;
  if(arguments.length > 0) {
    this.SetSeed(seed);
  }
}

N.Rand.RandomGenerator.GetDefaultRandomGenerator = function() {
  if(!N.Rand.GlobalGenerator) {
    N.Rand.GlobalGenerator = new N.Rand.RandomGenerator((new Date()).getTime());
  }
  return N.Rand.GlobalGenerator;
}

N.Rand.RandomGenerator.prototype.Reinitialize = function() {
  if(!this.SeedSet) {
    this.Seed = N.Rand.RandomGenerator.GetDefaultRandomGenerator().GetRandomInteger();
    this.SeedSet = true;
  }
  this.Generator = new Random(this.Seed);
}

N.Rand.RandomGenerator.prototype.GetSeed = function() {
  if(!this.SeedSet) {
    this.Reinitialize();
  }

  return this.Seed;
}

N.Rand.RandomGenerator.prototype.SetSeed = function(seed) {
  this.SeedSet      = true;
  this.Seed         = seed;
  this.RandomNumber = this.Seed;
  this.Reinitialize();
}

N.Rand.RandomGenerator.prototype.GetRandomInteger = function() {
  if(!this.SeedSet) {
    this.Reinitialize();
  }
  return parseInt(this.Generator.uniform(N.Rand.MinInteger, N.Rand.MaxInteger));
}

N.Rand.RandomGenerator.prototype.GetRandomIntegerInRange = function(minValue, maxValue) {
  var randomValue = this.GetRandomInteger();
  return (Math.abs(randomValue) % (maxValue-minValue+1)) + minValue;
}

/**
 * Get a floating point number between a minimum and maximum value. Note that min can be greater than max - the function reverses them.
 * @method GetRandomDouble
 * @param {Real} minValue
 * @param {Real} maxValue
 * @returns {Real} A double precision floating point number at or between minValue and maxValue.
 */
N.Rand.RandomGenerator.prototype.GetRandomDouble = function(minValue, maxValue) {
  if(!this.SeedSet) {
    this.Reinitialize();
  }
  return this.Generator.uniform(minValue, maxValue);
}

N.Rand.RandomGenerator.prototype.GetRandSignalArray = function(data) {  //{Range: [0.0, 0.5], TimeEnd: 0, Num: 5 }
  var a = [];
  var val = this.GetRandomDouble(data.Range[0], data.Range[1]);
  for(var i = data.TimeEnd-data.Num; i <= data.TimeEnd; i++) {
    a.push({ t: i, v: val });
  }
  return a;
}
