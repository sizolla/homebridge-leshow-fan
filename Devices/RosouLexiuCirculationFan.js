require('./Base');

const inherits = require('util').inherits;
const miio = require('miio');

var Accessory, PlatformAccessory, Service, Characteristic, UUIDGen;

RosouLexiuCirculationFan = function(platform, config) {
    this.init(platform, config);
    
    Accessory = platform.Accessory;
    PlatformAccessory = platform.PlatformAccessory;
    Service = platform.Service;
    Characteristic = platform.Characteristic;
    UUIDGen = platform.UUIDGen;
    
    this.device = new miio.Device({
        address: this.config['ip'],
        token: this.config['token']
    });
    
    this.accessories = {};
    if(!this.config['fanDisable'] && this.config['fanName'] && this.config['fanName'] != "") {
        this.accessories['fanAccessory'] = new RosouLexiuCirculationFanAccessory(this);
    }
	
    var accessoriesArr = this.obj2array(this.accessories);
    
    this.platform.log.debug("[MiFanPlatform][DEBUG]Initializing " + this.config["type"] + " device: " + this.config["ip"] + ", accessories size: " + accessoriesArr.length);
    
    return accessoriesArr;
}
inherits(RosouLexiuCirculationFan, Base);

RosouLexiuCirculationFanAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['fanName'];
    this.platform = dThis.platform;
}

RosouLexiuCirculationFanAccessory.prototype.getServices = function() {
    var that = this;
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "RosouLexiuCirculationFan")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);

    var fanService = new Service.Fanv2(this.name);
    var activeCharacteristic = fanService.getCharacteristic(Characteristic.Active);
    var swingModeCharacteristic = fanService.addCharacteristic(Characteristic.SwingMode);

    //power on/off
    activeCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["power"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - Active - getActive: " + result);
                callback(null, result == 1 ? Characteristic.Active.ACTIVE : Characteristic.Active.INACTIVE);
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - Active - getActive Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - Active - setActive: " + value);
            that.device.call("set_power", [value ? 1 : 0]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - Active - setActive Result: " + result);
                if(result == "ok") {
                    callback(null);
                } else {
                    callback(new Error(result));
                }            
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - Active - setActive Error: " + err);
                callback(err);
            });
        }.bind(this));
     
    //
    swingModeCharacteristic
  	    .on('get', function(callback) {
	        that.device.call("get_prop", ["yaw"]).then(result => {
	            that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - SwingMode - getSwingModeControls: " + result);
		if (result == 3) {
		    callback(null, Characteristic.SwingMode.SWING_ENABLED);
		} else {
		    callback(null, Characteristic.SwingMode.SWING_DISABLED);
		}
	    }).catch(function(err) {
	        that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - SwingMode - getSwingModeControls Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {	
            that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - SwingMode - setSwingModeControls: " + value);
	            that.device.call("set_yaw", [value ? 3 : 0]).then(result => {
		    that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - SwingMode - setSwingModeControls Result: " + result);
                if(result == "ok") {
                    callback(null);
                } else {
                     callback(new Error(result[0]));
                }
	     }).catch(function(err) {
	       that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - SwingMode - setSwingModeControls Error: " + err);
                callback(err);
	     });
        }.bind(this));

    services.push(fanService);

    return services;
}
