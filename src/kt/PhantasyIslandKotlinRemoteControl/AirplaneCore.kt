package PhantasyIslandKotlinRemoteControl

import java.awt.image.BufferedImage
import org.json.JSONObject

data class AirplaneFlyStatus(
    val landing: Boolean,
    val isStop: Boolean,
    val x: Double,
    val y: Double,
    val h: Double,
    val rX: Double,
    val rY: Double,
    val rZ: Double
)

fun makeAirplaneFlyStatus(flyStatus: JSONObject): AirplaneFlyStatus {
    return AirplaneFlyStatus(
        landing = flyStatus.getBoolean("landing"),
        isStop = flyStatus.getBoolean("isStop"),
        x = flyStatus.getDouble("x"),
        y = flyStatus.getDouble("y"),
        h = flyStatus.getDouble("h"),
        rX = flyStatus.getDouble("rX"),
        rY = flyStatus.getDouble("rY"),
        rZ = flyStatus.getDouble("rZ")
    )
}

open class AirplaneCore(
    var keyName: String,
    var typeName: String,
    var updateTimestamp: Long,
    var status: AirplaneFlyStatus,
    var cameraFront: String?,
    var cameraDown: String?
) {
    val imageReceiver: ImageReceiver = ImageReceiver(this)

    fun capImage(
        userReceiveCallback: ((BufferedImage?) -> Unit)? = null,
        userProgressCallback: ((Int, Int) -> Unit)? = null
    ) {
        imageReceiver.sendCapImage(userReceiveCallback, userProgressCallback)
    }

    fun getImageTransferProgress(): Int? {
        return imageReceiver.getTransferProgress()
    }

    fun isImageTransferInProgress(): Boolean {
        return imageReceiver.isTransferInProgress()
    }

    fun getLatestImage(): BufferedImage? {
        return imageReceiver.getLatestImage()
    }

    fun getCameraFrontImg(): BufferedImage? {
        return ImageProcess.readB64Img(HttpLayer.getAirplaneCameraImage(keyName, "front"))
    }

    fun getCameraDownImg(): BufferedImage? {
        return ImageProcess.readB64Img(HttpLayer.getAirplaneCameraImage(keyName, "down"))
    }
}
