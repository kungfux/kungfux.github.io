---
title: Exploring the world of electronics
description: My journey exploring electronics, microcontrollers and IoT.
date: 2019-11-14 03:12:39 +0300
last_modified_at: 2019-11-14 03:12:39 +0300
published: true
categories: [Posts, Electronics]
tags: [C++, Arduino, ESP8266, RaspberryPi, MQTT, IoT]
mermaid: false
media_subpath: /assets/media/2019/exploring-the-world-of-electronics/
image: cover.webp
---

## Introduction
One time I was in a bookstore, wandering around, and decided to check out what was on the shelves for developers. I looked at book after book until the next section started. There were books about electronics that I knew almost nothing about. I was drawn to a large book with something unusual to me on the cover - the breadboard. The table of contents said it would take me from basic electronic circuits to microcontrollers. And I thought: Is it possible that one book can take me through everything? It sounded very interesting and exciting, so I decided to give it a try.

![Make: Electronics by Charles Platt](book.webp)
_Make: Electronics by Charles Platt_

## Getting started
The next step was to buy a list of things like electronic components: resistors, capacitors, potentiometers, relays, fuses, LEDs, transistors, logic chips, batteries, breadboards, dupont jumpers, wires, etc. and equipment: multimeters, wire cutters, wire strippers, soldering station, etc. I bought all the components mentioned in the book. Later, I expanded my equipment with DIY kits to make a power supply and other useful things for my lab. The process of soldering things together was like a nice separate hobby that I enjoyed doing after my regular work. Soldering, like any other skill, has to be practiced and mastered. This activity helped me to understand how to solder and how to use a multimeter.

![DYI power supply](power-supply.webp)
_DYI power supply_

## Circuits
I started by building simple circuits, mentioned in the book, using a breadboard, or soldering things together.

![Shift register circuit on breadboard](breadboard.webp)
_Shift register circuit on breadboard_

Eventually I realized that testing each circuit on a breadboard takes time. Instead, I started using software to simulate electronic circuits. This led to a great discovery. I tried to build a circuit from a book to learn the physics of capacitors and how they work. But for some reason it did not work. Later I found out that this particular circuit did not work because it used a real world characteristic of many electronic components - they are not perfect! Every component has tolerances. This means that it is unlikely that 2 components will have the same resistance or capacitance values. Once I built the circuit on a breadboard, it worked like a charm. The whole idea of the solution was based on this fact.

![Oscillation generator circuit](exp11.webp)
_Oscillation generator circuit_

Another interesting thing I noticed is that the smoke test we use for software testing, which originally came from electronics, takes on new colors when you turn on the circuit. Although I have not fried any of my creation, I have learned that this can happen when you use a real component. I remember my glue gun exploded while I was working on one of the circuits for my project. No worries, I was not injured and repaired the glue gun so it could continue to serve its purpose.

![Exploded glue gun](glue-gun.webp)
_Exploded glue gun_

## Repairing
Since I have tools and knowledge, I started using them to repair things. Even though I couldn't replace a tablet's MicroUSB port, I learned that some types of work require the right equipment. And as time goes by and I buy more equipment, I have been able to do some repairs, such as fixing home medical equipment by replacing broken wires, fixing my computer's power supply by replacing capacitors, and even fixing broken webcams that had the problem of the matrix lens falling off due to insufficient cooling.

## Microcontrollers
I quickly moved to projects using microcontrollers for the ability to implement the logic using a programming language. I started with Arduino and then moved to ESP8266. I have done some projects like:
- Device to control the power of my computer from my phone using ESP8266 and Blynk platform
- Device to monitor soil moisture and environmental conditions for plants using Arduino Pro Mini, ESP8266, DHT11 and soil moisture sensors
- Home weather station using ESP8266, DHT11, BMP180, and MH-Z19B sensors for CO2, temperature, pressure, and humidity
- Flammable gas detection and alarm device using ESP8266 and MQ2 sensor for gas concentration

![Microcontroller based projects](projects.webp)
_Microcontroller based projects_

It was interesting to make programs when you had to think about the resources available to you. There are not so powerful processors and a limited amount of memory. I learned that it is important to use as less resources as possible.

There were many other challenges as well. Projects often had to search for sensor datasheets to understand how they worked and how to program the microcontroller to work with them. However, there was often incomplete information or unclear instructions. For example, for a flammable gas detection sensor, the sensor had to be calibrated and the device had to be tested somehow without any guidance. I would put the device in a plastic bag and add some gas from a lighter and see if the sensor detected the gas.

