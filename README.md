# homebridge-willhome

Homebridge plugin for plantower & wiring-pi

Based on [node-plantower](https://github.com/perfectworks/node-plantower),[node-wiring-pi](https://github.com/rsg98/node-wiring-pi)

Current version - 0.0.2

## 说明
目前封装了灯泡(可以调色的 😋 ),空调开关,plantower传感器 三种设备
- 灯泡,很简单,如果是单色就通过gpio控制开关就好了.如果是 rgb,那就通过调节pwm来进行调色
- 空调,理论上所有支持红外遥控的设备都可以操作.我住的地方只有空调带红外.原理就是先通过红外接收器,录制开关指令.再等到需要时通过红外发射器,模拟发射就行.
- plantower传感器,node有一个现成的项目,我只是做了数据的封装,然后传递给了homekit.

## 插件安装
```bash
//安装homebridge
npm install -g homebridge
//插件需要全局安装
npm install -g https://github.com/willnewii/homebridge-willhome
//如果在安装过程中出现了:gyp WARN EACCES user "root" does not have permission to access the dev dir "/root/.node-gyp/5.5.0" 类似的参数,可以在安装命令上添加--unsafe-perm 
```

## 配置
### fix bug
```dash
//在依赖的plantower项目中对sensor返回结果有点问题,需要修改一行代码.
//path->node_modules/plantower/plantower.js
//line:43
ret.error   ==>  ret.error.value !== 0
```

### 更新配置文件
更新你的homgbridge配置文件.一般在当前用户目录'.homebridge'文件下  eg:/Users/zhangweiwei/.homebridge

```json
//Config.json example 
    "accessories": [
        {
            "accessory": "willhome",
            "name": "willhome",
            "model":"PMS5003ST",
            "device":"/dev/ttyUSB0"
        }
    ]
```
- model: plantower 传感器型号 eg: PMS5003/PMS3003 ...
- device: serial port 串口数据读取的端口号 eg: '/dev/ttyUSB0'

### issue
- 在读取串口数据的时候,有可能因为没有权限不能正常工作.你可以chmod 777 一下 😁 ~
- sudo usermod -G gpio username 把当前用户添加到gpio组

## 运行
```dash
homebridge
``` 

## 截图
### 设备照片
![设备照片](http://obfmtiyt5.bkt.clouddn.com/img%2FIMG_CE8F8A0B79B1-1.jpg-iphone)
### 添加至homekit
![homekit截图](http://obfmtiyt5.bkt.clouddn.com/img%2FIMG_0624.PNG-iphone)
### 通过siri操作设备
![Siri截图](http://obfmtiyt5.bkt.clouddn.com/img%2FIMG_0623.PNG-iphone)

## 文档
- [HomeKitTypes](https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js)这里记录了homekit支持的设备类型,和设备支持哪些特征(Characteristics).

### homekit里的一些概念
- **Service**就是设备,他定义了这个设备拥有那些**特征(Characteristics)**.
- HomeKit是通过**UUID**来区分设备类型
- 一个**Service**有多个**特征(Characteristics)**,有可选和必要之分.比如空气质量传感器,必要特征是空气质量,可选的特征有pm2,pm10 等等.注意每个特征的取值范围,类型也不尽相同.
- **Accessory**,我理解类似小米家居中的那个网关,他是Service和HomeKit的联结器
