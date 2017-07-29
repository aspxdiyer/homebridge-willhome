const CallBackTypes = require('../gen/CallBackTypes');

/**
 * 空调
 * @param {*} name 
 * @param {*} _callback 
 */
function factory(name, _callback) {
    let _name = 'fan';
    let Service = this.Service;
    let Characteristic = this.Characteristic;

    const service = new Service.Fan(name, name);

    service.getCharacteristic(Characteristic.On)
/**        .on('get', (callback) => {
            this.log(_name + ' Get On :');
            callback(null, true);
        })*/
        .on('set', (value, callback) => {
            this.log(_name + ' Set On :', value);
            _callback && _callback(name, CallBackTypes.State, value);
            callback();
        })

    return service
}

module.exports = factory