from src.PhantasyIslandPythonRemoteControl.radio.radio_manager import RadioManager

rm = RadioManager()
rm.connect()

print(rm.create_msg_timestamp_id())

print(rm.ping())

print(rm.radioApi.listRadioLocalObjects())
print(rm.radioApi.mode('token'))
t = rm.radioApi.listRadioLocalObjects()
print(t)
print(t)

rm.socketio.wait()
