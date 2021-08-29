import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
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
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        log.info("Current state of the switch was returned: " + (this.switchOn? "ON": "OFF"));
        callback(undefined, this.switchOn);
      })
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        this.switchOn = value as boolean;
        log.info("Switch state was set to: " + (this.switchOn? "ON": "OFF"));
        callback();
      });

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
    this.log.info("Lights are: " + (this.switchOn ? "ON" : "OFF"));
  }

  async setOnHandler(value: boolean) {
    this.switchOn = value as boolean;
    this.log.info("Lights were changed to: " + (this.switchOn ? "ON" : "OFF"));
  }

  async getBrightnessHandler() {
    this.log.info("Light brightness is: " + this.brightness + "%");
  }

  async setBrightnessHandler(value: number) {
    this.brightness = value;
    this.log.info("Light brightness was changed to: " + this.brightness + "%");
  }
}
