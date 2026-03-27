

模板：

```python

from PhantasyIslandPythonRemoteControl import AirplaneController
from PhantasyIslandPythonRemoteControl.airplane_manager import get_airplane_manager
import time

m = get_airplane_manager()
m.flush()
m.start()
m.flush()

a: AirplaneController = m.get_airplane("FH0C:COM3")

a.use_fast_mode(
    fast_mode=False,
    future_mode=True,
)

a.takeoff(100)
time.sleep(3)

a.land()
time.sleep(3)

```




