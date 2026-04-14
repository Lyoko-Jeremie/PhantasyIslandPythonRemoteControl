require 'base64'

# 这个文件在 PhantasyIslandRubyRemoteControl 库中负责解析从仿真平台发回的无人机相机图像
module ImageProcess
  module_function

  # 从仿真平台中返回的无人机相机图像是一个标准html编码的png/jpg图像
  # 本函数将其解析为图像数据。
  # 由于 Ruby 标准库没有 OpenCV，这里仅实现 Base64 解码。
  # 用户可能需要安装 'opencv-ruby' 或其他库来处理图像。
  # 格式通常为：
  # "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAADElEQVQImWNgoBMAAABpAAFEI8ARAAAAAElFTkSuQmCC"
  # "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ…9oADAMBAAIRAxEAPwD/AD/6AP/Z"
  #
  # @param [String, nil] uri 来自仿真平台的无人机相机图像数据字符串
  # @return [String, nil] 原始图像字节数据 (注意：Python 版本返回的是 cv::Mat)
  def read_b64_img(uri)
    return nil if uri.nil? || !uri.include?(',')
    
    im_b64 = uri.split(',')[1]
    Base64.decode64(im_b64)
  end
end
