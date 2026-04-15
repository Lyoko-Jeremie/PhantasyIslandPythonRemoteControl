-module(image_receiver_mook).
-behaviour(gen_server).

-export([start_link/1, send_cap_image/3, get_latest_image/1, get_transfer_progress/1, is_transfer_in_progress/1]).
-export([init/1, handle_call/3, handle_cast/2, handle_info/2, terminate/2, code_change/3]).

-record(state, {
    airplane,
    image_instance = nil,
    cmd_id_counter = 1,
    now_loading_id = 0,
    user_receive_callback = nil,
    user_progress_callback = nil
}).

-record(image_info, {
    img,
    id,
    total_count,
    progress_count = 0,
    ok = false
}).

start_link(Airplane) ->
    gen_server:start_link(?MODULE, [Airplane], []).

send_cap_image(Pid, ReceiveCb, ProgressCb) ->
    gen_server:cast(Pid, {send_cap_image, ReceiveCb, ProgressCb}).

get_latest_image(Pid) ->
    gen_server:call(Pid, get_latest_image).

get_transfer_progress(Pid) ->
    gen_server:call(Pid, get_transfer_progress).

is_transfer_in_progress(Pid) ->
    gen_server:call(Pid, is_transfer_in_progress).

init([Airplane]) ->
    {ok, #state{airplane = Airplane}}.

handle_call(get_latest_image, _From, State = #state{image_instance = ImgInst}) ->
    Reply = case ImgInst of
        nil -> nil;
        #image_info{ok = true, img = Img} -> Img;
        _ -> nil
    end,
    {reply, Reply, State};

handle_call(get_transfer_progress, _From, State = #state{image_instance = ImgInst}) ->
    Reply = case ImgInst of
        nil -> nil;
        #image_info{progress_count = PC} -> PC
    end,
    {reply, Reply, State};

handle_call(is_transfer_in_progress, _From, State = #state{image_instance = ImgInst}) ->
    Reply = case ImgInst of
        nil -> false;
        #image_info{ok = OK} -> not OK
    end,
    {reply, Reply, State}.

handle_cast({send_cap_image, ReceiveCb, ProgressCb}, State = #state{airplane = Airplane, cmd_id_counter = Counter}) ->
    NewCounter = Counter + 1,
    Img = airplane_core:get_camera_down_img(Airplane),
    Total = 3 * 100,
    ImgInst = #image_info{img = Img, id = NewCounter, total_count = Total},
    NewState = State#state{
        cmd_id_counter = NewCounter,
        now_loading_id = NewCounter,
        image_instance = ImgInst,
        user_receive_callback = ReceiveCb,
        user_progress_callback = ProgressCb
    },
    erlang:send_after(10, self(), tick),
    {noreply, NewState}.

handle_info(tick, State = #state{image_instance = ImgInst, now_loading_id = NowID, user_progress_callback = ProgressCb, user_receive_callback = ReceiveCb}) ->
    case ImgInst of
        #image_info{id = ID, progress_count = PC, total_count = Total} when ID == NowID, PC < Total ->
            NewPC = PC + 1,
            NewImgInst = ImgInst#image_info{progress_count = NewPC},
            if is_function(ProgressCb) -> ProgressCb(NewPC, Total); true -> ok end,
            erlang:send_after(10, self(), tick),
            {noreply, State#state{image_instance = NewImgInst}};
        #image_info{id = ID} when ID == NowID ->
            NewImgInst = ImgInst#image_info{ok = true},
            if is_function(ReceiveCb) -> ReceiveCb(NewImgInst#image_info.img); true -> ok end,
            {noreply, State#state{image_instance = NewImgInst}};
        _ ->
            {noreply, State}
    end.

terminate(_Reason, _State) -> ok.
code_change(_OldVsn, State, _Extra) -> {ok, State}.
