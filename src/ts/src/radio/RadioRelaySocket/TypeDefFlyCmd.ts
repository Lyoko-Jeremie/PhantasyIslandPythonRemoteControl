import Type from 'typebox';
import {Compile} from 'typebox/compile';

export enum FlyCmdEnum {
    land = 'land',
    takeoff = 'takeoff',
    hover = 'hover',
    goto = 'goto',
    left = 'left',
    right = 'right',
    up = 'up',
    down = 'down',
    forward = 'forward',
    back = 'back',
    stop = 'stop',
    rotate = 'rotate',
    cw = 'cw',
    ccw = 'ccw',
    jump = 'jump',
    high = 'high',
    speed = 'speed',
    light = 'light',
    bln = 'bln',
    rainbow = 'rainbow',
}

export const Type_FlyCmdEnum = Type.Enum(FlyCmdEnum, {
    description: '飞行控制命令枚举. 包含常用的飞行控制命令，如起飞、降落、悬停、移动、旋转等',
});

// ── "重载表"：每个 FlyCmdEnum 值对应的附加参数（不含 cmd 字段本身） ──────────
//   类似函数重载的集中声明，新增命令只需在此处加一行，无需额外定义接口

export interface FlyCmdPayloadMap {
    // 无附加参数
    [FlyCmdEnum.land]: { speed?: number };
    [FlyCmdEnum.takeoff]: { h: number; speed?: number };
    [FlyCmdEnum.hover]: Record<never, never>;
    [FlyCmdEnum.stop]: Record<never, never>;
    // 绝对坐标（单位 cm）
    [FlyCmdEnum.goto]: { x: number; y: number; h: number; speed?: number };
    // 方向移动：distance（单位 cm）
    [FlyCmdEnum.left]: { distance: number; speed?: number };
    [FlyCmdEnum.right]: { distance: number; speed?: number };
    [FlyCmdEnum.up]: { distance: number; speed?: number };
    [FlyCmdEnum.down]: { distance: number; speed?: number };
    [FlyCmdEnum.forward]: { distance: number; speed?: number };
    [FlyCmdEnum.back]: { distance: number; speed?: number };
    // 旋转
    [FlyCmdEnum.rotate]: { degree: number; speed?: number };
    [FlyCmdEnum.cw]: { degree: number; speed?: number };
    [FlyCmdEnum.ccw]: { degree: number; speed?: number };
    // 跳跃移动
    [FlyCmdEnum.jump]: { distance: number; f: 'l' | 'r' | 'f' | 'b'; speed?: number };
    // 高度
    [FlyCmdEnum.high]: { h: number; speed?: number };
    // 速度
    [FlyCmdEnum.speed]: { speed?: number };
    // 灯光（0~255）
    [FlyCmdEnum.light]: { colorR: number; colorG: number; colorB: number };
    [FlyCmdEnum.bln]: { colorR: number; colorG: number; colorB: number };
    [FlyCmdEnum.rainbow]: { colorR: number; colorG: number; colorB: number };
}

// ── 判别联合：由映射类型自动拼出，TS 可通过 cmd 字段自动缩窄 ─────────────────

export type FlyCmd = {
    [C in FlyCmdEnum]: { cmd: C } & FlyCmdPayloadMap[C]
}[FlyCmdEnum];

// 如需单独引用某个子类型，可用 Extract 工具类型，无需额外声明接口：
//   type FlyCmd_goto  = Extract<FlyCmd, { cmd: FlyCmdEnum.goto  }>;
//   type FlyCmd_light = Extract<FlyCmd, { cmd: FlyCmdEnum.light }>;


// ── TypeBox Schema（Union，带判别键 cmd） ─────────────────────────────────────

const _noParam = (cmd: FlyCmdEnum, description: string) =>
    Type.Object({cmd: Type.Literal(cmd)}, {description});

const _distance = (cmd: FlyCmdEnum, description: string) =>
    Type.Object({
        cmd: Type.Literal(cmd),
        distance: Type.Number({description: '移动距离，单位 cm'}),
        speed: Type.Optional(Type.Number({description: '飞行速度'})),
    }, {description});

