from src.PhantasyIslandPythonRemoteControl.radio.radio_manager import RadioManager

rm = RadioManager()
rm.connect()

print(rm.create_msg_timestamp_id())

print(rm.ping())

print(rm.radioApi.listRadioLocalObjects())

rm.socketio.wait()
