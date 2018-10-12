/**
 * TMap component extension, use mapbox
 */
import * as echarts from 'echarts';
import TMapCoordSys from './TMapCoordSys';

import './TMapModel';
import './TMapView';

echarts.registerCoordinateSystem('tmap', TMapCoordSys);

// Action
echarts.registerAction({
  type: 'tmapRoam',
  event: 'tmapRoam',
  update: 'updateView'
}, function (payload, ecModel) {
  ecModel.eachComponent('tmap', function (tMapModel) {
    var tmap = tMapModel.getTMap();
    var center = tmap.getCenter();
    tMapModel.setCenterAndZoom([center.lng, center.lat], tmap.getZoom());
  });
});

export var version = '1.0.0';
