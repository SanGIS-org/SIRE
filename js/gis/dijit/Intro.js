define([
	'dojo/_base/declare',
	'dijit/_WidgetBase',    
	'dijit/_TemplatedMixin',
	'dojo/text!./Intro/templates/Intro.html',
], function (declare, _WidgetBase, _TemplatedMixin, IntroTemplate) {

	return declare([_WidgetBase, _TemplatedMixin], {
		declaredClass: 'gis.digit.Intro',
		templateString: IntroTemplate,

		postCreate: function () {
			this.inherited(arguments);

			//this.domNode.innerHTML = "HELP TEXT";
		},
	});
});