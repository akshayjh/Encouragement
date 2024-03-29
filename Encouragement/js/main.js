﻿(function () {
    "use strict";

	var app = WinJS.Application;
	var activation = Windows.ApplicationModel.Activation;
	var isFirstActivation = true;

	var notifications = Windows.UI.Notifications;
	var notificationManager = notifications.ToastNotificationManager;

	var _isRegistered = false,
        _bgTaskName = "EncouragementTask",
        _registeredTasks = Windows.ApplicationModel.Background.BackgroundTaskRegistration.allTasks.first(),
        task;

    // loop throught all of the tasks and find out who is already registered
	while (_registeredTasks.hasCurrent) {
	    var task = _registeredTasks.current.value;
	    if (task.name === _bgTaskName) {
	        _isRegistered = true;
	        break;
	    }

	    _registeredTasks.moveNext();
	}

	if (!_isRegistered) {
	    var taskBuilder = new Windows.ApplicationModel.Background.BackgroundTaskBuilder();

	    var taskTrigger = new Windows.ApplicationModel.Background.SystemTrigger(
            Windows.ApplicationModel.Background.SystemTriggerType.timeZoneChange, false
        );

	    taskBuilder.name = _bgTaskName;
	    taskBuilder.taskEntryPoint = "NotificationBackgroundTaskRuntimeComponent.NotificationTask";
	    taskBuilder.setTrigger(taskTrigger);

	    // Add user present condition to task
        taskBuilder.addCondition(
            new Windows.ApplicationModel.Background.SystemCondition(
                Windows.ApplicationModel.Background.SystemConditionType.userPresent
            )
        );

	    task = taskBuilder.register();
	}

	app.onactivated = function (args) {
		if (args.detail.kind === activation.ActivationKind.voiceCommand) {
			// TODO: Handle relevant ActivationKinds. For example, if your app can be started by voice commands,
			// this is a good place to decide whether to populate an input field or choose a different initial view.
		}
		else if (args.detail.kind === activation.ActivationKind.launch) {
			// A Launch activation happens when the user launches your app via the tile
			// or invokes a toast notification by clicking or tapping on the body.
			if (args.detail.arguments) {
				// TODO: If the app supports toasts, use this value from the toast payload to determine where in the app
				// to take the user in response to them invoking a toast notification.
			}
			else if (args.detail.previousExecutionState === activation.ApplicationExecutionState.terminated) {
				// TODO: This application had been suspended and was then terminated to reclaim memory.
				// To create a smooth user experience, restore application state here so that it looks like the app never stopped running.
				// Note: You may want to record the time when the app was last suspended and only restore state if they've returned after a short period.
			}
		}

		if (!args.detail.prelaunchActivated) {
			// TODO: If prelaunchActivated were true, it would mean the app was prelaunched in the background as an optimization.
			// In that case it would be suspended shortly thereafter.
			// Any long-running operations (like expensive network or disk I/O) or changes to user state which occur at launch
			// should be done here (to avoid doing them in the prelaunch case).
			// Alternatively, this work can be done in a resume or visibilitychanged handler.
		}

		if (isFirstActivation) {
			// TODO: The app was activated and had not been running. Do general startup initialization here.
			document.addEventListener("visibilitychange", onVisibilityChanged);
			args.setPromise(WinJS.UI.processAll());

		    // Retrieve the test button and register our event handler.
			var testButton = document.getElementById("testButton");
			testButton.addEventListener("click", testButtonClickHandler, false);

			displayUserGreeting();
		}

		isFirstActivation = false;
	};

	function onVisibilityChanged(args) {
		if (!document.hidden) {
			// TODO: The app just became visible. This may be a good time to refresh the view.
		}
	}

	app.oncheckpoint = function (args) {
		// TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
		// You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
		// If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
	};

	function testButtonClickHandler(eventInfo) {
	    displayToast("Here I am!");
	}

	function displayUserGreeting() {
	    if (Windows.System.UserProfile.UserInformation.nameAccessAllowed) {

	        var firstName = Windows.System.KnownUserProperties.firstName;

	        Windows.System.UserProfile.UserInformation.getFirstNameAsync().done(function (result) {
	            if (result) {
	                displayToast("Hello " + result + ", you are doing great!")
	            } else {
	                displayToast("You are doing great!");
	            }
	        });
	    } else {
	        displayToast("You're doing great!");
	    }
	}

	function displayToast(message) {
	    // Create the toast xml
	    var template = notifications.ToastTemplateType.toastImageAndText01;
	    var toastXml = notificationManager.getTemplateContent(template);

	    // Set the toast text
	    var toastTextElements = toastXml.getElementsByTagName("text");
	    toastTextElements[0].appendChild(toastXml.createTextNode(message));

	    // Set the toast image
	    var toastImageElements = toastXml.getElementsByTagName("image");
	    toastImageElements[0].setAttribute("src", "ms-appx:///images/smiles/face-grin.png");
	    toastImageElements[0].setAttribute("alt", "Grinning face");

	    // Show the toast
	    var toast = new notifications.ToastNotification(toastXml);

	    var toastNotifier = notifications.ToastNotificationManager.createToastNotifier();
	    toastNotifier.show(toast);
	}

	app.start();

})();
