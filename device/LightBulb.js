const CallBackTypes = require('../gen/CallBackTypes');

/**
 * 灯泡
 * @param {*} name 
 * @param {*} _callback 
 * @param {*} isHsl 
 * @param {*} _hsl 
 */
function factory(name, _callback, isHsl, _hsl) {
    let _name = 'Lightbulb';
    Characteristic = this.Characteristic
    Service = this.Service

    const service = new Service.Lightbulb(name, name);

    service.getCharacteristic(Characteristic.On)
        .on('set', (value, callback) => {
            this.log(_name + ' Set On ', value);
            _callback && _callback(name, CallBackTypes.State, value);
            callback();
        })

    if (isHsl) {
        service.addCharacteristic(new Characteristic.Brightness())
            .on('set', (value, callback) => {
                hsl[2] = value;
                this.log(_name + ' Set Brightness ', hsl);
                _callback && _callback(name, CallBackTypes.RGB, hsl);
                callback();
            })

        service.addCharacteristic(new Characteristic.Hue())
            .on('set', (value, callback) => {
                hsl[0] = value;
                this.log(_name + ' Set Hue ', hsl);
                _callback && _callback(name, CallBackTypes.RGB, hsl);
                callback();
            })

        service.addCharacteristic(new Characteristic.Saturation())
            .on('set', (value, callback) => {
                hsl[1] = value;
                this.log(_name + ' Set Saturation ', hsl);
                _callback && _callback(name, CallBackTypes.RGB, hsl);
                callback();
            })

        //初始化
        let hsl = [0, 0, 0];
        if (Object.prototype.toString.call(_hsl) === '[object Array]' && _hsl.length === 3) {
            hsl = _hsl
        }

        service.setCharacteristic(Characteristic.Hue, hsl[0])
        service.setCharacteristic(Characteristic.Saturation, hsl[1])
        service.setCharacteristic(Characteristic.Brightness, hsl[2])
    }

    return service
}

module.exports = factory