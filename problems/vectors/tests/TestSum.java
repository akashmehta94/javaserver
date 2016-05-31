import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class TestSum {

	@Test
	public void testSum() {
		Vector vector1 = new Vector(1, 2, 3);
		Vector vector2 = new Vector(4, 5, 6);
		Vector result = vector1.sum(vector2);

		// assert statements
		assertEquals("getX() must return 5", 5, result.getX(), 0.001);
		assertEquals("getY() must return 7", 7, result.getY(), 0.001);
		assertEquals("getZ() must return 9", 9, result.getZ(), 0.001);
	}

} 
