---
title: Measure application startup performance
description: Project to evaluate the impact of an add-in on application startup performance.
date: 2021-09-30 22:16:55 +0200
last_modified_at: 2021-09-30 22:16:55 +0200
published: true
categories: [Projects, Desktop]
tags: [DotNet, CSharp, FlaUI, Desktop automation, Performance testing, Windows]
mermaid: false
media_subpath: /assets/media/2021/measure-application-startup-performance/
image: cover.webp
---

## Story

As part of a team developing an add-in for Microsoft Office, I was asked to test and measure whether our add-in would slow down the startup performance of the main desktop application we were integrating with. This was a critical requirement because users would launch the application very frequently throughout the workday, and so people might be forced to disable the add-in if it caused their applications to take longer to open than usual. On the other hand, based on the telemetry collected by the application, the add-in can be forcibly disabled if it is degrading the overall performance of the application, which is completely understandable and at the same time completely unacceptable from a product development standpoint.

## Requirements

Use an existing solution or build a new one to:
* Measure desktop application startup performance
* Generate reports with test results
* Mark test execution as passed/failed in CI based on test results

As a nice to have feature, extend the solution to perform additional checks specific to add-in load, such as add-in presence checks, to ensure the accuracy of the received report.

## Investigation

There are solutions for measuring application performance, such as integrated or standalone profilers. We have nice tools to test the performance of web applications. However, I have noticed that there is much less information about performance testing of desktop applications that you need to integrate your solution with. Even if we can find some built-in mechanisms, such as in Microsoft Office applications, they are usually difficult to use in an automated way, or have limited capabilities, and sometimes they are designed primarily for internal use, which is totally understandable.

I had to accept the fact that I needed a custom solution. During my research, I found an interesting example of an application that aims to test the startup performance of desktop applications by launching the application and detecting the point at which the application becomes visible and waits for idle input.

![PassMark AppTimer](app-timer.webp)
_PassMark AppTimer[^PassMarkAppTimer]_

This was pretty close to what I was looking for, so I decided this was a good starting point for my idea. However, I had to work around its limitations: it won't work for complex applications and it can't be extended to add additional features.

I already had an E2E testing solution based on FlaUI [I wrote earlier](/posts/test-framework-for-microsoft-office-add-in/), so it would be good to reuse existing functionality. It turned out that Windows Automation's TreeWalker can only collect information about UI elements when the application is fully loaded and responding. This looked like a good alternative to `Input idle`.

## Solution

### Identify application state

Here are the steps I took to determine when the application was fully loaded:
- Launch the application.
- Wait for the expected window to appear.
- Find the UI element in the application using `Tree Walker` and check it's property.

The property can be based on the type or properties of the element. For example, in the case of a Word application, the most valuable UI element may be the document text area. If it's present and editable, then the application is fully loaded and interactive for the user.

So, in the case of the Word application, I want to measure the time it takes for the application to open a document and end the test when the text area meets the predefined criteria. Here is an example of the method that implements this logic.

```csharp
public void WaitForWordBecameInteractive(IApplication application)
{
    var cts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
    while (!cts.IsCancellationRequested)
    {
        try
        {
            var windowTitle = application.GetMainWindowTitle();
            if (windowTitle.ToLower().StartsWith("opening"))
            {
                // Ignore splash screen
                continue;
            }

            var element = application.MainWindow.FindFirstByXPath("//*[@Name='Page 1 content']");
            if (element == null)
            {
                continue;
            }

            if (element.IsEditable)
            {
                // Application is ready for use
                return;
            }
        }
        catch (Exception ex)
        {
            if (ex is COMException || ex is PropertyNotSupportedException)
            {
                // Ignore, splash screen might be closed in the middle of execution
                continue;
            }
            else
            {
                throw;
            }
        }
    }
}
```

Since I know the start and end time of the test execution, I can compare the results of launching the application with and without the add-in installed to see how it affects the launch performance of the application.

### Collect performance metrics

However, having only time in seconds, for example, may not be enough to say that we've got accurate test results, because many other things can happen during test execution and affect them. To be able to evaluate test results, we can collect additional data, such as performance statistics of the operating system and application under test.