const _degree = (cmd: FlyCmdEnum, description: string) =>
    Type.Object({
        cmd: Type.Literal(cmd),
        degree: Type.Number({description: '旋转角度，单位度'}),
        speed: Type.Optional(Type.Number({description: '旋转速度'})),
    }, {description});

const _rgb = (cmd: FlyCmdEnum, description: string) =>
    Type.Object({
        cmd: Type.Literal(cmd),
        colorR: Type.Number({description: '灯光颜色 R 分量，范围 0~255'}),
        colorG: Type.Number({description: '灯光颜色 G 分量，范围 0~255'}),
        colorB: Type.Number({description: '灯光颜色 B 分量，范围 0~255'}),
    }, {description});

export const Type_FlyCmd = Type.Union([
    Type.Object({
        cmd: Type.Literal(FlyCmdEnum.land),
        speed: Type.Optional(Type.Number({description: '降落速度'})),
    }, {description: '降落'}),
    Type.Object({
        cmd: Type.Literal(FlyCmdEnum.takeoff),
        h: Type.Number({description: '起飞高度，单位 cm'}),
        speed: Type.Optional(Type.Number({description: '起飞速度'})),
    }, {description: '起飞'}),
    _noParam(FlyCmdEnum.hover, '悬停'),
    _noParam(FlyCmdEnum.stop, '停止'),
    Type.Object({
        cmd: Type.Literal(FlyCmdEnum.goto),
        x: Type.Number({description: 'x 坐标，单位 cm'}),
        y: Type.Number({description: 'y 坐标，单位 cm'}),
        h: Type.Number({description: '高度，单位 cm'}),
        speed: Type.Optional(Type.Number({description: '飞行速度'})),
    }, {description: '飞往绝对坐标'}),
    _distance(FlyCmdEnum.left, '向左移动'),
    _distance(FlyCmdEnum.right, '向右移动'),
    _distance(FlyCmdEnum.up, '向上移动'),
    _distance(FlyCmdEnum.down, '向下移动'),
    _distance(FlyCmdEnum.forward, '向前移动'),
    _distance(FlyCmdEnum.back, '向后移动'),
    Type.Object({
        cmd: Type.Literal(FlyCmdEnum.rotate),
        degree: Type.Number({description: '旋转角度，单位度'}),
        speed: Type.Optional(Type.Number({description: '旋转速度'})),
    }, {description: '连续旋转'}),
    _degree(FlyCmdEnum.cw, '顺时针旋转指定角度'),
    _degree(FlyCmdEnum.ccw, '逆时针旋转指定角度'),
    Type.Object({
        cmd: Type.Literal(FlyCmdEnum.jump),
        distance: Type.Number({description: '跳跃距离，单位 cm'}),
        f: Type.Union([
            Type.Literal('l'),
            Type.Literal('r'),
            Type.Literal('f'),
            Type.Literal('b'),
        ], {description: '方向：l=left, r=right, f=forward, b=backward'}),
        speed: Type.Optional(Type.Number({description: '跳跃速度'})),
    }, {description: '跳跃移动'}),
    Type.Object({
        cmd: Type.Literal(FlyCmdEnum.high),
        h: Type.Number({description: '目标高度，单位 cm'}),
        speed: Type.Optional(Type.Number({description: '飞行速度'})),
    }, {description: '飞到指定高度'}),
    Type.Object({
        cmd: Type.Literal(FlyCmdEnum.speed),
        speed: Type.Optional(Type.Number({description: '飞行速度'})),
    }, {description: '设置飞行速度'}),
    _rgb(FlyCmdEnum.light, '设置 RGB 灯光颜色'),
    _rgb(FlyCmdEnum.bln, '闪烁'),
    _rgb(FlyCmdEnum.rainbow, '彩虹灯效'),
], {
    description: '飞行控制命令消息（判别联合，以 cmd 字段区分各子类型）',
});

export const Type_FlyCmd_Compiled = Compile(Type_FlyCmd);

