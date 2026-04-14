package PhantasyIslandGoRemoteControl

import (
	"time"
)

// UAV 此类是到 UAV 库的适配器，是对AirplaneManager的wrapper
type UAV struct {
	Airs *AirplaneManager
}

func NewUAV() *UAV {
	u := &UAV{
		Airs: GetAirplaneManager(),
	}
	u.Airs.Flush()
	u.Airs.Start()
	u.Airs.Flush()
	return u
}

func (u *UAV) Sleep(seconds float64) {
	time.Sleep(time.Duration(seconds * float64(time.Second)))
}

func (u *UAV) Destroy() {
	// 实现销毁逻辑
}

func (u *UAV) AddUav(port string) {
	u.Airs.GetAirplane(port)
}

func (u *UAV) P(port string) *AirplaneController {
	return u.Airs.GetAirplane(port)
}

func (u *UAV) Land(port string) {
	u.P(port).Land()
}

func (u *UAV) Emergency(port string) {
	u.P(port).Stop()
}

func (u *UAV) Takeoff(port string, high int) {
	u.P(port).Takeoff(high)
}

func (u *UAV) Up(port string, distance int) {
	u.P(port).Up(distance)
}

func (u *UAV) Down(port string, distance int) {
	u.P(port).Down(distance)
}

func (u *UAV) Forward(port string, distance int) {
	u.P(port).Forward(distance)
}

func (u *UAV) Back(port string, distance int) {
	u.P(port).Back(distance)
}

func (u *UAV) Left(port string, distance int) {
	u.P(port).Left(distance)
}

func (u *UAV) Right(port string, distance int) {
	u.P(port).Right(distance)
}

func (u *UAV) Goto(port string, x int, y int, h int) {
	u.P(port).Goto(x, y, h)
}

func (u *UAV) Flip(port string, direction string) {
	p := u.P(port)
	switch direction {
	case "f":
		p.FlipForward()
	case "b":
		p.FlipBack()
	case "r":
		p.FlipRight()
	case "l":
		p.FlipLeft()
	}
}

func (u *UAV) Rotate(port string, degree int) {
	u.P(port).Rotate(degree)
}

func (u *UAV) Cw(port string, degree int) {
	u.P(port).Cw(degree)
}

func (u *UAV) Ccw(port string, degree int) {
	u.P(port).Ccw(degree)
}

func (u *UAV) Speed(port string, speed int) {
	u.P(port).Speed(speed)
}

func (u *UAV) High(port string, high int) {
	u.P(port).High(high)
}

func (u *UAV) Led(port string, r, g, b int) {
	u.P(port).Led(r, g, b)
}

func (u *UAV) Bln(port string, r, g, b int) {
	u.P(port).Bln(r, g, b)
}

func (u *UAV) Rainbow(port string, r, g, b int) {
	u.P(port).Rainbow(r, g, b)
}

func (u *UAV) Mode(port string, mode int) {
	u.P(port).AirplaneMode(mode)
}

func (u *UAV) Stop(port string) {
	u.P(port).Stop()
}

func (u *UAV) Hover(port string) {
	u.P(port).Hover()
}
