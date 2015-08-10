'use strict';

(function () {
  // Trades Controller Spec
  describe('Trades Controller Tests', function () {
    // Initialize global variables
    var TradesController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Trades,
      mockTrade;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Trades_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Trades = _Trades_;

      // create mock trade
      mockTrade = new Trades({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Trade about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Trades controller.
      TradesController = $controller('TradesController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one trade object fetched from XHR', inject(function (Trades) {
      // Create a sample trades array that includes the new trade
      var sampleTrades = [mockTrade];

      // Set GET response
      $httpBackend.expectGET('api/trades').respond(sampleTrades);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.trades).toEqualData(sampleTrades);
    }));

    it('$scope.findOne() should create an array with one trade object fetched from XHR using a tradeId URL parameter', inject(function (Trades) {
      // Set the URL parameter
      $stateParams.tradeId = mockTrade._id;

      // Set GET response
      $httpBackend.expectGET(/api\/trades\/([0-9a-fA-F]{24})$/).respond(mockTrade);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.trade).toEqualData(mockTrade);
    }));

    describe('$scope.craete()', function () {
      var sampleTradePostData;

      beforeEach(function () {
        // Create a sample trade object
        sampleTradePostData = new Trades({
          title: 'An Trade about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An Trade about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (Trades) {
        // Set POST response
        $httpBackend.expectPOST('api/trades', sampleTradePostData).respond(mockTrade);

        // Run controller functionality
        scope.create();
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the trade was created
        expect($location.path.calls.mostRecent().args[0]).toBe('trades/' + mockTrade._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/trades', sampleTradePostData).respond(400, {
          message: errorMessage
        });

        scope.create();
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock trade in scope
        scope.trade = mockTrade;
      });

      it('should update a valid trade', inject(function (Trades) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/trades\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update();
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/trades/' + mockTrade._id);
      }));

      it('should set scope.error to error response message', inject(function (Trades) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/trades\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update();
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(trade)', function () {
      beforeEach(function () {
        // Create new trades array and include the trade
        scope.trades = [mockTrade, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/trades\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockTrade);
      });

      it('should send a DELETE request with a valid tradeId and remove the trade from the scope', inject(function (Trades) {
        expect(scope.trades.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.trade = mockTrade;

        $httpBackend.expectDELETE(/api\/trades\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to trades', function () {
        expect($location.path).toHaveBeenCalledWith('trades');
      });
    });
  });
}());
