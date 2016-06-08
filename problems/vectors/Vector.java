public class Vector {

    private final double x;
    private final double y;
    private final double z;

    public Vector(final double x, final double y, final double z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public Vector(final Vector vector) {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
    }

    public double getX() 
    {
        return x;
    }

    public double getY() {
        return y;
    }

    public double getZ() {
        return z;
    }

    public Vector sum(final Vector vector) {
        /* TODO */
        return null;
    }

    public Vector normalise() {
        /* TODO */
        return null;
    }

    public double length() {
        /* TODO */
        return 0;
    }

    @Override
    public String toString() {
        return "(" + x + "," + y + "," + z + ")";
    }

}