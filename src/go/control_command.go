package PhantasyIslandGoRemoteControl

import (
	"fmt"
)

// AirplaneController 无人机控制
// 嵌入了 AirplaneCore 以实现继承效果
type AirplaneController struct {
	*AirplaneCore
	Count      int
	IsFastMode bool
}

func NewAirplaneController(core *AirplaneCore) *AirplaneController {
	return &AirplaneController{
		AirplaneCore: core,
		Count:        1,
		IsFastMode:   false,
	}
}

// UseFastMode 设置命令是否使用非阻塞模式
// Go 中实现 Future 模式通常使用 channel 或直接开启 goroutine。
// 这里简化实现，主要区分同步和异步调用。
func (ac *AirplaneController) UseFastMode(fastMode bool) {
	ac.IsFastMode = fastMode
}

func (ac *AirplaneController) nextCount() int {
	ac.Count += 2
	return ac.Count
}

func (ac *AirplaneController) prepareCommand(command string) string {
	return fmt.Sprintf("%s %d %s", ac.KeyName, ac.nextCount(), command)
}

func (ac *AirplaneController) sendCmd(command string) interface{} {
	cmdStr := ac.prepareCommand(command)
	if ac.IsFastMode {
		return SendCmdVolatile(cmdStr)
	}
	return SendCmd(cmdStr)
}

func (ac *AirplaneController) Mode(mode int) interface{} {
	return ac.AirplaneMode(mode)
}

func (ac *AirplaneController) Takeoff(high int) interface{} {
	return ac.sendCmd(fmt.Sprintf("takeoff %d", high))
}

func (ac *AirplaneController) Land() interface{} {
	return ac.sendCmd("land")
}

func (ac *AirplaneController) Emergency() interface{} {
	return ac.sendCmd("emergency")
}

func (ac *AirplaneController) Up(distance int) interface{} {
	return ac.sendCmd(fmt.Sprintf("up %d", distance))
}

func (ac *AirplaneController) Down(distance int) interface{} {
	return ac.sendCmd(fmt.Sprintf("down %d", distance))
}

func (ac *AirplaneController) Forward(distance int) interface{} {
	return ac.sendCmd(fmt.Sprintf("forward %d", distance))
}

func (ac *AirplaneController) Back(distance int) interface{} {
	return ac.sendCmd(fmt.Sprintf("back %d", distance))
}

func (ac *AirplaneController) Left(distance int) interface{} {
	return ac.sendCmd(fmt.Sprintf("left %d", distance))
}

func (ac *AirplaneController) Right(distance int) interface{} {
	return ac.sendCmd(fmt.Sprintf("right %d", distance))
}

func (ac *AirplaneController) Goto(x int, y int, h int) interface{} {
	return ac.sendCmd(fmt.Sprintf("goto %d %d %d", x, y, h))
}

func (ac *AirplaneController) Flip(direction string) interface{} {
	return ac.sendCmd(fmt.Sprintf("flip %s 1", direction))
}

func (ac *AirplaneController) FlipForward() interface{} {
	return ac.Flip("f")
}

func (ac *AirplaneController) FlipBack() interface{} {
	return ac.Flip("b")
}

func (ac *AirplaneController) FlipLeft() interface{} {
	return ac.Flip("l")
}

func (ac *AirplaneController) FlipRight() interface{} {
	return ac.Flip("r")
}

func (ac *AirplaneController) Rotate(degree int) interface{} {
	return ac.sendCmd(fmt.Sprintf("rotate %d", degree))
}

func (ac *AirplaneController) Cw(degree int) interface{} {
	return ac.sendCmd(fmt.Sprintf("cw %d", degree))
}

func (ac *AirplaneController) Ccw(degree int) interface{} {
	return ac.sendCmd(fmt.Sprintf("ccw %d", degree))
}

func (ac *AirplaneController) High(high int) interface{} {
	return ac.sendCmd(fmt.Sprintf("high %d", high))
}

func (ac *AirplaneController) Speed(speed int) interface{} {
	return ac.sendCmd(fmt.Sprintf("setSpeed %d", speed))
}

func (ac *AirplaneController) Led(r int, g int, b int) interface{} {
	return ac.sendCmd(fmt.Sprintf("light %d %d %d", r, g, b))
}

func (ac *AirplaneController) Bln(r int, g int, b int) interface{} {
	return ac.sendCmd(fmt.Sprintf("bln %d %d %d", r, g, b))
}

func (ac *AirplaneController) Rainbow(r int, g int, b int) interface{} {
	return ac.sendCmd(fmt.Sprintf("rainbow %d %d %d", r, g, b))
}

func (ac *AirplaneController) AirplaneMode(mode int) interface{} {
	return ac.sendCmd(fmt.Sprintf("airplane_mode %d", mode))
}

func (ac *AirplaneController) Stop() interface{} {
	return ac.Hover()
}

func (ac *AirplaneController) Hover() interface{} {
	return ac.sendCmd("hover")
}
