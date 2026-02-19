/*
 * Correction is applied using constrained blending rather than direction replacement. 
 * This avoids jitter and maintains consistent frame-to-frame stability.
 */
Vector2 ResolveDirection()
{
    if (bestTarget == null)
        return inputDir;

    Vector2 targetDir =
        (bestTarget.position - origin).normalized;

    Vector2 corrected =
        Vector2.Lerp(inputDir, targetDir, assistStrength);

    return corrected.normalized;
}

//Because blending occurs post-evaluation and pre-fire execution, aim correction remains stateless and deterministic.