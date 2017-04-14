define([
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'dojo/_base/array',
	'dojo/_base/lang',
	'dojo/dom-construct',
	'dojo/topic',
	'dojo/aspect',
	'esri/tasks/query', 
	'esri/layers/FeatureLayer',
	'esri/tasks/RelationshipQuery',
	'esri/dijit/AttributeInspector',
	'dojo/dnd/Moveable',
	'dojo/promise/all',
	'dojo/text!./Editor/templates/Editor.html',
	'dojo/i18n!./Editor/nls/resource',
	'xstyle/css!./Editor/css/Editor.css',
	// 'dijit/form/Button'
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
	Moveable,
	all,
	template,
	i18n) {
	var selectedFeature, selectedLayer, attributeMessageContent, aliasTable, roadTable, roadLayer, interLayer, roadName, ai, univ_this;
	var missingAN = "";
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
			univ_this = this;
			var map = this.map;
			roadLayer = this.map.getLayer("roads");
			interLayer = this.map.getLayer("Intersections");
			this.loadRoadsegAlias();
			roadLayer.on('selection-complete',univ_this.handleSelection);
			map.infoWindow.on('hide', lang.hitch(this, univ_this.noSelection));
			map.infoWindow.on('show', lang.hitch(this, univ_this.removeCommas));
			
			// This bit of code makes infoWindows moveable
			var handle = Query(".title", map.infoWindow.domNode)[0];
	        var dnd = new Moveable(map.infoWindow.domNode, {
	            handle: handle
	        });
		},
		loadRoadsegAlias: function() {
			console.log('loadRoadsegAlias()...');
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
			console.log('getRoadName()...');
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
			console.log('getRelatedData()...');
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
					attributeMessageContent = "No alias exists for this road segment.";
				};
				attributeMessageContent += "<br><br> <input type='text' id='newAliasName' placeholder='Enter Alias Name...' style='width: 60%;'><button id='addAliasButton' type='button' align='center' style='width: 36%;'>Add New Alias</button>";
				attributeMessageContent += missingAN;
				document.getElementById('attributeMessage').innerHTML = attributeMessageContent;
				document.getElementById('attributeMessage').style.display = 'block';
				var _this = this;

				// Functionality to add new Alias record
				document.getElementById("addAliasButton").onclick = function () {
					var newAlias = document.getElementById("newAliasName").value;
					if (newAlias != "") {
						console.log('adding new alias...');
						var newAttributes = {
						geometry: null,
						attributes: {
							ROADSEGID: selectedFeature['ROADSEGID'],
							POSTDATE:new Date().getTime(),
							ALIAS_JURIS: null,
							POSTID: "",
							ALIAS_PREDIR_IND: null,
							ALIAS_NM: newAlias,
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
								console.log(error);
						}}).then( function() {
							missingAN = "";
							// Restart function to show newly created alias
							_this.getRelatedData(selectedFeature,selectedLayer);
							return;
						});
					} else {
						missingAN = "<br /><br /><span style='color:red;font-weight:bold;'>Please enter a valid alias name.</span>";
						_this.getRelatedData(selectedFeature,selectedLayer);
						return;
					}
				};
				
			}));
		},
		toggleEditing: function () {
			console.log('toggleEditing()...');
			if (!this.isEdit) {
				console.log('ON...');
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
					console.log('this.editor',this.editor);
					ai = this.editor.attributeInspector;
				}));
				this.toggleBTN.set('label', this.i18n.labels.stopEditing);
				this.toggleBTN.set('class', 'danger');
				this.isEdit = true;
				topic.publish('mapClickMode/setCurrent', 'editor');

			} else {
				console.log('OFF...');
				this.endEditing();
				topic.publish('mapClickMode/setDefault');
			}
		},
		endEditing: function () {
			console.log('endEditing()...');
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
			console.log('onLayoutChange()...');
			// end edit on close of title pane
			if (!open && this.mapClickMode === 'editor') {
				this.endEditing();
				topic.publish('mapClickMode/setDefault');
			}
		},
		setMapClickMode: function (mode) {
			console.log('setMapClickMode()...');
			this.mapClickMode = mode;
			if (mode !== 'editor') {
				this.endEditing();
			}
		},
		/**
		* Handles action when user selects a feature in 'editor' mode
		* Also handles if a user clicks a featureless area of map in 'editor' mode
		**/
		handleSelection: function(evt) {
			console.log('handleSelection()...');
			// if (evt.id == 'roads' || evt.target.id == 'roads') {
			// 	console.log('________________________road selected________________________');
			// }
			selectedLayer = roadLayer;
			selectedFeature = roadLayer._selectedFeatures;
			console.log('selectedFeature',selectedFeature);
			selectedFeature = selectedFeature[Object.keys(selectedFeature)[0]];
			if (selectedFeature != undefined) {
				univ_this.getRoadName(selectedFeature.attributes, selectedLayer);
				univ_this.getRelatedData(selectedFeature.attributes, selectedLayer);
			} else {
				univ_this.noSelection();
			}
			function ObjectLength( object ) {
				var length = 0;
				for( var key in object ) {
					if( object.hasOwnProperty(key) ) {
						++length;
					}
				}
				return length;
			};
		},
		/**
		* Removes initial commas from editor InfoWindow
		**/
		removeCommas: function(evt) {
			if (this.mapClickMode === 'editor'){
				console.log('removeCommas()...');
				// console.log('evt',evt);
				console.log('iw',univ_this.map.infoWindow);
				univ_this.map.infoWindow._nextFeatureButton.id = 'nf';
				univ_this.map.infoWindow._prevFeatureButton.id = 'pf';
				var _this = this;
				// document.getElementById("nf").onclick = function () {
				// 	univ_this.removeCommas();
				// 	return
				// }
				// document.getElementById("pf").onclick = function () {
				// 	univ_this.removeCommas();
				// 	return
				// }
				console.log('ai',ai);
				var lInfo = ai.layerInfos[0];// get the correct layerInfo
				console.log('lInfo',lInfo);
				lInfo.fieldInfos.forEach( function(item) {
					if(item.dijit && !item.field.domain){
						item.dijit.constraints && (item.dijit.constraints.pattern = "#");
						item.dijit.setValue(selectedFeature.attributes[item.fieldName]);  
					}
				});
			}
		},
		/**
		* Clears feature selections and corresponding information in side panel
		**/
		noSelection: function() {
			console.log('noSelection()...');
			roadLayer.clearSelection();
			interLayer.clearSelection();
			if (this.mapClickMode == 'editor') {
				document.getElementById('attributeInspectorDiv').style.display = 'none';
				document.getElementById('attributeUpdateMessage').innerHTML = '';
				document.getElementById('attributeUpdateMessage').style.display = 'none';
				document.getElementById('attributeMessage').innerHTML = '<b>No Feature Selected.</b>';
				document.getElementById('attributeMessage').style.display = 'block';
			}
		}
	});
});