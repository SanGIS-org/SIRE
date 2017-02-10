define([
    'esri/units',
    'esri/geometry/Extent',
    'esri/config',
    /*'esri/urlUtils',*/
    'esri/tasks/GeometryService',
    'esri/layers/ImageParameters',
    'dojo/i18n!./nls/main',
    'dojo/topic'
], function (units, Extent, esriConfig, /*urlUtils,*/ GeometryService, ImageParameters, i18n, topic) {

    // url to your proxy page, must be on same machine hosting you app. See proxy folder for readme.
    esriConfig.defaults.io.proxyUrl = 'proxy/proxy.ashx';
    esriConfig.defaults.io.alwaysUseProxy = false;

    // add a proxy rule to force specific domain requests through proxy
    // be sure the domain is added in proxy.config
    /*urlUtils.addProxyRule({
        urlPrefix: 'www.example.com',
        proxyUrl: 'proxy/proxy.ashx'
    });*/

    // url to your geometry server.
    esriConfig.defaults.geometryService = new GeometryService('https://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer');

    // Use your own Google Maps API Key.
    // https://developers.google.com/maps/documentation/javascript/get-api-key
    //GoogleMapsLoader.KEY = 'NOT-A-REAL-API-KEY';

    // helper function returning ImageParameters for dynamic layers
    // example:
    // imageParameters: buildImageParameters({
    //     layerIds: [0],
    //     layerOption: 'show'
    // })
    function buildImageParameters (config) {
        config = config || {};
        var ip = new ImageParameters();
        //image parameters for dynamic services, set to png32 for higher quality exports
        ip.format = 'png32';
        for (var key in config) {
            if (config.hasOwnProperty(key)) {
                ip[key] = config[key];
            }
        }
        return ip;
    }

    //some example topics for listening to menu item clicks
    //these topics publish a simple message to the growler
    //in a real world example, these topics would be used
    //in their own widget to listen for layer menu click events
    topic.subscribe('layerControl/hello', function (event) {
        topic.publish('growler/growl', {
            title: 'Hello!',
            message: event.layer._titleForLegend + ' ' + event.subLayer.name + ' says hello'
        });
    });
    topic.subscribe('layerControl/goodbye', function (event) {
        topic.publish('growler/growl', {
            title: 'Goodbye!',
            message: event.layer._titleForLegend + ' ' + event.subLayer.name + ' says goodbye'
        });
    });

    return {
        // used for debugging your app
        isDebug: true,

        //default mapClick mode, mapClickMode lets widgets know what mode the map is in to avoid multipult map click actions from taking place (ie identify while drawing).
        defaultMapClickMode: 'identify',

/*        baseMap: {
            baseMapLayers: [{
                title: sangisBaseMap,
                opacity: 1,
                visibility: true,
                url: 'https://gis.sangis.org/maps/rest/services/Public/Basemap/MapServer'
            }]
        },*/
        // map options, passed to map constructor. see: https://developers.arcgis.com/javascript/jsapi/map-amd.html#map1
        mapOptions: {
            basemap: 'streets',
            center: [-116.8611, 33],
            zoom: 10,
            minZoom: 9,
            sliderStyle: 'small'
        },
        //webMapId: 'ef9c7fbda731474d98647bebb4b33c20',  // High Cost Mortgage
        // webMapOptions: {},

        // panes: {
        //  left: {
        //      splitter: true
        //  },
        //  right: {
        //      id: 'sidebarRight',
        //      placeAt: 'outer',
        //      region: 'right',
        //      splitter: true,
        //      collapsible: true
        //  },
        //  bottom: {
        //      id: 'sidebarBottom',
        //      placeAt: 'outer',
        //      splitter: true,
        //      collapsible: true,
        //      region: 'bottom'
        //  },
        //  top: {
        //      id: 'sidebarTop',
        //      placeAt: 'outer',
        //      collapsible: true,
        //      splitter: true,
        //      region: 'top'
        //  }
        // },
        // collapseButtonsPane: 'center', //center or outer

        // custom titles
        titles: {
            header: i18n.viewer.titles.header,
            subHeader: i18n.viewer.titles.subHeader,
            pageTitle: i18n.viewer.titles.pageTitle
        },

        // user-defined layer types
        /*
        layerTypes: {
            myCustomLayer: 'widgets/MyCustomLayer'
        },
        */

        // user-defined widget types
        /*
        widgetTypes: [
            'myWidgetType'
        ],
        */

        // operationalLayers: Array of Layers to load on top of the basemap: valid 'type' options: 'dynamic', 'tiled', 'feature'.
        // The 'options' object is passed as the layers options for constructor. Title will be used in the legend only. id's must be unique and have no spaces.
        // 3 'mode' options: MODE_SNAPSHOT = 0, MODE_ONDEMAND = 1, MODE_SELECTION = 2
        operationalLayers: [{
            type: 'feature',
            url: 'https://gis.sangis.org/maps/rest/services/Secured/SIRE/FeatureServer/3',
            title: "RoadSegs",
            options: {
                id: 'RoadSegs',
                opacity: 1.0,
                visible: true,
                minScale: 20000,
                outFields: ['*'],
                mode: 1
            },
            editorLayerInfos: {
                disableGeometryUpdate: true,
                fieldInfos: [
                {fieldName: 'ROADSEGID', isEditable: false, label: 'RoadSegID' },
                {fieldName: 'LHIGHADDR', isEditable: true, label: 'Left High Addr'},
                {fieldName: 'LLOWADDR', isEditable: true, label: 'Left Low Addr'},
                {fieldName: 'RHIGHADDR', isEditable: true, label: 'Right High Addr'},
                {fieldName: 'RLOWADDR', isEditable: true, label: 'Right Low Addr'},
                {fieldName: 'SEGCLASS', isEditable: true, label: 'SegClass'},
                {fieldName: 'SPEED', isEditable: true, label: 'Speed Limit'},
                {fieldName: 'FIREDRIV', isEditable: true, label: 'Fire Drivability'},
                {fieldName: 'ONEWAY', isEditable: true, label: 'Oneway'},
                {fieldName: 'OBMH', isEditable: true, label: 'OBMH'},
                {fieldName: 'L_BLOCK', isEditable: false, label: 'L Block'},
                {fieldName: 'R_BLOCK', isEditable: false, label: 'R Block'},
                {fieldName: 'L_TRACT', isEditable: false, label: 'L Tract'},
                {fieldName: 'R_TRACT', isEditable: false, label: 'R Tract'},
                {fieldName: 'L_BEAT', isEditable: false, label: 'L Beat'},
                {fieldName: 'R_BEAT', isEditable: false, label: 'R Beat'}
                ]
            },
            legendLayerInfos: {
                exclude: false,
                layerInfo: {
                    title: i18n.viewer.operationalLayers.RoadSegs
                }
            }
        }, {
            type: 'feature',
            url: 'https://gis.sangis.org/maps/rest/services/Secured/SIRE/FeatureServer/2',
            title: "Intersections",
            options: {
                id: 'Intersections',
                opacity: 1.0,
                visible: true,
                minScale: 20000,
                outFields: ['*'],
                mode: 1
            }
        }/*, {
            type: 'dynamic',
            url: 'https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/PublicSafety/PublicSafetyOperationalLayers/MapServer',
            title: i18n.viewer.operationalLayers.louisvillePubSafety,
            options: {
                id: 'louisvillePubSafety',
                opacity: 1.0,
                visible: true,
                imageParameters: buildImageParameters({
                    layerIds: [0, 2, 4, 5, 8, 10, 12, 21],
                    layerOption: 'show'
                })
            },
            identifyLayerInfos: {
                layerIds: [2, 4, 5, 8, 12, 21]
            },
            layerControlLayerInfos: {
                layerIds: [0, 2, 4, 5, 8, 9, 10, 12, 21]
            },
            legendLayerInfos: {
                layerInfo: {
                    hideLayers: [21]
                }
            }
        }, {
            type: 'dynamic',
            url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/DamageAssessment/MapServer',
            title: i18n.viewer.operationalLayers.damageAssessment,
            options: {
                id: 'damageAssessment',
                opacity: 1.0,
                visible: true,
                imageParameters: buildImageParameters()
            },
            legendLayerInfos: {
                exclude: true
            },
            layerControlLayerInfos: {
                swipe: true,
                metadataUrl: true,
                expanded: true,

                //override the menu on this particular layer
                menu: [{
                    topic: 'hello',
                    label: 'Say Hello',
                    iconClass: 'fa fa-smile-o'
                }]
            }*/
        /*
        //examples of vector tile layers (beta in v3.15)
        }, {
            type: 'vectortile',
            title: 'Light Gray Canvas Vector',
            url: 'https//www.arcgis.com/sharing/rest/content/items/bdf1eec3fa79456c8c7c2bb62f86dade/resources/styles/root.json',
            options: {
                id: 'vectortile1',
                opacity: 0.8,
                visible: true
            }
        }, {
           //  taken from this demo: https://github.com/ycabon/presentations/blob/gh-pages/2015-berlin-plenary/demos/3.15-vectortile/create-by-style-object.html
            type: 'vectortile',
            title: 'Custom Vector Style',
            options: {
                id: 'vectortile2',
                opacity: 1.0,
                visible: true,
                'glyphs': 'https://www.arcgis.com/sharing/rest/content/items/00cd8e843bae49b3a040423e5d65416b/resources/fonts/{fontstack}/{range}.pbf',
                'sprite': 'https://www.arcgis.com/sharing/rest/content/items/00cd8e843bae49b3a040423e5d65416b/resources/sprites/sprite',
                'version': 8,
                'sources': {
                    'esri': {
                        'url': 'https://basemapsdev.arcgis.com/arcgis/rest/services/World_Basemap/VectorTileServer',
                        'type': 'vector'
                    }
                },
                'layers': [{
                    'id': 'background',
                    'type': 'background',
                    'paint': {
                        'background-color': '#556688'
                    }
                }, {
                    'id': 'Land',
                    'type': 'fill',
                    'source': 'esri',
                    'source-layer': 'Land',
                    'paint': {
                        'fill-color': '#273344'
                    },
                }, {
                    'id': 'roads',
                    'type': 'line',
                    'source': 'esri',
                    'source-layer': 'Road',
                    'layout': {
                        'line-join': 'round'
                    },
                    'paint': {
                        'line-width': 1,
                        'line-color': '#131622'
                    }
                }]
            }
        }*/
        ],
        // set include:true to load. For titlePane type set position the the desired order in the sidebar
        widgets: {
/*            growler: {
                include: true,
                id: 'growler',
                type: 'domNode',
                path: 'gis/dijit/Growler',
                srcNodeRef: 'growlerDijit',
                options: {}
            },*/
            search: {
                include: true,
                type: 'domNode',
                path: 'esri/dijit/Search',
                srcNodeRef: 'geocoderButton',
                options: {
                    map: true,
                    visible: true,
                    enableInfoWindow: false,
                    enableButtonMode: true,
                    expanded: false
                }
            },
            basemaps: {
                include: true,
                id: 'basemaps',
                type: 'domNode',
                path: 'gis/dijit/Basemaps',
                srcNodeRef: 'basemapsDijit',
                options: 'config/basemaps'
            },
            identify: {
                include: true,
                id: 'identify',
                type: 'titlePane',
                path: 'gis/dijit/Identify',
                title: i18n.viewer.widgets.identify,
                open: false,
                position: 3,
                options: 'config/identify'
            },
            mapInfo: {
                include: true,
                id: 'mapInfo',
                type: 'domNode',
                path: 'gis/dijit/MapInfo',
                srcNodeRef: 'mapInfoDijit',
                options: {
                    map: true,
                    mode: 'dms',
                    firstCoord: 'y',
                    unitScale: 3,
                    showScale: true,
                    xLabel: '',
                    yLabel: '',
                    minWidth: 286
                }
            },
            scalebar: {
                include: true,
                id: 'scalebar',
                type: 'map',
                path: 'esri/dijit/Scalebar',
                options: {
                    map: true,
                    attachTo: 'bottom-left',
                    scalebarStyle: 'line',
                    scalebarUnit: 'dual'
                }
            },
            locateButton: {
                include: true,
                id: 'locateButton',
                type: 'domNode',
                path: 'gis/dijit/LocateButton',
                srcNodeRef: 'locateButton',
                options: {
                    map: true,
                    publishGPSPosition: true,
                    highlightLocation: true,
                    useTracking: true,
                    geolocationOptions: {
                        maximumAge: 0,
                        timeout: 15000,
                        enableHighAccuracy: true
                    }
                }
            },
            overviewMap: {
                include: true,
                id: 'overviewMap',
                type: 'map',
                path: 'esri/dijit/OverviewMap',
                options: {
                    map: true,
                    attachTo: 'bottom-right',
                    color: '#0000CC',
                    height: 100,
                    width: 125,
                    opacity: 0.30,
                    visible: false
                }
            },
            homeButton: {
                include: true,
                id: 'homeButton',
                type: 'domNode',
                path: 'esri/dijit/HomeButton',
                srcNodeRef: 'homeButton',
                options: {
                    map: true,
                    extent: new Extent({
                        xmin: -180,
                        ymin: -85,
                        xmax: 180,
                        ymax: 85,
                        spatialReference: {
                            wkid: 4326
                        }
                    })
                }
            },
            legend: {
                include: true,
                id: 'legend',
                type: 'titlePane',
                path: 'esri/dijit/Legend',
                title: i18n.viewer.widgets.legend,
                open: false,
                position: 1,
                options: {
                    map: true,
                    legendLayerInfos: true
                }
            },
            layerControl: {
                include: true,
                id: 'layerControl',
                type: 'titlePane',
                path: 'gis/dijit/LayerControl',
                title: i18n.viewer.widgets.layerControl,
                open: false,
                position: 0,
                options: {
                    map: true,
                    layerControlLayerInfos: true,
                    separated: true,
                    vectorReorder: true,
                    overlayReorder: true,

                    //create a example sub layer menu that will
                    //apply to all layers of type 'dynamic'
                    subLayerMenu: {
                        dynamic: [{
                            topic: 'goodbye',
                            iconClass: 'fa fa-frown-o',
                            label: 'Say goodbye'
                        }]
                    }
                }
            },
            bookmarks: {
                include: true,
                id: 'bookmarks',
                type: 'titlePane',
                path: 'gis/dijit/Bookmarks',
                title: i18n.viewer.widgets.bookmarks,
                open: false,
                position: 2,
                options: 'config/bookmarks'
            },
            find: {
                include: true,
                id: 'find',
                type: 'titlePane',
                canFloat: false,
                path: 'gis/dijit/Find',
                title: i18n.viewer.widgets.find,
                open: false,
                position: 3,
                options: 'config/find'
            },
/*            draw: {
                include: false,
                id: 'draw',
                type: 'titlePane',
                canFloat: false,
                path: 'gis/dijit/Draw',
                title: i18n.viewer.widgets.draw,
                open: false,
                position: 4,
                options: {
                    map: true,
                    mapClickMode: true
                }
            },*/
/*            measure: {
                include: true,
                id: 'measurement',
                type: 'titlePane',
                canFloat: false,
                path: 'gis/dijit/Measurement',
                title: i18n.viewer.widgets.measure,
                open: false,
                position: 5,
                options: {
                    map: true,
                    mapClickMode: true,
                    defaultAreaUnit: units.SQUARE_MILES,
                    defaultLengthUnit: units.MILES
                }
            },*/
            print: {
                include: false,
                id: 'print',
                type: 'titlePane',
                canFloat: false,
                path: 'gis/dijit/Print',
                title: i18n.viewer.widgets.print,
                open: false,
                position: 6,
                options: {
                    map: true,
                    printTaskURL: 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
                    copyrightText: 'Copyright 2014',
                    authorText: 'Me',
                    defaultTitle: 'Viewer Map',
                    defaultFormat: 'PDF',
                    defaultLayout: 'Letter ANSI A Landscape'
                }
            },
            directions: {
                include: false,
                id: 'directions',
                type: 'titlePane',
                path: 'gis/dijit/Directions',
                title: i18n.viewer.widgets.directions,
                open: false,
                position: 7,
                options: {
                    map: true,
                    mapRightClickMenu: true,
                    options: {
                        routeTaskUrl: 'https://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Network/USA/NAServer/Route',
                        routeParams: {
                            directionsLanguage: 'en-US',
                            directionsLengthUnits: units.MILES
                        },
                        active: false //for 3.12, starts active by default, which we dont want as it interfears with mapClickMode
                    }
                }
            },
            editor: {
                include: true,
                id: 'editor',
                type: 'titlePane',
                path: 'gis/dijit/Editor',
                title: i18n.viewer.widgets.editor,
                open: false,
                position: 8,
                options: {
                    map: true,
                    mapClickMode: true,
                    editorLayerInfos: true,
                    settings: {
                        toolbarVisible: true,
                        showAttributesOnClick: true,
                        enableUndoRedo: true,
                        createOptions: {
                            //polygonDrawTools: ['freehandpolygon', 'autocomplete']
                            //polygonDrawTools: [],
                            //polylineDrawTools: []
                        },
                        toolbarOptions: {
                            reshapeVisible: false,
                            cutVisible: false,
                            mergeVisible: false
                        }
                    }
                }
            },
/*            streetview: {
                include: true,
                id: 'streetview',
                type: 'titlePane',
                canFloat: false,
                position: 9,
                path: 'gis/dijit/StreetView',
                title: i18n.viewer.widgets.streetview,
                paneOptions: {
                    resizable: true,
                    resizeOptions: {
                        minSize: {
                            w: 250,
                            h: 250
                        }
                    }
                },
                options: {
                    map: true,
                    mapClickMode: true,
                    mapRightClickMenu: true
                }
            },*/
/*            locale: {
                include: true,
                id: 'locale',
                //type: 'titlePane',
                //position: 0,
                //open: true,
                type: 'domNode',
                srcNodeRef: 'geocodeDijit',
                path: 'gis/dijit/Locale',
                title: i18n.viewer.widgets.locale,
                options: {
                    style: 'margin-left: 30px;'
                }
            },*/
            help: {
                include: true,
                id: 'help',
                type: 'floating',
                path: 'gis/dijit/Help',
                title: i18n.viewer.widgets.help,
                options: {}
            }

        }
    };
});
