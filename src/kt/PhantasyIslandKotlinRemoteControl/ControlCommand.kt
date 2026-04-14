package PhantasyIslandKotlinRemoteControl

import java.util.concurrent.Executors
import java.util.concurrent.Future

open class AirplaneController(
    keyName: String,
    typeName: String,
    updateTimestamp: Long,
    status: AirplaneFlyStatus,
    cameraFront: String?,
    cameraDown: String?
) : AirplaneCore(keyName, typeName, updateTimestamp, status, cameraFront, cameraDown) {

    private var count: Int = 1
    private var sendCmdFn: (String) -> Any = { s -> HttpLayer.sendCmd(s) }
    private val executor = Executors.newFixedThreadPool(10)

    fun useFastMode(fastMode: Boolean = true, futureMode: Boolean = true) {
        if (!futureMode) {
            if (fastMode) {
                sendCmdFn = { s -> HttpLayer.sendCmdVolatile(s) }
            } else {
                sendCmdFn = { s -> HttpLayer.sendCmd(s) }
            }
        } else {
            if (fastMode) {
                sendCmdFn = { s -> executor.submit<Any> { HttpLayer.sendCmdVolatile(s) } }
            } else {
                sendCmdFn = { s -> executor.submit<Any> { HttpLayer.sendCmd(s) } }
            }
        }
    }

    private fun nextCount(): Int {
        count += 2
        return count
    }

    private fun prepareCommand(command: String): String {
        return "$keyName ${nextCount()} $command"
    }

    private fun sendCommand(command: String): Any {
        return sendCmdFn(prepareCommand(command))
    }

    fun mode(mode: Int) {
        airplaneMode(mode)
    }

    fun takeoff(high: Int): Any {
        return sendCommand("takeoff $high")
    }

    fun land(): Any {
        return sendCommand("land")
    }

    fun emergency(): Any {
        return sendCommand("emergency")
    }

    fun up(distance: Int): Any {
        return sendCommand("up $distance")
    }

    fun down(distance: Int): Any {
        return sendCommand("down $distance")
    }

    fun forward(distance: Int): Any {
        return sendCommand("forward $distance")
    }

    fun back(distance: Int): Any {
        return sendCommand("back $distance")
    }

    fun left(distance: Int): Any {
        return sendCommand("left $distance")
    }

    fun right(distance: Int): Any {
        return sendCommand("right $distance")
    }

    fun goto(x: Int, y: Int, h: Int): Any {
        return sendCommand("goto $x $y $h")
    }

    fun flip(direction: String): Any {
        return sendCommand("flip $direction 1")
    }

    fun flipForward() {
        flip("f")
    }

    fun flipBack() {
        flip("b")
    }

    fun flipLeft() {
        flip("l")
    }

    fun flipRight() {
        flip("r")
    }

    fun rotate(degree: Int): Any {
        return sendCommand("rotate $degree")
    }

    fun cw(degree: Int): Any {
        return sendCommand("cw $degree")
    }

    fun ccw(degree: Int): Any {
        return sendCommand("ccw $degree")
    }

    fun high(high: Int): Any {
        return sendCommand("high $high")
    }

    fun speed(speed: Int): Any {
        return sendCommand("setSpeed $speed")
    }

    fun led(r: Int, g: Int, b: Int): Any {
        return sendCommand("light $r $g $b")
    }

    fun bln(r: Int, g: Int, b: Int): Any {
        return sendCommand("bln $r $g $b")
    }

    fun rainbow(r: Int, g: Int, b: Int): Any {
        return sendCommand("rainbow $r $g $b")
    }

    fun airplaneMode(mode: Int): Any {
        return sendCommand("airplane_mode $mode")
    }

    fun stop(): Any {
        return hover()
    }

    fun hover(): Any {
        return sendCommand("hover")
    }
}
