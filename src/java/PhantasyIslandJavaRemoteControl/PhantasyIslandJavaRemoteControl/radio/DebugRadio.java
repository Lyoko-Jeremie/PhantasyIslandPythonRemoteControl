package PhantasyIslandJavaRemoteControl.radio;

import java.util.List;

/**
 * Debug 示例代码，对应 Python 的 debug_radio.py。
 */
public class DebugRadio {
    public static void main(String[] args) {
        RadioManager rm = new RadioManager();
        rm.connect();

        System.out.println(rm.createMsgTimestampId());
        System.out.println(rm.ping());

        // sync 模式（默认）
        Object result = rm.radioApi.listRadioLocalObjectsIds();
        List<String> ids = ApiModule.asSync(result);
        System.out.println(ids);

        System.out.println("isSceneInit: " + rm.radioApi.isSceneInit());
        System.out.println("isRadioReachabilityCheckerInit: " + rm.radioApi.isRadioReachabilityCheckerInit());
        System.out.println("getAllRadioMaterial: " + rm.radioApi.getAllRadioMaterial());
        System.out.println("localRadioMaterial: " + rm.radioApi.localRadioMaterial());
        System.out.println("listRadioLocalObjectsIds: " + rm.radioApi.listRadioLocalObjectsIds());

        // rm.waitExit(); // 假设有类似的方法
    }
}
