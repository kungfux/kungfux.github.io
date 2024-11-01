---
title: Choosing a selector strategy
description: Considerations when choosing a selector strategy for web automation tests.
date: 2021-10-15 11:06:44 +0400
last_modified_at: 2021-10-15 11:06:44 +0400
published: true
categories: [Posts, Software Testing, Test Automation]
tags: [Web automation, Testing Library, Playwright]
mermaid: false
media_subpath: /assets/media/2021/choosing-a-selector-strategy/
image: cover.webp
---

## Introduction
What is a selector? In terms of web automation testing, a selector refers to the mechanism or technique used to locate and identify an element on a web page. Common selector types include ID, Name, Class, XPath, CSS, Link text etc.

| Selector type | Example                        |
| ------------- | ------------------------------ |
| ID            | `#sumbit`                      |
| Name          | `input[name='submit']`         |
| CSS           | `.signIn`                      |
| XPath         | `//button[@id='submitButton']` |
| Link text     | `link=Sign In`                 |
{: .m-auto }

When it comes to deciding which selector to use for a project, there are a few key things that are usually considered to make a "good" selector:
1. **Unique**: The selector should be able to uniquely identify an element on the page.
2. **Stable**: The selector should not break easily when the structure or attributes of the element change. Use locators that are least likely to be
to be affected by changes.
3. **Readable**: The selector should be readable and understandable. Complex XPath locators are difficult to read and maintain. Use descriptive IDs,
names, or classes whenever possible.
4. **Performant**: The selector should not affect test performance. Long XPath locators can slow down test execution.
5. **Cross-browser**: The selector should work across browsers. Avoid browser-specific attributes or XPaths that may not work in all browsers.

Even though some rules are really valuable and important to follow, I think others are not so important in practice. For example, the performance impact of XPath locators may not be significant for modern browsers and test runs, considering that we use them for the slowest tests in the test pyramid. I suppose there could be cases where performance is important, but that would be an exception.

## What is missing?
But more importantly, in my opinion, when it comes to end-to-end UI testing, what are we trying to achieve by using this or that locator strategy?

Let me take a step back from the technical details of locators and focus more on the purpose of UI testing. I want to refer to the mindset of the Selenium team and how they implement user interactions with the application under test. For example, despite the fact that it is technically possible to click on a hidden button, Selenium's `click()` method will throw an exception because it is not possible for a real user to interact with a non-visible element. This is done to make UI tests mimic real user behavior as closely as possible.

The selectors I mentioned earlier, which we use to find elements on a page, were designed primarily for development, not testing. However, as testers, we should focus more on how real users perceive and interact with the UI than on the technical details of the implementation. Our locators and tests should be able to catch any changes in the UI that break the expected user flow and experience, not just technical bugs. The goal is to ensure that the UI works as intended for the end user, not to validate the code.

## Solution
There are frameworks that support a different approach to writing UI tests. They are built from the ground up for testing and focus more on user interaction, such as the Testing Library[^TestingLibrary] and Playwright[^Playwright]. They suggest using specific functions like `getByRole()`, `getByText()`, etc. that mimic how real users perceive the elements, reflecting the experience of visual/mouse users as well as those using assistive technology like screen readers. I think this is a great step towards a way that is closer to how software is used by end users, while making selectors resilient to change.

Here is an example of how this could be done using Testing Library query: `getByRole('button', { name: 'Submit' })`.

## References
[^TestingLibrary]: [Testing Library](https://testing-library.com/docs/queries/about/#priority)
[^Playwright]: [Playwright](https://playwright.dev/docs/locators)
