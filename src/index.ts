import {
  AccessoryConfig,
  AccessoryPlugin,
  API, CharacteristicValue, HAP,
  Logging,
  Service
} from "homebridge";
const axios = require('axios').default;

let hap: HAP;

export = (api: API) => {
  hap = api.hap;
  api.registerAccessory("LightdDimmer", LightdDimmer);
};

class LightdDimmer implements AccessoryPlugin {
  private readonly log: Logging;
  private readonly name: string;
  private readonly url: string;
  private readonly device: string;
  private switchOn = false;
  private brightness = 0;

  private readonly lightService: Service;
  private readonly informationService: Service;

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log = log;
    this.name = config.name;
    this.url = config.url;
    this.device = config.device;

    this.lightService = new hap.Service.Lightbulb(this.name);

    this.lightService.getCharacteristic(hap.Characteristic.On)
      .onGet(this.getOnHandler.bind(this))
      .onSet(this.setOnHandler.bind(this));

    this.lightService.getCharacteristic(hap.Characteristic.Brightness)
      .onGet(this.getBrightnessHandler.bind(this))
      .onSet(this.setBrightnessHandler.bind(this));

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, "Jonathan Hoyt")
      .setCharacteristic(hap.Characteristic.Model, "lightd");

    log.info("Switch finished initializing!");
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify(): void {
    this.log("Identify!");
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.informationService,
      this.lightService,
    ];
  }

  async getOnHandler() {
    if (this.switchOn) {
      this.log.info("Lights are on and at " + this.brightness + "% brightness");
    } else {
      this.log.info("Lights are off");
    }
    return this.switchOn;
  }

  async setOnHandler(value: CharacteristicValue) {
    if (this.switchOn !== value) {
      this.switchOn = value as boolean;
      axios.get(this.url + "/" + this.device + "/toggle_power");
      this.log.info("Lights were changed " + this.switchOn ? "on" : "off");

      if (this.switchOn) {
        this.setBrightnessHandler(this.brightness);
      }
    } else {
      this.log.info("Lights are already " + this.switchOn ? "on" : "off")
    }

  }

  async getBrightnessHandler() {
    this.log.info("Light are at " + this.brightness + "% brightness");
    return this.brightness;
  }

  async setBrightnessHandler(value: CharacteristicValue) {
    this.brightness = value as number;

    if (value > 0 && !this.switchOn) {
      this.setOnHandler(true);
    } else if (value === 0 && this.switchOn) {
      this.setOnHandler(false);
      return;
    }

    if (value < 25) {
      axios.get(this.url + "/" + this.device + "/minimum_brightness");
    } else if (value < 50) {
      axios.get(this.url + "/" + this.device + "/25_brightness");
    } else if (value < 75) {
      axios.get(this.url + "/" + this.device + "/50_brightness");
    } else if (value < 100) {
      axios.get(this.url + "/" + this.device + "/75_brightness");
    } else if (value === 100) {
      axios.get(this.url + "/" + this.device + "/100_brightness");
    }

    this.log.info("Light was changed to " + this.brightness + "% brightness");
  }
}
