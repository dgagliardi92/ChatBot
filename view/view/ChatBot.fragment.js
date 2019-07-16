sap.ui.jsfragment("softtek.view.view.ChatBot", {
	createContent: function () {
		$.sap.require("sap.ui.layout.form.SimpleForm");
		$.sap.require("sap.ui.commons.layout.HorizontalLayout");
		var oLayout = new sap.ui.layout.VerticalLayout().addStyleClass("window");
		var oHLayout = new sap.ui.layout.HorizontalLayout("history").addStyleClass(".history");
		var oImg = new sap.m.Image({
			src: "https://sdlambert.github.io/loremipsum/img/smiling36.svg",
			height: "20%",
			width: "20%"
		}).addStyleClass("middle");
		var oTextArea = new sap.m.Input("chat", {
			placeholder: "Escriba algo...",
			//autofocus: "autofocus",
			valueLiveUpdate: false
		}).addStyleClass("input middle");
		var oLabel = new sap.m.Text("oLabel1", {
			textAlign: sap.ui.core.TextAlign.End
		}).addStyleClass("rightLabel");
		oHLayout.addContent(oLabel);
		oLayout.addContent(oHLayout); //Chat Input by user display
		oHLayout = new sap.ui.layout.HorizontalLayout({
			//width: "20%"
		}).addStyleClass("middle");
		oHLayout.addContent(oTextArea);
		oHLayout.addContent(oImg);
		oLayout.addContent(oHLayout); //Chat area for user
		var oForm = new sap.ui.layout.form.SimpleForm({
			maxContainerCols: 1,
			editable: true,
			layout: "ResponsiveGridLayout",
			//minWidth: 1024,
			visible: true
		}).addStyleClass("sapUiNoContentPadding");
		oForm.addContent(oLayout);
		oForm.addContent(oHLayout);
		var dialog = new sap.m.ResponsivePopover({
			title: "Chatea con el Bot",
			contentHeight: "50%",
			contentWidth: "29%",
			placement: sap.m.PlacementType.Bottom
		});
		dialog.addContent(oForm); //popover to display text and chat input area
		return dialog;
	}
});