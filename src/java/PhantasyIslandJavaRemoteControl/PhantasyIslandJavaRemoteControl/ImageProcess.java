package PhantasyIslandJavaRemoteControl;

import java.util.Base64;

/**
 * 负责解析从仿真平台发回的无人机相机图像。
 */
public class ImageProcess {

    /**
     * 从仿真平台中返回的无人机相机图像是一个标准html编码的png/jpg图像。
     * 在 Java 中，通常可以使用 javax.imageio.ImageIO 来解析。
     * 
     * @param uri 来自仿真平台的无人机相机图像数据字符串
     * @return 图像对象 (例如 BufferedImage)
     */
    public static Object readB64Img(String uri) {
        if (uri == null || !uri.contains(",")) {
            return null;
        }
        String imB64 = uri.split(",")[1];
        byte[] imBytes = Base64.getDecoder().decode(imB64);
        
        // 伪代码：实际中可以使用 ImageIO.read(new ByteArrayInputStream(imBytes))
        // return javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream(imBytes));
        return imBytes; // 暂时返回字节数组
    }
}
