---
title: Fine-tuning the autostart in Ubuntu Server
description: Automate the start and stop of a VirtualBox VM in Ubuntu Server.
date: 2011-08-30 22:41:12 +0200
last_modified_at: 2011-08-30 22:41:12 +0200
published: true
categories: [Posts, DevOps]
tags: [Ubuntu, Linux, System-V, VirtualBox]
mermaid: false
media_subpath: /assets/media/2011/fine-tuning-the-autostart-in-ubuntu-server/
image: cover.webp
---

## Introduction
The purpose of this post is to familiarize with the principles of autostart in the Ubuntu operating system using Ubuntu Server 10.04 LTS as an example and to demonstrate the configuration of a virtual machine autostart running under VirtualBox, and the correct termination of the latter in automatic mode when shutting down Ubuntu Server.

> The example below does not apply to customizing the autostart of graphical applications for a specific system user in desktop versions of Ubuntu. To do this, use the "Running Applications" from the Ubuntu main menu
{: .gh-alert.note }

## What is autostart and how to configure it?
Autostart is a process of automatically starting of services/applications when the operating system is started. Autostart can also ensure that these services/applications are properly terminated when the system is shut down or rebooted.

### Startup process in Ubuntu Server
To properly start and stop a service, you need to write a script with commands to start and stop it properly. Take a look at the contents of the `/etc/init.d` directory, it contains scripts that control the starting and stopping of services on your machine. So the first, but not the last point of a successful configuration is to have a script in `/etc/init.d`. The script does not describe when a particular script should be run. It can only take the parameters start, stop, restart and so on. So how does Ubuntu know when to run a script? The answer lies in the `/etc/rcN.d` directories, where `N` is a number between 0 and 6. These directories store symbolic links to scripts from `/etc/init.d`. Let's take a look at what each directory means and everything will become clear:
- `rc0.d` - runs at system shutdown;
- `rc1.d` - runs at boot in single user mode;
- `rc2.d` - runs on multi-user boot;
- `rc3.d-rc5.d` - reserved;
- `rc6.d` - runs on system reboot.

For example, a reboot will run all scripts from `/etc/rc6.d`, a shutdown will run all the scripts from `/etc/rc0.d`, and so on. The number in the directory name is called the startup level. That is, the `/etc/rc0.d` directory is called the zero boot level, and so on.

There is one more important thing you should know - it is the order of scripts execution from `rcN.d` directories. In order to organize start and stop properly, Ubuntu may need to start and stop services in a certain order. This problem is solved by special naming of files in the startup level directories. Files have the following names: `[S|K]NN[name]`, where `[S|K]` is a single character (`S` means the script starts the service, `K` stops it aka kills it), `NN` is a sequential number, `name` is the file name. You don't have to choose the `S` or `K` symbol yourself, because all scripts in the `rc1.d-rc5.d` directories must start with the `S` symbol, and in the `rc0.d` and `rc6.d` directories - with the `K` symbol. The number `NN` determines the order in which the scripts are executed, from smaller to larger. The smaller the number of the script to be executed, the earlier it will be executed at startup; the larger the number of the service to stop script, the later it will be executed.

If you need to run a service or application before or after a particular existing service, simply check its sequence number in the corresponding `rcN.d` directory and consider it when choosing the sequence number for your script.

### How to create a startup script?
There is a sample script for starting and stopping services in the `/etc/init.d` directory. There is a file called `/etc/init.d/skeleton`. To create a new script, make a copy of the `skeleton` file and edit it to suit your needs. Let's use the following command:

```bash
sudo cp /etc/init.d/skeleton /etc/init.d/myscript && vi /etc/init.d/myscript
```

> When you create a new script, don't forget to give it execute privileges. To add execution privileges to a script, use the `sudo chmod +x /etc/init.d/myscript` command
{: .gh-alert.tip }

### How to add a script to the autostart?
Some sources recommend creating symbolic links manually with the `ln` command, although special utilities exist. Before adding a script, the utility checks it for validity, and the `ln` command will create a link even if there is some error. So, tt is better to use specialized utilities, such as `update-rc.d`, which comes bundled with Ubuntu. It can be used to add a new script to any boot level, remove an existing script, and so on. Here's an example of how to use it:

```bash
sudo update-rc.d myscript start 99 2 3 4 5 . stop 01 0 1 6 .
```

