package PhantasyIslandKotlinRemoteControl

import java.awt.image.BufferedImage
import java.util.concurrent.locks.ReentrantReadWriteLock
import kotlin.concurrent.withLock
import kotlin.concurrent.thread

data class ImageInfo(
    val img: BufferedImage?,
    val id: Int,
    val totalCount: Int,
    var progressCount: Int = 0,
    var ok: Boolean = false
)

class ImageReceiver(private val airplane: AirplaneCore) {

    // 任何时候只存在一张图片
    private var imageInstance: ImageInfo? = null
    private var cmdIdCounter: Int = 1
    private var nowLoadingId: Int = 0
    private val lock = ReentrantReadWriteLock()

    var userReceiveCallback: ((BufferedImage?) -> Unit)? = null
    var userProgressCallback: ((Int, Int) -> Unit)? = null

    val mookTime = 3

    fun sendCapImage(
        userReceiveCallback: ((BufferedImage?) -> Unit)? = null,
        userProgressCallback: ((Int, Int) -> Unit)? = null
    ) {
        this.userReceiveCallback = userReceiveCallback
        this.userProgressCallback = userProgressCallback

        thread {
            mookReceiveThread()
        }
    }

    private fun mookReceiveThread() {
        lock.writeLock().withLock {
            cmdIdCounter += 1
            nowLoadingId = cmdIdCounter
            imageInstance = ImageInfo(
                img = airplane.getCameraDownImg(),
                id = cmdIdCounter,
                totalCount = mookTime * 100 // 模拟 3 秒，每 10ms 更新一次
            )
        }

        while (true) {
            val (currentProgress, currentTotal, currentId) = lock.readLock().withLock {
                val inst = imageInstance ?: return@thread
                Triple(inst.progressCount, inst.totalCount, inst.id)
            }

            if (currentProgress >= currentTotal || currentId != nowLoadingId) {
                break
            }

            Thread.sleep(10)

            lock.writeLock().withLock {
                if (imageInstance?.id == nowLoadingId) {
                    imageInstance?.progressCount = (imageInstance?.progressCount ?: 0) + 1
                }
            }

            userProgressCallback?.invoke(currentProgress + 1, currentTotal)
        }

        var finalImg: BufferedImage? = null
        lock.writeLock().withLock {
            if (imageInstance?.id == nowLoadingId) {
                imageInstance?.ok = true
                finalImg = imageInstance?.img
            }
        }

        if (finalImg != null && nowLoadingId != 0) {
            userReceiveCallback?.invoke(finalImg)
        }
    }

    fun getLatestImage(): BufferedImage? {
        return lock.readLock().withLock {
            if (imageInstance?.ok == true) imageInstance?.img else null
        }
    }

    fun getTransferProgress(): Int? {
        return lock.readLock().withLock {
            imageInstance?.progressCount
        }
    }

    fun isTransferInProgress(): Boolean {
        return lock.readLock().withLock {
            imageInstance != null && imageInstance?.ok == false
        }
    }
}
