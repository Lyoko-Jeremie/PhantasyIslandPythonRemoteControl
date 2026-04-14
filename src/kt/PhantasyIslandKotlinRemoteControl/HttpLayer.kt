package PhantasyIslandKotlinRemoteControl

import PhantasyIslandKotlinRemoteControl.Config.remoteLocation
import java.net.HttpURLConnection
import java.net.URL
import java.util.Scanner
import org.json.JSONObject

object HttpLayer {

    fun ping(): JSONObject? {
        return sendCmd("ping")
    }

    fun pingVolatile(): JSONObject? {
        return sendCmdVolatile("ping")
    }

    fun start(): JSONObject? {
        return sendCmd("start")
    }

    fun startVolatile(): JSONObject? {
        return sendCmdVolatile("start")
    }

    private fun getRequest(urlString: String, timeout: Int = 10000): String {
        val url = URL(urlString)
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "GET"
        connection.connectTimeout = timeout
        connection.readTimeout = timeout
        
        val responseCode = connection.responseCode
        return if (responseCode == HttpURLConnection.HTTP_OK) {
            val scanner = Scanner(connection.inputStream)
            val response = StringBuilder()
            while (scanner.hasNextLine()) {
                response.append(scanner.nextLine())
            }
            scanner.close()
            response.toString()
        } else {
            throw Exception("HTTP error code: $responseCode")
        }
    }

    fun sendCmd(s: String): JSONObject {
        return try {
            val response = getRequest("http://$remoteLocation/ECU_HTTP/sendStringCmd?c=$s")
            JSONObject(response)
        } catch (e: Exception) {
            System.err.println("send_cmd $s Error: ${e.message}")
            JSONObject().apply {
                put("ok", false)
                put("r", "Error: ${e.message}")
            }
        }
    }

    fun sendCmdVolatile(s: String): JSONObject {
        return try {
            val response = getRequest("http://$remoteLocation/ECU_HTTP/sendStringCmd?cc=$s")
            JSONObject(response)
        } catch (e: Exception) {
            System.err.println("send_cmd_volatile $s Error: ${e.message}")
            JSONObject().apply {
                put("ok", false)
                put("r", "Error: ${e.message}")
            }
        }
    }

    fun getAllAirplaneStatus(): JSONObject {
        return try {
            val response = getRequest("http://$remoteLocation/ECU_HTTP/requestPullAllAirplaneState", 5000)
            JSONObject(response)
        } catch (e: Exception) {
            System.err.println("ConnectionError Cannot Connect to PhantasyIsland: ${e.message}")
            throw Exception("ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded.")
        }
    }

    fun getAirplaneCameraImage(port: String, camera: String): String? {
        return try {
            val response = getRequest("http://$remoteLocation/ECU_HTTP/requestPullImage?flyPort=$port&imageType=$camera", 5000)
            val j = JSONObject(response)
            if (j.optBoolean("ok") == true) {
                j.optString("imgDataString")
            } else {
                null
            }
        } catch (e: Exception) {
            System.err.println("ConnectionError Cannot Connect to PhantasyIsland: ${e.message}")
            null
        }
    }

    fun processAirplane(j: JSONObject): Map<String, Map<String, Any?>>? {
        if (j.optBoolean("ok") == true) {
            val airplanes = j.getJSONArray("airplanes")
            val airplaneStatus = mutableMapOf<String, Map<String, Any?>>()
            for (i in 0 until airplanes.length()) {
                val air = airplanes.getJSONObject(i)
                val status = mutableMapOf<String, Any?>()
                val keyName = air.getString("keyName")
                status["keyName"] = keyName
                status["typeName"] = air.optString("typeName")
                status["updateTimestamp"] = air.optLong("updateTimestamp")
                status["status"] = air.optJSONObject("status")

                val cameraFront = air.optJSONObject("cameraFront")
                status["cameraFront"] = cameraFront?.optString("imgDataString")

                val cameraDown = air.optJSONObject("cameraDown")
                status["cameraDown"] = cameraDown?.optString("imgDataString")

                airplaneStatus[keyName] = status
            }
            return airplaneStatus
        } else {
            return null
        }
    }
}
