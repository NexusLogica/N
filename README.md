#N

A state based biological neural systems simulator.
***
## Users Guide
There are three main parts of a simulation.

  1. Components: These are parts of neurons, full neurons, or objects written to interact with other components.
  1. Waveforms: These can be inputs to various components in a simulation or recorded outputs from a simulation. These can indicate state, input, or output of a component. These are also used for comparing expected and actual values.
  1. Models: These are collections of components with the connections between them.
  
A simulation is a model with a set of input waveforms. It runs for a given period of time and the result is an output waveform that can be compared to an expected waveform in order to validate the model.

###Waveform Editor

The waveform editor is a composer/viewer for wavform/timing sequences.
    
## Acknowledgements

[WaveDrom](https://code.google.com/p/wavedrom/) has been used for sequence diagrams. The code has been modified for analog output and also to make it easier to use in a dynamic framework.
 
    
    
    