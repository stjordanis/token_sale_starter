pragma solidity ^0.4.23;


contract ICOState {

    enum State {
        Created,
        Running,
        Paused,
        Finished
    }

    State public icoState = State.Created;

}
