'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('NexusLogica App', function() {

  beforeEach(function() {
    browser().navigateTo('../../app/index.html');
  });

  //*************************************************************
  // Timing Editor Testing

  describe('Timing editor view', function() {

    beforeEach(function() {
      browser().navigateTo('#');
    });

    it('should set initial string of new timing wave to "p."', function() {
      expect(element('#editor-1 textarea[name="timing-text"]').val()).
        toBe("p.");
    });

  });

});
