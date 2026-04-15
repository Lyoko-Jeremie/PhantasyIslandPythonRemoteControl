-module(wait_token).
-behaviour(gen_server).

-export([start_link/2, complete/2, wait/2, set_post_processor/2]).
-export([init/1, handle_call/3, handle_cast/2]).

-record(state, {
    wait_cmd,
    time_base_id,
    response = nil,
    processed_response = nil,
    post_processor = nil,
    waiting_from = nil
}).

start_link(WaitCmd, TimeBaseID) ->
    gen_server:start_link(?MODULE, [WaitCmd, TimeBaseID], []).

complete(Pid, Data) ->
    gen_server:cast(Pid, {complete, Data}).

wait(Pid, Timeout) ->
    try
        gen_server:call(Pid, wait, Timeout)
    catch
        exit:{timeout, _} -> nil
    end.

set_post_processor(Pid, Processor) ->
    gen_server:cast(Pid, {set_post_processor, Processor}).

init([WaitCmd, TimeBaseID]) ->
    {ok, #state{wait_cmd = WaitCmd, time_base_id = TimeBaseID}}.

handle_cast({set_post_processor, Processor}, State) ->
    {noreply, State#state{post_processor = Processor}};

handle_cast({complete, Data}, State = #state{post_processor = PP, waiting_from = From}) ->
    Processed = if PP =/= nil -> PP(Data); true -> Data end,
    if From =/= nil -> gen_server:reply(From, Processed); true -> ok end,
    {noreply, State#state{response = Data, processed_response = Processed, waiting_from = nil}}.

handle_call(wait, From, State = #state{response = Resp, processed_response = ProcResp}) ->
    case Resp of
        nil -> {noreply, State#state{waiting_from = From}};
        _ -> {reply, ProcResp, State}
    end.
