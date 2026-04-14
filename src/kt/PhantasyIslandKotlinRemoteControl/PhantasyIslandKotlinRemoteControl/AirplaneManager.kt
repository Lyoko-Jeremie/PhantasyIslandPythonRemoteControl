package PhantasyIslandKotlinRemoteControl

import org.json.JSONObject

class AirplaneManager {
    val airplanesTable: MutableMap<String, AirplaneController> = mutableMapOf()

    fun ping(): JSONObject? {
        return HttpLayer.ping()
    }

    fun pingVolatile(): JSONObject? {
        return HttpLayer.pingVolatile()
    }

    fun start(): JSONObject? {
        return HttpLayer.start()
    }

    fun startVolatile(): JSONObject? {
        return HttpLayer.startVolatile()
    }

    fun getAirplane(id: String): AirplaneController? {
        return airplanesTable[id]
    }

    fun sleep(timeMs: Long) {
        Thread.sleep(timeMs)
    }

    fun flush() {
        val allStatus = HttpLayer.getAllAirplaneStatus()
        val airplaneStatusMap = HttpLayer.processAirplane(allStatus)
        
        airplaneStatusMap?.forEach { (k, status) ->
            val existing = airplanesTable[k]
            val keyName = status["keyName"] as String
            val typeName = status["typeName"] as String
            val updateTimestamp = status["updateTimestamp"] as Long
            val statusObj = status["status"] as JSONObject
            val cameraFront = status["cameraFront"] as? String
            val cameraDown = status["cameraDown"] as? String
            
            val flyStatus = makeAirplaneFlyStatus(statusObj)

            if (existing == null) {
                airplanesTable[k] = AirplaneController(
                    keyName = keyName,
                    typeName = typeName,
                    updateTimestamp = updateTimestamp,
                    status = flyStatus,
                    cameraFront = cameraFront,
                    cameraDown = cameraDown
                )
            } else {
                existing.keyName = keyName
                existing.typeName = typeName
                existing.updateTimestamp = updateTimestamp
                existing.status = flyStatus
                existing.cameraFront = cameraFront
                existing.cameraDown = cameraDown
            }
        }
    }

    companion object {
        private val instance = AirplaneManager()
        
        @JvmStatic
        fun getAirplaneManager(): AirplaneManager {
            return instance
        }
    }
}
