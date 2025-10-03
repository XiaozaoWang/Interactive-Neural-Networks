const int buttonPin = 2;  // 按钮连接到 D2 引脚

void setup() {
  Serial.begin(9600);            // 打开串口，波特率 9600
  pinMode(buttonPin, INPUT_PULLUP); // 设置按钮为上拉输入
  Serial.println("按下按钮测试开始...");
}

void loop() {
  int buttonState = digitalRead(buttonPin);

  // 因为 INPUT_PULLUP，按下时 = LOW
  if (buttonState == LOW) {
    Serial.println("Button Pressed!");
    delay(300); // 简单消抖，避免一次按下重复输出
  }
}
