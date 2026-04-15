defmodule PhantasyIslandRemoteControl.Radio.WaitToken do
  @moduledoc """
  轻量级的请求-响应等待令牌。
  在 Elixir 中，这通常通过发送进程消息或使用 Task.async/await 结合 GenServer 来实现。
  """

  # 在 Elixir 中，我们将 WaitToken 实现为一个持有状态的结构，或者使用进程。
  # 为了模仿弱引用和等待行为，我们可以使用一个临时的 Task 或 GenServer。

  defstruct [:wait_cmd, :time_base_id, :response, :processed_response, :owner_pid, :ref]

  def new(wait_cmd, time_base_id) do
    %__MODULE__{
      wait_cmd: wait_cmd,
      time_base_id: time_base_id,
      owner_pid: self(),
      ref: make_ref()
    }
  end

  # 同步等待响应
  def wait(token, timeout \\ 3000) do
    receive do
      {:token_response, ^token, data} ->
        process_response(token, data)
    after
      timeout ->
        nil
    end
  end

  defp process_response(_token, data) do
    # 模拟 post_processor 逻辑
    data
  end

  # 由 RadioManager 调用以完成令牌
  def complete(token, data) do
    send(token.owner_pid, {:token_response, token, data})
  end
end
