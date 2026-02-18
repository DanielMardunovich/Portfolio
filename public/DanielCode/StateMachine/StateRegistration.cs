/*
 * States are discovered at runtime using reflection, eliminating manual registration and enabling scalable expansion.
 */

private void OnEnable()
{
    _states = new List<State>();

    var stateTypes = AppDomain.CurrentDomain
        .GetAssemblies()
        .SelectMany(a => a.GetTypes())
        .Where(t => t.IsSubclassOf(typeof(State)) && !t.IsAbstract);

    foreach (var type in stateTypes)
    {
        if (Activator.CreateInstance(type) is State state)
            _states.Add(state);
    }
}
