define([
    'esri/units',
    'esri/geometry/Extent',
    'esri/config',
    /*'esri/urlUtils',*/
    'esri/tasks/GeometryService',
    'esri/layers/ImageParameters',
    'dojo/i18n!./nls/main',
    'dojo/topic',
    'esri/dijit/Basemap',
    'esri/dijit/BasemapLayer',
    'esri/geometry/Point'
], function (units, Extent, esriConfig, /*urlUtils,*/ GeometryService, ImageParameters, i18n, topic, Basemap, BasemapLayer, Point) {

    // url to your proxy page, must be on same machine hosting you app. See proxy folder for readme.
    esriConfig.defaults.io.proxyUrl = 'proxy/proxy.ashx';
    esriConfig.defaults.io.alwaysUseProxy = false;

    // url to your geometry server.
    esriConfig.defaults.geometryService = new GeometryService('https://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer');

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

    return {
        // used for debugging your app
        isDebug: true,
        //default mapClick mode, mapClickMode lets widgets know what mode the map is in to avoid multiple map click actions from taking place (ie identify while drawing).
        defaultMapClickMode: 'identify',
        // map options, passed to map constructor. see: https://developers.arcgis.com/javascript/jsapi/map-amd.html#map1
        mapOptions: {
            basemap: new Basemap({
                id: 'sangisBaseMap',
                layers: [new BasemapLayer({
                url: 'https://gis.sangis.org/maps/rest/services/Public/Basemap/MapServer'
                })]
            }),
            center: new Point({
                x: -116.8611,
                y: 33,
            }),
            zoom: 10,
            minZoom: 9,
            sliderStyle: 'small',
            showAttribution: true
        },
        // custom titles
        titles: {
            header: i18n.viewer.titles.header,
            subHeader: i18n.viewer.titles.subHeader,
            pageTitle: i18n.viewer.titles.pageTitle
        },
        // operationalLayers: Array of Layers to load on top of the basemap: valid 'type' options: 'dynamic', 'tiled', 'feature'.
        // The 'options' object is passed as the layers options for constructor. Title will be used in the legend only. id's must be unique and have no spaces.
        // 3 'mode' options: MODE_SNAPSHOT = 0, MODE_ONDEMAND = 1, MODE_SELECTION = 2
        operationalLayers: [{
            type: 'feature',
            url: 'https://gis.sangis.org/maps/rest/services/Secured/SIRE/FeatureServer/3',
            title: "RoadSegs",
            // titleHasRelatedFields: true,
            layerIDs: [ 3 ],
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
                    {fieldName: 'relationships/2/FULL_NAME', isEditable: false, label: 'Road Name'},
                    //{fieldName: 'FULL_NAME', isEditable: false, label: 'Road Name'},
                    {fieldName: 'ROADSEGID', isEditable: false, label: 'RoadSegID'},
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
            isEditable: true,
            fieldInfos: [
                {fieldName: 'relationships/2/FULL_NAME', isEditable: false, label: 'Road Name'},
                {fieldName: 'ROADSEGID', isEditable: false, label: 'RoadSegID'},
                {fieldName: 'LHIGHADDR', isEditable: true, label: 'Left High Addr'},
                {fieldName: 'LLOWADDR', isEditable: true, label: 'Left Low Addr'}
            ],
            identifyLayerInfos: {
                layerIds: [3],
            },
            legendLayerInfos: {
                exclude: false,
                layerInfo: {
                    title: i18n.viewer.operationalLayers.RoadSegs
                }
            }
        }, /*{
            type: 'feature',
            url: 'https://gis.sangis.org/maps/rest/services/Secured/SIRE/FeatureServer/4',
            title: "RoadName",
            titleHasRelatedFields: true,
            layerIDs: [ 4 ],
            options: {
                id: 'RoadName',
                opacity: 1.0,
                visible: true,
                minScale: 20000,
                outFields: ['*'],
                mode: 1
            },
            editorLayerInfos: {
                disableGeometryUpdate: true,
                fieldInfos: [
                {fieldName: 'FULL_NAME', isEditable: false, label: 'Road Name'},
                {fieldName: 'ROAD_ID', isEditable: false, label: 'RoadID'}
                ]
            },
            identifyLayerInfos: {
                layerIds: [4]
            },
            isEditable: true,
            attributeInspectorLayerInfos: {
                fieldInfos: [
                    {fieldName: 'ROADSEGID', isEditable: false, label: 'RoadSegID'},
                    {fieldName: 'LHIGHADDR', isEditable: true, label: 'Left High Addr'},
                    {fieldName: 'LLOWADDR', isEditable: true, label: 'Left Low Addr'}
                ]
            },
            legendLayerInfos: {
                exclude: true,
                layerInfo: {
                    title: 'Test Title'
                }
            }
        },*/ {
            type: 'feature',
            url: 'https://gis.sangis.org/maps/rest/services/Secured/SIRE/FeatureServer/2',
            title: "Intersections",
            layerIDs: [2],
            options: {
                id: 'Intersections',
                opacity: 1.0,
                visible: true,
                minScale: 20000,
                outFields: ['*'],
                mode: 1
            },
            legendLayerInfos: {
                exclude: true
            }
        }],
        // set include:true to load. For titlePane type set position the the desired order in the sidebar
        widgets: {
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
            homeButton: {
                include: true,
                id: 'homeButton',
                type: 'domNode',
                path: 'esri/dijit/HomeButton',
                srcNodeRef: 'homeButton',
                options: {
                    map: true,
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
                        templatePicker: false,
                        toolbarOptions: {
                            reshapeVisible: false,
                            cutVisible: false,
                            mergeVisible: false
                        }
                    }
                }
            },
/*            attributeInspector: {
                include: true,
                id: 'attributeInspector',
                type: 'titlePane',
                path: 'gis/dijit/AttributeInspector',
                title: 'Attribute Inspector',
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
                        templatePicker: false,
                        toolbarOptions: {
                            reshapeVisible: false,
                            cutVisible: false,
                            mergeVisible: false
                        }
                    }
                }
            },*/
            help: {
                include: true,
                id: 'help',
                type: 'floating',
                path: 'gis/dijit/Help',
                title: i18n.viewer.widgets.help,
                options: {}
            },
            relatedRecords: {
                include: true,
                id: 'relatedRecords',
                type: 'domNode',
                srcNodeRef: 'relatedRecords',
                path: 'gis/dijit/RelationshipTable',
                title: 'Related Records',
                objectIdField: 'OBJECTID',
                options: {
                    //required option
                    layerControlLayerInfos: true,

                    //optional relationships property
                    relationships: {
                        3: { //layerID (string) key refers to featurelayer id in the operationalLayers array
                            objectIdField: 'OBJECTID',
                            2: { //relationshipID (integer) key referrs to the relationship id on the rest services page
                                //relationship tab title
                                title: 'Road Names',
                                //set exclude to true to skip this relationship
                                exclude: false,
                                //other dgrid options like columns may be included
                                
                            }
                        }
                    }
                }
            }
        }
    };
});
