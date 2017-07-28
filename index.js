const CallBackTypes = require('./gen/CallBackTypes');
const LightBulb = require('./device/LightBulb');
const AccessoryInformation = require('./device/AccessoryInformation');
const AirQualitySensor = require('./device/AirQualitySensor');
const AirConditioner = require('./device/AirConditioner');

const Plantower = require('plantower');

var exec = require('child_process').exec;

var Accessory, Service, Characteristic, UUIDGen;

var services = [];

var devices = {
	sensor: [],
	lightbulbSmart: 0,
	lightbulb: 0,
	ac: 0
}

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
	homebridge.registerAccessory("homebridge-willHome", "WillHome", willHome);
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

	//调色灯泡
	let lightbulb2Service = LightBulb.bind(this)('Light02', this.setLightBulb, true, [10, 10, 50]);
	services.push(lightbulb2Service);
	devices.lightbulbSmart = services.length - 1;

	//普通灯泡
	let lightbulb3Service = LightBulb.bind(this)('Light03', this.setLightBulb);
	services.push(lightbulb3Service);
	devices.lightbulb = services.length - 1;

	//空调
	let acService = AirConditioner.bind(this)('空调', this.setAirConditioner);
	services.push(acService);
	devices.ac = services.length - 1;
}

willHome.prototype.getServices = function () {
	return services;
}

willHome.prototype.setLightBulb = function (name, type, value) {
	if (type === CallBackTypes.State) {
		console.log(name, type, value);
	} else if (type === CallBackTypes.RGB) {
		console.log(name, type, value);
	}
}

willHome.prototype.setAirConditioner = function (name, type, value) {
	if (type === CallBackTypes.State) {
		console.log(name, type, value);
	}
}

willHome.prototype.setAirQualitySensor = function (data) {
	data = {
		pm2_5: 600,
		temperature: 20,
		humidity: 60,
	}

	var value = parseInt(data.pm2_5 / 50)

	if (value == 0) {
		value = 1;
	}

	this.getServices()[devices.sensor[0]].setCharacteristic(Characteristic.AirQuality, value >= 5 ? 5 : value)
	this.getServices()[devices.sensor[0]].setCharacteristic(Characteristic.PM2_5Density, data.pm2_5);

	this.getServices()[devices.sensor[1]].setCharacteristic(Characteristic.CurrentTemperature, data.temperature);

	this.getServices()[devices.sensor[2]].setCharacteristic(Characteristic.CurrentRelativeHumidity, data.humidity);
}

willHome.prototype.getPlantowerData = function (callback) {
	this.plantower.read().then(data => {
		this.humidity = data['humidity'].value;
		this.temperature = data['temperature'].value;
		this.pm2_5 = data['concentration_pm2.5_normal'].value;
		/*        console.log('1', data['concentration_pm2.5_normal']);
		        console.log('2', data['concentration_pm2.5_atmos']);
		        console.log('3', data['formaldehyde']);
		        console.log('4', data['temperature'].value);
		        console.log('5', data['humidity'].value);*/
		return callback(null, data)
	}).catch(err => {
		console.error(err);
	});
}