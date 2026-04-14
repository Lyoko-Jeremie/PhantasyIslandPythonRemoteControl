package PhantasyIslandGoRemoteControl

import (
	"time"
)

// FH0A 此类是到FH0A库的适配器，是对AirplaneManager的wrapper
type FH0A struct {
	Airs *AirplaneManager
}

func NewFH0A() *FH0A {
	f := &FH0A{
		Airs: GetAirplaneManager(),
	}
	f.Airs.Flush()
	f.Airs.Start()
	f.Airs.Flush()
	return f
}

func (f *FH0A) Sleep(seconds float64) {
	time.Sleep(time.Duration(seconds * float64(time.Second)))
}

func (f *FH0A) Destroy() {
	// 实现销毁逻辑
}

func (f *FH0A) AddUav(port string) {
	f.Airs.GetAirplane(port)
}

func (f *FH0A) P(port string) *AirplaneController {
	return f.Airs.GetAirplane(port)
}

func (f *FH0A) Land(port string) {
	f.P(port).Land()
}

func (f *FH0A) Takeoff(port string, high int) {
	f.P(port).Takeoff(high)
}

func (f *FH0A) Up(port string, distance int) {
	f.P(port).Up(distance)
}

func (f *FH0A) Down(port string, distance int) {
	f.P(port).Down(distance)
}

func (f *FH0A) Forward(port string, distance int) {
	f.P(port).Forward(distance)
}

func (f *FH0A) Back(port string, distance int) {
	f.P(port).Back(distance)
}

func (f *FH0A) Left(port string, distance int) {
	f.P(port).Left(distance)
}

func (f *FH0A) Right(port string, distance int) {
	f.P(port).Right(distance)
}

func (f *FH0A) Goto(port string, x int, y int, h int) {
	f.P(port).Goto(x, y, h)
}

func (f *FH0A) Flip(port string, direction string) {
	p := f.P(port)
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

func (f *FH0A) Rotate(port string, degree int) {
	f.P(port).Rotate(degree)
}

func (f *FH0A) Cw(port string, degree int) {
	f.P(port).Cw(degree)
}

func (f *FH0A) Ccw(port string, degree int) {
	f.P(port).Ccw(degree)
}

func (f *FH0A) Speed(port string, speed int) {
	f.P(port).Speed(speed)
}

func (f *FH0A) High(port string, high int) {
	f.P(port).High(high)
}

func (f *FH0A) Led(port string, r, g, b int) {
	f.P(port).Led(r, g, b)
}

func (f *FH0A) Bln(port string, r, g, b int) {
	f.P(port).Bln(r, g, b)
}

func (f *FH0A) Rainbow(port string, r, g, b int) {
	f.P(port).Rainbow(r, g, b)
}

func (f *FH0A) Mode(port string, mode int) {
	f.P(port).AirplaneMode(mode)
}

func (f *FH0A) ColorDetect(port string, LL, LH, AL, AH, BL, BH int) {
	// TODO
}

func (f *FH0A) VisionMode(port string, mode int) {
	// TODO
}

func (f *FH0A) Stop(port string) {
	f.P(port).Stop()
}

func (f *FH0A) Hover(port string) {
	f.P(port).Hover()
}
