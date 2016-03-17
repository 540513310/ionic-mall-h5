angular.module('xgStore.controllers')

  .controller('areaCtrl', function ($scope, $http, $stateParams, $ionicPopover, $location, xgApi, xgAddress, xgUser) {

    $scope.areaList = {};
    $scope.chooseStep = 0;
    $scope.chooseStepObjList = [];


    $scope.updateBindAreaList = function (parent_id) {
      xgApi.requestApi("/api/area/find", {parent_id: parent_id}).then(function (result) {
        $scope.areaList = result;
      });
    }
    $scope.updateBindAreaList(0);

    $scope.chooseArea = function (id, name) {
      $scope.chooseStep++;
      if ($scope.chooseStep == 1 || $scope.chooseStep == 2) {
        $scope.chooseStepObjList.push({id: id, name: name})
        $scope.updateBindAreaList(id);
      }
      if ($scope.chooseStep == 3) {
        $scope.chooseStepObjList.push({id: id, name: name})

        $scope.address.province = $scope.chooseStepObjList[0].id;
        $scope.address.city = $scope.chooseStepObjList[1].id;
        $scope.address.area = $scope.chooseStepObjList[2].id;
        $scope.address.address_area = $scope.chooseStepObjList[0].name + ' ' + $scope.chooseStepObjList[1].name + ' ' + $scope.chooseStepObjList[2].name;

        $scope.modal.hide();
      }
    }

    $scope.hideModal = function () {
      $scope.modal.hide();
    }

  });






