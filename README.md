#N

A state based biological neural systems simulator.
***
## Components
There are a variet

###TimingEditor

The timing editor is a composer/viewer for timing sequence objects. An id is required for the container object and this value is communicated to the controller by the onload event. The event text must include `renderWave(id)` where `id` the DOM id of the parent/containing element.

    <div id="editor1"
      class="container"
      ng-include
      onload="renderWave('editor1')"
      src="'partials/timing-editor.html'"
      ng-controller="TimingEditorController">
    </div>
    
## Acknowledgements

[WaveDrom](https://code.google.com/p/wavedrom/) has been used for sequence diagrams. The code has been modified for analog output and also to make it easier to use in a dynamic framework.
 
    
    
    