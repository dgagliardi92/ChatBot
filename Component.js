sap.ui.define([
	"sap/ui/core/Component",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/MessageToast"
], function (Component, Button, Bar, MessageToast) {

	return Component.extend("softtek.Component", {

		metadata: {
			"manifest": "json"
		},

		onSupportHeaderItemPress: function (oEvent) {

			var that = oEvent.getSource()._Component;

			if (!this.oChatBot) {
				this.oChatBot = sap.ui.jsfragment("softtek.view.view.ChatBot", this);
				this.oChatInput = this.oChatBot.getContent()[0].getContent()[1].getContent()[0];
				this.oChatInput.attachLiveChange(that.addConversation.bind(this));

				var oModel = new sap.ui.model.json.JSONModel({
					data: {}
				});
				this.oChatBot.setModel(oModel);

				//this.oChatBot.openBy(that._oSupportHeaderItem);
				this.oChatInput.attachSubmit(that.parseText.bind(this));

				this.oChatInput._Component = that;
				that.isTyping = false;
			}

			this.oChatBot.openBy(that._oSupportHeaderItem);

			document.getElementById("oLabel1").innerHTML = that.history2;

			setTimeout(function () {
				document.getElementById("__layout0").scrollTop = that.historyScroll;
				document.getElementById("oLabel1").scrollTop = that.historyScroll;
			}, 50);

			// document.getElementById("__layout0").scrollTop = that.historyScroll;
			// document.getElementById("oLabel1").scrollTop = that.historyScroll;

		},

		addConversation: function (oEvent) {
			var newValue = oEvent.getParameter("value");
			var that = this;
		},

		parseText: function (oEvent) {

			var that = oEvent.getSource()._Component;
			var message;

			message = sap.ui.getCore().byId("chat").getValue().trim();

			// message is "sent" and triggers bot "response" with small delay
			if (message !== "") {
				sap.ui.getCore().byId("chat").setValue("");
				that.createMessage("user", message);
				// Only respond to one message at a time
				if (!that.isTyping) {
					//var that = this;
					that.isTyping = true;
					setTimeout(function () {
						that.respondTo(message);
					}, Math.random() * (4000) + 10);
				}
			}
		},

		init: function () {

			var that = this;

			var rendererPromise = this._getRenderer();

			if (!this._flag_init) {
				this._flag_init = false;
				var oRendererExtensions = jQuery.sap.getObject('sap.ushell.renderers.fiori2.RendererExtensions');
				this._oSupportHeaderItem = new sap.ushell.ui.shell.ShellHeadItem('supportChatBtn', {
					icon: sap.ui.core.IconPool.getIconURI('travel-request'),
					tooltip: 'Support Chat',
					showSeparator: true,
					press: this.onSupportHeaderItemPress
				}, true, false, "home");

				this._oSupportHeaderItem._Component = this;

				oRendererExtensions.addHeaderEndItem(this._oSupportHeaderItem);
			}
		},

		onAfterRendering: function () {
			this.getBot(); //get user uuid of your bot account in recast.ai
		},

		openBot: function (button) {
			if (!this.oChatBot) {
				this.oChatBot = sap.ui.jsfragment("softtek.view.view.ChatBot", this);
				this.oChatInput = this.oChatBot.getContent()[0].getContent()[1].getContent()[0];
				this.oChatInput.attachLiveChange(this.addConversation.bind(this));
			}
			var oModel = new sap.ui.model.json.JSONModel({
				data: {}
			});
			this.oChatBot.setModel(oModel);

			this.oChatBot.openBy(button);
			// Init listeners
			this.chatInput = document.getElementById("chat");
			this.chatInput.addEventListener("keyup", this.parseText.bind(this), false);
			this.history = document.getElementById("oLabel1");

			this.isTyping = false;
		},
		/**
		 **
		 * parseText is the callback for the keyup eventlistener, and listens for
		 * enter key to be pressed, signaling that the user has entered a message.
		 *
		 * @param {Event} event          - keyup from chatInput
		 *
		 */

		/*
		 * respondTo responds to the user's message by picking random lorem ipsum
		 * words from the words object.
		 *
		 * @param  {String} message    - incoming message string
		 *
		 */
		respondTo: function (message) {
			var response = "", // String to hold generated response
				responseLength, // number of words in response
				numChars, // number of characters in word
				selectedWord, // index of selected word (by length)
				delay, // chat bot delay in ms
				msgLength, // number of words in @message String
				comma; // optional comma

			// short sentences typically get short responses.
			if (message.indexOf(" ") === -1)
				msgLength = 1;
			else
				msgLength = message.split(" ").length;

			// maximum response length is 2 more words than the incoming message
			responseLength = Math.ceil(Math.random() * (msgLength + 2));

			// longer sentences should get a comma
			if (responseLength > 8)
				comma = Math.ceil(responseLength / 2);

			// simulated delayed response
			delay = Math.ceil(Math.random() * (responseLength + 1) * 1000) + 250;
			if (msgLength > 0) { //if user has inputted message then
				var _data = {
					"message": {
						"type": "text",
						"content": message
					},
					"conversation_id": "test-1533969037613",
					"log_level": "info"
				};
				var that = this;
				$.ajax({
					type: "POST",
					data: JSON.stringify(_data),
					url: "https://" + "api.recast.ai/build/v1/dialog",
					contentType: "application/json",
					path: "/build/v1/dialog",
					scheme: "https",
					headers: {
						"Authorization": "Token 9c7c9246e5d2bbde95a326eb6733ab99",
						"x-uuid": that.uuid
					},
					success: function (data) {
						// 		// do what you need to 
						console.log('[POST] /discover-dialog', data);
						that.pqaBotConversation = data;
						data.results.messages.forEach(jQuery.proxy(function (message) {
							that.createMessage("bot", message.content, delay, message.type);
						}), this);
						//that.createMessage("bot", data.results.messages[0].content, delay, data.results.messages[0].type);	
					},
					error: function (data) {
						that.botError = data;
					}
				});
			}
		},
		/**
		 * createMessage creates a message with an optional delay and posts it to the
		 * .chat_history window.
		 *
		 * @param  {String} from       - "user", "bot" class
		 * @param  {String} message    - message
		 * @param  {Number} delay      - delay in MS
		 *
		 */
		createMessage: function (from, message, delay, type) {
			var p, // paragraph element for message
				img, // image for avatar
				innerDiv, // inner div to hold animation and avatar
				outerDiv, // outer div for clearing floats
				animationSequence, // class list for animation
				position; // left or right

			//document.write("<script type='text/javascript' src='https://sap.github.io/ui5-webcomponents/resources/sap-ui-custom.js'></script>");

			// paragraph
			p = document.createElement("p");

			// img
			img = document.createElement("img");

			if (from === "bot") {
				//img.src = "https://sdlambert.github.io/loremipsum/img/helmet1.svg";
				img.src = "https://static.thenounproject.com/png/852157-200.png";
				position = "left";
			} else if (from === "user") {
				img.src = "https://sdlambert.github.io/loremipsum/img/user168.svg";
				position = "right";
			}

			img.classList.add("avatar", "middle", position);

			// inner div
			var innerDiv = document.createElement("div");
			innerDiv.appendChild(img);
			innerDiv.classList.add(from);

			// add animation, remove animation, add message
			if (delay) {
				this.addAnimation(innerDiv);
				var that = this;
				setTimeout(function () {
					that.removeAnimation(innerDiv);

					switch (type) {
					case "text":
						p.innerHTML = message;
						break;
					case "quickReplies":

						p.appendChild(document.createTextNode(message.title));

						p.appendChild(document.createElement("br"));

						that.crearBoton(message.buttons[0].title, that.onPressButton, p, that);
						that.crearBoton(message.buttons[1].title, that.onPressButton, p, that);

						break;
					}
					that.isTyping = false;

					innerDiv.appendChild(p);

					document.getElementById("__layout0").scrollTop = document.getElementById("__layout0").scrollHeight;
					that.history2 = document.getElementById("oLabel1").innerHTML;
					that.historyScroll = document.getElementById("__layout0").scrollHeight;

				}, delay);
			} else {
				p.appendChild(document.createTextNode(message));
				innerDiv.appendChild(p);
			}

			//outer div
			outerDiv = document.createElement("div");
			outerDiv.appendChild(innerDiv);
			outerDiv.classList.add("full");

			// history
			document.getElementById("oLabel1").appendChild(outerDiv);
			document.getElementById("__layout0").scrollTop = document.getElementById("__layout0").scrollHeight - 30;

			this.history2 = document.getElementById("oLabel1").innerHTML;
			this.historyScroll = document.getElementById("__layout0").scrollHeight;

		},

		onPressButton: function (oEvent) {
			that.createMessage("user", this.id);
		},

		crearBoton: function (text, funcion, context, that) {
			var button = document.createElement("input");
			button.id = text;
			button.type = "button";
			button.value = text;
			button.className = "QR";
			button.onclick = function () {
				//that.createMessage("user", text);
				if (!that.isTyping) {
					that.isTyping = true;
					setTimeout(function () {
						that.respondTo(text);
					}, Math.random() * (4000) + 10);
				}
			};

			context.appendChild(button);
		},
		/**
		 * addAnimation adds the "typing" animation to element by appending the
		 * animation sequence divs to the target element.
		 *
		 * @param {HTMLElement} element  - the target Element
		 *
		 */
		addAnimation: function (element) {
			var animationSequence = ["one", "two", "three"];

			animationSequence.forEach(function (animationClass) {
				var newDiv = document.createElement("div");
				newDiv.classList.add("bouncer", animationClass);
				element.appendChild(newDiv);
			});
		},
		removeAnimation: function (element) {
			var i = element.childNodes.length - 1;

			for (; i >= 0; i--)
				if (element.childNodes[i].tagName === "DIV")
					element.removeChild(element.childNodes[i]);
		},

		getBot: function () {
			var that = this;
			//check your user-slug in recast
			$.ajax({
				type: "GET",
				// data: {"line1":"hi"},
				url: "https://" + "api.recast.ai/auth/v1/owners/k-mus",
				headers: {
					"Authorization": "e33c4ab40c0916f364a8f1c7688b1478"
				},
				success: function (data) {
					that.uuid = data.results.owner.id;
					//console.log("uuid" + that.uuid);
				},
				error: function (data) {}
			});

		},

		addButton: function (oRendererExt) {
			var toolbar = new sap.m.Toolbar({
				content: [
					new sap.m.ToolbarSpacer(),
					new sap.m.Button({
						id: "ChatBot",
						text: "Chat",
						press: jQuery.proxy(function () {
							this.openBot();
						}, this)
					})
				]
			});
			oRendererExt.addSubHeader(toolbar);
		},

		_getRenderer: function () {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");

			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function (oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		}

	});
});