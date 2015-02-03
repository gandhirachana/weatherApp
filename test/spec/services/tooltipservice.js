'use strict';

describe('Service: tooltipService', function () {

  // load the service's module
  beforeEach(module('weatherAppApp'));

  // instantiate service
  var tooltipService;
  beforeEach(inject(function (_tooltipService_) {
    tooltipService = _tooltipService_;
  }));

  it('should do something', function () {
    expect(!!tooltipService).toBe(true);
  });

});
