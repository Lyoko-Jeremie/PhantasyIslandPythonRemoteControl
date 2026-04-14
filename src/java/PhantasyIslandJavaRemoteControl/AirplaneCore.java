package PhantasyIslandJavaRemoteControl;

/**
 * 每个飞机的基本信息。
 */
public class AirplaneCore {
    public String keyName;
    public String typeName;
    public long updateTimestamp;
    public AirplaneFlyStatus status;
    public String cameraFront;
    public String cameraDown;

    // 假设有类似 ImageReceiver 的类
    // public ImageReceiver imageReceiver;

    public AirplaneCore() {
        // this.imageReceiver = new ImageReceiver(this);
    }

    public Object getCameraFrontImg() {
        // return ImageProcess.readB64Img(HttpLayer.getAirplaneCameraImage(this.keyName, "front"));
        return null;
    }

    public Object getCameraDownImg() {
        // return ImageProcess.readB64Img(HttpLayer.getAirplaneCameraImage(this.keyName, "down"));
        return null;
    }
}
