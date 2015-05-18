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
N.Comp.OutputFunc.tanhCoeff = Math.sqrt(Math.PI)*Math.log(2.0);

N.Comp.OutputFunc.tanh = function(x) {
  return (Math.exp(x)-Math.exp(-x))/(Math.exp(x)+Math.exp(-x));
}

/**
 * This is the simplest output function, taking only one input, multiplying it by a gain and using that value for the output.
 * @example
 *     var template = {
 *         main: {
 *             componentName: 'IP',
 *             gain: 0.5
 *         },
 *     }
 *
 * @class Comp.OutputFunc.linearSum
 * @param {N.Comp.*} A component object that has a 'Main' input source.
 * @constructor
 */

N.Comp.OutputFunc.linearSum = function(comp, t) {
  var main = comp.inputs.main;
  comp.output = main.gain*main.comp.getOutputAt(t-main.delay);
}

N.Comp.OutputFunc.linearSum.validate = function(comp, report) {
  if(!_.isObject(comp.outputLogic.sources.main.compartment)) { report.Error(comp.getPath()+'[func:=OutputLogic.OutputFunc]', 'The source compartment is null'); }
}

/**
 * Summing function with approximate error function type output curve with modulating input.
 * @example
 *     var template = {
 *         main: {
 *             componentName: 'IP',
 *             gain: 0.5,
 *             threshhold: 0.0
 *         },
 *         modulator: {
 *             componentName: 'AIP',
 *             gain: 0.2,
 *             threshhold: 0.0
 *         }
 *     }
 *
 * @class Comp.OutputFunc.errFuncSumWithMod
 * @param {N.Comp.*} A component object that has a 'Main' input source and a 'Modulator' source.
 * @constructor
 */

N.Comp.OutputFunc.errFuncSumWithMod = function(comp) {
  var inMain = comp.inputs.main.comp.output-comp.inputs.main.threshhold;
  if(inMain < 0.0) {
    comp.output = 0.0;
    return;
  }
  var gain = comp.inputs.main.gain;
  comp.output =  gain*N.Comp.OutputFunc.tanh(N.Comp.OutputFunc.tanhCoeff*inMain);
  var inMod = comp.inputs.modulator.output;
  if(inMod > 0.00001) {
    var modulation = 1.0+comp.inputs.modulator.gain*N.Comp.OutputFunc.tanh(N.Comp.OutputFunc.tanhCoeff*inMod);
  }
}
