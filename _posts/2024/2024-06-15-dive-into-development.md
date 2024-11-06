---
title: Dive into development
description: Stories when software development is fun but challenging.
date: 2024-06-23 07:33:12 +0400
last_modified_at: 2024-06-23 07:33:12 +0400
published: true
categories: [Posts, Software Development, Electronics]
tags: [ESP8266, Arduino, C++, IoT, MQTT, Monkey C]
mermaid: false
media_subpath: /assets/media/2024/dive-into-development/
image: cover.webp
---

## Introduction
Software development can be as fun as it is challenging. Despite product development where you can usually launch an application or write tests to see if it works as expected or not, there is another world of software development where software development faces the real world. This juxtaposition brings even more challenges and makes the work more interesting. In this post, I will share some stories from my experience when software development is unusually fun.

> Some of the projects described here are done more for fun than for real usage. I do not recommend taking them seriously. Use certified only software and equipment when your safety and health are at stake.
{: .gh-alert.important }

## Dive depth gauge
Once I decided to try snorkeling and discover the creatures that live in the Black Sea. Since there is no way to discover the underwater world without diving in these specific conditions, I had to train myself to use apnea to dive. I used the smartwatch to navigate underwater to know where the land was without having to surface and look around. The timer on my watch told me how long I could stay at depth, while the heart rate monitor told me how long I should pause while breathing through the snorkel.

But there was one piece of the puzzle missing. I needed to know how deep I was in the water to track my progress. So I came up with a project. Typically, divers use dive computers to track depth. There are several reasons for this, such as specially designed devices that can operate at greater depths and track oxygen levels. I didn't want to go deep or use oxygen balloons, so I decided to create software that could track depth using a pressure sensor built into a smartwatch.

The coding part didn't take long because all the necessary formulas are already there, as well as constants like salt or fresh water density. Still, I had to carefully check how often and adequately the pressure sensor data provider delivers data. I remember writing the code, uploading the application, disconnecting it from the computer, going out the front door, and walking up and down the stairs to see how the application was receiving new ambient pressure values and how often it was being updated. It was a good exercise not only for my programming skills, but also for my fitness. When you test the application like that, you think twice about what you're doing because you don't want to get out and realize you made a stupid mistake. That was just the beginning, because you can't check the depth gauge by walking outside. You have to go and dive after all. If you have never tried it, you will never know how many emotions and feelings a person can have when diving for the first time. I had to challenge myself to at least test it on a few different depth markers up to 2 meters. It's a fun experience to dive and see how deep you can go.

## Gas leak detector
One day there was a knock on my door. I opened the door and saw a man who turned out to be a gas service inspector. He was going around the apartments making inspections to prevent gas leak accidents. At the end of the inspection, he suggested that I install a gas leak detector in my kitchen. I was not satisfied with this suggestion because of the technical solution and the price. This device could detect gas leaks, and when it did, it just beeped. I asked, "What if I'm not at home?" and got no answer. So I decided to create my own gas leak detector that I could integrate with the smart home solution I was working on.

I won't go into the details of the project except to mention that it was built using an ESP8266 and MQ2 sensor. The device was able to detect a gas leak and send a notification to my smart home system and, as a result, to my smartphone.

However, the interesting part of the development was actually exercising it. I was able to calculate the gas concentration from the sensor output, but I still had a lot of questions after reading the MQ2 datasheet. So I had to test it by instinct, which is not good for such a project. It was not a good idea to open the gas and let it fill the room, so I bought a natural gas spray bottle and did the tests in a plastic bag along with my device. The final idea was to use it as an additional device in the kitchen to detect gas leaks along with the gas service inspector's device. Hopefully, I did not have a chance to prove whether my device works or not in real life situation. On the other hand, it was a great experience for me to learn that sometimes it is much harder to test software than to develop it.

## Carbon dioxide concentration
While studying electronics and embedded software development, I worked on a project for a home weather station that would measure temperature, humidity, barometric pressure, and carbon dioxide (CO2) levels. It was based on well-known components such as ESP8266, DHT11, BMP180, and MH-Z19B sensors. Some sensors provide data in real time without much calculation, while others require a bit of math to get the desired values and may require calibration, such as the MH-Z19B for carbon dioxide concentration.

The easiest way to practice this part of the project was to use the average known value of the carbon dioxide concentration outside and ventilate the room properly to get it close to that value and keep the windows and doors tightly closed to get higher concentrations. I would not say that this is a fast enough process, so it took time to adjust everything and get the desired results, as well as come up with additional changes to the components to assemble so that more air can flow through the box to not measure all the values inside it, while real things change really fast in the room.

As with previous projects, the initial idea often looks simpler than it turns out to be. You may find yourself in a situation where the project takes more time and has become more difficult to accomplish with the desired results. This is something to keep in mind and take into account when planning.

## Conclusion
Software development is a challenging and fun profession. It is a profession that requires a lot of patience, dedication, and creativity to be successful. I'm happy to realize that I can usually hit the run button and see if my code works as expected or not. But I remember those unique moments with great fondness.

I wonder what challenges you have faced and what good stories you can tell others?
