---
title: Easy software updates
description: An introduction to winget tool for managing software on Windows computers.
date: 2024-10-26 04:21:11 +0400
last_modified_at: 2024-10-26 04:21:11 +0400
published: true
categories: [Posts, Software Development]
tags: [Winget, Windows]
mermaid: false
media_subpath: /assets/media/2024/easy-software-updates/
image: cover.webp
---

## Introduction
Software and applications make our lives easier every day. We use them a lot. Much of it has migrated to the web so we can use it from any device without having to download and install it. There is still a lot of software that we need to install on our machines. This is especially true for software development.

Keeping software up to date is a tedious task. It takes time and effort. But it allows us to take advantage of the latest features and security updates. Other systems, like Linux, have a package manager that makes it easy to keep software up-to-date that has been around for decades. Mobile platforms like Android have application stores that do it for us. On Windows, we had to do it manually for too long. Fortunately, today we have a number of options for Windows, including the Microsoft Store and a package manager.

## Getting started
Winget is a package manager for Windows. It is available as a command-line tool that allows you to install, update, and uninstall software on Windows[^WingetTrainingCourse]. If you are using Windows 10 or later, then you may already have it installed.

Go to Command Prompt or PowerShell from the Start menu and type `winget`.

```shell
C:\>winget
Windows Package Manager v1.8.1911
Copyright (c) Microsoft Corporation. All rights reserved.

The winget command line utility enables installing applications
and other packages from the command line.

usage: winget  [<command>] [<options>]
```

Here is a list of the most common commands:

| Command                 | Description                            |
| ----------------------- | -------------------------------------- |
| `winget search <name>`  | Search for an application in the store |
| `winget install <id>`   | Install an application                 |
| `winget uninstall <id>` | Uninstall an application               |
| `winget upgrade <id>`   | Upgrade an application                 |
| `winget list`           | List installed applications            |
| `winget upgrade`        | List available updates                 |
| `winget upgrade --all`  | Upgrade all applications               |
{: .m-auto }

> `update` is a command alias for `upgrade`, so you can use either of them.
{: .gh-alert.note }

The good thing about winget is that it requires an installer that supports silent installation mode, so we can avoid clicking the "Next" button in the installer wizard by passing the `--silent` argument. This makes it possible to use winget in scripts or to update all software at once without any disturbance. However, some applications may not support this mode, so you may need to use a GUI to install or update them.

```shell
winget update --all --silent
```

However, if you prefer to have more control over the update process, you can use the `--interactive` flag (or `-i` for short), which will let winget download an installer for you, while you can decide with the installer options to proceed.

## Making it yours
When it comes to everyday use, you may want more control over the update process. There are standalone applications that provide a GUI for winget and other package managers and include additional features like automatic updates, notifications, backup and restore list of software and more to make it as easy as possible to keep your software up to date.

There are a number of options, some are free and open source, some are paid. Many options are outdated or use and maintain their own list of software they support. The option I have been using for a while is UniGetUI[^UniGetUI]. It is a free and open source application that supports winget and other package managers. It is available on GitHub and the Microsoft Store. Like many other applications these days, it can be installed using winget.

```shell
winget install --exact --id MartiCliment.UniGetUI --source winget
```

## Winget sources
By default, winget collects the list of software from the Microsoft Store (free applications rated "e" for everyone) and the winget community repository[^WindowsPackageManagerCommunityRepository]. You can see this by running the `winget source list` command. It's possible to add or remove sources that would be useful for corporate environments.

```shell
C:\>winget source list
Name    Argument                                      Explicit
--------------------------------------------------------------
msstore https://storeedgefd.dsx.mp.microsoft.com/v9.0 false
winget  https://cdn.winget.microsoft.com/cache        false
```

So for typical use, to support winget for your application, you need to publish your application to the Microsoft Store or add it to the winget community repository. You can find more information about the winget community repository and creating manifest files[^CreateYourPackageManifest] in the references section below.

## Winget alternatives
It is worth mentioning that there are other package managers for Windows, such as Chocolatey[^Chocolatey]. Some of them became popular because there were no alternatives 10 years ago. However, some are still very popular.

## Conclusion
Ubuntu Software Center contains many applications, but is not favored by many users and is still far from being something like Google Play Store. Especially for more experienced users who are used to the command line. Most official and community provided Ubuntu documentation, as well as third party software installation guides, usually instruct users to use commands like `apt-get` from the shell. This makes it more widely known and used, especially for those following online instructions. I can't say the same for the Microsoft Store, but I don't see its popularity growing much. Maybe things will change in the future. In the meantime, you can use winget to manage your software and keep it up to date.

## References
[^UniGetUI]: [UniGetUI](https://github.com/marticliment/UniGetUI)
[^CreateYourPackageManifest]: [Create your package manifest](https://learn.microsoft.com/en-us/windows/package-manager/package/manifest?tabs=minschema%2Cversion-example)
[^WindowsPackageManagerCommunityRepository]: [Windows Package Manager Community Repository](https://github.com/microsoft/winget-pkgs)
[^WingetTrainingCourse]: [Winget training course](https://docs.microsoft.com/learn/modules/explore-windows-package-manager-tool/?WT.mc_id=AZ-MVP-5004737)
[^Chocolatey]: [Chocolatey](https://chocolatey.org/)
