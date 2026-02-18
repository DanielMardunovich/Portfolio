/*
 * Layout computation is decoupled from world representation.
 * Prefabs are selected based on structural classification and instantiated deterministically into world space, enabling scalable content expansion without modifying generation logic.
*/

private void InstantiateRooms()
{
    for (int x = 0; x < roomsToCreate; x++)
    {
        for (int y = 0; y < roomsToCreate; y++)
        {
            if (grid[x, y] == RoomType.Zero)
                continue;

            RoomType type = ClassifyRoom(x, y);
            GameObject prefab = SelectPrefab(type);

            SpawnRoom(prefab, x, y);
        }
    }
}

private void SpawnRoom(GameObject prefab, int x, int y)
{
    Vector3 position = new(
        x * distanceBetweenRooms,
        0,
        y * distanceBetweenRooms);

    Instantiate(prefab, position, Quaternion.identity);
}


