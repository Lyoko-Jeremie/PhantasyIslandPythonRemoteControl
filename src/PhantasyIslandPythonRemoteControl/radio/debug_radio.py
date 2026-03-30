from src.PhantasyIslandPythonRemoteControl.radio.radio_manager import RadioManager

rm = RadioManager()
rm.connect()

print(rm.ping())

rm.socketio.wait()
