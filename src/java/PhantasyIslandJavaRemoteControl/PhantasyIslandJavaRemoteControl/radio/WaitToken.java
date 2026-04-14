package PhantasyIslandJavaRemoteControl.radio;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

/**
 * 轻量级的请求-响应等待令牌。
 */
public class WaitToken<T> {
    public final String waitCmd;
    public final long timeBaseId;
    private Map<String, Object> response = null;
    private T processedResponse = null;
    private final CountDownLatch latch = new CountDownLatch(1);
    private final CompletableFuture<T> future = new CompletableFuture<>();
    private Function<Map<String, Object>, T> postProcessor = null;

    public WaitToken(String waitCmd, long timeBaseId) {
        this.waitCmd = waitCmd;
        this.timeBaseId = timeBaseId;
    }

    public boolean isDone() {
        return latch.getCount() == 0;
    }

    public WaitToken<T> setPostProcessor(Function<Map<String, Object>, T> processor) {
        this.postProcessor = processor;
        return this;
    }

    @SuppressWarnings("unchecked")
    private T applyPostProcessor(Map<String, Object> data) {
        T result;
        if (postProcessor != null) {
            result = postProcessor.apply(data);
        } else {
            result = (T) data;
        }
        this.processedResponse = result;
        return result;
    }

    /**
     * 填充响应并唤醒所有等待者。
     */
    public void complete(Map<String, Object> data) {
        this.response = data;
        T result = applyPostProcessor(data);
        latch.countDown();
        future.complete(result);
    }

    /**
     * 获取原始响应数据。
     */
    public Map<String, Object> getResponse() {
        return response;
    }

    /**
     * 获取后处理后的响应数据。
     */
    public T getProcessedResponse() {
        return processedResponse;
    }

    /**
     * 同步等待响应。
     */
    public T waitResponse(double timeoutSeconds) {
        try {
            if (latch.await((long) (timeoutSeconds * 1000), TimeUnit.MILLISECONDS)) {
                return processedResponse;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return null;
    }

    /**
     * 获取用于异步等待的 CompletableFuture。
     */
    public CompletableFuture<T> asFuture() {
        return future;
    }

    @Override
    public String toString() {
        String status = isDone() ? "done" : "pending";
        return String.format("<WaitToken cmd=%s %s>", waitCmd, status);
    }
}
