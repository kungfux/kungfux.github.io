---
title: Resource limitations cause bugs
description: Overview of interesting bugs caused by resource limitations.
date: 2015-01-18 16:00:21 +0300
last_modified_at: 2015-01-18 16:00:21 +0300
published: true
categories: [Posts, Software Testing]
tags: [Testing]
mermaid: false
media_subpath: /assets/media/2015/resource-limitations-cause-bugs/
image: cover.webp
---

## Introduction
While answering interview questions, I was once asked about the most interesting bug I had encountered during my career as a software test engineer. I never thought about rating the "interestingness" of bugs, but I started thinking about how to answer the interviewer. It would be trivial to come up with cases where something just did not work, or problems with business logic and data validation. But what really makes a bug story interesting is when limitations in the underlying platform or resources manifest themselves in unexpected ways.

## Case #1: GDI object leaks
An interesting bug I encountered was while testing a C++ desktop application that contained a list of items on the left side showing instrumental results received from external medical devices, with the ability to view details for each item on the right side by clicking on it. The application's user interface was complex, with many labels, fields, and graphics to represent the medical data. I noticed that over time, while working with the application and refreshing the list of available results, application elements would begin to disappear and the entire application screen would appear broken, with only a portion of the visual elements visible.

It turns out that there was a GDI object leak. According to Wikipedia, the Graphics Device Interface (GDI) is a legacy component of Microsoft Windows that is responsible for representing graphical objects and transferring them to output devices such as monitors and printers. Windows applications use the Windows API to interact with the GDI for tasks such as drawing lines and curves, rendering fonts, and handling palettes. The Windows user interface subsystem uses the GDI to render user interface elements such as window borders and menus. As a result, each graphical element, such as a button, label, or image, loaded by the application would consume a GDI object. Due to the complex nature of the UI in the application under test, a large number of GDI objects were created and not properly cleaned up or released. Over time, as the user refreshed the list and viewed details, the number of GDI objects would exceed the limit set by Windows, causing the application to malfunction.

![Task manager showing GDI objects](taskmgr-dark.webp){: .dark }
![Task manager showing GDI objects](taskmgr-light.webp){: .light }
_Task manager showing GDI objects_

## Case #2: Running out of handlers
In another case, I decided to create a small application to keep my notes during manual test execution, such as data values entered, steps performed, expected vs. actual results, etc. This application had a simple user interface with a text area for entering notes and an auto-save feature so that I would never lose my data even if the application unexpectedly closed. It worked well on my machine.

The implementation of auto-save feature was similar to the code below. It used a `Timer` to periodically write the textbox contents to a file.

```csharp
public partial class Form1 : Form
{
    Timer timer;

    public Form1()
    {
        InitializeComponent();

        timer = new Timer();
        timer.Interval = 5000;
        timer.Tick += Timer_Tick;
        timer.Start();
    }

    private void Timer_Tick(object sender, EventArgs e)
    {
        var writer = new StreamWriter("notes.txt");
        writer.Write(textBox1.Text);
        writer.Close();
    }
}
```

There were certain testing activities that we needed to perform on a remote Windows server machine that was shared by several people who were connected at the same time. I decided to use the same Notes application on this machine. However, after some time of using the application, people started claiming that the applications under test were closing unexpectedly and that we were probably dealing with a potential bug. After some debugging and looking at the Task Manager, we found that my Notes application was causing the problem.

My Notes application had only a few lines of code and was written quickly to serve a simple purpose. How could it go wrong? I don't remember the exact implementation details, but it is clear that my application did not properly close the file handlers after automatically saving the notes. As a result, the handlers kept accumulating over time and eventually reached the maximum handler limit. Once the limit is reached, Windows Server starts forcibly closing applications to free up resources.

## Conclusion
- Get your application used every day, not just by QA, but by the entire team. This helps to uncover many issues related not only to functionality, but also to usability, performance, and resource usage.
- As a software developer, be aware of resource constraints. For example, limit the number of objects created, close database connections, etc. to avoid hitting OS/hardware limits.
