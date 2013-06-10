'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('NexusLogica App', function() {

  beforeEach(function() {
    browser().navigateTo('../../app/index.html');
  });

  //*************************************************************
  // Waveform Editor And Search Form Testing

  describe('Waveform editor and search view', function() {

    beforeEach(function() {
      browser().navigateTo('#');
    });

    it('should allow creation, saving, and retrieval of a new waveform', function() {
      element('.waveforms-new-menu').click();
      expect(element('#editor-1 textarea[name="timing-text"]').val()).
        toBe("p.");
      var randomName = "TEST-"+Date.now();
      input('waveName').enter(randomName);
      expect(input('waveName').val()).
        toBe(randomName);
      element('.waveform-save-btn').click();
      sleep(1);

      element('.waveforms-search-menu').click();
      sleep(1);
      
      input('query').enter(randomName);
      expect(repeater(".wave-list-item").count()).
        toBe(1);
    });

  });

});
