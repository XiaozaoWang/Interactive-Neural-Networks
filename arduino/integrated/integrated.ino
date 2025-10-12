#include <SPI.h>
#include <MFRC522.h>

// RFID Pins
#define SS_PIN 10
#define RST_PIN 9
MFRC522 mfrc522(SS_PIN, RST_PIN);

// Button Pin
const int buttonPin = 2;

// Slider Pins
const int sliderPins[3] = {A0, A1, A2};

// Variables to track previous states
int lastSliderValues[3] = {-1, -1, -1}; // Initialize with impossible values
bool buttonPressed = false; // Track if button is currently pressed

void setup() {
  Serial.begin(9600);
  
  // Initialize RFID
  SPI.begin();
  mfrc522.PCD_Init();
  
  // Initialize button with pull-up
  pinMode(buttonPin, INPUT_PULLUP);
  
  Serial.println("System started - Ready for inputs");
}

void loop() {
  // Check RFID
  checkRFID();
  
  // Check button (using your original approach)
  checkButton();
  
  // Check all sliders
  for (int i = 0; i < 3; i++) {
    checkSlider(i);
  }
}

void checkRFID() {
  // Check for new RFID card
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    // Create UID string
    String uidString = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      if (mfrc522.uid.uidByte[i] < 0x10) {
        uidString += "0";
      }
      uidString += String(mfrc522.uid.uidByte[i], HEX);
    }
    
    // Send JSON message
    Serial.print("{\"type\":\"rfid\",\"uid\":\"");
    Serial.print(uidString);
    Serial.println("\"}");
    
    // Stop communication with card
    mfrc522.PICC_HaltA();
  }
}

void checkButton() {
  int buttonState = digitalRead(buttonPin);

  // 因为 INPUT_PULLUP，按下时 = LOW
  if (buttonState == LOW && !buttonPressed) {
    Serial.println("{\"type\":\"button\",\"state\":\"pressed\"}");
    buttonPressed = true;
    delay(300); // 简单消抖，避免一次按下重复输出
  }
  
  // 当按钮释放时重置状态
  if (buttonState == HIGH) {
    buttonPressed = false;
  }
}

void checkSlider(int sliderId) {
  int currentValue = analogRead(sliderPins[sliderId]);
  
  // Only send if value changed significantly (to avoid noise)
  if (abs(currentValue - lastSliderValues[sliderId]) > 30) {
    lastSliderValues[sliderId] = currentValue;
    
    // Send JSON message with slider ID and value
    Serial.print("{\"type\":\"slider\",\"id\":");
    Serial.print(sliderId + 1); // IDs 1,2,3
    Serial.print(",\"value\":");
    Serial.print(currentValue);
    Serial.println("}");
  }
}