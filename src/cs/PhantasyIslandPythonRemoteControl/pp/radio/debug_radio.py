from src.PhantasyIslandPythonRemoteControl.radio.radio_manager import RadioManager
from src.PhantasyIslandPythonRemoteControl.radio.api_module import as_sync, as_token

rm = RadioManager()
rm.connect()

print(rm.create_msg_timestamp_id())

print(rm.ping())

# sync 模式（默认）—— 使用 as_sync 窄化，类型检查器推导为 dict | None
data = as_sync(rm.radioApi.listRadioLocalObjectsIds())
print(data)

# # token 模式 —— mode() 返回 self，支持链式调用
# rm.radioApi.mode('token')
# # 使用 as_token 窄化，类型检查器推导为 WaitToken[dict]
# t = as_token(rm.radioApi.listRadioLocalObjectsIds())
# print(t)
# print(t.wait(10))       # ← 类型检查器不再报错
# print(rm.radioApi.get_now_mode())

print('isSceneInit', rm.radioApi.isSceneInit())
print('isRadioReachabilityCheckerInit', rm.radioApi.isRadioReachabilityCheckerInit())
print('getAllRadioMaterial', rm.radioApi.getAllRadioMaterial())
print('localRadioMaterial', rm.radioApi.localRadioMaterial())
print('listRadioLocalObjectsIds', rm.radioApi.listRadioLocalObjectsIds())

rm.socketio.wait()
