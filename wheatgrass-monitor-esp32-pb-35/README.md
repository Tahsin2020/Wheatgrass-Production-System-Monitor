# Wheatgrass Monitor ESP32

This project contains an ESPHome configuration for an ESP32-based wheatgrass monitoring setup. The device connects to Wi-Fi, exposes sensors to Home Assistant through the ESPHome API, and supports over-the-air updates.

## File Overview

- `wheatgrass-sensors.yaml`: Main ESPHome configuration
- `secrets.yaml`: Stores Wi-Fi credentials, API key, and passwords

## Hardware Used

- ESP32 development board (`esp32dev`)
- BME280 temperature / humidity / pressure sensor
- TSL2591 light sensor
- YF-S201 water flow sensor

## Configured Sensors

- `BME280 Temperature`
- `BME280 Humidity`
- `BME280 Pressure`
- `Light`
- `Water Flow Rate`

## Pin and Bus Setup

- I2C bus:
  - SDA: GPIO21
  - SCL: GPIO22
- BME280 I2C address: `0x76`
- TSL2591 I2C address: `0x29`
- Water flow sensor input: `GPIO32`

## Update Intervals

- BME280: every `5s`
- TSL2591: every `1s`
- Water flow rate: every `1s`

## Secrets Required

Make sure `secrets.yaml` defines the following values:

- `wifi_ssid`
- `wifi_password`
- `api_key`
- `ota_password`
- `ap_password`

## How to Use

1. Install ESPHome.
2. Update `secrets.yaml` with your network credentials and passwords.
3. Flash the configuration to the ESP32:

```bash
esphome run wheatgrass-sensors.yaml
```

4. After the first flash, future updates can be done over OTA if the device is connected to Wi-Fi.

## Notes

- The ESP32 uses the `esp-idf` framework.
- Wi-Fi fallback AP mode is enabled with the SSID `Wheatgrass-Sensors`.
- I2C scanning is enabled to help detect connected devices during setup.
