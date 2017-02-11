/*eslint no-console: 0, no-alert: 0*/
define([
    'dojo/i18n!./nls/main'
], function (i18n) {

    return {
        map: true,
        zoomExtentFactor: 2,
        queries: [
            {
                // description: i18n.find.louisvillePubSafety,
                description: i18n.find.roadSegs,
                url: 'https://gis.sangis.org/maps/rest/services/Secured/SIRE/FeatureServer/3',
                // layerIds: [1, 2, 3, 4, 5, 6, 7],
                layerIds: [ 1 ],
                // searchFields: ['FDNAME, PDNAME', 'NAME', 'RESNAME'],
                searchFields: [ 'ROADSEGID' ],
                minChars: 2,
                gridColumns: [
                    {field: 'ROADSEGID', label: 'RoadSegID', width: 100, sortable: false, resizable: false},
                    {field: 'FNODE', label: 'FNode', width: 100, sortable: false, resizable: false, get: function ( reuslt ) {
                        var fnode = result.feature.attributes.FNODE;
                        return fnode;
                    }}
                ],
                sort: [
                    {
                        attribute: 'ROADSEGID',
                        descending: false
                    }
                ],
                prompt: 'Road Segment ID',
                // selectionMode: 'single'
            }/*,
            {
                description: i18n.find.sf311Incidents,
                url: 'https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/PublicSafety/PublicSafetyOperationalLayers/MapServer',
                layerIds: [15, 17, 18],
                searchFields: ['FCODE', 'DESCRIPTION'],
                minChars: 4,
                gridColumns: [
                    {
                        field: 'layerName',
                        label: 'Layer',
                        width: 100,
                        sortable: false,
                        resizable: false
                    },
                    {
                        field: 'Fcode',
                        label: 'Fcode',
                        width: 100
                    },
                    {
                        field: 'Description',
                        label: 'Descr'
                    },
                    {
                        field: 'SORT_VALUE',
                        visible: false,
                        get: function (findResult) {
                            return findResult.layerName + ' ' + findResult.feature.attributes.Fcode; //seems better to use attributes[ 'Fcode' ] but fails build.  Attribute names will be aliases and may contain spaces and mixed cases.
                        }
                    }
                ],
                sort: [
                    {
                        attribute: 'SORT_VALUE',
                        descending: false
                    }
                ],
                prompt: 'fdname, pdname, name or resname',
                customGridEventHandlers: [
                    {
                        event: '.dgrid-row:click',
                        handler: function (event) {
                            alert('You clicked a row!');
                            console.log(event);
                        }
                    }
                ]
            }*/
        ],
        selectionSymbols: {
            polygon: {
                type: 'esriSFS',
                style: 'esriSFSSolid',
                color: [255, 0, 0, 62],
                outline: {
                    type: 'esriSLS',
                    style: 'esriSLSSolid',
                    color: [255, 0, 0, 255],
                    width: 3
                }
            },
            point: {
                type: 'esriSMS',
                style: 'esriSMSCircle',
                size: 25,
                color: [255, 0, 0, 62],
                angle: 0,
                xoffset: 0,
                yoffset: 0,
                outline: {
                    type: 'esriSLS',
                    style: 'esriSLSSolid',
                    color: [255, 0, 0, 255],
                    width: 2
                }
            }
        },
        selectionMode: 'extended'
    };
});