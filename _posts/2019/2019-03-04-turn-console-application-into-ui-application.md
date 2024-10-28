---
title: Turn a console application into a UI application
description: Project to add a user interface to the console application.
date: 2019-03-04 21:44:37 +0300
last_modified_at: 2019-03-04 21:44:37 +0300
published: true
categories: [Projects, Desktop]
tags: [DotNet, CSharp, WinForms, MVC, Windows]
mermaid: false
media_subpath: /assets/media/2019/turn-console-application-into-ui-application/
image: cover.webp
---

## Story
Some applications are designed for computers, not people. Imagine a service that runs in the background and performs some tasks periodically. While such applications work fine without a user interface, it makes them difficult for humans to use. But that is not a problem because they were never intended to be. However, there are times when we want to interact with such applications for debugging, testing, or demonstration purposes. In such cases, adding a simple UI can make a big difference.

I was once confronted with such applications. They required passing some parameters that were not obvious to people who rarely had to deal with them. So doing it through the console was not convenient. At some point, I decided to add a UI to interact with them and reduce the time spent thinking about what parameters to pass and avoid human error in following specific workflows related to the service.

## Demo
{% include embed/youtube.html id='JQEGedtAd0I' %}

## Requirements
- Add a user interface to interact with the console application
- Make it easy for people to use
- Prevent incorrect user actions

## Solution
Stack used:
- C#/.NET WinForms

I have created an MVC application using Windows Forms to be deployed alongside the existing console applications hosted on a Windows Server instance. Since running them concurrently can cause problems, I added a warning to the UI application using `Mutex' to display a confirmation prompt if another instance is already running.

```csharp
internal static class Program
{
    private static Mutex _mutex;

    [STAThread]
    private static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        if (!IsSingleInstance() && ConfirmToContinue() != DialogResult.Yes) return;

        var view = new MyAppUiForm();
        var settingsService = new SettingsService();
        var databaseService = new DatabaseService(settingsService);
        var taskRunnerService = new TaskRunnerService(settingsService, databaseService);
        var model = new MyAppUiModel(databaseService);
        var presenter = new MyAppUiPresenter(view, model, taskRunnerService);
        Application.Run(view);
    }

    private static DialogResult ConfirmToContinue()
    {
        return MessageBox.Show(
            Resources.MessageProgramAlreadyRunning,
            Resources.AppName,
            MessageBoxButtons.YesNo,
            MessageBoxIcon.Warning
            );
    }

    private static bool IsSingleInstance()
    {
        try
        {
            Mutex.OpenExisting(Resources.AppName);
        }
        catch
        {
            _mutex = new Mutex(true, Resources.AppName);
            return true;
        }
        return false;
    }
}
```

When the user launches the UI application, they are prompted to choose from a predefined list of actions to perform. To prevent incorrect actions, I added a validation to the model to adjust the user's choice. So, if the user chooses an action `A` that requires another action `B` to be completed before or after, the model will automatically select `B` as well. I left the final decision to the end user, so he can uncheck action `B`. To avoid confusion, I also added "tooltips" explaining dependencies between actions.

```csharp
public class MyAppUiModel : IMyAppUiModel
{
    public TaskOptions TaskOptions { get; private set; } = TaskOptions.None;

    public bool ActionA
    {
        get => TaskOptions.HasFlag(TaskOptions.ActionA);
        set
        {
            if (value)
            {
                TaskOptions |= TaskOptions.ActionA;
                TaskOptions |= TaskOptions.ActionB;
            }
            else
            {
                TaskOptions &= ~TaskOptions.ActionA;
            }
        }
    }
}
```

Task cross dependencies were tricky, so I had to implement unit tests for model classes to make changes to the models safe.

Finally, when user clicks "Execute" button, tasks are queued and executed by `TaskRunnerService`. To update the UI, I have used a separate thread to run long-running tasks asynchronously, while having ability to report progress and results back to the UI thread.

```csharp
private async void ExecuteTasks(object sender, EventArgs e)
{
    _view.DisableExecutionControls();
    await Task.Factory.StartNew(() => { _taskRunner.ExecuteTasks(_model.TaskOptions, _model.Clients); });
    _view.EnableExecutionControls();
}
```

## Conclusion
It's a good thing to think about ways to improve usability even for applications not originally designed for direct user interaction, keeping in mind development and test environments. Yes, it may not be feasible to build a UI application for every case. But having nice command line help and input parameter validation can go a long way.
