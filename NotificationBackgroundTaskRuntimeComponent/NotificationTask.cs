using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.ApplicationModel.Background;
using Windows.ApplicationModel.Store;
using Windows.Data.Xml.Dom;
using Windows.Storage;
using Windows.System.Threading;
using Windows.UI.Notifications;

namespace NotificationBackgroundTaskRuntimeComponent
{
    public sealed class NotificationTask : IBackgroundTask
    {
        public async void Run(IBackgroundTaskInstance taskInstance)
        {
            BackgroundTaskDeferral deferral = taskInstance.GetDeferral();

            Debug.WriteLine("Testing app!!!");

            ShowToast();

            deferral.Complete();
        }

        private void ShowToast()
        {
            // simple example with a Toast, to enable this go to manifest file
            // and mark App as TastCapable - it won't work without this
            // The Task will start but there will be no Toast.
            ToastTemplateType toastTemplate = ToastTemplateType.ToastText02;
            XmlDocument toastXml2 = ToastNotificationManager.GetTemplateContent(toastTemplate);
            XmlNodeList textElements = toastXml2.GetElementsByTagName("text");
            textElements[0].AppendChild(toastXml2.CreateTextNode("My first Task"));
            textElements[1].AppendChild(toastXml2.CreateTextNode("I'm message from your background task!"));
            ToastNotificationManager.CreateToastNotifier().Show(new ToastNotification(toastXml2));
        }
    }
}
