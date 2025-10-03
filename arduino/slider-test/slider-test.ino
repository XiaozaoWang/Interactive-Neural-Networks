const int slidePin = A0;  // 滑动电位器信号接在 A0

void setup() {
  Serial.begin(9600);     // 波特率要和 server.js 里的 BAUD 一致
  Serial.println("Slide Pot JSON Test");
}

void loop() {
  int rawValue = analogRead(slidePin); // 读值 0-680

  // 组装成 JSON 格式 {"slider": 123}
  Serial.print("{\"slider\": ");
  Serial.print(rawValue);
  Serial.println("}");

  // Serial.println("{\"slider\": 45}");

  delay(100); // 100ms 发送一次
}

