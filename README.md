#N

A state based biological neural system simulator.

There are two extremes when simulating neuronal systems. The first is to have an extremely detailed model, with spikes, compartments, ion channels,
and so on. The other extreme is a simple linear summing neuron with a thresholded output function. The former is difficult to model correctly, executes slowly, and
the results are difficult to interpret. The latter is overly simple and ignores important functionality of biological neurons.

The N simulation is based on the belief that neurons are built of sets of functional sub-components and that those components change their operating state,
and within any state the functionality if fairly simple. Take as an example relay neurons in the thalamus. When we are awake their output matches fairly closes their input.
But when we are sleeping the neurons go into a bursting mode, where they are quiet for short periods of time and then fire a volley of spikes at a high fairly high rate,
then go quiet again. Or put another way, when awake they are in one state, and when asleep they are in states of either doing nothing or burst firing.

