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
        .on('get', (callback) => {
            this.log(_name + ' Get On ');

            callback(null, true);
        })
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
                _callback && _callback(name, CallBackTypes.RGB, hslToRgb(hsl));
                callback();
            })

        service.addCharacteristic(new Characteristic.Hue())
            .on('set', (value, callback) => {
                hsl[0] = value;
                this.log(_name + ' Set Hue ', hsl);
                _callback && _callback(name, CallBackTypes.RGB, hslToRgb(hsl));
                callback();
            })

        service.addCharacteristic(new Characteristic.Saturation())
            .on('set', (value, callback) => {
                hsl[1] = value;
                this.log(_name + ' Set Saturation ', hsl);
                _callback && _callback(name, CallBackTypes.RGB, hslToRgb(hsl));
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

function hslToRgb(hsl) {
    let h = hsl[0];
    let s = hsl[1] / 100;
    let l = hsl[2] / 100;

    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

module.exports = factory