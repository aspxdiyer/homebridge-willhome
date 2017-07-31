const wpi = require('node-wiring-pi');

class wiringHelper {
    constructor(pin) {
        wpi.wiringPiSetupGpio();

        this.pin = pin;
        this.isHSL = false;
        if (Object.prototype.toString.call(pin) === '[object Array]' && pin.length === 3) {
            this.isHSL = true;
        }
    }

    initLightBulb() {
        if (this.isHSL) {
            if (wpi.softPwmCreate(this.pin[0], 0, 100)) {
                console.log('Failed to create Red PWM channel on pin ' + this.pin[0]);
            }
            if (wpi.softPwmCreate(this.pin[1], 0, 100)) {
                console.log('Failed to create Green PWM channel on pin ' + this.pin[1]);
            }
            if (wpi.softPwmCreate(this.pin[2], 0, 100)) {
                console.log('Failed to create Blue PWM channel on pin ' + this.pin[2]);
            }
        } else {
            wpi.pinMode(this.pin, wpi.OUTPUT);
            wpi.digitalWrite(this.pin, 1);
        }
    }

    setLightBulbOnOff(state) {
        if (this.isHSL) {
            this.setLightBulbColor(state ? [8, 4, 21] : [0, 0, 0]);
        } else {
            wpi.digitalWrite(this.pin, state ? 0 : 1);
        }
    }

    setLightBulbColor(rgb) {
        wpi.softPwmWrite(this.pin[0], parseInt(rgb[0] / 256 * 100));
        wpi.softPwmWrite(this.pin[1], parseInt(rgb[1] / 256 * 100));
        wpi.softPwmWrite(this.pin[2], parseInt(rgb[2] / 256 * 100));
    }
}