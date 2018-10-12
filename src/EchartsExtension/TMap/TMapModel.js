import * as echarts from 'echarts';

function v2Equal(a, b) {
    return a && b && a[0] === b[0] && a[1] === b[1];
}

export default echarts.extendComponentModel({
    type: 'tmap',

    getTMap: function () {
        // __tmap is injected when creating BMapCoordSys
        return this.__tmap;
    },

    setCenterAndZoom: function (center, zoom) {
        this.option.center = center;
        this.option.zoom = zoom;
    },

    centerOrZoomChanged: function (center, zoom) {
        var option = this.option;
        return !(v2Equal(center, option.center) && zoom === option.zoom);
    },

    defaultOption: {

        center: [104.114129, 37.550339],

        zoom: 5,

        style: {},

        roam: true
    }
});
