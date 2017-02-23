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
	'dojo/string',
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
string, 
template, 
i18n) {
	var selectedFeatureAliasTable;
	var propAttInspector;
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
			// this.map.on('click', lang.hitch(this, function (evt){
			// }));
			this.map._layers.roads.on('click', lang.hitch(this, function (evt) {
				if (this.mapClickMode === 'editor') {
					var layerSel = this.map.getLayer("roads");
				// 	this.getRelatedRecords(this.objectId, layerSel, evt.graphic.attributes);
				// 	this.getRelatedAlias(this.objectId, layerSel, evt.graphic.attributes);
					relatedTable.clearSelection();
					// this.map.infoWindow.setTitle("Searching for related items...");
					// this.map.infoWindow.show(evt.screenPoint, this.map.getInfoWindowAnchor(evt.screenPoint));
					var graphicAttributes = evt.graphic.attributes;
					var objectId = evt.graphic.attributes['OBJECTID'];
					var title = this.getRoadName(objectId, layerSel, graphicAttributes);
					console.log('title:', title);

					var relatedQuery = new RelationshipQuery();
					relatedQuery.outFields = ["*"];
					relatedQuery.relationshipId = 1;
					relatedQuery.objectIds = [objectId];

					layerSel.queryRelatedFeatures(relatedQuery, lang.hitch(this, function (relatedRecords) {
						var fset = relatedRecords[objectId];
						var content = "";
						if (fset) {
							document.getElementById('attributeInspectorDiv').style.display = 'block';
							// this.map.infoWindow.setTitle(title || "No Title");
							var relatedObjectIds = arrayUtils.map(fset.features, function (feature) {
								return feature.attributes[relatedTable.objectIdField];
							});
							var selectQuery = new Query();
							selectQuery.objectIds = relatedObjectIds;
							relatedTable.selectFeatures(selectQuery, FeatureLayer.SELECTION_NEW);

						} else {
							content += "No Records Exist For this Point <button id='addFirstButton' type='button' onClick='addNewRecord()'>Add New</button>";
							document.getElementById('relatedDiv').innerHTML = content;
							// document.getElementById('attributeInspectorDiv').style.display = 'none';
							// this.map.infoWindow.setTitle("No Related Items");
						}
					}));
				};
			}));
			var relatedTable = new FeatureLayer("https://gis.sangis.org/maps/rest/services/Secured/SIRE/FeatureServer/7", {
				mode: FeatureLayer.MODE_ONDEMAND,
				id: "relatedTable",
				outFields: ["ALIAS_PREDIR_IND",
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
			relatedTable.on("load", lang.hitch(this, function () {
				var layerInfos = [{
					'featureLayer': relatedTable,
						'showAttachments': false,
						'isEditable': true,
						'fieldInfos': arrayUtils.map(relatedTable.fields, function (field) {
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
					document.getElementById('attributeInspectorMsg').innerHTML = msg;
				});
				attInspector.on("delete", function (evt) {
					evt.feature.getLayer().applyEdits(null, null, [evt.feature]);
					// map.infoWindow.hide();
				});
				// map.infoWindow.setContent(attInspector.domNode);
				// map.infoWindow.resize(350, 240);
			}));
		},
		addNewRecord: function() {
			var guid = selectedPointFeature.GlobalID
			if(selectedPointFeature.SystemType === 0){  //property maintenance feature
				relatedLayer = propMaintLayer;
				dojo.style(dojo.query(".propSaveButton")[0],"visibility","visible");
				var newAttributes = {attributes:{PointID:"" + guid + "",Date:new Date().getTime(),MaintType:"Preventative",Crew:"?",CleanOut:"N",Float:"N",Basket:"N",BioTube:"N",Lid:"N",PumpMotor:"N",ControlPanel:"N",CVTank:"N",CVStreet:"N",DschrgHose:"N",Lateral:"N",CleanSeptic:"N",SealSeptic:"N",Starter:"N",Relay:"N",Hmeter:"N",HighLevel:"N",SelfCorrect:"N",Other:"N"}};
			}else{
				relatedLayer = collectSysLayer;
				dojo.style(dojo.query(".collectSysSaveButton")[0],"visibility","visible");
				var newAttributes = {attributes:{PointID:"" + guid + "",Date:new Date().getTime(),MaintType:"Preventative",Crew:"?",AirRlfValve:"N",AVRVrebuild:"N",AVRVreplace:"N",Valve:"N",SewerClean:"N",SewerReplace:"N",LSchkPump:"N",Pump:"N",Float:"N",PumpRail:"N",Starter:"N",Relay:"N",HourMeter:"N",SSofVFD:"N",HighLevel:"N",SelfCorrected:"N",Other:"N"}};				
			}		
			//dojo.style(saveButton[0],"visibility","visible");
			
			
			relatedLayer.applyEdits([newAttributes],null,null,null,
			function(error){
			if(error){
			}
			}
			);
			if(dojo.byId('addFirstButton')){
				var content = "<b><span id='pointAddress'>" + (selectedPointFeature.Address === null ? "unknown address":selectedPointFeature.Address ) + "</span></b><br/>Click an event below to edit or <button id='addNewButton' type='button' onClick='addNewRecord()'>Add New</button><ul id='relatedRecords'>";
				dojo.byId('relatedDiv').innerHTML = content;
			}
		},
		getRoadName: function(oid, layer, graphicAttributes) {
			// var content;
			var full_name = "";
			var relatedQuery = new RelationshipQuery();
			relatedQuery.objectIds = [oid];
			relatedQuery.outFields = ["*"];
			relatedQuery.relationshipId = 2;
			relatedQuery.returnGeometry = false;
			var query_result = layer.queryRelatedFeatures(relatedQuery);
			promises = all(query_result);
			promises.then(handleQueryResults);
			function handleQueryResults(results)  {
				var selectedFeature, attr;
				// var content = "<table class='attrTable'>";
				selectedFeature = results.promise;
				// console.log(selectedFeature);
				attr = selectedFeature[oid].features["0"].attributes;
				full_name = attr['FULL_NAME'];
				console.log('ObjectID: ', oid, '\nRoad Name: ', full_name);
				// content += string.substitute("<tr><td class='attrName'>${label}</td><td class='attrValue'> ${value}</td></tr>",{label: 'Road Name', value: full_name});
				// content += "</table>";
				// document.getElementById('editorResult').innerHTML = content;
				return full_name.toString();
			};
			console.log('full_name: ',full_name);
			return full_name;
		},
		/*getRelatedAlias: function(oid, layer, graphicAttributes) {
			var content;
			var relatedQuery = new RelationshipQuery();
			relatedQuery.objectIds = [oid];
			relatedQuery.outFields = ["*"];
			relatedQuery.relationshipId = 1;
			relatedQuery.returnGeometry = false;
			var query_result = layer.queryRelatedFeatures(relatedQuery);
			promises = all(query_result);
			promises.then(handleQueryResults);
			function handleQueryResults(results)  {
				var selectedFeature, attr;
				var content = "<table class='attrTable'>";
				selectedFeature = results.promise;
				console.log('selectedFeature', selectedFeature);
				field_names = [	'ALIAS_PREDIR_IND',
								'ALIAS_NM',
								'ALIAS_SUFFIX_NM',
								'ALIAS_POST_DIR',
								'ALIAS_LEFT_LO_ADDR',
								'ALIAS_LEFT_HI_ADDR',
								'ALIAS_RIGHT_LO_ADDR',
								'ALIAS_RIGHT_HI_ADDR',
								'LMIXADDR',
								'RMIXADDR',
								'ALIAS_JURIS'];
				field_labels = ['Alias Pre Direction Type',
								'Alias Name',
								'Alias Suffix Type',
								'Alias Post Direction',
								'Left Low Address',
								'Left High Address',
								'Right Low Address',
								'Right High Address',
								'Left Mixed Address',
								'Right Mixed Address',
								'Alias Jurisdiction']
				field_values = [];
				if (selectedFeature[oid]) {
					selectedFeature = selectedFeature[oid].features["0"];
					selectedFeatureAliasTable = selectedFeature;
					console.log('selectedFeatureNew', selectedFeature);
					attr = selectedFeature.attributes;
					field_names.forEach(function(item, index) {
						if (attr[field_names[index]]) {
							content += string.substitute("<tr><td class='attrName'>${label}:</td><td class='attrValue'><input value='${value}'></input></td></tr>",{label: field_labels[index], value: attr[field_names[index]]});
						} else {
							content += string.substitute("<tr><td class='attrName'>${label}:</td><td class='attrValue'><input placeholder='no value'></input></td></tr>",{label: field_labels[index]});
						}
					});
				} else {
					field_names.forEach(function(item, index) {
						content += string.substitute("<tr><td class='attrName'>${label}:</td><td class='attrValue'><input placeholder='no value'></input></td></tr>",{label: field_labels[index]});
					});
				}
				content += "</table>";
				document.getElementById('editorResult').innerHTML += content;
			};
		},*/
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
				// document.getElementById('attributeInspectorDiv').style.display = 'none';
			}
		},
		endEditing: function () {
			if (this.editor && this.editor.destroyRecursive) {
				this.editor.destroyRecursive();
			}
			this.toggleBTN.set('label', this.i18n.labels.startEditing);
			this.toggleBTN.set('class', 'success');
			this.isEdit = false;
			this.editor = null;
			document.getElementById('attributeInspectorDiv').style.display = 'none';
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
		}
	});
});