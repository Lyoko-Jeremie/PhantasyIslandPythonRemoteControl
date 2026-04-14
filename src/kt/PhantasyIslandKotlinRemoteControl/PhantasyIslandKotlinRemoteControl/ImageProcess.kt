package PhantasyIslandKotlinRemoteControl

import java.util.Base64
import java.awt.image.BufferedImage
import java.io.ByteArrayInputStream
import javax.imageio.ImageIO

/**
 * 这个文件在 PhantasyIslandPythonRemoteControl 库中负责解析从仿真平台发回的无人机相机图像
 * Kotlin 实现使用 BufferedImage 代替 cv::Mat
 */
object ImageProcess {

    /**
     * 从仿真平台中返回的无人机相机图像是一个标准html编码的png/jpg图像
     * 本函数将其解析为 BufferedImage 图像数据
     * :param uri: 来自仿真平台的无人机相机图像数据字符串
     * :return: BufferedImage 图像数据
     */
    fun readB64Img(uri: String?): BufferedImage? {
        if (uri == null) return null
        return try {
            val parts = uri.split(",")
            if (parts.size < 2) return null
            val imB64 = parts[1]
            val imBytes = Base64.getDecoder().decode(imB64)
            val bis = ByteArrayInputStream(imBytes)
            ImageIO.read(bis)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