```cpp
#include "gas.h"

GasSensor::GasSensor(){}

void GasSensor::Init(uint8_t pin) {
  _pin = pin;
  pinMode(_pin, INPUT);
}

short GasSensor::GetRawValue() {
  return analogRead(_pin);
}

void GasSensor::Calibrate() {
  short repeatCount = 1000;
  short delayMs = 1000;
  float sensorValue = 0;
  for(short x=0;x<repeatCount;x++) {
    short rawValue = analogRead(_pin);
    sensorValue = sensorValue + rawValue;
    Serial.print("Value on pin: ");
    Serial.println(rawValue);
    delay(delayMs);
  }
  sensorValue = sensorValue/1000.0;
  Serial.print("Clean air value: ");
  Serial.println(sensorValue);
}

float GasSensor::GetConcentration() {
  short normalAirValue = 182.315; // put from Calibrate()
  short repeatCount = 100.0;
  short delayMs = 50;
  float sensorValue = 0;
  for (short x=0;x<repeatCount;x++) {
    short value = analogRead(_pin) - normalAirValue;
    value = value < 0 ? 0 : value;
    sensorValue = sensorValue + value;
    delay(delayMs);
  }
  sensorValue = sensorValue/repeatCount;
  float valuePercent = sensorValue / 1024;
  Serial.print("Gas concentration: ");
  Serial.println(valuePercent);
  return valuePercent;
}
```
{: file="gas.cpp" }

In case of the carbon dioxide sensor for the home weather station, I am still not sure if the correct formula was used to calculate the concentration. Altough, I made a series of tests to see if the given value looks like a real value based on the knowledge I gathered from Wikipedia and other resources.

```cpp
/* Pinouts:
 *  MK-->MH-Z19B
 *   5V  - Vcc (peak 150mA!)
 *   GND - GND
 *   RX  - TX  (UART TTL level 3.3V!!!)
 *   TX  - RX
 */

#include "dioxide.h"

DioxideSensor::DioxideSensor(){}

void DioxideSensor::begin(uint8_t rxPin, uint8_t txPin){
  readError = true;
  Serial.print(F("Init MH-Z19B..."));
  rx = rxPin;
  tx = txPin;
  uart.init(rx, tx);
  uart.begin(9600);
  uart.write(requestDisableCalibration, 9);
  uart.flush();
  readError = false;
  Serial.println(F("OK"));
}

DioxideSensor::Data DioxideSensor::getConcentration(){
  readError = true;
  Data sensorValues;
  uart.write(requestGetConcentration, 9);
  memset(response, 0, 9);
  uart.readBytes(response, 9);

  Serial.print(F("MH-Z19B response:"));
  for (unsigned char i=0;i<=8;++i){
    Serial.print(F(" "));
    Serial.print(F("0x"));
    Serial.print(response[i], HEX);
  }
  Serial.println();

  if(verifyChecksum()){
    short high = (short)response[2];
    short low = (short)response[3];
    short concentration = high*256+low;
    concentration = concentration; // revert that / 5 * 2; // proof?
    sensorValues.concentration = concentration;
    sensorValues.temp = (short)response[4] - 40;
    sensorValues.status = response[5];
    sensorValues.minCoMeasured = response[6];
    readError = false;
  }
  return sensorValues;
}

bool DioxideSensor::verifyChecksum(){
  byte checksum = 0;
  for (unsigned char i=1;i<8;i++){
    checksum += response[i];
  }
  checksum = 0xFF - checksum;
  checksum += 1;
  if (sizeof(response) != 9 || response[0] != startByte || response[1] != responseCommandByte || response[8] != checksum){
    Serial.println("ERROR: MH-Z19B checksum error!");
    return false;
  } else {
    return true;
  }
}
```
{: file="dioxide.cpp" }

## Minicomputers
Later, having experience with microcontrollers, gave a possibility to program them so they can talk to the Internet or just over Bluetooth and Wi-Fi to use MQTT protocol. I have connected all my devices to MQTT broken working alongside the smart home system on tiny Raspberry Pi server, so I can navigate to a web page to see data from all devices and receive notifications on my phone in case of any warnings. It became possible to remotely control lights, turn appliances on and off, and plan for a home security solutions.

## Technologies
It's interesting how technologies connect. I started with electronic components, then microcontrollers and programming language, and now I'm working with IoT. I learned and made some progress in prototyping boards, then producing PCBs, using 3D printing, learning server solutions and protocols. While working on projects, later or sooner you start to learn existing libraries and build your own to fix some issues and extend functionality. There is a whole world of possibilities and endless knowledge to explore.

![Technologies](technology.webp)
_Technologies_

## Conclusion
This journey took me about a year and I completely understand why people choose this direction and what it means to be an engineer. I would highly recommend anyone to take this path and explore the world of electronics to better understand how computers work and how to write efficient programs, even if they will not connect their lives with electronics itself.

The knowledge and experience I have gained is hard to overestimate. Some tools and knowledge I can use in my daily life. Others have helped me organize my knowledge. The rest are just for fun and push the boundaries of knowledge and can be used to understand many technical things.
