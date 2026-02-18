/*
 * A singleton-based event hub provides a single communication surface for all runtime systems, ensuring consistent event broadcasting without cross-system dependencies.
 * Events are triggered through dedicated public methods rather than exposed directly. 
 * This preserves encapsulation and prevents external systems from invoking events incorrectly.
 */

using System;
using UnityEngine;

public class EventManager : MonoBehaviour
{
    public static EventManager Instance { get; private set; }

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(this);
            return;
        }

        Instance = this;
    }

    // --- Game Flow Events ---
    public event Action<State> OnStateSwapped;
    public event Action OnMainGameLoaded;
    public event Action OnPauseGame;

    // --- Level Progression Events ---
    public event Action<GameObject> OnRoomCompleted;
    public event Action OnFloorCompleted;
    public event Action OnFloorDestroyed;
    public event Action OnSpawnRoomSpawned;

    // --- Player Events ---
    public event Action OnPlayerDeath;
    // Game Flow
    public void StateSwapped(State state) => OnStateSwapped?.Invoke(state);

    public void MainGameLoaded() => OnMainGameLoaded?.Invoke();

    public void PauseGame() => OnPauseGame?.Invoke();

    // Level Progression
    public void RoomCompleted(GameObject lastEnemy) => OnRoomCompleted?.Invoke(lastEnemy);

    public void FloorCompleted()=> OnFloorCompleted?.Invoke();

    public void FloorDestroyed() => OnFloorDestroyed?.Invoke();

    public void SpawnRoomSpawned() => OnSpawnRoomSpawned?.Invoke();

    // Player
    public void PlayerDied() => OnPlayerDeath?.Invoke();
}
