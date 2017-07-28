# homebridge-plantower

Homebridge plugin for plantower sensors/wiring-pi

Based on [node-plantower](https://github.com/perfectworks/node-plantower)
Based on [node-wiring-pi](https://github.com/rsg98/node-wiring-pi)

[![npm version](https://badge.fury.io/js/homebridge-smartthings.svg)](https://badge.fury.io/js/homebridge-smartthings)
Current version - 0.0.1

## Installation

### Homebridge Installation

> You may need to use the --unsafe-perm flag if you receive an error similar to this:
> gyp WARN EACCES user "root" does not have permission to access the dev dir "/root/.node-gyp/5.5.0"

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g https://github.com/willnewii/homebridge-willhome

#### edit file
```
path->node_modules/plantower/plantower.js
//line:43
ret.error   ==>  ret.error.value !== 0
```

3. Update your configuration file. See sample config.json snippet below.

#### Config.json example 
```
    "accessories": [
        {
            "accessory": "plantower",
            "name": "PM2.5",
            "model":"PMS5003ST",
            "device":"/dev/ttyAMA0"
        }
    ]
```
- model: plantower device model eg: PMS5003/PMS3003
- device: serial port eg: '/dev/ttyAMAO'

### doc
- [HomeKitTypes](https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js)

- [Service](https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/Service.js)

#### Accessory
> 附件是一款虚拟的HomeKit设备。它可以发布一个相关的iOS设备的连接服务器来进行通信
或者它可以运行在另一个“桥”辅助服务器上。

#### UUID
> 一个特定的服务通过它的“type”来区别于其他服务，它是一个UUID。HomeKit提供了一套在HomeKit类型中定义的已知服务UUIDs.

#### Service
> 服务包含一组特征.

#### Characteristics
> 特征表示一个特定类型的变量，它可以被分配给一个服务。