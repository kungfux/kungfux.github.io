---
title: Aquaculture management and analysis software
description: Desktop application project to manage aquaculture production data.
date: 2013-05-16 01:09:23 +0200
last_modified_at: 2013-05-16 01:09:23 +0200
published: true
categories: [Projects, Desktop]
tags: [DotNet, CSharp, WinForms, SQLite, InnoSetup, Delphi, Batch Scripting]
mermaid: true
media_subpath: /assets/media/2013/aquaculture-management-and-analysis-software/
image: cover.webp
---

## Story
I have done some small projects so far, as my colleague suggested me to develop a solution for the research institute in 2014. This was a great opportunity for me to build a more complex, larger and hopefully professional solution. We worked with the customer to gather requirements and understand their needs. Since it takes time to understand their business, I built a basic prototype to demonstrate the core features and get early feedback. I had to think about how to model their data, design the UI/UX for their specific tasks, and think about how to make it easy to install and use for people who are not technical and have basic computer skills.

In addition to trying to make the project itself more professional, I also wanted to make the project management more organized. I had to work with several people with different roles in the project, so I started using the project management tool Redmine to manage tasks, assign responsibilities, and track progress. Releases and previews were available for download from FTP server. For coding, I followed best practices such as using SVN for code versioning and Jenkins for continuous integration.

Due to time and budget constraints, it was decided to go with a single-user desktop application where the operator would work on the computer running this software. While it was possible to work with the same database from multiple workstations, I informed the client that it would be better to customize the solution to fully support multi-user access in the future if needed.

## Demo
{% include embed/youtube.html id='X8vJlxaz5YM' %}

## Requirements
- Create application to manage aquaculture farm data
- Add reporting for analysis
- Add document management to attach documentation and reports to records
- Create an installer
- Create accompanying documentation
- Create end-user help system

## Solution
Stack used:
- C#/.NET WinForms
- SQLite
- InnoSetup
- Delphi

The core application was built using C# and .NET WinForms as the UI framework for its rich controls and ease of development.

### UI/UX
The client's vision of their workflow and tasks was mapped to forms, views, and navigation between them. I decided to use the Multiple Document Interface (MDI) approach to allow multiple document windows within the parent application window. Child windows could be minimized, maximized, and closed. I added a menu to display the currently open windows to quickly switch between them and organize them cascading, vertically, or horizontally like in Windows.

The application consists of a main menu with forms accessible through it. Each form has a toolbar with common actions such as Create New, Edit, Save, Print, etc. Context menus provide actions relevant to selected items. There are many forms with grids to display data in tables. To make it easier to read data in tables and to customize columns based on user preferences, I had to implement custom controls. These include the `SmartDataGridViewTable`, `SmartListView`, and `SmartTableLayoutPanel` controls, which allow you to
- Apply alternating row colors to improve readability
- Hide/show columns
- Change column order, width
- Store user column preferences in the Windows registry and restore them on form load

Forms are designed to be simple and focus on single tasks. Complex tasks have been split into multiple forms to avoid clutter. Navigation was made easy through the toolbar; for example, there was no need to navigate back to the grid form to access the previous or next record in the list. Any referenced item was accessible from the current context through double-click navigation.

### Data storage
SQLite was used for data storage as a lightweight solution that was easy to back up and didn't require a database server. As I continued to work on the project after the initial release, I needed to implement database versioning to handle schema changes. This was done by storing the database version number in a table and checking it at application startup. If a newer version was required, an upgrade script would perform the necessary transformations using a transaction to keep the database up to date.

```sql
PRAGMA foreign_keys = ON;

-- history of database updates
CREATE TABLE [BF_UPDATES_HISTORY]
(
  [id]      INTEGER PRIMARY KEY AUTOINCREMENT,
  [when]    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  [version] VARCHAR(15) NOT NULL
);

-- current version of database
CREATE VIEW [BF_VIEW_CURRENT_VERSION] AS
  SELECT version
  FROM BF_UPDATES_HISTORY
  WHERE id = (SELECT MAX(id) FROM BF_UPDATES_HISTORY);

-- set default database's version
INSERT INTO BF_UPDATES_HISTORY (version) VALUES ('1.0.0.0');
```

