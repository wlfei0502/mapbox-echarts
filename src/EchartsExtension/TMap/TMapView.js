/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import * as echarts from 'echarts';

export default echarts.extendComponentView({
    type: 'tmap',

    render: function (tMapModel, ecModel, api) {
        var rendering = true;
        var mapOffset;
        var tmap = tMapModel.getTMap();
        var viewportRoot = api.getZr().painter.getViewportRoot();
        var coordSys = tMapModel.coordinateSystem;
        var moveHandler = function (type, target) {
            if (rendering || this._zooming) {
                return;
            }
            var centerPix = tmap.project(tMapModel.initCenter);
            var halfWidth = tmap.transform.width/2;
            var halfHeight = tmap.transform.height/2;
            var centerOffset = {
              style:{
                left:centerPix.x - halfWidth,
                top:centerPix.y - halfHeight,
              },
              // style:{
              //   left:'0',
              //   top:'0',
              // }
            }
            mapOffset = [
                parseInt(centerOffset.style.left, 10) || 0,
                parseInt(centerOffset.style.top, 10) || 0
            ];
            viewportRoot.style.left = mapOffset[0] + 'px';
            viewportRoot.style.top = mapOffset[1] + 'px';
            coordSys.setMapOffset(mapOffset);
            tMapModel.__mapOffset = mapOffset;
        };

        function zoomEndHandler() {
            if (rendering) {
              return;
            }

            this._zooming = false;
            viewportRoot.style.display = 'block';
            tMapModel.initCenter = tmap.getCenter();
            api.dispatchAction({
                type: 'tmapRoam'
            });
        }

        function zoomStartHandler() {
            if (rendering) {
              return;
            }
            resetEchartsLayer();
            this._zooming = true;
        }

        function moveEndHandler () {
            if (rendering || this._zooming) {
              return;
            }
            resetEchartsLayer();
            tMapModel.initCenter = tmap.getCenter();
            api.dispatchAction({
                type: 'tmapRoam'
            });
            setTimeout(function () {
                viewportRoot.style.display = 'block';
            }, 300);
        }

        function resetEchartsLayer() {
          var mapOffset = [0, 0];
          viewportRoot.style.left = mapOffset[0] + 'px';
          viewportRoot.style.top = mapOffset[1] + 'px';
          viewportRoot.style.display = 'none';
          coordSys.setMapOffset(mapOffset);
          tMapModel.__mapOffset = mapOffset;
        }

        tmap.off('move', this._oldMoveHandler);
        tmap.off('moveend', this._oldMoveEndHandler);
        tmap.off('zoomend', this._oldZoomEndHandler);
        tmap.off('zoomstart', this._oldZoomStartHandler);
        tmap.on('move', moveHandler);
        tmap.on('moveend', moveEndHandler);
        tmap.on('zoomend', zoomEndHandler);
        tmap.on('zoomstart', zoomStartHandler);

        this._oldMoveHandler = moveHandler;
        this._oldMoveEndHandler = moveEndHandler;
        this._oldZoomEndHandler = zoomEndHandler;
        this._oldZoomStartHandler = zoomStartHandler;

        var roam = tMapModel.get('roam');
        if (roam) {
            tmap.keyboard.enable();
        } else {
            tmap.keyboard.disable();
        }

        if (roam && roam !== 'scale') {
            tmap.dragPan.enable();
            tmap.dragRotate.enable();
        }
        else {
            tmap.dragPan.disable();
            tmap.dragRotate.disable();
        }
        if (roam && roam !== 'move') {
            tmap.boxZoom.enable();
            tmap.scrollZoom.enable();
            tmap.doubleClickZoom.enable();
            tmap.touchZoomRotate.enable();
        }
        else {
            tmap.boxZoom.disable();
            tmap.scrollZoom.disable();
            tmap.doubleClickZoom.disable();
            tmap.touchZoomRotate.disable();
        }

        var originalStyle = tMapModel.__style;

        var newMapStyle = tMapModel.get('style') || {};
        var mapStyleStr = JSON.stringify(newMapStyle);
        if (JSON.stringify(originalStyle) !== mapStyleStr) {
            if (Object.keys(newMapStyle).length) {
              tmap.setStyle(newMapStyle);
            }
          tMapModel.__style = JSON.parse(mapStyleStr);
        }

        rendering = false;
    }
});
