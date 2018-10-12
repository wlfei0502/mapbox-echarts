# Demo
[热力图](https://wlfei0502.github.io/mapbox-echarts/example/heatmap.html)<br/>
[散点图](https://wlfei0502.github.io/mapbox-echarts/example/scatter.html)

# mapbox-echarts

ECharts extension for visualizing data on mapbox. Require mapbox-gl and echarts.

# How to install

## with script tag
```
<script type="text/javascript" src="mapbox-gl.js">
<script type="text/javascript" src="echarts.js">
<script type="text/javascript" src="mapbox-echarts.js">
    
```
      
## with npm
```
npm install mapbox-gl echarts mapbox-echarts

import 'mapbox-gl'
import echarts from 'echarts'
import 'mapbox-echarts'

```

# Usage
use 'tmap' as Echarts coordinateSystem

```
var style =  {
  "version": 8,
  "sprite": "http://localhost:8080/static/sprite/sprite",
  "glyphs": "mapbox://font/{fontstack}/{range}.pbf",
  "sources": {
    "osm-tiles": {
      "type": "raster",
      'tiles': [
        "http://t{s}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}"
      ],
      'tileSize': 256
    }
  },
  "layers": [{
    "id": "tdt-tiles",
    "type": "raster",
    "source": "osm-tiles",
    "minzoom": 0,
    "maxzoom": 20
  }]
}

var myChart = echarts.init(document.getElementById('echarts-container'));
var option = {
  // map option
  tmap:{
    center: [120.13066322374, 30.240018034923],
    zoom: 2,
    roam: true,
    style: style,
    transformRequest: (url, resourceType)=> {
      if(resourceType === 'Tile' && url.indexOf('DataServer') > -1) {
        var random = parseInt(Math.random()*7);
        return {
          url: url.replace('{s}', random)
        }
      }
    }
  },
  series:[{
    coordinateSystem:'tmap'
  }]
}

myechart.setOption(option)
```
