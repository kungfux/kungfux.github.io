---
title: Automation by image search
description: Automation project utilizing image search to find elements to interact with.
date: 2022-10-18 23:05:59 +0400
last_modified_at: 2022-10-18 23:05:59 +0400
published: true
categories: [Projects, Desktop, Web]
tags: [Python, Desktop automation, Web automation]
mermaid: false
media_subpath: /assets/media/2022/automation-by-image-search/
image: cover.webp
---

## Story
Thanks to the application design and tools available today, it is quite easy to identify elements on a screen that need to be interacted with or validated. We use `TreeWalker` for desktop applications, selectors to find elements in the `DOM` for web applications. However, there are times when we are limited to programmatic access and need to find other ways.

I once had to deal with a Unity mini-game that drew graphics on a screen. The only way to automate it was to simulate user actions such as mouse clicks, keystrokes, etc. But how do you know where to click or press without seeing the elements tree?

## Requirements
- Identify elements on a screen
- Simulate user actions, including mouse clicks

## Solution
Stack used:
- Python
- PyAutoGUI[^PyAutoGUI]
- python-imagesearch[^python-imagesearch]

We need to find the screen location of items to interact with. There are some rules were given like game character enjoys only yellow fruits, so user had to click on yellow fruits on screen.

![In-game fruits](in-game-fruits.webp)
_In-game fruits_

As a first step, let's prepare assets with yellow fruits and buttons we need to click to confirm our selection and play again.

<pre>
📦assets
 ┣ 🖼️01-banana.png
 ┣ 🖼️02-pineapple.png
 ┣ 🖼️03-lemon.png
 ┣ 🖼️04-next.png
 ┗ 🖼️05-play-again.png
 </pre>

Now we can compare the screenshot from the game with our assets folder using `python_imagesearch` which provides image search capabilities. It has `imagesearcharea()` function to search screenshot and return coordinates if it matches. Then we will use `pyautogui` to move the mouse cursor to the appropriate position and perform a left click.

```python
import time
import os
import pyautogui
from python_imagesearch.imagesearch import imagesearcharea

# XY coordinates of the play area on a screen
x1 = 0
y1 = 0
x2 = 1024
y2 = 1024
#  Time to sleep after click, in seconds
wait = 0.3
# XY offset to click
x_offset = 10
y_offset = 10

def findImage():
    for imageName in images:
        pos = imagesearcharea('./assets/' + imageName, x1, y1, x2, y2)
        if pos[0] != -1:
            return pos
    print('No matching images were found on the screen.')
    return [-1]

def click(pos):
    pyautogui.moveTo(pos[0] + x1 + x_offset, pos[1] + y1 + y_offset)
    pyautogui.leftClick()
    time.sleep(wait)

images = os.listdir('./assets')
while 0 < 1:
    pos = findImage()
    if pos[0] != -1:
        click(pos)
```

Here I use some delay after each click to give the in-game animation time to complete.

## Conclusion
Even though it was a simple game, this approach allowed me to automate repetitive tasks without any visual identification. However, this approach has some drawbacks if we want to scale it up for larger projects. It is necessary to consider other options and be aware of these limitations.

- Image recognition is relatively slow. The image recognition area should be as small as possible to avoid wasting processing time during execution. Each asset should be as small as possible for the same reason. Assets should be sorted and used in order from most expected to least expected. This improves the average execution time.
- No error thrown on failed click or misclick.
- Assets are sensitive to any visual changes. Light/dark themes, UI updates can break image search. So you may need to prepare assets for both or have strict requirements for the automation execution environment. Hence, it will work poorly with animated elements and may fail due to element visual state changes such as hover, active, etc.

## References
[^PyAutoGUI]: [PyAutoGUI](https://pypi.org/project/PyAutoGUI/)
[^python-imagesearch]: [python-imagesearch](https://pypi.org/project/python-imagesearch/)
