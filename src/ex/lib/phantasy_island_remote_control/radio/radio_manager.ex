defmodule PhantasyIslandRemoteControl.Radio.RadioManager do
  @moduledoc """
  无线电管理器，管理与仿真平台的 Socket.io 连接。
  """
  use GenServer

  alias PhantasyIslandRemoteControl.Radio.WaitToken
  alias PhantasyIslandRemoteControl.Radio.ApiDebug
  alias PhantasyIslandRemoteControl.Radio.ApiScene
  alias PhantasyIslandRemoteControl.Radio.ApiFly
  alias PhantasyIslandRemoteControl.Radio.ApiRadio

  defstruct [
    :socket, :namespace, :scene_is_init, :pending_waiters,
    :debug_api, :scene_api, :fly_api, :radio_api
  ]

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    state = %__MODULE__{
      namespace: "/UserSide",
      scene_is_init: false,
      pending_waiters: %{}
    }
    # 在 Elixir 中，API 子模块通常持有 RM 的 pid
    {:ok, %{state |
      debug_api: ApiDebug.new(self()),
      scene_api: ApiScene.new(self()),
      fly_api: ApiFly.new(self()),
      radio_api: ApiRadio.new(self())
    }}
  end

  def create_msg_timestamp_id do
    System.system_time(:millisecond) * 100
  end

  def connect(pid, url \\ "http://127.0.0.1:60002", ns \\ "/UserSide") do
    GenServer.call(pid, {:connect, url, ns})
  end

  def send_and_wait_sync(pid, cmd, data, opts \\ []) do
    token = GenServer.call(pid, {:send_with_token, cmd, data})
    WaitToken.wait(token, Keyword.get(opts, :timeout, 3000))
  end

  def send_and_wait_token(pid, cmd, data, _opts \\ []) do
    GenServer.call(pid, {:send_with_token, cmd, data})
  end

  @impl true
  def handle_call({:connect, _url, ns}, _from, state) do
    # 模拟连接逻辑
    IO.puts("[RadioManager] Connected to namespace #{ns}")
    {:reply, :ok, %{state | namespace: ns}}
  end

  @impl true
  def handle_call({:send_with_token, cmd, data}, {from_pid, _}, state) do
    time_base_id = create_msg_timestamp_id()
    token = %WaitToken{
      wait_cmd: cmd,
      time_base_id: time_base_id,
      owner_pid: from_pid,
      ref: make_ref()
    }

    # 注册 waiter
    new_waiters = Map.update(state.pending_waiters, cmd, [token], fn list -> [token | list] end)
    
    # 模拟发送消息
    msg = Map.merge(%{"cmd" => cmd, "timestampIdPython" => time_base_id}, data)
    IO.puts("[RadioManager] Sending message: #{inspect(msg)}")

    {:reply, token, %{state | pending_waiters: new_waiters}}
  end

  # 处理从 Socket.io 接收到的消息
  @impl true
  def handle_info({:socket_message, data}, state) do
    cmd = data["cmd"]
    timestamp_id = data["timestampIdPython"]

    case Map.get(state.pending_waiters, cmd) do
      nil -> {:noreply, state}
      waiters ->
        {matched, surviving} = Enum.split_with(waiters, fn t -> t.time_base_id == timestamp_id end)
        Enum.each(matched, fn t -> WaitToken.complete(t, data) end)
        
        new_pending = if surviving == [], do: Map.delete(state.pending_waiters, cmd), else: Map.put(state.pending_waiters, cmd, surviving)
        {:noreply, %{state | pending_waiters: new_pending}}
    end
  end
end
