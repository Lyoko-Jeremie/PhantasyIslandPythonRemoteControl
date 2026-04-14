package PhantasyIslandGoRemoteControl

import (
	"encoding/base64"
	"strings"
)

// ReadB64Img 从仿真平台中返回的无人机相机图像是一个标准html编码的png/jpg图像
// 在 Go 中，如果没有 cgo 依赖，我们通常返回原始字节数组。
// 如果需要 opencv 支持，用户可以自行使用 gocv 解析这些字节。
func ReadB64Img(uri *string) []byte {
	if uri == nil {
		return nil
	}

	parts := strings.Split(*uri, ",")
	if len(parts) < 2 {
		return nil
	}

	imB64 := parts[1]
	imBytes, err := base64.StdEncoding.DecodeString(imB64)
	if err != nil {
		return nil
	}

	return imBytes
}
