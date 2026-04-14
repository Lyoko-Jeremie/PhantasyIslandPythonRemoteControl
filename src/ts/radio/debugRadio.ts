import {RadioManager} from './radioManager';
import {asAsync, asToken} from './apiModule';

async function main() {
    const rm = new RadioManager();
    await rm.connect();

    console.log(rm.createMsgTimestampId());
    console.log(await rm.debugApi.ping());

    // sync/async 模式
    const data = await asAsync(rm.radioApi.listRadioLocalObjectsIds());
    console.log(data);

    // token 模式
    rm.radioApi.mode('token');
    const t = asToken(rm.radioApi.listRadioLocalObjectsIds());
    console.log(t);
    console.log(await t.wait(10000));

    console.log('isSceneInit', await rm.radioApi.isSceneInit());
}

if (require.main === module) {
    main();
}