```csharp
private readonly IList<PerformanceMetric> _performanceMetrics = new List<PerformanceMetric>();
private readonly TimeSpan _monitoringFrequency;
private readonly int _numberOfProcessors;
private readonly string[] _processNames;
private readonly object _collectLock = new object();
private Timer _timer;

public PerformanceMonitor(TimeSpan monitoringFrequency, string[] processNamesToMeasure)
{
    _monitoringFrequency = monitoringFrequency;
    _processNames = processNamesToMeasure;
    _numberOfProcessors = Environment.ProcessorCount;
}

private void AddProcessMetrics(string processName)
{
    _performanceMetrics.Add(new PerformanceMetric("Process", "% Processor Time", processName, "%", f => f / _numberOfProcessors));
    _performanceMetrics.Add(new PerformanceMetric("Process", "Working Set - Private", processName, "KB", f => f / 1024));
    _performanceMetrics.Add(new PerformanceMetric("Process", "Elapsed Time", processName, "s"));
    _performanceMetrics.Add(new PerformanceMetric("Process", "IO Data Bytes/sec", processName, "KB", f => f / 1024));
    _performanceMetrics.Add(new PerformanceMetric("Process", "Thread Count", processName));
}

private void AddSystemMetrics()
{
    _performanceMetrics.Add(new PerformanceMetric("Processor", "% Processor Time", "_Total", "%"));
    _performanceMetrics.Add(new PerformanceMetric("Memory", "Available MBytes", null, "MB"));
    _performanceMetrics.Add(new PerformanceMetric("LogicalDisk", "Disk Bytes/sec", "C:", "KB", f => f / 1024));
    _performanceMetrics.Add(new PerformanceMetric("LogicalDisk", "% Disk Time", "C:", "%"));
}

private void CollectAllMetrics()
{
    if (Monitor.TryEnter(_collectLock))
    {
        try
        {
            foreach (var metric in _performanceMetrics)
            {
                metric.CollectNextValue();
            }

            return;
        }
        finally
        {
            Monitor.Exit(_collectLock);
        }
    }

    OnWarningReceived(string.Concat(
            "Skipping collecting performance metrics as previous collecting attempt has not finished yet. ",
            "Increase the resolution to avoid this problem."));
}

public void Start()
{
    if (_timer != null)
    {
        throw new InvalidOperationException("Performance monitor can be started only once.");
    }

    if (_monitoringFrequency.TotalSeconds < 1)
    {
        OnWarningReceived("It is not recommended to use monitoring frequency less than 1 second.");
    }

    AddSystemMetrics();
    foreach (var process in _processNames)
    {
        AddProcessMetrics(process);
    }

    _timer = new Timer(callback => CollectAllMetrics(), null, 0, (int)_monitoringFrequency.TotalMilliseconds);
}
```

All collected metrics can be saved in any way for later inclusion in the test execution report.

### Workflow

The overall flow of a possible test execution scenario for a given application might be as follows
* Warm up
Run the test without collecting performance metrics and saving the test results to reduce the effect of the application's cold-start variance. Repeat a few times.

* Run the test without the add-in installed (baseline)
Run the test to evaluate what it takes for the application to start on its own, and then compare it to that.

* Run the test with the add-in installed
Run the test to collect metrics for the application with the add-in installed.

* Get feedback
Analyze the results and pass/fail the execution process so that job execution in CI can pass/fail accordingly. Generate a test execution report for attachment.

## Conclusion

This solution has proven to be stable and provides an accurate test status result. While it serves the purpose of warning when changes are made that affect startup performance, it has some overall drawbacks:

* Failed results must be evaluated manually
If for some reason the test took longer to run and produced a failed result, you will need to analyze the overall performance report to see if there were any processes running, such as virus scanning, that affected disk or CPU usage. This process is completely manual and requires some experience. However, we can still run the test again at a later time to double check.

* No degradation details
If there is a performance degradation, we will not have any useful information about why exactly it happened.

* Requires an interactive environment
To perform tests, this solution requires a Windows server running as a CI agent in interactive mode, which requires a bit more computation and additional configuration.

* Unsuitable for all cases
The solution is designed based on analysis of target applications and may not work for other applications. It's completely up to the application implementation, and plug-in initialization can be fully parallel or delayed until the main process is fully loaded, so you won't affect startup performance in any way.

## References
[^PassMarkAppTimer]: [PassMark AppTimer](https://www.passmark.com/products/apptimer/)
