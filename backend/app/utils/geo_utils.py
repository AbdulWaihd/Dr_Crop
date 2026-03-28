import math

def calculateBearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the bearing between two GPS coordinates in degrees.
    Formula: θ = atan2(sin(Δlong).cos(lat2), cos(lat1).sin(lat2) − sin(lat1).cos(lat2).cos(Δlong))
    """
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    diff_long = math.radians(lon2 - lon1)

    x = math.sin(diff_long) * math.cos(lat2_rad)
    y = math.cos(lat1_rad) * math.sin(lat2_rad) - (
        math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(diff_long)
    )

    initial_bearing = math.atan2(x, y)
    # Now we have the initial bearing but math.atan2 return values
    # from -180° to + 180° which is not what we want for a compass bearing
    # The solution is to normalize the initial bearing as shown below
    initial_bearing = math.degrees(initial_bearing)
    compass_bearing = (initial_bearing + 360) % 360

    return compass_bearing

def isUserInPath(sourceLat: float, sourceLon: float, userLat: float, userLon: float, windDirection: float) -> bool:
    """
    Checks if a user location is within a 45-degree cone (+/- 22.5 deg) of the wind direction from a source.
    """
    angleToUser = calculateBearing(sourceLat, sourceLon, userLat, userLon)
    
    # Calculate shortest difference between two angles
    angleDifference = abs(windDirection - angleToUser)
    angleDifference = min(angleDifference, 360 - angleDifference)
    
    return angleDifference < 22.5