This command adds a new `myscript` script to all startup levels. It will start the service on levels 2 through 5 with priority 99 (last), and stop the service on levels 0, 1, and 6 with priority 01 (first).
To remove the script from the startup sequence, use the following command:

```bash
sudo update-rc.d -f myscript remove
```

## Challenge: Configure VirtualBox VM autostart
**Objective**: To configure the autostart of a virtual machine running on VirtualBox to start two minutes after the Ubuntu Server operating system is started. When Ubuntu Server is shut down or rebooted, the virtual machine should shut down properly.
Let's assume that VirtualBox is installed on Ubuntu Server and there is a virtual machine named `Agent` whose operating system supports the ability to shut down correctly when the computer's shutdown button is pressed (ACPI support).

First, let's write a script to put in the `/etc/init.d` directory:

```bash
sudo cp /etc/init.d/skeleton /etc/init.d/agent && sudo vi /etc/init.d/agent
```

By editing the script and leaving only the minimum necessary, we get a file with the following contents:

```sh
#!/bin/sh
### BEGIN INIT INFO
# Provides: agent
# Required-Start:
# Required-Stop:
# Default-Start: 2 3 4 5
# Default-Stop: 0 1 6
# Short-Description: Start and stop execution state of VBox virtual machines
# Description: This script is used to start and stop of  VBox virtual machines
#              using System-V on Ubuntu Server.
#              This file should be placed in /etc/init.d
### END INIT INFO
# Author: Alexander Fuks

. /lib/lsb/init-functions

# Perform agent virtual machine startup with 2 minute delay
perform_start()
{
        log_daemon_msg «Starting Agent VM»
        sleep 120 && su -l -c «VboxHeadless –startvm Agent &» kungfux
        log_end_msg 0
        return 0
}

# Send POWEROFF ACPI signal for Agent VM
perform_save()
{
        log_daemon_msg «Sending ACPI POWER OFF signal for Vbox Agent VM»
        su -l -c «VboxManage controlvm Agent acpipowerbutton» kungfux
        log_end_msg 0
        return 0
}

case “$1” in
  start)
    perform_start
    ;;
  stop)
    perform_save
    ;;
  *)
    echo “Usage: /etc/init.d/agent {start|stop}”
    exit 3
    ;;
esac

:
```

Let's add the script to all start levels:

```bash
kungfux@itworks:~$ sudo update-rc.d agent start 99 2 3 4 5 . stop 01 0 1 6 .
Adding system startup for /etc/init.d/agent ...
/etc/rc0.d/K01agent -> ../init.d/agent
/etc/rc1.d/K01agent -> ../init.d/agent
/etc/rc6.d/K01agent -> ../init.d/agent
/etc/rc2.d/S99agent -> ../init.d/agent
/etc/rc3.d/S99agent -> ../init.d/agent
/etc/rc4.d/S99agent -> ../init.d/agent
/etc/rc5.d/S99agent -> ../init.d/agent
```

After the reboot, we can verify that the virtual machine startup command was executed. Let's look at the startup report:

```bash
kungfux@itworks:~$ cat /var/log/boot.log
fsck from util-linux-ng 2.17.2
/dev/sda1: clean, 92526/4751360 files, 2565789/18975488 blocks
 * Starting Jenkins Continuous Integration Server jenkins
 * Starting No-IP.com dynamic address update noip2
 * Not starting internet superserver: no services enabled
 * Starting Postfix Mail Transport Agent postfix
 * Starting bittorrent daemon transmission-daemon
 * Starting VirtualBox kernel modules
 * Starting NTP server ntpd
 * Starting ftp server proftpd
 * Starting web server apache2
 * Starting Agent VM
```

The last line contains the output of the `agent` script.

In addition, scripts written for `init.d` can be used from the terminal at any time. For example, to start a virtual machine, issue the command:

```bash
kungfux@itworks:~$ /etc/init.d/agent start
```

As you can see from this example, the Ubuntu operating system provides many ways to control the start and stop of services and programs. In startup scripts, you can describe dependencies on other services using "Required-Start/Required-Stop" sections, and the script itself can be of any complexity, allowing you to fine-tune any startup configuration.

![Article competition diploma](diploma.webp)
_Article competition diploma._

> This material was written for the "First contest of Russian-language articles for Ubuntu OS 2011" (konkurs.ubuntu.ru) and published on [open-life.org](https://open-life.org/blog/1862.html)
{: .gh-alert.note }
