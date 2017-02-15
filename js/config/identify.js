define([
    'dojo/i18n!./nls/main',
    'dojo/_base/lang',
    'dojo/dom-construct',
    'dijit/layout/TabContainer',
    'dijit/layout/ContentPane',
    'gis/dijit/RelationshipTable'
], function (i18n, lang, domConstruct, TabContainer, ContentPane, RelationshipTable) {
    var formatters = {
        relationship: function (relationship) {
           return function (data) {
               var container = new TabContainer({
                   style: 'width:100%;height:300px;'
               }, domConstruct.create('div'));
               container.startup();
               //delay then resize
               setTimeout(function () {
                   container.resize();
               }, 200);
               container.addChild(new RelationshipTable(lang.mixin({
                   attributes: data.attributes,
                   title: 'Related Records',
                   style: 'width:100%;'
               }, relationship)));
               return container.domNode;
           };
        }
    };
    var linkTemplate = '<a href="{url}" target="_blank">{text}</a>';
    function directionsFormatter (noValue, attributes) {
        return lang.replace(linkTemplate, {
            url: 'https://www.google.com/maps/dir/' + attributes.Address + ' Louisville, KY',
            text: 'Get Directions'
        });
    }
    return {
        map: true,
        mapClickMode: false,
        mapRightClickMenu: true,
        identifyLayerInfos: true,
        identifyTolerance: 100,
        draggable: false,

        // config object definition:
        //  {<layer id>:{
        //      <sub layer number>:{
        //          <pop-up definition, see link below>
        //          }
        //      },
        //  <layer id>:{
        //      <sub layer number>:{
        //          <pop-up definition, see link below>
        //          }
        //      }
        //  }

        // for details on pop-up definition see: https://developers.arcgis.com/javascript/jshelp/intro_popuptemplate.html
        identifies: {
            RoadSegs: {
                3: {
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
                    }, {
                        fieldName: 'relationships/2/FULL_NAME',
                        visible: true
                    }, {
                        fieldName: 'Police Function',
                        visible: true
                    }, {
                        fieldName: 'Last Update Date',
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
                }
            }
        }
    };
});
