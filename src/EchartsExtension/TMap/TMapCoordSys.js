import {
    util as zrUtil,
    graphic,
    matrix
} from 'echarts';

function TMapCoordSys(tmap, api) {
    this._tmap = tmap;
    this.dimensions = ['lng', 'lat'];
    this._mapOffset = [0, 0];

    this._api = api;

    // lnglat -> point
    this._project = tmap.project.bind(tmap);

    // point -> lnglat
    this._unproject = tmap.unproject.bind(tmap);
}

TMapCoordSys.prototype.dimensions = ['lng', 'lat'];

TMapCoordSys.prototype.setZoom = function (zoom) {
    this._zoom = zoom;
};

TMapCoordSys.prototype.setCenter = function (center) {
    this._center = this._project(new mapboxgl.LngLat(center[0], center[1]));
};

TMapCoordSys.prototype.setMapOffset = function (mapOffset) {
    this._mapOffset = mapOffset;
};

TMapCoordSys.prototype.getTMap = function () {
    return this._tmap;
};

TMapCoordSys.prototype.dataToPoint = function (data) {
    var px = this._project(data);
    var mapOffset = this._mapOffset;
    return [px.x - mapOffset[0], px.y - mapOffset[1]];
};

TMapCoordSys.prototype.pointToData = function (pt) {
    var mapOffset = this._mapOffset;
    var pt = this._unproject({
        x: pt[0] + mapOffset[0],
        y: pt[1] + mapOffset[1]
    });
    return [pt.lng, pt.lat];
};

TMapCoordSys.prototype.getViewRect = function () {
    var api = this._api;
    return new graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight());
};

TMapCoordSys.prototype.getRoamTransform = function () {
    return matrix.create();
};

TMapCoordSys.prototype.prepareCustoms = function (data) {
    var rect = this.getViewRect();
    return {
        coordSys: {
            // The name exposed to user is always 'cartesian2d' but not 'grid'.
            type: 'tmap',
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
        },
        api: {
            coord: zrUtil.bind(this.dataToPoint, this),
            size: zrUtil.bind(dataToCoordSize, this)
        }
    };
};

function dataToCoordSize(dataSize, dataItem) {
    dataItem = dataItem || [0, 0];
    return zrUtil.map([0, 1], function (dimIdx) {
        var val = dataItem[dimIdx];
        var halfSize = dataSize[dimIdx] / 2;
        var p1 = [];
        var p2 = [];
        p1[dimIdx] = val - halfSize;
        p2[dimIdx] = val + halfSize;
        p1[1 - dimIdx] = p2[1 - dimIdx] = dataItem[1 - dimIdx];
        return Math.abs(this.dataToPoint(p1)[dimIdx] - this.dataToPoint(p2)[dimIdx]);
    }, this);
}

// For deciding which dimensions to use when creating list data
TMapCoordSys.dimensions = TMapCoordSys.prototype.dimensions;

// 创建图表覆盖层
function createEchartsLayer(map, viewport) {
    const mapContainer = map.getCanvasContainer();
    viewport.style.width = map.getCanvas().style.width;
    viewport.style.height = map.getCanvas().style.height;
    mapContainer.appendChild(viewport);
}

TMapCoordSys.create = function (ecModel, api) {
    var tmapCoordSys;
    var root = api.getDom();

    ecModel.eachComponent('tmap', function (tmapModel) {
        var center = tmapModel.get('center');
        var zoom = tmapModel.get('zoom');
        var painter = api.getZr().painter;
        var viewportRoot = painter.getViewportRoot();
        if (typeof mapboxgl === 'undefined') {
            throw new Error('mapboxgl api is not loaded');
        }
        if (tmapCoordSys) {
            throw new Error('Only one tmap component can exist');
        }
        if (!tmapModel.__tmap) {
            // Not support IE8
            var tmapRoot = root.parentElement.querySelector('.ec-extension-tmap');
            if (tmapRoot) {
                // Reset viewport left and top, which will be changed
                // in moving handler in mapbox
                viewportRoot.style.left = '0px';
                viewportRoot.style.top = '0px';
                root.parentNode.removeChild(tmapRoot);
            }
            tmapRoot = document.createElement('div');
            tmapRoot.style.cssText = 'width:100%;height:100%';
            tmapRoot.classList.add('ec-extension-tmap');
            root.parentNode.appendChild(tmapRoot);
            tmapModel.option.container = tmapRoot;
            var tmap = tmapModel.__tmap = new mapboxgl.Map(tmapModel.option);
            // 构建echarts图层
            createEchartsLayer(tmap, root);
            // Override
            painter.getViewportRootOffset = function () {
                return {offsetLeft: 0, offsetTop: 0};
            };
        }

        var tmap = tmapModel.__tmap;
        tmapCoordSys = new TMapCoordSys(tmap, api);
        tmapCoordSys.setMapOffset(tmapModel.__mapOffset || [0, 0]);
        tmapCoordSys.setZoom(zoom);
        tmapCoordSys.setCenter(center);

        tmapModel.coordinateSystem = tmapCoordSys;
    });

    ecModel.eachSeries(function (seriesModel) {
        if (seriesModel.get('coordinateSystem') === 'tmap') {
            seriesModel.coordinateSystem = tmapCoordSys;
        }
    });
};

export default TMapCoordSys;
