require_relative 'radio_manager'
require_relative 'api_module'

# 演示代码
rm = RadioManager.new
rm.connect

puts rm.create_msg_timestamp_id

puts rm.ping

# sync 模式（默认）
data = as_sync(rm.radioApi.listRadioLocalObjectsIds)
puts data

# token 模式
rm.radioApi.mode('token')
t = as_token(rm.radioApi.listRadioLocalObjectsIds)
puts t.inspect
puts t.wait(10)
puts rm.radioApi.now_mode

rm.radioApi.mode('sync')
puts "isSceneInit: #{rm.radioApi.isSceneInit}"
puts "isRadioReachabilityCheckerInit: #{rm.radioApi.isRadioReachabilityCheckerInit}"
puts "getAllRadioMaterial: #{rm.radioApi.getAllRadioMaterial}"
puts "localRadioMaterial: #{rm.radioApi.localRadioMaterial}"
puts "listRadioLocalObjectsIds: #{rm.radioApi.listRadioLocalObjectsIds}"

# 阻塞主线程以接收消息
loop { sleep 1 }
