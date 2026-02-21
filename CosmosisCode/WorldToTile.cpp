FIntVector UEnemyLookup::WorldToTile(FVector WorldLocation)
{
    int tileX = FMath::Floor(WorldLocation.X / TileSize);
    int tileY = FMath::Floor(WorldLocation.Y / TileSize);
    int tileZ = FMath::Floor(WorldLocation.Z / TileSize);
    return FIntVector(tileX, tileY, tileZ);
}

FVector UEnemyLookup::TileToWorld(FIntVector TileLocation)
{
    float tileX = TileLocation.X * TileSize;
    float tileY = TileLocation.Y * TileSize;
    float tileZ = TileLocation.Z * TileSize;
    return FVector(tileX, tileY, tileZ);
}