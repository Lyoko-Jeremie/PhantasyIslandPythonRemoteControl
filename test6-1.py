from src.PhantasyIslandPythonRemoteControl.airplane_manager import get_airplane_manager

m = get_airplane_manager()

m.flush()
m.start()
m.flush()

a = m.get_airplane('FH0C:COM3')
m.sleep(1)

a.mode(4)
m.sleep(1)

a.cap_image()
print(a.is_image_transfer_in_progress())
m.sleep(5)
print(a.is_image_transfer_in_progress())
print(a.get_latest_image())
print('')

a.cap_image(
    user_receive_callback=lambda img: print(f"receive image {len(img)} bytes"),
    user_progress_callback=lambda p,t: print(f"receive progress {p}/{t} bytes"),
)
print(a.is_image_transfer_in_progress())
print(a.get_latest_image())
