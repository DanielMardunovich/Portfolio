/*
 * Targets are first filtered through a forward-facing angular gate using normalized vectors and dot product thresholds. 
 * This ensures only intention-aligned candidates enter scoring.
 */

Vector2 inputDir = rawInput.normalized;

float bestScore = minDotThreshold;
Transform bestTarget = null;

foreach (var enemy in nearbyEnemies)
{
    Vector2 toTarget = (enemy.position - origin).normalized;
    float alignment = Vector2.Dot(inputDir, toTarget);

    if (alignment < minDotThreshold)
        continue;

    // Candidate passes cone constraint
    EvaluateTarget(enemy, alignment);
}

// This prevents lateral snapping and guarantees correction remains intention-bound.