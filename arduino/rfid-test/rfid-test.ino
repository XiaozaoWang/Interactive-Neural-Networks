#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 10    // SDA
#define RST_PIN 9    // RST
MFRC522 mfrc522(SS_PIN, RST_PIN);   // 创建 MFRC522 实例

void setup() {
  Serial.begin(9600);   // 开启串口
  SPI.begin();          // 初始化 SPI
  mfrc522.PCD_Init();   // 初始化 MFRC522
  Serial.println("请刷卡...");
}

void loop() {
  // 如果没有检测到新卡，直接返回
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // 如果不能读取卡片，直接返回
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // 打印 UID
  Serial.print("卡片 UID:");
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(mfrc522.uid.uidByte[i], HEX);  // 以16进制打印
  }
  Serial.println();

  // 停止卡片与读卡器通信
  mfrc522.PICC_HaltA();
}
