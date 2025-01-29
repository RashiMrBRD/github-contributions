#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YourWiFiSSID";
const char* password = "YourWiFiPassword";

// MQTT Broker settings
const char* mqtt_server = "192.168.1.100";
const int mqtt_port = 1883;
const char* mqtt_user = "mqtt_user";
const char* mqtt_password = "mqtt_password";

// DHT sensor settings
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Topics
const char* temp_topic = "home/sensor1/temperature";
const char* humidity_topic = "home/sensor1/humidity";
const char* status_topic = "home/sensor1/status";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
      Serial.println("connected");
      client.publish(status_topic, "online");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (!isnan(h) && !isnan(t)) {
    StaticJsonDocument<200> doc;
    doc["temperature"] = t;
    doc["humidity"] = h;
    doc["timestamp"] = millis();

    char buffer[200];
    serializeJson(doc, buffer);
    
    client.publish(temp_topic, String(t).c_str());
    client.publish(humidity_topic, String(h).c_str());
  }

  delay(30000);  // Wait 30 seconds before next reading
}