I decided to store documents not in the database, but in the file system. A `Documents` table contains only metadata and a file path. The file is copied to the special folder during file import and a record is created in the database. This makes it easy to open and modify attached files while keeping the database lightweight. Files that should not be modified are copied and marked read-only in the file system, so that the user can still view them, but cannot modify them. For example, sample documents and formal templates.

To display the appropriate icon for the document in the list, I checked if the path to the icon file was present in the registry at the path `HKEY_CLASSES_ROOT\<extension>\DefaultIcon` and extracted the icon from that file. If not, I used the combination of `SHGetFileInfo` and `ExtractIconEx` WinAPI functions. SHGetFileInfo' returns the index of the system icon for a given file type based on its extension. ExtractIconEx' uses this index to extract the actual icon from the system icon resources.

![Icons for attached documents](document-icons.webp)
_Icons for attached documents_

### Reporting
To generate reports from the data, I created a base abstract class `ReportSkeleton` that other report classes could inherit from. It contained common properties used by the print form to define whether the user is allowed to use filters, filter values, etc., and methods to retrieve data from the database based on those filters. Reports would inherit from this base class and override the methods to define their specific data source and fields to display.

Reports could be printed or exported to Word, Excel, and HTML documents. In fact, each report produces its output in HTML format and saves it with a different extension, depending on the export type. The trick is that both Word and Excel applications can open such files and display and format the data accordingly. Using the web format also makes it easy to display the print preview window.

### Distribution
To distribute the application, InnoSetup was used to create a Windows installer. It provides a wizard-style interface to guide the user through the installation. I built a typical installer file, except for some custom logic to check if the .NET dependency is installed on the machine or not. This was a necessary step because the minimum supporting Windows version was Windows XP SP2, where .NET was not a mandatory part of the system.

```pascal
[Code]
const
   DotNetVersion='v4';

 function InitializeSetup(): Boolean;
 begin
   Result := true;
   if (not RegKeyExists(HKLM, 'SOFTWARE\Microsoft\NET Framework Setup\NDP\' + DotNetVersion)) then
   begin
       MsgBox(FmtMessage(CustomMessage('DotNetIsNotInstalled'), [DotNetVersion]), mbError, MB_OK);

     Abort();
   end;
end;

[CustomMessages]
DotNetIsNotInstalled='Програма Bestfish.NET не може бути встановлена, так як на даному комп''ютері не встановлений Microsoft .NET Framework %1. Вставте інсталяційний CD диск в оптичний привід вашого комп''ютера і встановіть всі необхідні доповнення. Після чого спробуйте знову'.
```

To automate the build process, I created batch scripts to build the application, create the database, and generate the installer. This allowed me to minimize the build step logic in Jenkins and keep it up-to-date directly in the codebase.

