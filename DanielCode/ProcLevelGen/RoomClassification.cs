/*
 * Each generated cell evaluates spatial adjacency to determine its structural type (1 to 4 connections).
 * This classification drives prefab selection and ensures coherent topology across the layout.
 */

private RoomType ClassifyRoom(int x, int y)
{
    int connections = CountConnections(x, y);
    return (RoomType)Mathf.Clamp(connections, 1, 4);
}

private int CountConnections(int x, int y)
{
    int count = 0;

    foreach (var dir in directions)
    {
        int nx = x + dir.x;
        int ny = y + dir.y;

        if (IsInsideGrid(new Vector2Int(nx, ny)) &&
            grid[nx, ny] != RoomType.Zero)
        {
            count++;
        }
    }

    return count;
}

