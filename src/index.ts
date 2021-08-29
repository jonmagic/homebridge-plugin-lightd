import {
  AccessoryConfig,
  AccessoryPlugin,
  API, CharacteristicValue, HAP,
  Logging,
  Service
} from "homebridge";

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

  private readonly switchService: Service;
  private readonly informationService: Service;

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log = log;
    this.name = config.name;
    this.url = config.url;
    this.device = config.device;

    this.switchService = new hap.Service.Switch(this.name);

    this.switchService.getCharacteristic(hap.Characteristic.On)
      .onGet(this.getOnHandler.bind(this))
      .onSet(this.setOnHandler.bind(this));

    this.switchService.getCharacteristic(hap.Characteristic.Brightness)
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
      this.switchService,
    ];
  }

  async getOnHandler() {
    this.log.info("Lights are: " + this.switchOn);
    return this.switchOn;
  }

  async setOnHandler(value: CharacteristicValue) {
    this.switchOn = value as boolean;
    this.log.info("Lights were changed to: " + this.switchOn);
  }

  async getBrightnessHandler() {
    this.log.info("Light brightness is: " + this.brightness + "%");
    return this.brightness;
  }

  async setBrightnessHandler(value: CharacteristicValue) {
    this.brightness = value as number;
    this.log.info("Light brightness was changed to: " + this.brightness + "%");
  }
}
