/*
 * Transitions cleanly exit the current state, enter the new one, and broadcast the change through the event system.
 */

public void SwitchState<T>() where T : State
{
    foreach (var state in _states)
    {
        if (state.GetType() != typeof(T))
            continue;

        _currentState?.ExitState();
        _currentState = state;
        _currentState.EnterState();

        EventManager.Instance.StateSwapped(_currentState);
        break;
    }
}
