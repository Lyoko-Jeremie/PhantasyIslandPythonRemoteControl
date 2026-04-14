package PhantasyIslandKotlinRemoteControl

class UAV {
    /**
     * 此类是到 UAV 库的适配器，是对AirplaneManager的wrapper
     */
    private val airs: AirplaneManager = AirplaneManager.getAirplaneManager()

    init {
        airs.flush()
        airs.start()
        airs.flush()
    }

    fun sleep(timeSec: Double) {
        /** sleep 单位 秒 */
        Thread.sleep((timeSec * 1000).toLong())
    }

    fun destroy() {
        // airs.destroy()
    }

    fun addUav(port: String) {
        /** 添加（注册）无人机 */
        airs.getAirplane(port)
    }

    fun p(port: String): AirplaneController? {
        return airs.getAirplane(port)
    }

    fun land(port: String) {
        /** 降落 */
        p(port)?.land()
    }

    fun emergency(port: String) {
        p(port)?.stop()
    }

    fun takeoff(port: String, high: Int) {
        /** 起飞到指定高度 单位cm */
        p(port)?.takeoff(high)
    }

    fun up(port: String, distance: Int) {
        /** 上升指定距离 单位cm */
        p(port)?.up(distance)
    }

    fun down(port: String, distance: Int) {
        /** 下降指定距离 单位cm */
        p(port)?.down(distance)
    }

    fun forward(port: String, distance: Int) {
        /** 前进指定距离 单位cm */
        p(port)?.forward(distance)
    }

    fun back(port: String, distance: Int) {
        /** 后退指定距离 单位cm */
        p(port)?.back(distance)
    }

    fun left(port: String, distance: Int) {
        /** 左移指定距离 单位cm */
        p(port)?.left(distance)
    }

    fun right(port: String, distance: Int) {
        /** 右移指定距离 单位cm */
        p(port)?.right(distance)
    }

    fun goto(port: String, x: Int, y: Int, h: Int) {
        /** 移动到指定坐标处 */
        p(port)?.goto(x, y, h)
    }

    fun flip(port: String, direction: String) {
        /**
         * flip函数用于控制无人机翻滚
         * :param direction: 翻滚方向（f前 b后 l左 r右）
         */
        val controller = p(port) ?: return
        when (direction) {
            "f" -> controller.flipForward()
            "b" -> controller.flipBack()
            "r" -> controller.flipRight()
            "l" -> controller.flipLeft()
        }
    }

    fun rotate(port: String, degree: Int) {
        /** 顺时旋转指定角度 */
        p(port)?.rotate(degree)
    }

    fun cw(port: String, degree: Int) {
        /** 顺时针旋转指定角度 */
        p(port)?.cw(degree)
    }

    fun ccw(port: String, degree: Int) {
        /** 逆时针旋转指定角度 */
        p(port)?.ccw(degree)
    }

    fun speed(port: String, speed: Int) {
        /** 设置飞行速度 */
        p(port)?.speed(speed)
    }

    fun high(port: String, high: Int) {
        /** 移动到指定高度处 */
        p(port)?.high(high)
    }

    fun led(port: String, r: Int, g: Int, b: Int) {
        /** 设置无人机led色彩 */
        p(port)?.led(r, g, b)
    }

    fun bln(port: String, r: Int, g: Int, b: Int) {
        /** 设置无人机led呼吸灯色彩 */
        p(port)?.bln(r, g, b)
    }

    fun rainbow(port: String, r: Int, g: Int, b: Int) {
        /** 设置无人机led彩虹色彩 */
        p(port)?.rainbow(r, g, b)
    }

    fun mode(port: String, mode: Int) {
        /** 设置无人机飞行模式
         * :param mode: 1常规2巡线3跟随4单机编队 通常情况下使用模式4
         */
        p(port)?.airplaneMode(mode)
    }

    fun stop(port: String) {
        /** 停桨 */
        p(port)?.stop()
    }

    fun hover(port: String) {
        /** 悬停 */
        p(port)?.hover()
    }
}
