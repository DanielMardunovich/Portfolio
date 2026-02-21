TArray<ASimpleDefaultAI*> UEnemyLookup::FindAllContentInRadius(FVector center, int tilesDistanceAway)
{
    TArray<ASimpleDefaultAI*> AIInRadius;
    FIntVector CenterTile = WorldToTile(center);

    for (int x = -tilesDistanceAway; x <= tilesDistanceAway; x++)
        for (int y = -tilesDistanceAway; y <= tilesDistanceAway; y++)
            for (int z = -tilesDistanceAway; z <= tilesDistanceAway; z++)
            {
                FIntVector tileToCheck = CenterTile + FIntVector(x, y, z);
                if (TileMap.Contains(tileToCheck))
                    for (auto a : FindContentOfTile(tileToCheck))
                        if (IsValid(a))
                            AIInRadius.AddUnique(a);
            }

    return AIInRadius;
}