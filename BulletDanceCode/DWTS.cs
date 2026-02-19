/*
 * Candidates are scored using a composite function combining directional alignment and inverse distance weighting. 
 * This avoids long-range magnetic behavior and stabilizes target selection in clustered scenarios. 
 */
void EvaluateTarget(Transform enemy, float alignment)
{
    float distance = Vector2.Distance(origin, enemy.position);

    if (distance > maxAssistDistance)
        return;

    float score = alignment * (1f / (1f + distance * distanceWeight));

    if (score > bestScore)
    {
        bestScore = score;
        bestTarget = enemy;
    }
}

// Distance is intentionally squared-weighted to reduce bias toward far targets inside the same cone.