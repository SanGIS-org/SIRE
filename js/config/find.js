define([
    'dojo/i18n!./nls/main'
], function (i18n) {
    return {
        map: true,
        zoomExtentFactor: 2,
        queries: [
            {
                description: i18n.find.roadSegs,
                url: 'https://gis.sangis.org/maps/rest/services/Secured/SIRE/MapServer',
                layerIds: [ 1 ],
                searchFields: [ 'ROADSEGID' ],
                minChars: 2,
                gridColumns: [
                    {field: 'ROADSEGID', label: 'RoadSegID', width: 100, sortable: false, resizable: false},
                    {field: 'ROADSEGID', visible: false, get: function (findResult) {
                            return findResult.feature.attributes.ROADSEGID; //seems better to use attributes[ 'Fcode' ] but fails build.  Attribute names will be aliases and may contain spaces and mixed cases.
                        }
                    }
                ],
                sort: [
                    {
                        attribute: 'ROADSEGID',
                        descending: false
                    }
                ],
                prompt: 'Road Segment ID',
            }
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