```batch
:: Configuration parameters
set SetupOutputFolder=X:\output
set sqlite3=X:\3rd_party\util\sqlite3.exe
set databasesql=X:\install\db.sql
set compiler=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\MSBuild.exe
set keys=/p:Configuration=Release
set projectfile=X:\project\Bestfish.NET.csproj
set setupfile=X:\install\bestfish.iss

:: Check is X: exists
if not exist X:\makefile.bat set XERROR=1
if [%XERROR%]==[1] echo ERROR! X: disk not found! Call makeX.bat to fix this.
if [%XERROR%]==[1] exit /B 1

:: Remember 1st argument from command line
set argument=%1
:: Check argument
if [%argument%]==[Build]    goto Build
if [%argument%]==[Database] goto Database
if [%argument%]==[Setup]    goto Clean

:Help
:: Display help
echo Script can be used with following arguments:
echo  * Build    - just compile program;
echo  * Database - just create new database file;
echo  * Setup    - compile release + database + pack installation file.
echo .
goto :EOF

:Build
:: Perform debug build of project
echo *** Perform operation: Build project ***
:: Check is compiler exists
if not exist %compiler% set COMPERROR=1
if [%COMPERROR%]==[1] echo ERROR: Compiler not found!
if [%COMPERROR%]==[1] exit /B 1
:: Check is project file exists
if not exist %projectfile% set PROJECTFILEERROR=1
if [%PROJECTFILEERROR%]==[1] echo ERROR: Project file not found!
if [%PROJECTFILEERROR%]==[1] exit /B 1
:: Compile
%compiler% %keys% %projectfile%
if ERRORLEVEL==1 echo ERROR: Project was not built properly!
if ERRORLEVEL==1 exit /B 1
copy /V X:\project\bin\Release\*.* %SetupOutputFolder%
if ERRORLEVEL==1 echo ERROR: Coping to output folder was not done properly!
if ERRORLEVEL==1 exit /B 1
echo *** Job done ***
:: Go to next step or exit
if [%argument%]==[Setup] goto Database
goto :EOF

:Database
:: Perform creation of new database
:: Check is sqlite command line tool exists
if not exist %sqlite3% set SQLITEERROR=1
if [%SQLITEERROR%]==[1] echo ERROR: sqlite3.exe not found!
if [%SQLITEERROR%]==[1] exit /B 1
:: Check is .sql file exists. If OK then perform database making
if not exist %databasesql% set SQLFILEERROR=1
if [%SQLFILEERROR%]==[1] echo ERROR: database.sql file not found!
if [%SQLFILEERROR%]==[1] exit /B 1
:: Remove existing database
echo *** Perform operation: Removing existing database ***
del /Q %SetupOutputFolder%\db.sqlite
if ERRORLEVEL==1 echo ERROR: Existing database can not be deleted!
:: Perform operation
echo *** Perform operation: Make new database ***
%sqlite3% %SetupOutputFolder%\db.sqlite < %databasesql%
if ERRORLEVEL==1 echo ERROR: Database was not created properly!
if ERRORLEVEL==1 exit /B 1
echo *** Job done ***
:: Go to next step or exit
if [%argument%]==[Setup] goto Pack
goto :EOF

:Pack
:: Perform packing of installation file
echo *** Perform operation: Pack installation file ***
:: Check is Inno Setup 5 exists
if not exist "C:\Program Files\Inno Setup 5\ISCC.exe" set SETUPERROR=1
if [%SETUPERROR%]==[1] echo ERROR: Inno Setup 5 not found!
if [%SETUPERROR%]==[1] exit /B 1
:: Pack
"C:\Program Files\Inno Setup 5\ISCC.exe" %setupfile%
if ERRORLEVEL==1 echo ERROR: Installation file was not created properly!
if ERRORLEVEL==1 exit /B 1
echo *** Job done ***
goto :EOF

:Clean
:: Perform cleaning of output folder
echo *** Perform operation: Cleaning workspace ***
del /S /Q /A-H %SetupOutputFolder%
if ERRORLEVEL==1 echo ERROR: Workspace was not cleaned!
if ERRORLEVEL==1 goto End
echo *** Job done ***
if [%argument%]==[Setup] goto Build
goto :EOF
```

In addition to the installer, I was asked to create an ISO image that could be burned to a CD that would contain all the necessary files and have an autorun feature. However, there was no guarantee that .NET would be installed on the machine where the CD would be used. So I had to create an autorun application using Delphi. So when the disk is inserted, the system reads `autorun.inf` and launches a Delphi application that helps install the necessary dependencies, read the associated documentation, and install the software I developed.

![Autorun application](autorun.webp)
_Autorun application_

It was interesting to figure out what system requirements should be defined for the end product. The good news is that there were requirements available from the frameworks being used to build the project that I used to define system requirements for my applications.

We created the help system using the Compiled HTML (CHM) format, which is a standard Windows format for creating help files. This allowed end users to easily access the help directly from within the application.

## Conclusion
- It's not enough to build an application that might solve a user need. There is a huge overhead in maintaining, supporting, and preparing applications for deployment. You need to think about these issues from the beginning to properly plan and estimate project timelines.
- Infrastructure and management software is just as important as the core application code. They help you plan, meet deliverables, and maintain the product over time.

## Extras
{% include embed/youtube.html id='21sK0JMU9aI' %}
