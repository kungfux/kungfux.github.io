---
title: Creating a development server
description: Project of setting up a self-hosted development server with useful tools.
date: 2013-07-04 00:18:57 +0200
last_modified_at: 2013-07-04 00:18:57 +0200
published: true
categories: [Projects, System Administration]
tags: [Linux, Bash, SVN, Munin, Jenkins, Redmine, PHP, MySQL, Apache]
mermaid: false
media_subpath: /assets/media/2013/creating-a-development-server/
image: cover.webp
---

## Story
In the period 2011-2013 I was working on various personal and customer projects and it became more and more difficult to manage the source code and all related documentation for them. At that time I became familiar with the Unix system and wanted to learn more about it. My goal was to set up a development server that would help me manage source code repositories, build environments, issue tracking, and more in an organized way, and to share these tools with other people I work with. I want to set it up on my own hardware so that I can learn server administration as well.

![Server's main page](demo.webp)
_Server's main page_

## Hardware
I tried to keep the setup as light and power efficient as possible while still being able to run the necessary software. The server was a 3Q-Sign Nettop PC with Intel Atom D525, 4GB SO-DIMM DDR3 RAM, SATA HDD, Gigabit Ethernet, 802.11bgn Wi-Fi and a 65 watt power supply, which is not very powerful but very economical. The PC is connected to a Must PowerAgent 1060 LCD UPS, which allows it to work for hours in the event of a power outage.

### Monitor battery capacity
To prevent data loss or damage, I configured Network UPS Tools (NUT) monitoring to check the UPS battery voltage levels and percent charged. The configuration required running a few tests to determine the high and low voltage thresholds used to trigger an emergency shutdown in the event of a power failure if the battery level drops below the low threshold.

```conf
default.battery.voltage.high = 27.4
default.battery.voltage.low = 21.8

;                     battery.voltage - battery.voltage.low
; battery.charge =  -------------------------------------------- x 100 %
;                     battery.voltage.high - battery.voltage.low
```

### Monitor internet availability
After experiencing some problems with Internet availability due to intermittent router problems, I wrote a simple bash script to periodically check for Internet connectivity and automatically reboot the router if the connection is lost.

```bash
#!/bin/sh

if [ "`ping 8.8.8.8 -c 5 -a | grep ttl`" == "" ]; then
 echo "Looks like internet is down. Rebooting the router..."
 wget --http-user=admin --http-password=6vT9xcm2ceXuF33 --output-document=/dev/null http://192.168.1.1/rebootinfo.cgi
else
 echo "Internet works."
fi
```

## Software
I chose Ubuntu Server LTS as the operating system because of its stability and large community support. Some of the major software installed are
- Apache web server
- File transfer server (FTP)
- MySQL database management system
- Jenkins continuous integration service with Windows build agent running in VirtualBox
- Subversion (SVN) source control system
- Redmine project management and bug tracking system
- Munin web monitoring solution
- Mail server (working with Postfix and Gmail service)

### Website
To avoid having to remember all the links and to have a single place where I can access all the tools and reports about server health, I set up a simple web site with Apache. The site is written in PHP and uses the MySQL database for data storage.

### Backups
To automate the process of backing up important files and databases, I wrote bash scripts. They are run by a crontab schedule.

```bash
#!/bin/sh

backup_files="/var/spool/mail /etc /var/log /var/svn /var/www"
dest="/home/kungfux/backup/fs/"
archive_file=$(date +"%d-%m-%Y-%T")".tar.gz"
tar czf $dest/$archive_file $backup_files
```
{: file="backup-fs.sh" }

```bash
#!/bin/sh

MUSER="root"
MPASS="fThbSpgEPQtj4r4"
MHOST="localhost"
MYSQL="$(which mysql)"
MYSQLDUMP="$(which mysqldump)"
BAK="/home/kungfux/backup/mysql"
GZIP="$(which gzip)"
NOW=$(date +"%d-%m-%Y")

DBS="$($MYSQL -u $MUSER -h $MHOST -p$MPASS -Bse 'show databases')"
for db in $DBS
do
 FILE=$BAK/$db.$NOW-$(date +"%T").gz
  $MYSQLDUMP -u $MUSER -h $MHOST -p$MPASS $db | $GZIP -9 > $FILE
done
```
{: file="backup-db.sh" }

### Build agents
To facilitate automated build and test, I configured Jenkins to use a VirtualBox VM running Windows as the build agent. However, I needed to ensure that the VM would automatically start and stop when the server was shut down. This required learning more about System-V. I wrote a [separate post](/posts/fine-tuning-the-autostart-in-ubuntu-server/) about this task earlier.

## Conclusion
- Having a development server allowed me to manage projects in an organized way and learn new skills.
- Setting it up with open source software like Ubuntu, Apache, MySQL, Jenkins, SVN, Redmine, etc. kept costs down while providing powerful tools for development and collaboration.
- This experience has been useful for my future projects, including smart home automation and home network administration, as well as a general understanding of how things work.
