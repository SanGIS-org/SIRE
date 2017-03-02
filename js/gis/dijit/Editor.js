define([
'dojo/_base/declare',
'dijit/_WidgetBase',
'dijit/_TemplatedMixin',
'dijit/_WidgetsInTemplateMixin',
"dojo/_base/array",
'dojo/_base/lang',
'dojo/dom-construct',
'dojo/topic',
'dojo/aspect',
"esri/tasks/query", 
"esri/layers/FeatureLayer",
'esri/tasks/RelationshipQuery',
'esri/dijit/AttributeInspector',
'dojo/promise/all',
'dojo/text!./Editor/templates/Editor.html',
'dojo/i18n!./Editor/nls/resource',
'xstyle/css!./Editor/css/Editor.css',
'dijit/form/Button'
], function (declare,
_WidgetBase,
_TemplatedMixin,
_WidgetsInTemplateMixin,
arrayUtils,
lang,
domConstruct,
topic,
aspect,
Query,
FeatureLayer,
RelationshipQuery,
AttributeInspector,
all,
template,
i18n) {
	var selectedFeature, selectedLayer, attributeMessageContent, aliasTable, roadTable, roadLayer, interLayer, addAliasButton, roadName;
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: template,
		i18n: i18n,
		widgetsInTemplate: true,
		editor: null,
		isEdit: false,
		mapClickMode: null,

		postCreate: function () {
			this.inherited(arguments);
			this.own(topic.subscribe('mapClickMode/currentSet', lang.hitch(this, 'setMapClickMode')));
			if (this.parentWidget && this.parentWidget.toggleable) {
				this.own(aspect.after(this.parentWidget, 'toggle', lang.hitch(this, function () {
					this.onLayoutChange(this.parentWidget.open);
				})));
			}
			var callSelf = this;
			var map = this.map;
			roadLayer = this.map.getLayer("roads");
			interLayer = this.map.getLayer("Intersections");
			this.loadRoadsegAlias();

			roadLayer.on('selection-complete', lang.hitch(this,callSelf.handleSelection));
			map.infoWindow.on('hide', lang.hitch(this,callSelf.noSelection));
		},
		loadRoadsegAlias: function() {
			aliasTable = new FeatureLayer("https://gis.sangis.org/maps/rest/services/Secured/SIRE/FeatureServer/7", {
				mode: FeatureLayer.MODE_ONDEMAND,
				id: "aliasTable",
				outFields: ["OBJECTID",
							"ALIAS_PREDIR_IND",
							"ALIAS_NM",
							"ALIAS_SUFFIX_NM",
							"ALIAS_POST_DIR",
							"ALIAS_LEFT_LO_ADDR",
							"ALIAS_LEFT_HI_ADDR",
							"ALIAS_RIGHT_LO_ADDR",
							"ALIAS_RIGHT_HI_ADDR",
							"LMIXADDR",
							"RMIXADDR",
							"ALIAS_JURIS"]
			});
			aliasTable.on("load", lang.hitch(this, function () {
				var layerInfos = [{
					'featureLayer': aliasTable,
					'showAttachments': false,
					'isEditable': true,
					'fieldInfos': arrayUtils.map(aliasTable.fields, function (field) {
						return {
							'fieldName': field.name,
							'isEditable': field.editable,
							'tooltip': field.type,
							'label': field.alias
						};
					})
				}];
				var attInspector = new AttributeInspector({
					layerInfos: layerInfos
				}, "attributeInspectorDiv");
				attInspector.on("attribute-change", function (evt) {
					evt.feature.attributes[evt.fieldName] = evt.fieldValue;
					evt.feature.getLayer().applyEdits(null, [evt.feature], null);
					var msg = evt.fieldName + " changed to " + evt.fieldValue;
					document.getElementById('attributeUpdateMessage').innerHTML = msg;
				});
				attInspector.on("delete", function (evt) {
					evt.feature.getLayer().applyEdits(null, null, [evt.feature]);
				});
			}));
		},
		/**
		* Pulls road name from 'gisdata.T.ROADNAME' and assigns it to the InfoWindow Title
		* @param selectedFeature {Feature} - the feature clicked
		**/
		getRoadName: function(selectedFeature) {
			var queryRoadName = new RelationshipQuery();
			queryRoadName.outFields = ['FULL_NAME'];
			queryRoadName.relationshipId = 2;
			queryRoadName.objectIds = [selectedFeature['OBJECTID']];
			selectedLayer.queryRelatedFeatures(queryRoadName,lang.hitch(this, function (relatedRecords) {
				var fset = relatedRecords[selectedFeature['OBJECTID']].features[0].attributes['FULL_NAME'];
				if (fset) {
					roadName = fset;
					this.map.infoWindow.setTitle(roadName);
				}
			}));
		},
		/**
		* Pulls alias data from 'gisdata.T.ROADSEG_ALIAS' and displays the results
		* @param selectedFeature {Feature} - the feature clicked
		* @param selectedLayer {FeatureLayer} - the layer for the feature clicked
		**/
		getRelatedData: function(selectedFeature, selectedLayer) {
			// Build Road Alias query
			var queryRoadsegAlias = new RelationshipQuery();
			queryRoadsegAlias.outFields = ["*"];
			queryRoadsegAlias.relationshipId = 1;
			queryRoadsegAlias.objectIds = [selectedFeature['OBJECTID']];
			selectedLayer.queryRelatedFeatures(queryRoadsegAlias, lang.hitch(this, function (relatedRecords) {
				var fset = relatedRecords[selectedFeature['OBJECTID']];
				// If an alias record exists
				if (fset) {
					// Display number of aliases found and 'Add Another Alias' button
					var numRecords = fset.features.length;
					document.getElementById('attributeInspectorDiv').style.display = 'block';
					document.getElementById('attributeUpdateMessage').style.display = 'block';
					if (numRecords > 1) {
						attributeMessageContent = "<b>"+numRecords+" aliases found!</b>"
					} else if (numRecords == 1) {
						attributeMessageContent = '<b>Alias found!</b>';
					}
					attributeMessageContent += "<br /><br /> <button id='addAliasButton' type='button' align='center'>Add Another Alias</button>";
					// Collect corresponding attributes
					var relatedObjectIds = arrayUtils.map(fset.features, function (feature) {
						return feature.attributes[aliasTable.objectIdField];
					});
					// Query RoadSeg_Alias records
					var selectQuery = new Query();
					selectQuery.objectIds = relatedObjectIds;
					aliasTable.selectFeatures(selectQuery, FeatureLayer.SELECTION_NEW);
				} else {
					// If no alias exists in the related table, create 'Add New' button
					document.getElementById('attributeInspectorDiv').style.display = 'none';
					attributeMessageContent = "No alias exists for this road segment.<br /><br /> <button id='addAliasButton' type='button' align='center'>Add New</button>";
				};
				document.getElementById('attributeMessage').innerHTML = attributeMessageContent;
				document.getElementById('attributeMessage').style.display = 'block';
				var callSelf = this;

				// Functionality to add new Alias record
				document.getElementById("addAliasButton").onclick = function() {
					var newAttributes = {
					geometry: null,
					attributes: {
						ROADSEGID: selectedFeature['ROADSEGID'],
						POSTDATE:new Date().getTime(),
						ALIAS_JURIS: null,
						POSTID: "",
						ALIAS_PREDIR_IND: null,
						ALIAS_NM: null,
						ALIAS_SUFFIX_NM: null,
						ALIAS_POST_DIR: null,
						ALIAS_LEFT_LO_ADDR: null,
						ALIAS_LEFT_HI_ADDR: null,
						ALIAS_RIGHT_LO_ADDR: null,
						ALIAS_RIGHT_HI_ADDR: null,
						LMIXADDR: null,
						RMIXADDR: null
					}
					};
					aliasTable.applyEdits([newAttributes],null,null,null,
					function(error){
						if(error){
					}}).then( function() {
						// Restart function to show newly created alias
						callSelf.getRelatedData(selectedFeature,selectedLayer);
						return;
					});
				};
				
			}));
		},
		toggleEditing: function () {
			if (!this.isEdit) {
				var ops = lang.clone(this.settings);
				ops.map = this.map;
				ops.layerInfos = this.layerInfos;

				var con = domConstruct.create('div', {
					innerHTML: '<img style="display:inline;" src="data:image/gif;base64,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"/>',
					'style': 'text-align:center;'
				}, this.containerNode, 'only');

				require(['esri/dijit/editing/Editor'], lang.hitch(this, function (Editor) {
					this.editor = new Editor({
						settings: ops
					}, con);
					this.editor.startup();
				}));

				this.toggleBTN.set('label', this.i18n.labels.stopEditing);
				this.toggleBTN.set('class', 'danger');
				this.isEdit = true;
				topic.publish('mapClickMode/setCurrent', 'editor');

			} else {
				this.endEditing();
				topic.publish('mapClickMode/setCurrent', 'identify');
			}
		},
		endEditing: function () {
			// Stops editing and clears appropriate editing divs
			if (this.editor && this.editor.destroyRecursive) {
				this.editor.destroyRecursive();
			}
			this.toggleBTN.set('label', this.i18n.labels.startEditing);
			this.toggleBTN.set('class', 'success');
			this.isEdit = false;
			this.editor = null;
			document.getElementById('attributeInspectorDiv').style.display = 'none';
			document.getElementById('attributeMessage').style.display = 'none';
		},
		onLayoutChange: function (open) {
			// end edit on close of title pane
			if (!open && this.mapClickMode === 'editor') {
				this.endEditing();
				topic.publish('mapClickMode/setDefault');
			}
		},
		setMapClickMode: function (mode) {
			this.mapClickMode = mode;
			if (mode !== 'editor') {
				this.endEditing();
			}
		},
		/**
		* Handles action when user selects a feature in 'editor' mode
		* Also handles if a user clicks a featureless area of map in 'editor' mode
		**/
		handleSelection: function() {
			selectedLayer = roadLayer;
			selectedFeature = roadLayer._selectedFeatures;
			selectedFeature = selectedFeature[Object.keys(selectedFeature)[0]];
			if (selectedFeature != undefined) {
				this.getRoadName(selectedFeature.attributes, selectedLayer);
				this.getRelatedData(selectedFeature.attributes, selectedLayer);
			} else {
				this.noSelection();
			}
		},
		/**
		* Clears feature selections and corresponding information in side panel
		**/
		noSelection: function() {
			roadLayer.clearSelection();
			interLayer.clearSelection();
			document.getElementById('attributeInspectorDiv').style.display = 'none';
			document.getElementById('attributeUpdateMessage').innerHTML = '';
			document.getElementById('attributeUpdateMessage').style.display = 'none';
			document.getElementById('attributeMessage').innerHTML = '<b>No Feature Selected.</b>';
			document.getElementById('attributeMessage').style.display = 'block';
		}
	});
});