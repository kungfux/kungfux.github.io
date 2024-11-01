---
title: SPA web application for small businesses
description: SPA project for small businesses to manage income, expenses and basic reports.
date: 2021-11-10 21:16:09 +0300
last_modified_at: 2021-11-10 21:16:09 +0300
published: true
categories: [Projects, Web]
tags: [Angular, JavaScript, TypeScript, NodeJS, Fastify, SQLite, Electron, Windows]
mermaid: false
media_subpath: /assets/media/2021/spa-web-application-for-small-businesses/
image: cover.webp
---

## Story
This was my longest project so far, which started somewhere in 2008 and ended in 2021. My dad asked me to create a program that would allow him to easily keep track of his business income and expenses without having to learn complex accounting solutions. I built several solutions and changed the tech stack over time to meet his needs and learn something new for myself.

The very first version I built in 2008 was a desktop application using C# and WinForms with a simple Microsoft Access database. It had a single screen to add income/expenses and calculate the total, average per year, or per selected range. It was easy to build and super usable for my dad.

Later, in 2015, I updated the application[^BusinessAccountingDesktop] to use WPF for modern UI and SQLite database. This version had more features like employee directory, salary management and basic charts. It was also packaged using InnoSetup[^InnoSetup] to create a simple Windows installer. This served him well for many years.

In 2021, he told me that what he wanted most was to be able to access the application from any device, not just his computer.

## Demo
{% include embed/youtube.html id='o-xmhvZgwyM' %}

## Requirements
- Create an application that can be accessed from any device, including PCs and Android devices
- Synchronize data across devices
- Add expenses quickly
- Preserve functionality currently available in the desktop application

## Solution
At first I thought about separate desktop and mobile applications and how to synchronize data between them. However, I decided to simplify things and go with an SPA application[^BusinessAccountingCloud] that could run in the browser on any device.

### Database
I decided to stick with SQLite as a lightweight solution that was easy to back up and move. The database schema got a bit bigger with additional tables for employee titles, properties, categories, etc. Also, the schema and the application itself were designed to manage multiple businesses in case he ever wanted to track income/expenses for other ventures separately in the future.

![Database schema](database-schema.webp){: width="440" height="350" }
_Database schema_

### Backend
*[Fastify]: Fast and low overhead web framework, for Node.js
*[JWT]: JSON Web Tokens are an open, industry standard RFC 7519 method for representing claims securely between two parties.

The server side, which is basically a web API, is written in Javascript using Fastify. Authentication is done using JWT. User credentials are salted and stored as hashes in the database.

The only custom thing I did, taking into account that my dad doesn't like to use strong passwords, is to implement brute force protection. If the user enters the wrong credentials, all subsequent login attempts will fail for a certain "ban" period. This makes brute force useless without a dictionary.

```js
'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async (fastify, opts) => {

    const banTime = 3000;

    {
        let collection = {}
        var lastAttempt = function (login) {
            if (collection[login] === undefined) {
                collection[login] = new Date(Date.now() - banTime - 1000)
                return collection[login]
            }
            var last = collection[login]
            collection[login] = new Date(Date.now())
            return last
        };
    }

    fastify.decorate('canLogin', function (login) {
        var last = lastAttempt(login)
        var allowed = last < new Date(Date.now() - banTime)
        return allowed
    })
})
```

### Frontend
The frontend is based on Typescript and Angular 12. The application consists of
- 22 pages
- 4 widgets for the homepage
- 1 interceptor to display a dialog with a message when the API returns an error
- 3 guards
- 6 components to build application pages like menu and header

I implemented some Angular guards to deal with user roles:
- Unauthorized users can only see the login page
- Authorized users can see other pages
- Administrators can see pages related to administration

Even if they do not completely protect against unauthorized access to pages, they give users confidence in what they can and cannot do.

```ts
import { Injectable } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserPreferencesService } from '../services/userPreferences.service';

@Injectable({
  providedIn: 'root',
})
export class AdminUserGuard implements CanActivate {
  constructor(private userPreferences: UserPreferencesService) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.userPreferences.admin;
  }
}
```

### Desktop client
To make my father feel comfortable working with the application from his PC, I created a desktop application using Electron. The desktop application supports an auto-update feature and loads the application from the domain where the frontend is hosted.

There was a menu item in the main menu of the frontend to download the desktop client. I had to hide it when loading the frontend inside the Electron application. So when Electron loads the application, it exposes a "flag" that is used by the frontend to decide whether to show this menu item or not.

```js
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('isRunningInsideDesktopApp', {
    isRunningInsideDesktopApp: true
})
```

```html
<mat-nav-list
  *ngIf="
  !(isHandset | async) && loggedInUser.id && !isRunningInsideDesktopApp
  ">
  <div mat-subheader>Extra</div>
  <a
  mat-list-item
  href="https://bac-setup.kungfux-stub.com/Business%20Accounting%20Cloud%20Setup%201.0.0.exe"
  target="_blank"
  matTooltip="Download desktop application to make your work even more comfortable.">
  <mat-icon>laptop</mat-icon>
  Desktop client
  </a>
</mat-nav-list>
```

## Conclusion
- I didn't think about deployment from the beginning, and I had a bad time trying to deploy to the Azure cloud. This was a good lesson.
- The frontend application bundle was quite large for such a small application. I wish I had spent time thinking about how to break it up into multiple pieces so that the user doesn't have to load the whole bundle if they don't need it.
- I wish I had taken the time to make it a PWA application so my dad could keep track of his finances even when he is not connected to the Internet.
- Even after all these years and multiple versions of the application, my dad said he loved the very first version of the program because it allowed him to enter values with a single click and gave him the big picture for the entire year on the same application screen. It was an interesting thing to think about. However, he enjoyed being able to access his finances from anywhere and on any device.

## References
[^BusinessAccountingDesktop]: [Business Accounting Desktop](https://github.com/kungfux/business-accounting-desktop)
[^BusinessAccountingCloud]: [Business Accounting Cloud](https://github.com/kungfux/business-accounting-cloud)
[^InnoSetup]: [Inno Setup](https://jrsoftware.org/isinfo.php)
