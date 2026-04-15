defmodule PhantasyIslandRemoteControl.ImageReceiverMook do
  @moduledoc """
  模拟图像接收器
  """

  defmodule ImageInfo do
    defstruct [:img, :id, :total_count, progress_count: 0, ok: false]
  end

  # 在 Elixir 中，这种带有状态和后台线程的逻辑通常使用 GenServer 实现
  use GenServer

  def start_link(airplane) do
    GenServer.start_link(__MODULE__, airplane)
  end

  @impl true
  def init(airplane) do
    {:ok, %{
      airplane: airplane,
      image_instance: nil,
      cmd_id_counter: 1,
      now_loading_id: 0,
      user_receive_callback: nil,
      user_progress_callback: nil,
      mook_time: 3
    }}
  end

  def send_cap_image(pid, receive_cb, progress_cb) do
    GenServer.cast(pid, {:send_cap_image, receive_cb, progress_cb})
  end

  def get_latest_image(pid) do
    GenServer.call(pid, :get_latest_image)
  end

  @impl true
  def handle_cast({:send_cap_image, receive_cb, progress_cb}, state) do
    new_id = state.cmd_id_counter + 1
    total_count = state.mook_time * 100
    
    # 模拟获取图片（在实际应用中可能需要异步）
    img = PhantasyIslandRemoteControl.AirplaneCore.get_camera_down_img(state.airplane)

    image_instance = %ImageInfo{
      img: img,
      id: new_id,
      total_count: total_count
    }

    # 启动模拟进度更新的“线程”（Task）
    Task.start(fn -> simulate_progress(pid_self(), new_id, total_count, progress_cb, receive_cb, img) end)

    {:noreply, %{state | 
      cmd_id_counter: new_id, 
      now_loading_id: new_id, 
      image_instance: image_instance,
      user_receive_callback: receive_cb,
      user_progress_callback: progress_cb
    }}
  end

  @impl true
  def handle_cast({:progress_update, id, count, progress_cb}, state) do
    if state.now_loading_id == id do
      if progress_cb, do: progress_cb.(count, state.image_instance.total_count)
      new_instance = %{state.image_instance | progress_count: count}
      {:noreply, %{state | image_instance: new_instance}}
    else
      {:noreply, state}
    end
  end

  @impl true
  def handle_cast({:finish_loading, id, receive_cb, img}, state) do
    if state.now_loading_id == id do
      if receive_cb, do: receive_cb.(img)
      new_instance = %{state.image_instance | ok: true}
      {:noreply, %{state | image_instance: new_instance}}
    else
      {:noreply, state}
    end
  end

  defp pid_self, do: self()

  defp simulate_progress(parent_pid, id, total, progress_cb, receive_cb, img) do
    Enum.each(1..total, fn i ->
      :timer.sleep(10)
      GenServer.cast(parent_pid, {:progress_update, id, i, progress_cb})
    end)
    GenServer.cast(parent_pid, {:finish_loading, id, receive_cb, img})
  end

  @impl true
  def handle_call(:get_latest_image, _from, state) do
    res = if state.image_instance && state.image_instance.ok, do: state.image_instance.img, else: nil
    {:reply, res, state}
  end
end
