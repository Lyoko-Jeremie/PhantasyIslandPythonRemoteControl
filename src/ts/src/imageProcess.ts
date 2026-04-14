/**
 * 这个文件在 PhantasyIslandPythonRemoteControl 库中负责解析从仿真平台发回的无人机相机图像
 * 注意：在浏览器或 Node.js 环境中处理图像的方式不同。
 * 这里提供一个通用的 Base64 处理逻辑。
 */

export function readB64Img(uri: string | null): string | null {
    /**
     * 在 TS/JS 环境中，如果是在浏览器，可以直接将 uri 赋值给 <img> 标签的 src。
     * 如果是在 Node.js 且需要进行图像处理，通常会使用 canvas 或 sharp 库。
     * 这里我们保持原样返回或提取 base64 部分。
     */
    if (uri === null) {
        return null;
    }
    // 简单返回原始 URI，因为它已经是标准格式，可以直接在前端展示
    return uri;
}

export function decodeBase64ToBuffer(uri: string): Buffer | null {
    if (!uri) return null;
    const parts = uri.split(',');
    const b64 = parts.length > 1 ? parts[1] as string : parts[0] as string;
    return Buffer.from(b64, 'base64');
}
