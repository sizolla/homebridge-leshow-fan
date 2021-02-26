# homebridge-leshow-fan

홈브리지 샤오미 leshow 서큘레이터 플러그인





# 지원기기

1.Xiaomi Rosou Lexiu SS310 Air Circulation Standing Floor Fan (leshow.fan.ss320)



# 설정
        {
            "platform": "MiFanPlatform",
            "deviceCfgs": [
                {
                    "type": "leshow.fan.ss320",
                    "ip": "192.168.xxx.xxx",
                    "token": "xxxxxxxxxxxxxxxxxx",
                    "fanName": "circulation fan",
                    "fanDisable": false
                }
            ]
        }
