void UEnemyLookup::AddAIToTile_Implementation(FVector Position, ASimpleDefaultAI* ai)
{
    FIntVector Tile = WorldToTile(Position);
    if (TileMap.Contains(Tile))
    {
        if (ai != nullptr)
            TileMap[Tile].AIList.AddUnique(ai);
    }
    else
    {
        if (ai != nullptr)
        {
            FAIArray Temp;
            Temp.AIList.Add(ai);
            TileMap.Add(Tile, Temp);
        }
    }
}