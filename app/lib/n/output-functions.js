/**********************************************************************

File     : compartments.js
Project  : N Simulator Library
Purpose  : Source file for standard compartment objects.
Revisions: Original definition by Lawrence Gunn.
           2014/02/19

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};
N.Comp = N.Comp || {};
N.Comp.OutputFunc = N.Comp.OutputFunc || {};

// See http://math.stackexchange.com/questions/321569/approximating-the-error-function-erf-by-analytical-functions.
N.Comp.OutputFunc.TanhCoeff = Math.sqrt(Math.PI)*Math.log(2.0);

N.Comp.OutputFunc.Tanh = function(x) {
  return (Math.exp(x)-Math.exp(-x))/(Math.exp(x)+Math.exp(-x));
}

/**
 * This is the simplest output function, taking only one input, multiplying it by a gain and using that value for the output.
 * @example
 *     var template = {
 *         Main: {
 *             ComponentName: 'IP',
 *             Gain: 0.5
 *         },
 *     }
 *
 * @class Comp.OutputFunc.LinearSum
 * @param {N.Comp.*} A component object that has a 'Main' input source.
 * @constructor
 */

N.Comp.OutputFunc.LinearSum = function(comp, t) {
  var main = comp.Inputs.Main;
  comp.Output = main.Gain*main.Comp.GetOutputAt(t-main.Delay);
}

N.Comp.OutputFunc.LinearSum.validate = function(comp, report) {
  if(!_.isObject(comp.OutputLogic.Sources.Main.Compartment)) { report.Error(comp.getPath()+'[func:=OutputLogic.OutputFunc]', 'The source compartment is null'); }
}

/**
 * Summing function with approximate error function type output curve with modulating input.
 * @example
 *     var template = {
 *         Main: {
 *             ComponentName: 'IP',
 *             Gain: 0.5,
 *             Threshhold: 0.0
 *         },
 *         Modulator: {
 *             ComponentName: 'AIP',
 *             Gain: 0.2,
 *             Threshhold: 0.0
 *         }
 *     }
 *
 * @class Comp.OutputFunc.ErrFuncSumWithMod
 * @param {N.Comp.*} A component object that has a 'Main' input source and a 'Modulator' source.
 * @constructor
 */

N.Comp.OutputFunc.ErrFuncSumWithMod = function(comp) {
  var inMain = comp.Inputs.Main.Comp.Output-comp.Inputs.Main.Threshhold;
  if(inMain < 0.0) {
    comp.Output = 0.0;
    return;
  }
  var gain = comp.Inputs.Main.Gain;
  comp.Output =  gain*N.Comp.OutputFunc.Tanh(N.Comp.OutputFunc.TanhCoeff*inMain);
  var inMod = comp.Inputs.Modulator.Output;
  if(inMod > 0.00001) {
    var modulation = 1.0+comp.Inputs.Modulator.Gain*N.Comp.OutputFunc.Tanh(N.Comp.OutputFunc.TanhCoeff*inMod);
  }
}

// See http://math.stackexchange.com/questions/321569/approximating-the-error-function-erf-by-analytical-functions.
N.Comp.OutputFunc.TanhCoeff = Math.sqrt(Math.PI)*Math.log(2.0);

N.Comp.OutputFunc.Tanh = function(x) {
  return (Math.exp(x)-Math.exp(-x))/(Math.exp(x)+Math.exp(-x));
}
