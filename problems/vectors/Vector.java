public class Vector {

    private final double x;
    private final double y;
    private final double z;

    public Vector(double x, double y, double z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public Vector(Vector vector) {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public double getZ() {
        return z;
    }

    public Vector sum(Vector vector) {
        /* TODO */
        return null;
    }

    public Vector difference(Vector vector) {
        /* TODO */
        return null;
    }

    public Vector scale(double value) {
        /* TODO */
        return null;
    }

    public double distance(Vector vector) {
        /* TODO */
        return 0;
    }

    public Vector normalise() {
        /* TODO */
        return null;
    }

    public double length() {
        /* TODO */
        return 0;
    }

    public String toString() {
        return "(" + x + "," + y + "," + z + ")";
    }

}

