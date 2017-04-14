define([
    'dojo/i18n!./nls/main',
    'dojo/_base/lang',
    'dojo/dom-construct',
    'dijit/layout/TabContainer',
    'dijit/layout/ContentPane',
    'gis/dijit/RelationshipTable'
], function (i18n, lang, domConstruct, TabContainer, ContentPane, RelationshipTable) {
    return {
        map: true,
        mapClickMode: false,
        mapRightClickMenu: true,
        identifyLayerInfos: true,
        // identifyTolerance: 100,
        draggable: false,
        identifies: {
            roads: {
/*                3: {
                    title: i18n.identify.RoadSegs.road,
                    fieldInfos: [
                    {
                        fieldName: 'ROADID',
                        visible: true
                    }, {
                        fieldName: 'ROADSEGID',
                        visible: true
                    }, {
                        fieldName: 'OBJECTID',
                        visible: true
                    }]
                },
                3: {
                    title: 'Testy McTesterson',
                    content: formatters.relationship({
                        title: i18n.identify.RoadSegs.road,
                        objectIdField: 'OBJECTID',
                        relationshipId: 2,
                        url: 'https://gis.sangis.org/maps/rest/services/Secured/SIRE/FeatureServer/3',
                        columns: [{
                                label: 'ObjectID',
                                field: 'OBJECTID'
                            }, {
                                label: 'Full Name',
                                field: 'FULL_NAME'
                            }],
                    })
                }*/
            }
        }
    };
});
