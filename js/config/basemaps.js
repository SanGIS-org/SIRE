define([
    'esri/dijit/Basemap',
    'esri/dijit/BasemapLayer',
], function (Basemap, BasemapLayer) {

    return {
        map: true, // needs a reference to the map
        //mode: 'agol', // mut be either 'agol' or 'custom'

        /* optional starting basemap
        / otherwise uses the basemap from the map
        / must match one of the keys in basemaps object below
        */
        //mapStartBasemap: 'streets',

        /* optional array of  basemaps to show in menu.
        / otherwise uses keys in basemaps object below
        / values in array must match keys in basemaps object
        */
        //basemapsToShow: ['streets', 'satellite', 'hybrid', 'topo', 'lightGray', 'gray', 'national-geographic', 'osm', 'oceans'],

        // define all valid basemaps here.
        basemaps: {
            sangisBaseMap: {
                title: 'sangisBaseMap',
                basemap: {
                    baseMapLayers: [
                        {
                            url: 'https://gis.sangis.org/maps/rest/services/Public/Basemap/MapServer'
                        }
                    ]
                }
            },
            streets: {},
            'streets-night-vector': {}, // requires v3.16 or higher
            'streets-navigation-vector': {}, // requires v3.16 or higher
            'streets-relief-vector': {}, // requires v3.16 or higher
            satellite: {},
            hybrid: {},
            topo: {},
            terrain: {},
            'gray-vector': {}, // requires v3.16 or higher
            'dark-gray-vector': {}, // requires v3.16 or higher
            oceans: {},
            'national-geographic': {},
            osm: {},
        }
    };
});