/*
 * Deterministic grid expansion from a randomized origin ensures guaranteed connectivity while preventing out-of-bounds placement. 
 * The algorithm grows the layout incrementally, validating each step before committing it to the grid.
 */

private void GenerateLayout()
{
    var rng = new System.Random();
    Vector2Int current = GetRandomStartPosition(rng);

    grid[current.x, current.y] = RoomType.One;

    for (int i = 0; i < roomsToCreate; i++)
        current = ExpandFrom(current, rng);
}

private Vector2Int ExpandFrom(Vector2Int origin, System.Random rng)
{
    while (true)
    {
        Vector2Int next = origin + directions[rng.Next(directions.Length)];

        if (!IsInsideGrid(next))
            continue;

        if (grid[next.x, next.y] != RoomType.Zero)
        {
            origin = next;
            continue;
        }

        grid[next.x, next.y] = RoomType.One;
        return next;
    }
}
