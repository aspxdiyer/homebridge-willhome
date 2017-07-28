const CallBackTypes = require('./gen/CallBackTypes');
const LightBulb = require('./device/LightBulb');
const AccessoryInformation = require('./device/AccessoryInformation');
const AirQualitySensor = require('./device/AirQualitySensor');
const AirConditioner = require('./device/AirConditioner');

const Util = require('./device/Util');

const Plantower = require('plantower');
const wpi = require('node-wiring-pi');
var exec = require('child_process').exec;

var Accessory, Service, Characteristic, UUIDGen;

var services = [];

var devices = {
	sensor: [],
	lightbulbSmart: 0,
	lightbulb: 0,
	ac: 0
}

var lightbulbPin = 4;
var redPin = 5,
	greenPin = 6,
	bluePin = 13;

module.exports = function (homebridge) {
	// Accessory must be created from PlatformAccessory Constructor
	Accessory = homebridge.platformAccessory;

	// Service and Characteristic are from hap-nodejs
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	UUIDGen = homebridge.hap.uuid;

	// For platform plugin to be considered as dynamic platform plugin,
	// registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
	//homebridge.registerPlatform("homebridge-samplePlatform", "SamplePlatform", SamplePlatform, true);
	homebridge.registerAccessory("homebridge-willhome", "willhome", willHome);
}

// Platform constructor
// config may be null
// api may be null if launched from old homebridge version
function willHome(log, config, api) {
	log("willHome Init");
	var platform = this;
	this.log = log;
	this.config = config;
	this.accessories = [];

	this.Service = Service;
	this.Accessory = Accessory;
	this.UUIDGen = UUIDGen;
	this.Characteristic = Characteristic;

	this.initServices();
	this.initGPIO();

	this.plantower = new Plantower(config['model'], config['device']);
	setInterval(() => {
		this.getPlantowerData((err, data) => {
			this.setAirQualitySensor(data);
		});
	}, 5000);
}

willHome.prototype.initServices = function () {
	//设备信息
	let accessoryInformationService = AccessoryInformation.bind(this)(Service, Characteristic);
	services.push(accessoryInformationService);

	//空气/温度/湿度
	let airQualitySensorService = AirQualitySensor.bind(this)('空气');
	services.push(airQualitySensorService);
	devices.sensor.push(services.length - 1);

	let temperatureService = new Service.TemperatureSensor("温度");
	services.push(temperatureService);
	devices.sensor.push(services.length - 1);

	let humidityService = new Service.HumiditySensor("湿度");
	services.push(humidityService);
	devices.sensor.push(services.length - 1);

	//普通灯泡
	let lightbulb3Service = LightBulb.bind(this)('灯', this.setLightBulb1);
	services.push(lightbulb3Service);
	devices.lightbulb = services.length - 1;

	//调色灯泡
	let lightbulb2Service = LightBulb.bind(this)('彩灯', this.setLightBulb2.bind(this), true, [10, 10, 50]);
	services.push(lightbulb2Service);
	devices.lightbulbSmart = services.length - 1;

	//空调
	let acService = AirConditioner.bind(this)('空调', this.setAirConditioner);
	services.push(acService);
	devices.ac = services.length - 1;
}

willHome.prototype.initGPIO = function () {
	wpi.wiringPiSetupGpio();

	//普通灯泡 默认为关
	wpi.pinMode(lightbulbPin, wpi.OUTPUT);
	wpi.digitalWrite(lightbulbPin, 1);
	this.getServices()[devices.lightbulb].setCharacteristic(Characteristic.On, false);

	//彩色灯泡 设置
	if (wpi.softPwmCreate(redPin, 0, 100)) {
		console.log('Failed to create Red PWM channel on pin ' + redPin);
	}
	if (wpi.softPwmCreate(greenPin, 0, 100)) {
		console.log('Failed to create Green PWM channel on pin ' + greenPin);
	}
	if (wpi.softPwmCreate(bluePin, 0, 100)) {
		console.log('Failed to create Blue PWM channel on pin ' + bluePin);
	}

	this.getServices()[devices.lightbulbSmart].setCharacteristic(Characteristic.Hue, 255);
	this.getServices()[devices.lightbulbSmart].setCharacteristic(Characteristic.Saturation, 68);
	this.getServices()[devices.lightbulbSmart].setCharacteristic(Characteristic.Brightness, 6);
}

willHome.prototype.getServices = function () {
	return services;
}

willHome.prototype.setLightBulb1 = function (name, type, value) {
	if (type === CallBackTypes.State) {
		wpi.digitalWrite(lightbulbPin, value ? 0 : 1);
	}
}

willHome.prototype.setLightBulb2 = function (name, type, value) {
	if (type === CallBackTypes.State) {
		if (value != this.getServices()[devices.lightbulbSmart].getCharacteristic(Characteristic.On).value) {
			if (value) {
				setColor([8, 4, 21]);
			} else {
				setColor([0, 0, 0]);
			}
		}
	} else if (type === CallBackTypes.RGB) {
		console.log(name, type, value);
		setColor(Util.hslToRgb(value));
	}
}

function setColor(rgb) {
	wpi.softPwmWrite(redPin, parseInt(rgb[0] / 256 * 100));
	wpi.softPwmWrite(greenPin, parseInt(rgb[1] / 256 * 100));
	wpi.softPwmWrite(bluePin, parseInt(rgb[2] / 256 * 100));
}

/**
 * 空调操作
 */
willHome.prototype.setAirConditioner = function (name, type, value) {
	if (type === CallBackTypes.State) {
		let cmd = 'irsend send_once fan2 KEY_POWER_';
		cmd = value ? cmd + 'ON' : cmd + 'OFF';

		exec(cmd, function callback(error, stdout, stderr) {
			console.log(stdout);
		});
	}
}

/**
 * 空气质量数据获取
 */
willHome.prototype.getPlantowerData = function (callback) {
	this.plantower.read().then(data => {
		/*        console.log('1', data['concentration_pm2.5_normal']);
		        console.log('2', data['concentration_pm2.5_atmos']);
		        console.log('3', data['formaldehyde']);
		        console.log('4', data['temperature'].value);
		        console.log('5', data['humidity'].value);*/
		return callback(null, {
			humidity: data['humidity'].value,
			temperature: data['temperature'].value,
			pm2_5: data['concentration_pm2.5_normal'].value,
		})
	}).catch(err => {
		console.error(err);
	});
}

/**
 * 空气质量数据处理
 */
willHome.prototype.setAirQualitySensor = function (data) {

	var value = parseInt(data.pm2_5 / 50)

	if (value == 0) {
		value = 1;
	}
	this.getServices()[devices.sensor[0]].setCharacteristic(Characteristic.AirQuality, value >= 5 ? 5 : value)
	this.getServices()[devices.sensor[0]].setCharacteristic(Characteristic.PM2_5Density, data.pm2_5);

	this.getServices()[devices.sensor[1]].setCharacteristic(Characteristic.CurrentTemperature, data.temperature);

	this.getServices()[devices.sensor[2]].setCharacteristic(Characteristic.CurrentRelativeHumidity, data.humidity);
}