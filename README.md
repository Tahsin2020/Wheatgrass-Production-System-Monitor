# Wheatgrass Production System Monitor

This project monitors an automated wheatgrass production system by collecting sensor data and displaying it through a web dashboard. It integrates ESP32 sensors, Home Assistant, and a full-stack web application to monitor environmental conditions and water flow.

## Folder Structure

Additional information is contained in the README files for each folder:

- `wheatgrass-monitor-esp32-pb-35/` — **Hardware:** ESP32 sensor configuration using ESPHome to collect temperature, humidity, pressure, light, and water-flow data.
- `WheatgrassDigitalTwin-PB35/` — **Software:** Full-stack monitoring application, including:
  - `Frontend/` — Web dashboard for viewing sensor readings and historical data.
  - `Backend/` — API server for retrieving sensor data, managing authentication, notifications, and camera streaming.
  - PostgreSQL — Storage for historical sensor data.
  - Keycloak — User authentication.
  - `run.sh` — Script for starting the application services.
