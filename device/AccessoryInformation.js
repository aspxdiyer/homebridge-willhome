/**
 * 配件信息
 */
function factory() {
    let Service = this.Service;
    let Characteristic = this.Characteristic;

    const service = new Service.AccessoryInformation();

    service
        .setCharacteristic(Characteristic.Manufacturer, "Made In Will")
        .setCharacteristic(Characteristic.Model, "1.0")
        .setCharacteristic(Characteristic.SerialNumber, "00000000");

    return service
}

module.exports = factory