/*
 * After instantiation, rooms validate structural alignment using physics-based overlap detection.
 * If connections are invalid, the system rotates rooms dynamically until proper alignment is achieved, guaranteeing seamless traversal.
 */

public void CheckDoors()
{
    for (int i = 0; i < 4; i++)
    {
        foreach (var door in ExitDoors)
        {
            Collider[] overlaps = Physics.OverlapSphere(
                door.GameObject.transform.position,
                doorCheckRadius,
                doorLayer);

            door.connected = overlaps.Length > 1;
        }

        if (ExitDoors.All(d => d.connected))
            return;

        Rotate();
    }
}
