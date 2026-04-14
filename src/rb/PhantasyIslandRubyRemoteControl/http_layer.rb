require 'net/http'
require 'json'
require_relative 'config'

module HttpLayer
  module_function

  def ping
    send_cmd('ping')
  end

  def ping_volatile
    send_cmd_volatile('ping')
  end

  def start
    send_cmd('start')
  end

  def start_volatile
    send_cmd_volatile('start')
  end

  def send_cmd(s)
    uri = URI("http://#{REMOTE_LOCATION}/ECU_HTTP/sendStringCmd?c=#{s}")
    begin
      response = Net::HTTP.get_response(uri)
      JSON.parse(response.body)
    rescue Net::ReadTimeout => e
      puts "send_cmd #{s} Error Command Timeout"
      { 'ok' => false, 'r' => 'Timeout' }
    rescue StandardError => e
      warn "ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded."
      warn "  ===>>>  #{e.message}"
      { 'ok' => false, 'r' => 'ConnectionError Cannot Connect to PhantasyIsland' }
    end
  end

  def send_cmd_volatile(s)
    uri = URI("http://#{REMOTE_LOCATION}/ECU_HTTP/sendStringCmd?cc=#{s}")
    begin
      response = Net::HTTP.get_response(uri)
      JSON.parse(response.body)
    rescue Net::ReadTimeout => e
      puts "send_cmd_volatile #{s} Error Command Timeout"
      { 'ok' => false, 'r' => 'Timeout' }
    rescue StandardError => e
      warn "ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded."
      warn "  ===>>>  #{e.message}"
      { 'ok' => false, 'r' => 'ConnectionError Cannot Connect to PhantasyIsland' }
    end
  end

  def get_all_airplane_status
    uri = URI("http://#{REMOTE_LOCATION}/ECU_HTTP/requestPullAllAirplaneState")
    begin
      http = Net::HTTP.new(uri.host, uri.port)
      http.read_timeout = 5
      response = http.get(uri.request_uri)
      JSON.parse(response.body)
    rescue StandardError => e
      warn "ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded."
      warn "  ===>>>  #{e.message}"
      raise "ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded."
    end
  end

  def get_airplane_camera_image(port, camera)
    uri = URI("http://#{REMOTE_LOCATION}/ECU_HTTP/requestPullImage?flyPort=#{port}&imageType=#{camera}")
    begin
      http = Net::HTTP.new(uri.host, uri.port)
      http.read_timeout = 5
      response = http.get(uri.request_uri)
      j = JSON.parse(response.body)
      j['ok'] ? j['imgDataString'] : nil
    rescue StandardError => e
      warn "ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded."
      warn "  ===>>>  #{e.message}"
      nil
    end
  end

  def process_airplane(j)
    if j['ok']
      airplanes = j['airplanes']
      airplane_status = {}
      airplanes.each do |air|
        status = {}
        status['keyName'] = air['keyName']
        status['typeName'] = air['typeName']
        status['updateTimestamp'] = air['updateTimestamp']
        status['status'] = air['status']
        
        camera_front = air['cameraFront']
        status['cameraFront'] = camera_front ? camera_front['imgDataString'] : nil
        
        camera_down = air['cameraDown']
        status['cameraDown'] = camera_down ? camera_down['imgDataString'] : nil
        
        airplane_status[status['keyName']] = status
      end
      airplane_status
    else
      nil
    end
  end
end
