/**
 * 空气质量
 * @param {*} Service 
 * @param {*} Characteristic 
 */
function factory(name) {
    let Service = this.Service;
    let Characteristic = this.Characteristic;

    const service = new Service.AirQualitySensor(name, name);
    return service
}

module.exports = factory